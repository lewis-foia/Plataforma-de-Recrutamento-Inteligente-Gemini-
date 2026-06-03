from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class JobCreateRequest(BaseModel):
    title: str = Field(min_length=5, max_length=255)
    description: str = Field(min_length=20)
    education_level: Optional[str] = None
    experience_years: int = Field(default=0, ge=0)
    required_skills: list[str] = Field(default_factory=list)

class JobUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    description: Optional[str] = Field(None, min_length=20)
    education_level: Optional[str] = None
    experience_years: Optional[int] = Field(None, ge=0)

class JobResponse(BaseModel):
    id: UUID
    recruiter_id: UUID
    title: str
    description: str
    education_level: Optional[str]
    experience_years: int
    status: str
    required_skills: list[str] = []
    created_at: datetime
    updated_at: datetime
