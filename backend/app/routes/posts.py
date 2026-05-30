from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import (
    CommentCreate, CommentOut, LikeStatus, MessageResponse,
    PaginatedPosts, PostCreate, PostOut,
)
from app.services import post_service

router = APIRouter(prefix="/posts", tags=["Posts"])

@router.get("/feed", response_model=PaginatedPosts)
def feed(page: int = Query(1, ge=1), per_page: int = Query(15, ge=1, le=50),
         db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return post_service.get_feed(db, u.id, page, per_page)

@router.get("/search/posts", response_model=List[PostOut])
def search(q: str = Query(..., min_length=1),
           db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return post_service.search_posts(db, q, u.id)

@router.post("/", response_model=PostOut, status_code=201)
def create(data: PostCreate, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return post_service.create_post(db, data, u.id)

@router.delete("/{post_id}", response_model=MessageResponse)
def delete(post_id: int, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    post_service.delete_post(db, post_id, u.id)
    return {"message": "Deleted"}

@router.post("/{post_id}/like", response_model=LikeStatus)
def like(post_id: int, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return post_service.toggle_like(db, post_id, u.id)

@router.get("/{post_id}/comments", response_model=List[CommentOut])
def comments(post_id: int, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return post_service.get_comments(db, post_id)

@router.post("/{post_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(post_id: int, data: CommentCreate,
                db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return post_service.add_comment(db, post_id, data, u.id)
