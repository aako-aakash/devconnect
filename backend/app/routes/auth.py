from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.models import User
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserOut
from app.services.auth_service import login_user, register_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=201,
             summary="Register a new user")
def signup(data: UserCreate, db: Session = Depends(get_db)):
    """Create a new account and receive a JWT access token."""
    return register_user(db, data)


@router.post("/login", response_model=TokenResponse,
             summary="Log in with email + password")
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate and receive a JWT access token."""
    return login_user(db, data)


@router.get("/me", response_model=UserOut,
            summary="Get current authenticated user")
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the profile of the currently authenticated user."""
    return UserOut(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        bio=current_user.bio,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at,
        post_count=len(current_user.posts),
    )
