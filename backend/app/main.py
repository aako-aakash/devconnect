import logging
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import check_db, create_tables
from app.routes import auth, posts, users

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="DevConnect API",
    description="Social platform for student developers.\n\nProtected routes require `Authorization: Bearer <token>`.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# allow_origin_regex covers ALL *.vercel.app preview URLs automatically.
# allow_origins covers explicit local + production origins.

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.all_origins,
    allow_origin_regex=r"https://[a-zA-Z0-9\-]+(\.vercel\.app)|http://localhost(:\d+)?|http://127\.0\.0\.1(:\d+)?",
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
    logger.info("🚀  Starting DevConnect API")
    logger.info(f"    FRONTEND_URL : {settings.FRONTEND_URL}")
    logger.info(f"    All origins  : {settings.all_origins}")
    try:
        create_tables()
    except Exception as exc:
        logger.error(f"💥  Startup error: {exc}")

# ── Health & debug ────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "DevConnect API 🚀", "docs": "/docs"}


@app.get("/health", tags=["Health"])
def health():
    result = check_db()
    return {"status": "healthy" if result["db"] == "connected" else "degraded", **result}


@app.get("/debug", tags=["Health"])
def debug():
    """Diagnose deployment issues — remove before going public."""
    raw = settings.DATABASE_URL or ""
    safe = re.sub(r"://([^:]+):([^@]+)@", r"://<user>:<pass>@", raw)
    return {
        "db":            check_db(),
        "database_url":  safe or "NOT SET ⚠️",
        "frontend_url":  settings.FRONTEND_URL,
        "all_origins":   settings.all_origins,
        "secret_ok":     len(settings.SECRET_KEY) >= 32,
    }
