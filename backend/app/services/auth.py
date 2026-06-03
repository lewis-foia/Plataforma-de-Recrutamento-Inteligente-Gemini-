from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, UserRole
from app.models.candidate import Candidate
from app.core.security.password import hash_password, verify_password
from app.core.security.jwt import create_access_token, create_refresh_token, decode_refresh_token
from fastapi import HTTPException, status
from uuid import uuid4

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register_candidate(self, email: str, password: str, full_name: str) -> User:
        result = await self.db.execute(select(User).where(User.email == email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")
        user_id = uuid4()
        user = User(id=user_id, email=email, password_hash=hash_password(password), role=UserRole.CANDIDATE)
        candidate = Candidate(id=uuid4(), user_id=user_id, full_name=full_name)
        self.db.add(user)
        self.db.add(candidate)
        await self.db.commit()
        return user

    async def login(self, email: str, password: str) -> dict:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user or not user.is_active or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        access = create_access_token(user.id, user.role.value)
        refresh = create_refresh_token(user.id)
        return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}

    async def refresh_token(self, token: str) -> dict:
        payload = decode_refresh_token(token)
        user_id = payload.get("sub")
        user = await self.db.get(User, user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="Invalid token")
        access = create_access_token(user.id, user.role.value)
        refresh = create_refresh_token(user.id)
        return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}
