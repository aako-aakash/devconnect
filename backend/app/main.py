import logging
import re

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.db.database import create_tables, check_db
from app.routes import auth, posts, users

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s – %(message)s",
)
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="DevConnect API",
    description="Social platform for student developers. All protected routes require `Authorization: Bearer <token>`.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Strategy: explicit list of origins  +  regex to catch any *.vercel.app preview URL.
# This means no matter what Vercel preview URL the frontend gets, it will always be allowed.

_ORIGIN_REGEX = (
    r"https://devconnect-steel.vercel.app/"   # any *.vercel.app
    r"|http://localhost(:\d+)?"                  # localhost (any port)
    r"|http://127\.0\.0\.1(:\d+)?"              # 127.0.0.1 (any port)
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.all_origins,         # explicit list
    allow_origin_regex=_ORIGIN_REGEX,           # regex fallback covers ALL vercel previews
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth.router,  prefix="/api")
app.include_router(posts.router, prefix="/api")
app.include_router(users.router, prefix="/api")

# ── Startup ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
def on_startup():
    logger.info("🚀 DevConnect API starting…")
    logger.info(f"   FRONTEND_URL  = {settings.FRONTEND_URL}")
    logger.info(f"   All origins   = {settings.all_origins}")
    try:
        create_tables()
    except Exception as e:
        logger.error(f"💥 Startup DB error: {e}")
        # Don't crash – let the app start so /debug can be hit

# ── Health & debug endpoints ───────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "DevConnect API 🚀", "docs": "/docs"}


@app.get("/health", tags=["Health"])
def health():
    db_status = check_db()
    return {
        "status": "healthy" if db_status["db"] == "connected" else "degraded",
        **db_status,
    }


@app.get("/debug", tags=["Health"])
def debug():
    """
    Returns configuration info to help diagnose deployment problems.
    Remove this endpoint (or protect it) before going to full production.
    """
    db_status = check_db()
    raw_url   = settings.DATABASE_URL or ""
    safe_url  = re.sub(r"://([^:]+):([^@]+)@", "://<user>:<pass>@", raw_url)
    return {
        "db":           db_status,
        "database_url": safe_url or "NOT SET",
        "frontend_url": settings.FRONTEND_URL,
        "all_origins":  settings.all_origins,
        "secret_set":   bool(settings.SECRET_KEY and settings.SECRET_KEY != "dev-secret-key-change-in-production-min-32-chars-here"),
    }
