from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.core.deps import get_db, require_role
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter()

@router.get("/", response_model=list[UserResponse])
async def list_users(
    current_user = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db)
):
    """Lista todos os utilizadores (apenas ADMIN)"""
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [
        UserResponse(
            id=u.id,
            email=u.email,
            role=u.role.value,
            is_active=u.is_active,
            full_name=getattr(u, "full_name", None)
        )
        for u in users
    ]

@router.patch("/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: UUID,
    current_user = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db)
):
    """Ativa ou desativa um utilizador (apenas ADMIN)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = not user.is_active
    await db.commit()
    return {"id": str(user.id), "is_active": user.is_active}