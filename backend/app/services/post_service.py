import logging
from typing import List
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.models import Comment, Like, Notification, Post, User
from app.schemas.schemas import (
    CommentCreate, CommentOut, PaginatedPosts,
    PostAuthor, PostCreate, PostOut,
)

logger = logging.getLogger(__name__)


def _post_out(post: Post, uid: int) -> PostOut:
    return PostOut(
        id=post.id,
        content=post.content,
        created_at=post.created_at,
        author=PostAuthor(id=post.author.id, name=post.author.name, avatar_url=post.author.avatar_url),
        like_count=len(post.likes),
        comment_count=len(post.comments),
        liked_by_me=any(l.user_id == uid for l in post.likes),
    )


def _comment_out(c: Comment) -> CommentOut:
    return CommentOut(
        id=c.id, content=c.content, created_at=c.created_at, post_id=c.post_id,
        author=PostAuthor(id=c.author.id, name=c.author.name, avatar_url=c.author.avatar_url),
    )


def get_feed(db: Session, uid: int, page: int = 1, per_page: int = 15) -> PaginatedPosts:
    offset = (page - 1) * per_page
    total  = db.query(func.count(Post.id)).scalar() or 0
    posts  = db.query(Post).order_by(Post.created_at.desc()).offset(offset).limit(per_page).all()
    return PaginatedPosts(
        posts=[_post_out(p, uid) for p in posts],
        total=total, page=page, per_page=per_page,
        has_more=(offset + per_page) < total,
    )


def create_post(db: Session, data: PostCreate, uid: int) -> PostOut:
    post = Post(user_id=uid, content=data.content)
    db.add(post); db.commit(); db.refresh(post)
    return _post_out(post, uid)


def delete_post(db: Session, post_id: int, uid: int) -> None:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != uid:
        raise HTTPException(status_code=403, detail="Not your post")
    db.delete(post); db.commit()


def toggle_like(db: Session, post_id: int, uid: int) -> dict:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = db.query(Like).filter(Like.user_id == uid, Like.post_id == post_id).first()
    if existing:
        db.delete(existing); db.commit(); liked = False
    else:
        db.add(Like(user_id=uid, post_id=post_id)); db.commit(); liked = True
        if post.user_id != uid:
            actor = db.query(User).filter(User.id == uid).first()
            db.add(Notification(recipient_id=post.user_id, actor_name=actor.name,
                                action="liked your post", post_id=post_id))
            db.commit()

    db.refresh(post)
    return {"liked": liked, "like_count": len(post.likes)}


def get_comments(db: Session, post_id: int) -> List[CommentOut]:
    if not db.query(Post).filter(Post.id == post_id).first():
        raise HTTPException(status_code=404, detail="Post not found")
    return [_comment_out(c) for c in
            db.query(Comment).filter(Comment.post_id == post_id)
              .order_by(Comment.created_at.asc()).all()]


def add_comment(db: Session, post_id: int, data: CommentCreate, uid: int) -> CommentOut:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    c = Comment(user_id=uid, post_id=post_id, content=data.content)
    db.add(c); db.commit(); db.refresh(c)
    if post.user_id != uid:
        actor = db.query(User).filter(User.id == uid).first()
        db.add(Notification(recipient_id=post.user_id, actor_name=actor.name,
                            action="commented on your post", post_id=post_id))
        db.commit()
    return _comment_out(c)


def search_posts(db: Session, q: str, uid: int) -> List[PostOut]:
    posts = db.query(Post).filter(Post.content.ilike(f"%{q}%")) \
               .order_by(Post.created_at.desc()).limit(50).all()
    return [_post_out(p, uid) for p in posts]
