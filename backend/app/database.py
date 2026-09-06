from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import resolved_database_url

engine = create_engine(
    resolved_database_url(),
    connect_args={"check_same_thread": False}
    if resolved_database_url().startswith("sqlite")
    else {},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()