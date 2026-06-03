from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID, uuid4
from app.core.deps import get_db, get_current_user, require_role
from app.schemas.resume import ResumeResponse
from app.models.resume import Resume, ResumeStatus
from app.models.candidate import Candidate
from app.models.skill import Skill, CandidateSkill          # <-- NOVO: import dos modelos de skills
from app.services.gemini_service import GeminiService
from app.core.config import settings
import os, aiofiles

router = APIRouter()

@router.post("/upload", response_model=ResumeResponse, status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user = Depends(require_role("CANDIDATE")),
    db: AsyncSession = Depends(get_db)
):
    if file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(400, "Only PDF/DOCX allowed")
    
    # Obter o candidate.id a partir do user.id
    result = await db.execute(select(Candidate).where(Candidate.user_id == current_user.id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(400, "Candidate profile not found")
    
    upload_dir = os.path.join(settings.UPLOAD_DIR, str(candidate.id))
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{uuid4()}_{file.filename}")
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(await file.read())
    
    resume = Resume(
        candidate_id=candidate.id,
        original_filename=file.filename,
        storage_path=file_path
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    
    # Processar em background – passamos o candidate_id para associar skills
    background_tasks.add_task(process_resume, resume.id, file_path, file.content_type, candidate.id)
    
    return ResumeResponse(
        id=resume.id,
        candidate_id=resume.candidate_id,
        original_filename=resume.original_filename,
        status=resume.status.value,
        uploaded_at=resume.uploaded_at
    )


async def process_resume(resume_id: UUID, file_path: str, content_type: str, candidate_id: UUID):
    """Extrai texto, analisa com Gemini e popula as tabelas de skills."""
    from app.core.deps import get_db
    from app.services.gemini_service import GeminiService
    from app.models.resume import Resume, ResumeStatus
    import PyPDF2, docx

    async for session in get_db():
        resume = await session.get(Resume, resume_id)
        if not resume:
            return

        resume.status = ResumeStatus.PROCESSING
        await session.commit()

        try:
            # 1. Extrair texto
            text = ""
            if "pdf" in content_type:
                reader = PyPDF2.PdfReader(file_path)
                text = " ".join(page.extract_text() or "" for page in reader.pages)
            else:
                doc = docx.Document(file_path)
                text = "\n".join(p.text for p in doc.paragraphs)

            # 2. Analisar com Gemini
            gemini = GeminiService()
            parsed = await gemini.extract_resume_data(text)

            # 3. Guardar dados extraídos
            resume.parsed_data = parsed
            resume.status = ResumeStatus.PROCESSED

            # 4. Popular tabelas de skills
            if parsed and 'skills' in parsed:
                for skill_name in parsed['skills']:
                    skill_name = skill_name.strip()
                    if not skill_name:
                        continue

                    # Verifica se a skill já existe na tabela global de skills
                    skill_result = await session.execute(
                        select(Skill).where(Skill.name == skill_name)
                    )
                    skill = skill_result.scalar_one_or_none()

                    # Se não existe, cria
                    if not skill:
                        skill = Skill(id=uuid4(), name=skill_name)
                        session.add(skill)
                        await session.flush()  # obtém o ID

                    # Associa ao candidato, se ainda não existir
                    existing_assoc = await session.execute(
                        select(CandidateSkill).where(
                            CandidateSkill.candidate_id == candidate_id,
                            CandidateSkill.skill_id == skill.id
                        )
                    )
                    if not existing_assoc.scalar_one_or_none():
                        candidate_skill = CandidateSkill(
                            candidate_id=candidate_id,
                            skill_id=skill.id
                        )
                        session.add(candidate_skill)

            await session.commit()

        except Exception:
            resume.status = ResumeStatus.FAILED
            await session.commit()
            raise

        break


@router.get("/", response_model=list[ResumeResponse])
async def list_my_resumes(
    current_user = Depends(require_role("CANDIDATE")),
    db: AsyncSession = Depends(get_db)
):
    # Obter candidate.id
    result = await db.execute(select(Candidate).where(Candidate.user_id == current_user.id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        return []
    result = await db.execute(select(Resume).where(Resume.candidate_id == candidate.id))
    resumes = result.scalars().all()
    return [
        ResumeResponse(
            id=r.id,
            candidate_id=r.candidate_id,
            original_filename=r.original_filename,
            status=r.status.value,
            parsed_data=r.parsed_data,
            uploaded_at=r.uploaded_at
        ) for r in resumes
    ]