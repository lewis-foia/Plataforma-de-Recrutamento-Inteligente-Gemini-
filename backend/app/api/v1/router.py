from fastapi import APIRouter
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.users import router as users_router
from app.api.v1.endpoints.jobs import router as jobs_router
from app.api.v1.endpoints.resumes import router as resumes_router
from app.api.v1.endpoints.applications import router as applications_router
from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.profile import router as profile_router
from app.api.v1.endpoints import users

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
api_router.include_router(resumes_router, prefix="/resumes", tags=["resumes"])
api_router.include_router(applications_router, prefix="/applications", tags=["applications"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(profile_router, prefix="/profile", tags=["profile"])