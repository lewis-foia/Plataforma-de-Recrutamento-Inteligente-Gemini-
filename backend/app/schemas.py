from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    full_name: Optional[str]
    is_active: bool

class JobCreate(BaseModel):
    title: str
    description: str
    education_level: Optional[str] = None
    experience_years: int = 0
    required_skills: List[str] = []

class JobResponse(JobCreate):
    id: str
    status: str
    recruiter_id: Optional[str]
    created_at: datetime
    updated_at: datetime

class ResumeResponse(BaseModel):
    id: str
    original_filename: str
    status: str
    parsed_data: Optional[dict] = None
    uploaded_at: datetime

class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    job_title: Optional[str] = None
    status: str
    compatibility_score: Optional[float] = None
    applied_at: datetime

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    linkedin_url: Optional[str] = None
    summary: Optional[str] = None

class ProfileResponse(BaseModel):
    full_name: str
    phone: str = ""
    address: str = ""
    linkedin_url: str = ""
    summary: str = ""