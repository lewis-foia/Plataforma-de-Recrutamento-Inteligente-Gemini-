import uuid
from sqlalchemy import Column, String, ForeignKey, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
import enum

class SkillLevel(str, enum.Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"

class Skill(Base):
    __tablename__ = "skills"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)

class CandidateSkill(Base):
    __tablename__ = "candidate_skills"
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), primary_key=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    level = Column(Enum(SkillLevel, name="skilllevel"), nullable=True)

class JobSkill(Base):
    __tablename__ = "job_skills"
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    is_mandatory = Column(Boolean, default=False)
