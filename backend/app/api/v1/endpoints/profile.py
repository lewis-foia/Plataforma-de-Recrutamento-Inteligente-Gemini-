from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.deps import get_db, get_current_user, require_role
from app.models.candidate import Candidate

router = APIRouter()

class ProfileUpdate(BaseModel):
    full_name: str
    phone: str | None = None
    address: str | None = None
    linkedin_url: str | None = None
    summary: str | None = None

@router.get("/")
async def get_profile(
    current_user = Depends(require_role("CANDIDATE")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Candidate).where(Candidate.user_id == current_user.id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        # Cria perfil automaticamente (evita 404)
        candidate = Candidate(user_id=current_user.id, full_name="")
        db.add(candidate)
        await db.commit()
        await db.refresh(candidate)
    return {
        "full_name": candidate.full_name or "",
        "phone": candidate.phone or "",
        "address": candidate.address or "",
        "linkedin_url": candidate.linkedin_url or "",
        "summary": candidate.summary or "",
    }

@router.put("/")
async def update_profile(
    body: ProfileUpdate,
    current_user = Depends(require_role("CANDIDATE")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Candidate).where(Candidate.user_id == current_user.id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        candidate = Candidate(user_id=current_user.id, full_name=body.full_name)
        db.add(candidate)
    candidate.full_name = body.full_name
    candidate.phone = body.phone
    candidate.address = body.address
    candidate.linkedin_url = body.linkedin_url
    candidate.summary = body.summary
    await db.commit()
    return {"message": "Profile updated"}