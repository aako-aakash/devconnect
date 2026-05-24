from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings


class Base(DeclarativeBase):
    pass


engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,      # reconnect on stale connections
    pool_recycle=300,        # recycle connections every 5 min
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ── FastAPI dependency ────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Startup table creation ────────────────────────────────────────────────────

def create_tables():
    import app.models.models  # noqa: ensure all models are registered
    Base.metadata.create_all(bind=engine)
