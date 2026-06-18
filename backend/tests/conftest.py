"""
Shared pytest fixtures.

Key idea: we override DevConnect's `get_db` dependency to point at an
in-memory SQLite database instead of the real Postgres/Neon database.
Every test gets a clean, empty database — fast and fully isolated.
"""
import os

# Set required env vars BEFORE importing the app, since Settings reads
# them at import time.
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only-not-for-prod")
os.environ.setdefault("FRONTEND_URL", "http://localhost:5173")

import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.database import Base, get_db


# ── In-memory SQLite engine (shared across the test session) ──────────────────
engine = create_engine(
    "sqlite://",                 # in-memory, never touches disk
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,        # keep the same connection for all sessions
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db_session():
    """Create all tables, yield a session, then drop everything."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    """FastAPI TestClient with the DB dependency overridden."""
    from fastapi.testclient import TestClient

    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def auth_headers(client):
    """Signs up a fresh user and returns ready-to-use auth headers."""
    resp = client.post("/api/auth/signup", json={
        "name": "Test User",
        "email": "testuser@example.com",
        "password": "testpass123",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
