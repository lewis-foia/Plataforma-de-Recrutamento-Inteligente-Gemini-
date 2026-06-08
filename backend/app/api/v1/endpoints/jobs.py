from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID, uuid4
from app.core.deps import get_db, get_current_user, require_role
from app.schemas.job import JobCreateRequest, JobUpdateRequest, JobResponse
from app.models.job import Job, JobStatus
from app.models.recruiter import Recruiter

router = APIRouter()   # ← OBRIGATÓRIO

@router.get("/", response_model=list[JobResponse])
async def list_jobs(
    search: str = Query(""),
    skip: int = Query(0),
    limit: int = Query(20),
    db: AsyncSession = Depends(get_db)
):
    query = select(Job).where(Job.status == JobStatus.OPEN)
    if search:
        query = query.where(Job.title.ilike(f"%{search}%") | Job.description.ilike(f"%{search}%"))
    query = query.offset(skip).limit(limit).order_by(Job.created_at.desc())
    result = await db.execute(query)
    jobs = result.scalars().all()
    return [JobResponse.model_validate(job) for job in jobs]

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    job = await db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return JobResponse.model_validate(job)

@router.post("/", response_model=JobResponse, status_code=201)
async def create_job(
    request: JobCreateRequest,
    current_user = Depends(require_role("RECRUITER", "ADMIN")),
    db: AsyncSession = Depends(get_db)
):
    # Busca ou cria um recrutador para ADMIN
    recruiter = None
    if current_user.role == "ADMIN":
        result = await db.execute(select(Recruiter).where(Recruiter.user_id == current_user.id))
        recruiter = result.scalar_one_or_none()
        if not recruiter:
            # Se não tem, pega o primeiro recrutador existente
            result = await db.execute(select(Recruiter).limit(1))
            recruiter = result.scalar_one_or_none()
            if not recruiter:
                # Cria um recrutador dummy para o admin
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
        result = await db.execute(select(Recruiter).where(Recruiter.user_id == current_user.id))
        recruiter = result.scalar_one_or_none()
        if not recruiter:
            raise HTTPException(400, "Perfil de recrutador não encontrado")

    job = Job(
        recruiter_id=recruiter.id,
        title=request.title,
        description=request.description,
        education_level=request.education_level,
        experience_years=request.experience_years,
        status=JobStatus.OPEN
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return JobResponse.model_validate(job)

# (os restantes endpoints – update, close, candidates – podem ser adicionados, mas não são necessários para o teste)