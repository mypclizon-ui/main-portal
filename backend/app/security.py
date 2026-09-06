from datetime import datetime, timedelta
from typing import Optional
import secrets

import bcrypt
from jose import JWTError, jwt

from .config import settings


def hash_password(password: str) -> str:
    """Hash a password with bcrypt. Returns a portable bcrypt hash string."""
    encoded = password.encode("utf-8")[:72]
    return bcrypt.hashpw(encoded, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8")[:72], hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_access_token(
    subject: str | int,
    expires_delta: Optional[timedelta] = None,
    remember_me: bool = False,
) -> str:
    """Issue a JWT. Short lifetime by default; 30 days if remember_me."""
    if expires_delta is None:
        expires_delta = timedelta(
            minutes=settings.access_token_expire_minutes
            if not remember_me
            else settings.remember_me_expire_days * 24 * 60
        )
    expire = datetime.utcnow() + expires_delta
    payload = {"sub": str(subject), "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def generate_reset_code(length: int = 6) -> str:
    """Generate a short numeric password-reset code."""
    # Use secrets to avoid predictability; digits only for easy entry.
    return "".join(str(secrets.randbelow(10)) for _ in range(length))


def decode_access_token(token: str) -> Optional[str]:
    """Return the subject (user id) if the token is valid, else None."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload.get("sub")
    except JWTError:
        return None