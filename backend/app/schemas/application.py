from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class ApplyRequest(BaseModel):
    job_id: UUID
    resume_id: Optional[UUID] = None

class ApplicationResponse(BaseModel):
    id: UUID
    candidate_id: UUID
    job_id: UUID
    resume_id: Optional[UUID]
    status: str
    applied_at: str
