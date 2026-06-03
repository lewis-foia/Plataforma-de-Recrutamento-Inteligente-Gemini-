from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from app.core.deps import get_db, get_current_user, require_role
from app.schemas.job import JobCreateRequest, JobUpdateRequest, JobResponse
from app.models.job import Job, JobStatus
from app.models.application import Application, ApplicationStatus
from app.models.ai_ranking import AIRanking
from app.models.candidate import Candidate
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=list[JobResponse])
async def list_jobs(skip: int = Query(0), limit: int = Query(20), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.status == JobStatus.OPEN).offset(skip).limit(limit).order_by(Job.created_at.desc()))
    jobs = result.scalars().all()
    return [JobResponse(id=j.id, recruiter_id=j.recruiter_id, title=j.title, description=j.description, education_level=j.education_level, experience_years=j.experience_years, status=j.status.value, created_at=j.created_at, updated_at=j.updated_at) for j in jobs]

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    job = await db.get(Job, job_id)
    if not job: raise HTTPException(404, "Job not found")
    return JobResponse(id=job.id, recruiter_id=job.recruiter_id, title=job.title, description=job.description, education_level=job.education_level, experience_years=job.experience_years, status=job.status.value, created_at=job.created_at, updated_at=job.updated_at)

@router.post("/", response_model=JobResponse, status_code=201)
async def create_job(request: JobCreateRequest, current_user = Depends(require_role("RECRUITER")), db: AsyncSession = Depends(get_db)):
    job = Job(recruiter_id=current_user.id, title=request.title, description=request.description, education_level=request.education_level, experience_years=request.experience_years)
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return JobResponse(id=job.id, recruiter_id=job.recruiter_id, title=job.title, description=job.description, education_level=job.education_level, experience_years=job.experience_years, status=job.status.value, created_at=job.created_at, updated_at=job.updated_at)

@router.put("/{job_id}", response_model=JobResponse)
async def update_job(job_id: UUID, request: JobUpdateRequest, current_user = Depends(require_role("RECRUITER")), db: AsyncSession = Depends(get_db)):
    job = await db.get(Job, job_id)
    if not job or job.recruiter_id != current_user.id: raise HTTPException(403, "Not authorized")
    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(job, key, value)
    await db.commit()
    await db.refresh(job)
    return JobResponse(id=job.id, recruiter_id=job.recruiter_id, title=job.title, description=job.description, education_level=job.education_level, experience_years=job.experience_years, status=job.status.value, created_at=job.created_at, updated_at=job.updated_at)

@router.patch("/{job_id}/close", response_model=JobResponse)
async def close_job(job_id: UUID, current_user = Depends(require_role("RECRUITER")), db: AsyncSession = Depends(get_db)):
    job = await db.get(Job, job_id)
    if not job or job.recruiter_id != current_user.id: raise HTTPException(403, "Not authorized")
    job.status = JobStatus.CLOSED
    await db.commit()
    await db.refresh(job)
    return JobResponse(id=job.id, recruiter_id=job.recruiter_id, title=job.title, description=job.description, education_level=job.education_level, experience_years=job.experience_years, status=job.status.value, created_at=job.created_at, updated_at=job.updated_at)

@router.get("/{job_id}/candidates")
async def get_job_candidates(job_id: UUID, current_user = Depends(require_role("RECRUITER")), db: AsyncSession = Depends(get_db)):
    job = await db.get(Job, job_id)
    if not job or job.recruiter_id != current_user.id: raise HTTPException(403, "Not authorized")
    result = await db.execute(select(Application, Candidate.full_name, AIRanking.compatibility_score, AIRanking.justification).join(Candidate).outerjoin(AIRanking).where(Application.job_id == job_id))
    rankings = result.all()
    return [{"candidate_id": app.candidate_id, "candidate_name": name, "application_id": app.id, "compatibility_score": score or 0, "justification": just or ""} for app, name, score, just in sorted(rankings, key=lambda x: x[2] or 0, reverse=True)]

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
        query = query.where(Job.title.ilike(f"%{search}%") | Job.description.ilike(f"%{search}%"))
    if skills:
        skill_list = [s.strip() for s in skills.split(",")]
        # Filtro simples: busca no campo required_skills (se existir)
        # Para um filtro mais preciso, seria necessário usar a tabela job_skills
        for skill in skill_list:
            query = query.where(Job.required_skills.any(skill))  # se for JSONB
    query = query.offset(skip).limit(limit).order_by(Job.created_at.desc())
    result = await db.execute(query)
    jobs = result.scalars().all()
    return [JobResponse(...) for j in jobs]


