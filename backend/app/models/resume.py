import uuid
from sqlalchemy import Column, String, ForeignKey, Enum, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum

class ResumeStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    PROCESSED = "PROCESSED"
    FAILED = "FAILED"

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    original_filename = Column(String(500), nullable=False)
    storage_path = Column(String(1000), nullable=False)
    parsed_data = Column(JSONB(), nullable=True)
    status = Column(Enum(ResumeStatus), default=ResumeStatus.PENDING)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    candidate = relationship("Candidate", back_populates="resumes")
    applications = relationship("Application", back_populates="resume")
