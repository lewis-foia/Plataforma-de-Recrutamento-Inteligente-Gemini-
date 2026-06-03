from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security.jwt import decode_access_token
from app.models.user import User
from uuid import UUID
from typing import AsyncGenerator

security = HTTPBearer()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    from app.infrastructure.persistence.database import get_db_session
    async for session in get_db_session():
        yield session

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    user = await db.get(User, UUID(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    return user

def require_role(*roles: str):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role.value not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker
