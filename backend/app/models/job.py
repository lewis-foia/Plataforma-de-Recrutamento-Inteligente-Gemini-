import uuid
from sqlalchemy import Column, String, Text, Integer, ForeignKey, Enum, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum

class JobStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

class Job(Base):
    __tablename__ = "jobs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recruiter_id = Column(UUID(as_uuid=True), ForeignKey("recruiters.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text(), nullable=False)
    education_level = Column(String(100), nullable=True)
    experience_years = Column(Integer, default=0)
    status = Column(Enum(JobStatus), default=JobStatus.OPEN)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    recruiter = relationship("Recruiter", back_populates="jobs")
    applications = relationship("Application", back_populates="job")
