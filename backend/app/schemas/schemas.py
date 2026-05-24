from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator


# ── Posts ─────────────────────────────────────────────────────────────────────

class PostCreate(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def content_valid(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Post content must not be empty")
        if len(v) > 2000:
            raise ValueError("Post content must not exceed 2000 characters")
        return v


class PostAuthor(BaseModel):
    id: int
    name: str
    avatar_url: Optional[str] = None

    model_config = {"from_attributes": True}


class PostOut(BaseModel):
    id: int
    content: str
    created_at: datetime
    author: PostAuthor
    like_count: int = 0
    comment_count: int = 0
    liked_by_me: bool = False

    model_config = {"from_attributes": True}


class PaginatedPosts(BaseModel):
    posts: List[PostOut]
    total: int
    page: int
    per_page: int
    has_more: bool


# ── Comments ──────────────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def content_valid(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Comment must not be empty")
        if len(v) > 500:
            raise ValueError("Comment must not exceed 500 characters")
        return v


class CommentOut(BaseModel):
    id: int
    content: str
    created_at: datetime
    post_id: int
    author: PostAuthor

    model_config = {"from_attributes": True}


# ── Likes ─────────────────────────────────────────────────────────────────────

class LikeStatus(BaseModel):
    liked: bool
    like_count: int


# ── Notifications ─────────────────────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: int
    actor_name: str
    action: str
    post_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Generic ───────────────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
