from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.deps import get_db, require_role
from app.schemas.dashboard import DashboardMetricsResponse, CompatibilityDist
from app.models.user import User, UserRole
from app.models.job import Job, JobStatus
from app.models.application import Application, ApplicationStatus
from app.models.ai_ranking import AIRanking

router = APIRouter()

@router.get("/metrics", response_model=DashboardMetricsResponse)
async def get_metrics(_ = Depends(require_role("ADMIN")), db: AsyncSession = Depends(get_db)):
    total_candidates = (await db.execute(select(func.count(User.id)).where(User.role == UserRole.CANDIDATE))).scalar()
    total_jobs = (await db.execute(select(func.count(Job.id)).where(Job.status == JobStatus.OPEN))).scalar()
    total_applications = (await db.execute(select(func.count(Application.id)))).scalar()
    approved = (await db.execute(select(func.count(Application.id)).where(Application.status == ApplicationStatus.APPROVED))).scalar()
    rejected = (await db.execute(select(func.count(Application.id)).where(Application.status == ApplicationStatus.REJECTED))).scalar()
    avg_score = (await db.execute(select(func.avg(AIRanking.compatibility_score)))).scalar() or 0
    scores = (await db.execute(select(AIRanking.compatibility_score))).scalars().all()
    dist = [
        CompatibilityDist(range="0-20", count=sum(1 for s in scores if s <= 20)),
        CompatibilityDist(range="21-40", count=sum(1 for s in scores if 21 <= s <= 40)),
        CompatibilityDist(range="41-60", count=sum(1 for s in scores if 41 <= s <= 60)),
        CompatibilityDist(range="61-80", count=sum(1 for s in scores if 61 <= s <= 80)),
        CompatibilityDist(range="81-100", count=sum(1 for s in scores if s >= 81)),
    ]
    return DashboardMetricsResponse(
        total_candidates=total_candidates, total_jobs=total_jobs, total_applications=total_applications,
        approved_applications=approved, rejected_applications=rejected, avg_compatibility=round(avg_score,2),
        compatibility_distribution=dist
    )
