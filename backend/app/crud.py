from sqlalchemy.orm import Session
from app import models, schemas
import hashlib
import secrets
from jose import jwt
from datetime import datetime, timedelta
import os
import json

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "minha_chave_super_secreta_12345")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
    return f"{salt}${pwd_hash}"

def verify_password(plain: str, hashed: str) -> bool:
    try:
        salt, stored = hashed.split('$')
        new_hash = hashlib.pbkdf2_hmac('sha256', plain.encode(), salt.encode(), 100000).hex()
        return new_hash == stored
    except:
        return False

def create_access_token(sub: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": sub, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user_data: schemas.RegisterRequest):
    hashed = hash_password(user_data.password)
    user = models.User(
        email=user_data.email,
        password_hash=hashed,
        full_name=user_data.full_name,
        role="CANDIDATE"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_all_users(db: Session):
    return db.query(models.User).all()

def toggle_user_active(db: Session, user_id: str):
    user = get_user_by_id(db, user_id)
    if user:
        user.is_active = not user.is_active
        db.commit()
    return user

def create_job(db: Session, job_data: schemas.JobCreate, recruiter_id: str):
    job = models.Job(
        title=job_data.title,
        description=job_data.description,
        education_level=job_data.education_level,
        experience_years=job_data.experience_years,
        recruiter_id=recruiter_id,
        status="OPEN"
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

def get_job_by_id(db: Session, job_id: str):
    return db.query(models.Job).filter(models.Job.id == job_id).first()

def get_jobs(db: Session, skip: int = 0, limit: int = 100, only_open: bool = True):
    query = db.query(models.Job)
    if only_open:
        query = query.filter(models.Job.status == "OPEN")
    return query.order_by(models.Job.created_at.desc()).offset(skip).limit(limit).all()

def close_job(db: Session, job_id: str):
    job = get_job_by_id(db, job_id)
    if job:
        job.status = "CLOSED"
        db.commit()
    return job

def create_resume(db: Session, user_id: str, original_filename: str, file_path: str):
    resume = models.Resume(
        user_id=user_id,
        original_filename=original_filename,
        file_path=file_path,
        status="PENDING"
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume

def get_resume_by_id(db: Session, resume_id: str):
    return db.query(models.Resume).filter(models.Resume.id == resume_id).first()

def get_user_latest_resume(db: Session, user_id: str):
    return db.query(models.Resume).filter(models.Resume.user_id == user_id).order_by(models.Resume.uploaded_at.desc()).first()

def get_user_resumes(db: Session, user_id: str):
    return db.query(models.Resume).filter(models.Resume.user_id == user_id).order_by(models.Resume.uploaded_at.desc()).all()

def update_resume_parsed_data(db: Session, resume_id: str, parsed_data: dict):
    resume = get_resume_by_id(db, resume_id)
    if resume:
        resume.parsed_data = json.dumps(parsed_data)
        resume.status = "PROCESSED"
        db.commit()
        return resume
    return None

def create_application(db: Session, user_id: str, job_id: str, resume_id: str = None):
    existing = db.query(models.Application).filter(
        models.Application.user_id == user_id,
        models.Application.job_id == job_id
    ).first()
    if existing:
        return None
    app = models.Application(
        user_id=user_id,
        job_id=job_id,
        resume_id=resume_id,
        status="PENDING"
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app

def get_application_by_id(db: Session, app_id: str):
    return db.query(models.Application).filter(models.Application.id == app_id).first()

def update_application_score(db: Session, app_id: str, score: float, justification: str):
    app = get_application_by_id(db, app_id)
    if app:
        app.compatibility_score = score
        app.compatibility_justification = justification
        db.commit()
        return app
    return None

def get_user_applications(db: Session, user_id: str):
    apps = db.query(models.Application).filter(models.Application.user_id == user_id).order_by(models.Application.applied_at.desc()).all()
    result = []
    for app in apps:
        job = get_job_by_id(db, app.job_id)
        result.append({
            "id": app.id,
            "job_id": app.job_id,
            "job_title": job.title if job else None,
            "status": app.status,
            "compatibility_score": app.compatibility_score,
            "applied_at": app.applied_at
        })
    return result

def update_profile(db: Session, user_id: str, profile_data: schemas.ProfileUpdate):
    user = get_user_by_id(db, user_id)
    if user:
        for field, value in profile_data.dict(exclude_unset=True).items():
            setattr(user, field, value)
        db.commit()
    return user