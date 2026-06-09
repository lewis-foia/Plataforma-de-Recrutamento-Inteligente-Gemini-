from sqlalchemy import Column, String, Boolean, Integer, DateTime, func, Text, ForeignKey, Float
from app.database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="CANDIDATE")
    is_active = Column(Boolean, default=True)
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Job(Base):
    __tablename__ = "jobs"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    education_level = Column(String(100), nullable=True)
    experience_years = Column(Integer, default=0)
    status = Column(String(20), default="OPEN")
    recruiter_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    status = Column(String(20), default="PENDING")
    parsed_data = Column(Text, nullable=True)   # JSON string com dados extraídos
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

class Application(Base):
    __tablename__ = "applications"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=False)
    resume_id = Column(String(36), ForeignKey("resumes.id"), nullable=True)
    status = Column(String(20), default="PENDING")
    compatibility_score = Column(Float, nullable=True)
    compatibility_justification = Column(Text, nullable=True)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())