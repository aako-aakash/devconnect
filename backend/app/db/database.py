import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    pass


def _build_engine():
    """
    Build the SQLAlchemy engine.
    Neon (and most cloud Postgres) requires SSL.
    We normalise the URL and inject connect_args for psycopg2.
    """
    url = settings.DATABASE_URL

    # Neon gives postgres:// — SQLAlchemy 2 needs postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    # Psycopg2 needs sslmode in connect_args, not just the query string
    connect_args = {}
    if "neon.tech" in url or "sslmode=require" in url:
        connect_args["sslmode"] = "require"

    return create_engine(
        url,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10,
        echo=False,
    )


engine = _build_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ── FastAPI dependency ────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Startup: create tables + verify connection ────────────────────────────────

def create_tables():
    import app.models.models  # noqa – register all ORM classes
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created / verified.")
    except Exception as e:
        logger.error(f"❌ create_tables() failed: {e}")
        raise


def check_db() -> dict:
    """Quick DB health check — returns a status dict."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"db": "connected"}
    except Exception as e:
        return {"db": "error", "detail": str(e)}
