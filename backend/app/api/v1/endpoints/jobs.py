from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID, uuid4
from app.core.deps import get_db, get_current_user, require_role
from app.schemas.job import JobCreateRequest, JobUpdateRequest, JobResponse
from app.models.job import Job, JobStatus
from app.models.recruiter import Recruiter
from app.models.application import Application, ApplicationStatus
from app.models.ai_ranking import AIRanking
from app.models.candidate import Candidate
from datetime import datetime

router = APIRouter()


# ---------------------------------------------------------------
# Listar vagas (abertas) – acesso público
# ---------------------------------------------------------------
@router.get("/", response_model=list[JobResponse])
async def list_jobs(
    search: str = Query("", description="Buscar por título ou descrição"),
    skills: str = Query("", description="Filtrar por skills (separadas por vírgula)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(Job).where(Job.status == JobStatus.OPEN)
    if search:
        query = query.where(
            Job.title.ilike(f"%{search}%") | Job.description.ilike(f"%{search}%")
        )
    # Nota: o modelo Job atual não tem required_skills como coluna separada.
    # O filtro por skills está desativado até que a tabela job_skills seja populada.
    query = query.offset(skip).limit(limit).order_by(Job.created_at.desc())
    result = await db.execute(query)
    jobs = result.scalars().all()
    return [
        JobResponse(
            id=j.id,
            recruiter_id=j.recruiter_id,
            title=j.title,
            description=j.description,
            education_level=j.education_level,
            experience_years=j.experience_years,
            status=j.status.value,
            created_at=j.created_at,
            updated_at=j.updated_at,
        ) for j in jobs
    ]


# ---------------------------------------------------------------
# Obter detalhes de uma vaga
# ---------------------------------------------------------------
@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    job = await db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return JobResponse(
        id=job.id,
        recruiter_id=job.recruiter_id,
        title=job.title,
        description=job.description,
        education_level=job.education_level,
        experience_years=job.experience_years,
        status=job.status.value,
        created_at=job.created_at,
        updated_at=job.updated_at,
    )


# ---------------------------------------------------------------
# Criar vaga (RECRUITER ou ADMIN)
# ---------------------------------------------------------------
@router.post("/", response_model=JobResponse, status_code=201)
async def create_job(
    request: JobCreateRequest,
    current_user = Depends(require_role("RECRUITER", "ADMIN")),
    db: AsyncSession = Depends(get_db)
):
    recruiter = None
    # Se for ADMIN, tentamos obter ou criar um recrutador
    if current_user.role == "ADMIN":
        # Buscar o primeiro recrutador existente (qualquer um)
        result = await db.execute(select(Recruiter).limit(1))
        recruiter = result.scalar_one_or_none()
        # Se não existir nenhum recrutador, criar um dummy para o admin
        if not recruiter:
            recruiter = Recruiter(
                id=uuid4(),
                user_id=current_user.id,
                company_name="Admin Company",
                position="Admin"
            )
            db.add(recruiter)
            await db.commit()
            await db.refresh(recruiter)
    else:
        # Para RECRUITER, obter o seu próprio perfil
        result = await db.execute(
            select(Recruiter).where(Recruiter.user_id == current_user.id)
        )
        recruiter = result.scalar_one_or_none()
        if not recruiter:
            raise HTTPException(400, "Recruiter profile not found for this user")

    # Criar a vaga
    job = Job(
        recruiter_id=recruiter.id,
        title=request.title,
        description=request.description,
        education_level=request.education_level,
        experience_years=request.experience_years,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return JobResponse(
        id=job.id,
        recruiter_id=job.recruiter_id,
        title=job.title,
        description=job.description,
        education_level=job.education_level,
        experience_years=job.experience_years,
        status=job.status.value,
        created_at=job.created_at,
        updated_at=job.updated_at,
    )


# ---------------------------------------------------------------
# Atualizar vaga (dono ou ADMIN)
# ---------------------------------------------------------------
@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: UUID,
    request: JobUpdateRequest,
    current_user = Depends(require_role("RECRUITER", "ADMIN")),
    db: AsyncSession = Depends(get_db)
):
    job = await db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Job not found")

    # Verificar se é o dono ou ADMIN
    if current_user.role != "ADMIN":
        result = await db.execute(
            select(Recruiter).where(Recruiter.user_id == current_user.id)
        )
        recruiter = result.scalar_one_or_none()
        if not recruiter or job.recruiter_id != recruiter.id:
            raise HTTPException(403, "Not authorized")

    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(job, key, value)
    await db.commit()
    await db.refresh(job)
    return JobResponse(
        id=job.id,
        recruiter_id=job.recruiter_id,
        title=job.title,
        description=job.description,
        education_level=job.education_level,
        experience_years=job.experience_years,
        status=job.status.value,
        created_at=job.created_at,
        updated_at=job.updated_at,
    )


# ---------------------------------------------------------------
# Fechar vaga (dono ou ADMIN)
# ---------------------------------------------------------------
@router.patch("/{job_id}/close", response_model=JobResponse)
async def close_job(
    job_id: UUID,
    current_user = Depends(require_role("RECRUITER", "ADMIN")),
    db: AsyncSession = Depends(get_db)
):
    job = await db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Job not found")

    if current_user.role != "ADMIN":
        result = await db.execute(
            select(Recruiter).where(Recruiter.user_id == current_user.id)
        )
        recruiter = result.scalar_one_or_none()
        if not recruiter or job.recruiter_id != recruiter.id:
            raise HTTPException(403, "Not authorized")

    job.status = JobStatus.CLOSED
    await db.commit()
    await db.refresh(job)
    return JobResponse(
        id=job.id,
        recruiter_id=job.recruiter_id,
        title=job.title,
        description=job.description,
        education_level=job.education_level,
        experience_years=job.experience_years,
        status=job.status.value,
        created_at=job.created_at,
        updated_at=job.updated_at,
    )


# ---------------------------------------------------------------
# Listar candidatos ranqueados (dono ou ADMIN)
# ---------------------------------------------------------------
@router.get("/{job_id}/candidates")
async def get_job_candidates(
    job_id: UUID,
    current_user = Depends(require_role("RECRUITER", "ADMIN")),
    db: AsyncSession = Depends(get_db)
):
    job = await db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Job not found")

    # ADMIN pode ver qualquer vaga; recrutador só vê as suas
    if current_user.role != "ADMIN":
        result = await db.execute(
            select(Recruiter).where(Recruiter.user_id == current_user.id)
        )
        recruiter = result.scalar_one_or_none()
        if not recruiter or job.recruiter_id != recruiter.id:
            raise HTTPException(403, "Not authorized")

    result = await db.execute(
        select(
            Application,
            Candidate.full_name,
            AIRanking.compatibility_score,
            AIRanking.justification
        )
        .join(Candidate)
        .outerjoin(AIRanking)
        .where(Application.job_id == job_id)
    )
    rankings = result.all()
    return [
        {
            "candidate_id": str(app.candidate_id),
            "candidate_name": name or "Sem nome",
            "application_id": str(app.id),
            "compatibility_score": score or 0,
            "justification": just or "",
        }
        for app, name, score, just in sorted(rankings, key=lambda x: x[2] or 0, reverse=True)
    ]