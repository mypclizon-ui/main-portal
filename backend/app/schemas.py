from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


# --------------------------------------------------------------- Auth
class SignupIn(BaseModel):
    email: EmailStr
    full_name: str
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False  # true → longer token lifetime (30 days)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    skills: Optional[str] = None
    bio: Optional[str] = None
    cv_url: Optional[str] = None
    role: str = "user"          # "user" | "admin"
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# --------------------------------------------------------------- Forgot / Reset
class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    email: EmailStr
    reset_code: str
    new_password: str


# --------------------------------------------------------------- Profile
class ProfileUpdateIn(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    skills: Optional[str] = None
    bio: Optional[str] = None


# --------------------------------------------------------------- Jobs
class JobCreate(BaseModel):
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    category: Optional[str] = None
    salary: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    deadline: Optional[str] = None
    is_active: bool = True


class JobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    category: Optional[str] = None
    salary: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    deadline: Optional[str] = None
    is_active: bool
    created_at: datetime


# --------------------------------------------------------------- Applications
class ApplicationIn(BaseModel):
    cover_note: Optional[str] = None


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    user_id: int
    status: str
    cover_note: Optional[str] = None
    snapshot: Optional[dict] = None
    applied_at: datetime
    updated_at: datetime
    job: Optional[JobOut] = None