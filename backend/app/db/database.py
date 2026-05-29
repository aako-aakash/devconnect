import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    pass


def _build_engine():
    url = settings.DATABASE_URL

    # Neon gives postgres:// — SQLAlchemy 2 needs postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    connect_args = {}
    # Force SSL for Neon / any cloud Postgres
    if "neon.tech" in url or "sslmode" not in url:
        connect_args["sslmode"] = "require"

    return create_engine(
        url,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10,
    )


engine = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    import app.models.models  # noqa — registers all ORM classes
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅  Database tables ready.")
    except Exception as exc:
        logger.error(f"❌  create_tables() failed: {exc}")
        raise


def check_db() -> dict:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"db": "connected"}
    except Exception as exc:
        return {"db": "error", "detail": str(exc)}
