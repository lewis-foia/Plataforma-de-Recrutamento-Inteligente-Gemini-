from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ResumeResponse(BaseModel):
    id: UUID
    candidate_id: UUID
    original_filename: str
    status: str
    parsed_data: Optional[dict] = None
    uploaded_at: datetime
