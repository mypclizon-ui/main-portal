from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    skills = Column(Text, nullable=True)      # comma-separated
    bio = Column(Text, nullable=True)
    cv_url = Column(String(500), nullable=True)  # relative path to uploaded CV
    role = Column(String(20), default="user")    # "user" | "admin"
    reset_code = Column(String(120), nullable=True)   # forgot-password code
    reset_expires = Column(DateTime, nullable=True)   # when reset_code expires
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship(
        "Application", back_populates="user", cascade="all, delete-orphan"
    )


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    location = Column(String(120), nullable=True)
    job_type = Column(String(50), nullable=True)      # full-time, part-time, contract...
    category = Column(String(120), nullable=True)
    salary = Column(String(120), nullable=True)
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    deadline = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("Application", back_populates="job")


class Application(Base):
    """A candidate's application for a job, with a status that can move
    through a simple recruitment pipeline tracked on the user profile."""

    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Tracking fields.
    status = Column(String(30), default="submitted")  # submitted | under_review | shortlisted | rejected | hired
    cover_note = Column(Text, nullable=True)

    # Snapshot taken at apply time.
    snapshot = Column(JSON, nullable=True)  # {title, company, location, salary}

    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    job = relationship("Job", back_populates="applications")
    user = relationship("User", back_populates="applications")

    __table_args__ = (UniqueConstraint("job_id", "user_id", name="uq_user_job"),)


class GovJob(Base):
    """Mirror table used by the standalone gov-jobs portal — kept here so a
    single backend could serve both, though the gov portal uses its own.
    (Defined for completeness; not used by the main API.)"""

    __tablename__ = "gov_jobs"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    ministry = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    location = Column(String(120), nullable=True)
    vacancy_count = Column(Integer, default=1)
    salary_scale = Column(String(120), nullable=True)
    deadline = Column(String(20), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)