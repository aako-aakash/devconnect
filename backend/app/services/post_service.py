from typing import List

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.models import Comment, Like, Notification, Post, User
from app.schemas.schemas import (
    CommentCreate,
    CommentOut,
    PaginatedPosts,
    PostAuthor,
    PostCreate,
    PostOut,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _build_post_out(post: Post, current_user_id: int) -> PostOut:
    return PostOut(
        id=post.id,
        content=post.content,
        created_at=post.created_at,
        author=PostAuthor(
            id=post.author.id,
            name=post.author.name,
            avatar_url=post.author.avatar_url,
        ),
        like_count=len(post.likes),
        comment_count=len(post.comments),
        liked_by_me=any(lk.user_id == current_user_id for lk in post.likes),
    )


def _build_comment_out(comment: Comment) -> CommentOut:
    return CommentOut(
        id=comment.id,
        content=comment.content,
        created_at=comment.created_at,
        post_id=comment.post_id,
        author=PostAuthor(
            id=comment.author.id,
            name=comment.author.name,
            avatar_url=comment.author.avatar_url,
        ),
    )


# ── Feed ──────────────────────────────────────────────────────────────────────

def get_feed(
    db: Session,
    current_user_id: int,
    page: int = 1,
    per_page: int = 20,
) -> PaginatedPosts:
    offset = (page - 1) * per_page
    total  = db.query(func.count(Post.id)).scalar() or 0
    posts  = (
        db.query(Post)
        .order_by(Post.created_at.desc())
        .offset(offset)
        .limit(per_page)
        .all()
    )
    return PaginatedPosts(
        posts=[_build_post_out(p, current_user_id) for p in posts],
        total=total,
        page=page,
        per_page=per_page,
        has_more=(offset + per_page) < total,
    )


# ── CRUD ──────────────────────────────────────────────────────────────────────

def create_post(db: Session, data: PostCreate, current_user_id: int) -> PostOut:
    post = Post(user_id=current_user_id, content=data.content)
    db.add(post)
    db.commit()
    db.refresh(post)
    return _build_post_out(post, current_user_id)


def delete_post(db: Session, post_id: int, current_user_id: int) -> None:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post.user_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorised to delete this post")
    db.delete(post)
    db.commit()


# ── Likes ─────────────────────────────────────────────────────────────────────

def toggle_like(db: Session, post_id: int, current_user_id: int) -> dict:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    existing = (
        db.query(Like)
        .filter(Like.user_id == current_user_id, Like.post_id == post_id)
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
        liked = False
    else:
        db.add(Like(user_id=current_user_id, post_id=post_id))
        db.commit()
        liked = True

        # Notify post owner (skip self-likes)
        if post.user_id != current_user_id:
            actor = db.query(User).filter(User.id == current_user_id).first()
            db.add(Notification(
                recipient_id=post.user_id,
                actor_name=actor.name,
                action="liked your post",
                post_id=post_id,
            ))
            db.commit()

    db.refresh(post)
    return {"liked": liked, "like_count": len(post.likes)}


# ── Comments ──────────────────────────────────────────────────────────────────

def get_comments(db: Session, post_id: int) -> List[CommentOut]:
    if not db.query(Post).filter(Post.id == post_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return [_build_comment_out(c) for c in comments]


def add_comment(db: Session, post_id: int, data: CommentCreate, current_user_id: int) -> CommentOut:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    comment = Comment(user_id=current_user_id, post_id=post_id, content=data.content)
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Notify post owner (skip self-comments)
    if post.user_id != current_user_id:
        actor = db.query(User).filter(User.id == current_user_id).first()
        db.add(Notification(
            recipient_id=post.user_id,
            actor_name=actor.name,
            action="commented on your post",
            post_id=post_id,
        ))
        db.commit()

    return _build_comment_out(comment)


# ── Search ────────────────────────────────────────────────────────────────────

def search_posts(db: Session, q: str, current_user_id: int) -> List[PostOut]:
    posts = (
        db.query(Post)
        .filter(Post.content.ilike(f"%{q}%"))
        .order_by(Post.created_at.desc())
        .limit(50)
        .all()
    )
    return [_build_post_out(p, current_user_id) for p in posts]
