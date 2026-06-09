from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas, auth
from app.services.gemini_service import GeminiService
from app.utils.file_parser import extract_text_from_file
import os
import shutil
import uuid
import json

router = APIRouter(prefix="/api/v1")
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# -------------------- Auth --------------------
@router.post("/auth/register", status_code=201)
def register(req: schemas.RegisterRequest, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, req.email):
        raise HTTPException(400, "Email already registered")
    user = crud.create_user(db, req)
    return {"message": "User registered", "user_id": user.id}

@router.post("/auth/login", response_model=schemas.TokenResponse)
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, req.email)
    if not user or not crud.verify_password(req.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    token = crud.create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/auth/me", response_model=schemas.UserResponse)
def me(current_user = Depends(auth.get_current_user)):
    return schemas.UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        full_name=current_user.full_name,
        is_active=current_user.is_active
    )

# -------------------- Jobs --------------------
@router.get("/jobs/", response_model=list[schemas.JobResponse])
def list_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    jobs = crud.get_jobs(db, skip, limit, only_open=True)
    return jobs

@router.get("/jobs/{job_id}", response_model=schemas.JobResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = crud.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return job

@router.post("/jobs/", response_model=schemas.JobResponse)
def create_job(
    job_data: schemas.JobCreate,
    current_user = Depends(auth.require_role(["ADMIN", "RECRUITER"])),
    db: Session = Depends(get_db)
):
    job = crud.create_job(db, job_data, current_user.id)
    return job

@router.patch("/jobs/{job_id}/close", response_model=schemas.JobResponse)
def close_job(
    job_id: str,
    current_user = Depends(auth.require_role(["ADMIN", "RECRUITER"])),
    db: Session = Depends(get_db)
):
    job = crud.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    if current_user.role != "ADMIN" and job.recruiter_id != current_user.id:
        raise HTTPException(403, "Not your job")
    closed = crud.close_job(db, job_id)
    return closed

# -------------------- Resumes (com Gemini) --------------------
async def process_resume_with_gemini(resume_id: str, file_path: str, content_type: str, db: Session):
    text = extract_text_from_file(file_path, content_type)
    gemini = GeminiService()
    parsed_data = await gemini.extract_resume_data(text)
    crud.update_resume_parsed_data(db, resume_id, parsed_data)

@router.post("/resumes/upload", status_code=201)
def upload_resume(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user = Depends(auth.require_role(["CANDIDATE"])),
    db: Session = Depends(get_db)
):
    if file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(400, "Only PDF or DOCX allowed")
    ext = file.filename.split(".")[-1]
    new_filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    resume = crud.create_resume(db, current_user.id, file.filename, file_path)
    background_tasks.add_task(process_resume_with_gemini, resume.id, file_path, file.content_type, db)
    return {"id": resume.id, "original_filename": resume.original_filename, "status": resume.status, "uploaded_at": resume.uploaded_at}

@router.get("/resumes/", response_model=list[schemas.ResumeResponse])
def list_resumes(current_user = Depends(auth.require_role(["CANDIDATE"])), db: Session = Depends(get_db)):
    resumes = crud.get_user_resumes(db, current_user.id)
    return resumes

# -------------------- Applications (com Gemini) --------------------
async def evaluate_compatibility_task(app_id: str, user_id: str, job_id: str, resume_id: str, db: Session):
    resume = crud.get_resume_by_id(db, resume_id) if resume_id else crud.get_user_latest_resume(db, user_id)
    job = crud.get_job_by_id(db, job_id)
    if not resume or not resume.parsed_data or not job:
        return
    resume_data = json.loads(resume.parsed_data)
    gemini = GeminiService()
    score, justification = await gemini.evaluate_compatibility(
        resume_data,
        job.title,
        job.description,
        ""
    )
    crud.update_application_score(db, app_id, score, justification)

@router.post("/applications/", status_code=201)
def apply(
    job_id: str,
    resume_id: str = None,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user = Depends(auth.require_role(["CANDIDATE"])),
    db: Session = Depends(get_db)
):
    job = crud.get_job_by_id(db, job_id)
    if not job or job.status != "OPEN":
        raise HTTPException(400, "Job not available")
    app_record = crud.create_application(db, current_user.id, job_id, resume_id)
    if not app_record:
        raise HTTPException(400, "You already applied to this job")
    background_tasks.add_task(evaluate_compatibility_task, app_record.id, current_user.id, job_id, resume_id, db)
    return {"message": "Application submitted", "application_id": app_record.id}

@router.get("/applications/mine", response_model=list[schemas.ApplicationResponse])
def my_applications(current_user = Depends(auth.require_role(["CANDIDATE"])), db: Session = Depends(get_db)):
    apps = crud.get_user_applications(db, current_user.id)
    return apps

# -------------------- Users (Admin) --------------------
@router.get("/users/")
def list_users(current_user = Depends(auth.require_role(["ADMIN"])), db: Session = Depends(get_db)):
    users = crud.get_all_users(db)
    return [{"id": u.id, "email": u.email, "role": u.role, "full_name": u.full_name, "is_active": u.is_active} for u in users]

@router.patch("/users/{user_id}/toggle-active")
def toggle_active(user_id: str, current_user = Depends(auth.require_role(["ADMIN"])), db: Session = Depends(get_db)):
    user = crud.toggle_user_active(db, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return {"id": user.id, "is_active": user.is_active}

# -------------------- Profile --------------------
@router.get("/profile/", response_model=schemas.ProfileResponse)
def get_profile(current_user = Depends(auth.get_current_user)):
    return schemas.ProfileResponse(
        full_name=current_user.full_name or "",
        phone="",
        address="",
        linkedin_url="",
        summary=""
    )

@router.put("/profile/")
def update_profile(profile: schemas.ProfileUpdate, current_user = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    updated = crud.update_profile(db, current_user.id, profile)
    return {"message": "Profile updated"}

# -------------------- Dashboard (Admin) --------------------
@router.get("/dashboard/metrics")
def dashboard_metrics(current_user = Depends(auth.require_role(["ADMIN"])), db: Session = Depends(get_db)):
    total_candidates = db.query(crud.models.User).filter(crud.models.User.role == "CANDIDATE").count()
    total_jobs = db.query(crud.models.Job).count()
    total_applications = db.query(crud.models.Application).count()
    approved = db.query(crud.models.Application).filter(crud.models.Application.status == "APPROVED").count()
    rejected = db.query(crud.models.Application).filter(crud.models.Application.status == "REJECTED").count()
    return {
        "total_candidates": total_candidates,
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "approved_applications": approved,
        "rejected_applications": rejected,
        "avg_compatibility": 0,
        "compatibility_distribution": []
    }

# -------------------- Candidates stats --------------------
@router.get("/candidates/me/stats")
def candidate_stats(current_user = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    apps = crud.get_user_applications(db, current_user.id)
    total = len(apps)
    approved = sum(1 for a in apps if a["status"] == "APPROVED")
    return {
        "totalApplications": total,
        "avgCompatibility": 0,
        "approvalRate": int(approved / total * 100) if total else 0
    }