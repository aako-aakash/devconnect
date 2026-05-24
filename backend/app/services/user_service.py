from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.models import Notification, Post, User
from app.schemas.schemas import NotificationOut, PostAuthor, PostOut
from app.schemas.user import UserOut, UserProfile, UserUpdate


# ── Profile ───────────────────────────────────────────────────────────────────

def get_user_profile(db: Session, user_id: int) -> UserProfile:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserProfile(
        id=user.id,
        name=user.name,
        email=user.email,
        bio=user.bio,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
        post_count=len(user.posts),
    )


def get_user_posts(db: Session, user_id: int, current_user_id: int) -> List[PostOut]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    posts = sorted(user.posts, key=lambda p: p.created_at, reverse=True)
    return [
        PostOut(
            id=post.id,
            content=post.content,
            created_at=post.created_at,
            author=PostAuthor(id=user.id, name=user.name, avatar_url=user.avatar_url),
            like_count=len(post.likes),
            comment_count=len(post.comments),
            liked_by_me=any(lk.user_id == current_user_id for lk in post.likes),
        )
        for post in posts
    ]


def update_profile(db: Session, current_user: User, data: UserUpdate) -> UserOut:
    if data.name is not None:
        current_user.name = data.name.strip()
    if data.bio is not None:
        current_user.bio = data.bio
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url or None
    db.commit()
    db.refresh(current_user)
    return UserOut(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        bio=current_user.bio,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at,
        post_count=len(current_user.posts),
    )


# ── Search ────────────────────────────────────────────────────────────────────

def search_users(db: Session, q: str) -> List[UserOut]:
    users = (
        db.query(User)
        .filter(User.name.ilike(f"%{q}%"))
        .order_by(User.name)
        .limit(20)
        .all()
    )
    return [
        UserOut(
            id=u.id,
            name=u.name,
            email=u.email,
            bio=u.bio,
            avatar_url=u.avatar_url,
            created_at=u.created_at,
            post_count=len(u.posts),
        )
        for u in users
    ]


# ── Notifications ─────────────────────────────────────────────────────────────

def get_notifications(db: Session, current_user_id: int) -> List[NotificationOut]:
    notifs = (
        db.query(Notification)
        .filter(Notification.recipient_id == current_user_id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        NotificationOut(
            id=n.id,
            actor_name=n.actor_name,
            action=n.action,
            post_id=n.post_id,
            is_read=n.is_read,
            created_at=n.created_at,
        )
        for n in notifs
    ]


def mark_notifications_read(db: Session, current_user_id: int) -> None:
    db.query(Notification).filter(
        Notification.recipient_id == current_user_id,
        Notification.is_read == False,  # noqa: E712
    ).update({"is_read": True})
    db.commit()
