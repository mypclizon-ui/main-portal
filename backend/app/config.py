from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # PostgreSQL via Docker is the default. If Docker is not running, the
    # app falls back to an in-file SQLite database so the project still
    # works out of the box for local development.
    database_url: str = "sqlite:///./bdgc_main.db"

    # JWT auth.
    secret_key: str = "dev-secret-key-change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours (session)
    remember_me_expire_days: int = 30            # "Remember me" → 30 days

    # Google OAuth (optional). Set in .env / Render env to enable social login.
    google_client_id: str = ""

    # CV uploads are stored on local disk under ./uploads.
    upload_dir: str = str(BASE_DIR / "uploads")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()

# The PostgreSQL connection string for Docker (used by docker-compose / docs).
DATABASE_URL_DOCKER = "postgresql+psycopg2://bdgc:bdgc_password@localhost:5432/bdgc_main"


def resolved_database_url() -> str:
    """Return the Postgres URL if the user set one, otherwise SQLite."""
    return settings.database_url or DATABASE_URL_DOCKER