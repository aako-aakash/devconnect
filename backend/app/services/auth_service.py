import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.models import User
from app.schemas.user import UserCreate, UserLogin, UserOut, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token

logger = logging.getLogger(__name__)


def _user_to_out(user: User, post_count: int = 0) -> UserOut:
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        bio=user.bio,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
        post_count=post_count,
    )


def register_user(db: Session, data: UserCreate) -> TokenResponse:
    try:
        existing = db.query(User).filter(User.email == data.email.lower()).first()
    except Exception as e:
        logger.error(f"DB error checking existing user: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Check DATABASE_URL on Render.",
        )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    try:
        user = User(
            name=data.name.strip(),
            email=data.email.lower(),
            password_hash=hash_password(data.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        logger.error(f"DB error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Could not create account. DB error: {str(e)[:200]}",
        )

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=_user_to_out(user, 0))


def login_user(db: Session, data: UserLogin) -> TokenResponse:
    try:
        user = db.query(User).filter(User.email == data.email.lower()).first()
    except Exception as e:
        logger.error(f"DB error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Check DATABASE_URL on Render.",
        )

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=_user_to_out(user, len(user.posts)))
