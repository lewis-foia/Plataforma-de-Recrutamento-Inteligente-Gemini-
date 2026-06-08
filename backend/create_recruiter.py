import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User
from app.models.recruiter import Recruiter

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        result = await db.execute(select(User).where(User.role == 'ADMIN'))
        admin = result.scalar_one_or_none()
        if not admin:
            print("Nenhum ADMIN encontrado.")
            return
        # Verificar se já tem recruiter
        res = await db.execute(select(Recruiter).where(Recruiter.user_id == admin.id))
        if res.scalar_one_or_none():
            print(f"Admin {admin.email} já possui um recrutador.")
            return
        recruiter = Recruiter(
            id=uuid.uuid4(),
            user_id=admin.id,
            company_name="Admin Company",
            position="Administrator"
        )
        db.add(recruiter)
        await db.commit()
        print(f"Recrutador criado para admin {admin.email} (ID: {recruiter.id})")

if __name__ == "__main__":
    asyncio.run(main())