from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.database import create_tables
from app.routes import auth, posts, users

# ── App factory ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="DevConnect API",
    description=(
        "REST API for DevConnect — a social platform for student developers.\n\n"
        "All protected endpoints require `Authorization: Bearer <token>`."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global exception handler ──────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."},
    )

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth.router,  prefix="/api")
app.include_router(posts.router, prefix="/api")
app.include_router(users.router, prefix="/api")

# ── Startup ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
def on_startup():
    """Create all database tables on first run."""
    create_tables()

# ── Health checks ─────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "DevConnect API is running 🚀", "docs": "/docs"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
