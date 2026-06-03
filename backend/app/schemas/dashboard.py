from pydantic import BaseModel

class CompatibilityDist(BaseModel):
    range: str
    count: int

class DashboardMetricsResponse(BaseModel):
    total_candidates: int
    total_jobs: int
    total_applications: int
    approved_applications: int
    rejected_applications: int
    avg_compatibility: float
    compatibility_distribution: list[CompatibilityDist]
