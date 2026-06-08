from sqlalchemy import Column, String, Integer, Enum as SQLEnum, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
import enum
import uuid

class JobStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recruiter_id = Column(UUID(as_uuid=True), ForeignKey("recruiters.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String, nullable=False)
    education_level = Column(String(100))
    experience_years = Column(Integer, default=0)
    status = Column(SQLEnum(JobStatus), default=JobStatus.OPEN, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())