from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID, uuid4
from app.core.deps import get_db, get_current_user, require_role
from app.schemas.application import ApplyRequest, ApplicationResponse
from app.models.application import Application
from app.models.ai_ranking import AIRanking
from app.services.gemini_service import GeminiService

router = APIRouter()

@router.post("/", response_model=ApplicationResponse, status_code=201)
async def apply_to_job(request: ApplyRequest, background_tasks: BackgroundTasks, current_user = Depends(require_role("CANDIDATE")), db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Application).where(Application.candidate_id == current_user.id, Application.job_id == request.job_id))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Already applied")
    app = Application(id=uuid4(), candidate_id=current_user.id, job_id=request.job_id, resume_id=request.resume_id)
    db.add(app)
    await db.commit()
    await db.refresh(app)
    # Background: calcular ranking
    background_tasks.add_task(calculate_ranking, app.id)
    return ApplicationResponse(id=app.id, candidate_id=app.candidate_id, job_id=app.job_id, resume_id=app.resume_id, status=app.status.value, applied_at=str(app.applied_at))

async def calculate_ranking(application_id: UUID):
    from app.core.deps import get_db
    from app.models.application import Application
    from app.models.resume import Resume
    from app.models.job import Job
    from app.models.ai_ranking import AIRanking
    from app.services.gemini_service import GeminiService
    import json
    async for session in get_db():
        app = await session.get(Application, application_id)
        if not app: return
        resume = await session.get(Resume, app.resume_id) if app.resume_id else None
        job = await session.get(Job, app.job_id)
        if not job: return
        resume_data = resume.parsed_data if resume and resume.parsed_data else {}
        requirements = json.dumps({"education": job.education_level, "experience_years": job.experience_years})
        try:
            gemini = GeminiService()
            score, justification = await gemini.evaluate_compatibility(resume_data, job.title, job.description, requirements)
            ranking = AIRanking(application_id=app.id, compatibility_score=score, justification=justification)
            session.add(ranking)
            await session.commit()
        except Exception:
            pass
        break

@router.get("/mine", response_model=list[ApplicationResponse])
async def list_my_applications(current_user = Depends(require_role("CANDIDATE")), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).where(Application.candidate_id == current_user.id))
    apps = result.scalars().all()
    return [ApplicationResponse(id=a.id, candidate_id=a.candidate_id, job_id=a.job_id, resume_id=a.resume_id, status=a.status.value, applied_at=str(a.applied_at)) for a in apps]
