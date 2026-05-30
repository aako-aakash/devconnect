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

@router.get("/search", response_model=List[UserOut])
def search(q: str = Query(..., min_length=1),
           db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return user_service.search_users(db, q)

@router.get("/notifications", response_model=List[NotificationOut])
def notifications(db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return user_service.get_notifications(db, u.id)

@router.post("/notifications/read", response_model=MessageResponse)
def mark_read(db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    user_service.mark_notifications_read(db, u.id)
    return {"message": "Marked as read"}

@router.patch("/me/profile", response_model=UserOut)
def update_me(data: UserUpdate, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return user_service.update_profile(db, u, data)

@router.get("/{user_id}", response_model=UserProfile)
def profile(user_id: int, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return user_service.get_user_profile(db, user_id)

@router.get("/{user_id}/posts", response_model=List[PostOut])
def user_posts(user_id: int, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return user_service.get_user_posts(db, user_id, u.id)
