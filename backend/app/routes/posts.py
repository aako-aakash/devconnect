from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import (
    CommentCreate,
    CommentOut,
    LikeStatus,
    MessageResponse,
    PaginatedPosts,
    PostCreate,
    PostOut,
)
from app.services import post_service

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.get("/feed", response_model=PaginatedPosts, summary="Get paginated global feed")
def get_feed(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(15, ge=1, le=50, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return post_service.get_feed(db, current_user.id, page, per_page)


@router.get("/search/posts", response_model=List[PostOut], summary="Search posts by content")
def search_posts(
    q: str = Query(..., min_length=1, description="Search query"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return post_service.search_posts(db, q, current_user.id)


@router.post("/", response_model=PostOut, status_code=201, summary="Create a post")
def create_post(
    data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return post_service.create_post(db, data, current_user.id)


@router.delete("/{post_id}", response_model=MessageResponse, summary="Delete a post")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post_service.delete_post(db, post_id, current_user.id)
    return {"message": "Post deleted successfully"}


@router.post("/{post_id}/like", response_model=LikeStatus, summary="Toggle like on a post")
def toggle_like(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return post_service.toggle_like(db, post_id, current_user.id)


@router.get("/{post_id}/comments", response_model=List[CommentOut], summary="Get comments on a post")
def get_comments(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return post_service.get_comments(db, post_id)


@router.post("/{post_id}/comments", response_model=CommentOut, status_code=201, summary="Add a comment")
def add_comment(
    post_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return post_service.add_comment(db, post_id, data, current_user.id)
