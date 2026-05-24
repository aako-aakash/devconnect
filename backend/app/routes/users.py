from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import MessageResponse, NotificationOut, PostOut
from app.schemas.user import UserOut, UserProfile, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/search", response_model=List[UserOut], summary="Search users by name")
def search_users(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return user_service.search_users(db, q)


@router.get("/notifications", response_model=List[NotificationOut],
            summary="Get current user's notifications")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return user_service.get_notifications(db, current_user.id)


@router.post("/notifications/read", response_model=MessageResponse,
             summary="Mark all notifications as read")
def mark_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_service.mark_notifications_read(db, current_user.id)
    return {"message": "All notifications marked as read"}


@router.patch("/me/profile", response_model=UserOut, summary="Update current user's profile")
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return user_service.update_profile(db, current_user, data)


@router.get("/{user_id}", response_model=UserProfile, summary="Get a user's public profile")
def get_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return user_service.get_user_profile(db, user_id)


@router.get("/{user_id}/posts", response_model=List[PostOut], summary="Get all posts by a user")
def get_user_posts(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return user_service.get_user_posts(db, user_id, current_user.id)
