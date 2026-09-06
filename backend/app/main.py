import os
import secrets
import shutil
import uuid
from pathlib import Path

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session

from . import models, schemas
from .config import settings
from .database import Base, engine, get_db
from .security import (
    create_access_token,
    decode_access_token,
    generate_reset_code,
    hash_password,
    verify_password,
)

Base.metadata.create_all(bind=engine)
app = FastAPI(title="BD Garments Career — Main Portal API")

# Allow the Next.js frontend (and the legacy WordPress site) to call us.
# Local development origins plus your production domains.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8000",
        "https://www.bdgarmentscareer.com",
        "https://bdgarmentscareer.com",
        "https://api.bdgarmentscareer.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    user_id = decode_access_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.get(models.User, int(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_admin(user: models.User = Depends(get_current_user)) -> models.User:
    """Reject non-admin users for protected write endpoints."""
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return user


# --------------------------------------------------------------- Auth
@app.post("/auth/signup", response_model=schemas.TokenOut, status_code=201)
def signup(payload: schemas.SignupIn, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    user = models.User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    return schemas.TokenOut(access_token=token, user=schemas.UserOut.model_validate(user))


@app.post("/auth/login", response_model=schemas.TokenOut)
def login(payload: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(user.id, remember_me=payload.remember_me)
    return schemas.TokenOut(access_token=token, user=schemas.UserOut.model_validate(user))


@app.post("/auth/forgot", status_code=200)
def forgot_password(payload: schemas.ForgotPasswordIn, db: Session = Depends(get_db)):
    """Generate a 6-digit reset code. In production, email it to the user;
    in demo, echo it in the response so a front-end can show it."""
    user = db.query(models.User).filter(models.User.email == payload.email).one_or_none()
    if not user:
        # Don't reveal whether an email exists.
        return {"status": "sent"}
    import datetime as _dt
    user.reset_code = generate_reset_code()
    user.reset_expires = _dt.datetime.utcnow() + _dt.timedelta(minutes=15)
    db.commit()
    return {"status": "sent", "reset_code": user.reset_code}  # demo: echo code


@app.post("/auth/reset", response_model=schemas.TokenOut, status_code=200)
def reset_password(payload: schemas.ResetPasswordIn, db: Session = Depends(get_db)):
    """Validate the reset code (15-min expiry) and set a new password."""
    import datetime as _dt
    user = db.query(models.User).filter(models.User.email == payload.email).one_or_none()
    if not user or not user.reset_code:
        raise HTTPException(status_code=400, detail="No reset request found")
    if user.reset_expires is None or user.reset_expires < _dt.datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset code expired. Request a new one.")
    if user.reset_code != payload.reset_code:
        raise HTTPException(status_code=401, detail="Invalid reset code")

    user.hashed_password = hash_password(payload.new_password)
    user.reset_code = None
    user.reset_expires = None
    db.commit()

    token = create_access_token(user.id)
    return schemas.TokenOut(access_token=token, user=schemas.UserOut.model_validate(user))


# --------------------------------------------------------------- Google OAuth
class GoogleLoginIn(BaseModel):
    id_token: str


GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_CLIENT_ID = getattr(settings, "google_client_id", "")  # set in .env / Render


@app.post("/auth/google", response_model=schemas.TokenOut)
def google_login(payload: GoogleLoginIn, db: Session = Depends(get_db)):
    """Verify a Google ID token and create/return a local user.

    Requires a GOOGLE_CLIENT_ID to be configured. The token is validated
    using Google's published JWKS so the site never handles Google secrets.
    """
    import httpx

    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth is not configured on this server")

    try:
        from jose import jwt as _jwt
        with httpx.Client(timeout=15) as client:
            certs = client.get(GOOGLE_CERTS_URL).json().get("keys", [])
        # Decode/verify against the JWKS keys.
        payload_decoded = _jwt.decode(
            payload.id_token,
            certs,
            algorithms=["RS256"],
            audience=GOOGLE_CLIENT_ID,
            options={"verify_exp": True},
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    google_email = payload_decoded.get("email")
    google_name = payload_decoded.get("name") or payload_decoded.get("email", "").split("@")[0]
    if not google_email:
        raise HTTPException(status_code=400, detail="Google token missing email")

    user = db.query(models.User).filter(models.User.email == google_email).one_or_none()
    if not user:
        # Auto-create an account with a random password so it's never usable
        # to sign in via password flow, but the email identifies the user.
        user = models.User(
            email=google_email,
            full_name=google_name,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            role="user",
            is_admin=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(user.id)
    return schemas.TokenOut(access_token=token, user=schemas.UserOut.model_validate(user))


@app.get("/auth/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(get_current_user)):
    return user


# --------------------------------------------------------------- Profile
@app.put("/profile", response_model=schemas.UserOut)
def update_profile(
    payload: schemas.ProfileUpdateIn,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@app.post("/profile/cv", response_model=schemas.UserOut)
async def upload_cv(
    file: UploadFile = File(...),
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in ("application/pdf", "application/msword", "text/plain"):
        raise HTTPException(status_code=400, detail="Only PDF, Word or plain text CVs are supported")

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename or "").suffix or ".pdf"
    filename = f"{user.id}-{uuid.uuid4().hex}{ext}"
    dest = upload_dir / filename

    # Stream to disk in chunks.
    with dest.open("wb") as out:
        shutil.copyfileobj(file.file, out)

    # Keep a relative path that a static mount can serve.
    user.cv_url = f"/media/{filename}"
    db.commit()
    db.refresh(user)
    return user


# ---------------------------------------------------------------- Jobs
@app.get("/jobs", response_model=list[schemas.JobOut])
def list_jobs(
    q: str | None = None,
    category: str | None = None,
    location: str | None = None,
    job_type: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Job).filter(models.Job.is_active == True)  # noqa: E712
    if q:
        query = query.filter(models.Job.title.ilike(f"%{q}%"))
    if category:
        query = query.filter(models.Job.category.ilike(f"%{category}%"))
    if location:
        query = query.filter(models.Job.location.ilike(f"%{location}%"))
    if job_type:
        query = query.filter(models.Job.job_type == job_type)
    return query.order_by(models.Job.created_at.desc()).all()


@app.get("/jobs/{job_id}", response_model=schemas.JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(models.Job, job_id)
    if not job or not job.is_active:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/jobs/filters/meta")
def jobs_filters(db: Session = Depends(get_db)):
    def distinct(col):
        return [r[0] for r in db.query(col).distinct().all() if r[0]]

    return {
        "categories": distinct(models.Job.category),
        "locations": distinct(models.Job.location),
        "types": distinct(models.Job.job_type),
    }


@app.post("/jobs", response_model=schemas.JobOut, status_code=201, dependencies=[Depends(require_admin)])
def create_job(payload: schemas.JobCreate, db: Session = Depends(get_db)):
    """Admin-only: publish a new job listing."""
    job = models.Job(**payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


# --------------------------------------------------------- Applications
@app.post("/jobs/{job_id}/apply", response_model=schemas.ApplicationOut, status_code=201)
def apply_to_job(
    job_id: int,
    payload: schemas.ApplicationIn,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = db.get(models.Job, job_id)
    if not job or not job.is_active:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = (
        db.query(models.Application)
        .filter(models.Application.job_id == job_id, models.Application.user_id == user.id)
        .one_or_none()
    )
    if existing:
        raise HTTPException(status_code=409, detail="You have already applied to this job")

    application = models.Application(
        job_id=job.id,
        user_id=user.id,
        cover_note=payload.cover_note,
        status="submitted",
        snapshot={
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "salary": job.salary,
        },
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@app.get("/applications/me", response_model=list[schemas.ApplicationOut])
def my_applications(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(models.Application)
        .filter(models.Application.user_id == user.id)
        .order_by(models.Application.applied_at.desc())
        .all()
    )


@app.patch("/applications/{app_id}/status", response_model=schemas.ApplicationOut)
def update_application_status(
    app_id: int,
    status: str,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = db.get(models.Application, app_id)
    allowed = {"submitted", "under_review", "shortlisted", "rejected", "hired"}
    if status not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {', '.join(sorted(allowed))}")
    if application is None or application.user_id != user.id:
        raise HTTPException(status_code=404, detail="Application not found")
    application.status = status
    db.commit()
    db.refresh(application)
    return application


# --------------------------------------------------------------- Media serve
from fastapi.staticfiles import StaticFiles  # noqa: E402

# Serve uploaded CVs from the /media mount point.
media_dir = Path(settings.upload_dir)
media_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(media_dir)), name="media")


# ---------------------------------------------------------------- Seed
@app.on_event("startup")
def seed_jobs():
    """Insert a handful of sample jobs the first time the DB is empty.
    Safe: only runs when there are no jobs yet."""
    db = next(get_db())
    try:
        if db.query(models.Job).count() == 0:
            samples = [
                ("Sewing Machine Operator", "Apex Knitwear Ltd", "Gazipur", "full-time", "Factory", "৳25,000/mo", "Operate industrial sewing machines on a knit production line.", "At least 2 years of experience; able to work shifts."),
                ("Quality Inspector", "Envoy Textiles", "Dhaka", "full-time", "Quality", "৳30,000/mo", "Inspect finished garments for defects before shipment.", "Eye for detail; garments QC certificate preferred."),
                ("Merchandiser", "DBL Group", "Chattogram", "permanent", "Merchandising", "৳45,000/mo", "Liaise between buyers and the factory to manage orders and timelines.", "BA in Fashion Merchandising or equivalent; 3+ years."),
                ("Knitting Supervisor", "Ha-Meem Group", "Savar", "full-time", "Knit", "৳35,000/mo", "Supervise a circular knitting section and maintain output quality.", "Diploma in Textile Engineering; leadership skills."),
                ("Industrial Engineer", "Beximco Textiles", "Narayanganj", "contract", "Textile", "৳55,000/mo", "Optimise layout and workflow to improve line efficiency.", "BSc in Industrial Engineering; lean manufacturing knowledge."),
                ("Finishing Supervisor", "Super Knitting", "Ashulia", "full-time", "Finishing", "৳32,000/mo", "Oversee the finishing and packing section from bundling to dispatch.", "2+ years in a washing/finishing unit."),
                ("Sample Developer", "Ananta Group", "Dhaka", "permanent", "Sample", "৳40,000/mo", "Develop and cost new samples from design briefs.", "Strong pattern-making and garment construction skills."),
            ]
            for row in samples:
                db.add(models.Job(
                    title=row[0], company=row[1], location=row[2],
                    job_type=row[3], category=row[4], salary=row[5],
                    description=row[6], requirements=row[7],
                ))
            db.commit()
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok", "service": "bdgc-main-portal"}