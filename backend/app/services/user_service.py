from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.models import Notification, User
from app.schemas.schemas import NotificationOut, PostAuthor, PostOut
from app.schemas.user import UserOut, UserProfile, UserUpdate


def _u(u: User) -> UserOut:
    return UserOut(id=u.id, name=u.name, email=u.email, bio=u.bio,
                   avatar_url=u.avatar_url, created_at=u.created_at,
                   post_count=len(u.posts))


def get_user_profile(db: Session, user_id: int) -> UserProfile:
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404, "User not found")
    return UserProfile(id=u.id, name=u.name, email=u.email, bio=u.bio,
                       avatar_url=u.avatar_url, created_at=u.created_at,
                       post_count=len(u.posts))


def get_user_posts(db: Session, user_id: int, current_uid: int) -> List[PostOut]:
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404, "User not found")
    return [PostOut(id=p.id, content=p.content, created_at=p.created_at,
                    author=PostAuthor(id=u.id, name=u.name, avatar_url=u.avatar_url),
                    like_count=len(p.likes), comment_count=len(p.comments),
                    liked_by_me=any(l.user_id == current_uid for l in p.likes))
            for p in sorted(u.posts, key=lambda x: x.created_at, reverse=True)]


def update_profile(db: Session, user: User, data: UserUpdate) -> UserOut:
    if data.name is not None: user.name = data.name.strip()
    if data.bio is not None: user.bio = data.bio
    if data.avatar_url is not None: user.avatar_url = data.avatar_url or None
    db.commit(); db.refresh(user)
    return _u(user)


def search_users(db: Session, q: str) -> List[UserOut]:
    return [_u(u) for u in db.query(User).filter(User.name.ilike(f"%{q}%")).limit(20).all()]


def get_notifications(db: Session, uid: int) -> List[NotificationOut]:
    return [NotificationOut(id=n.id, actor_name=n.actor_name, action=n.action,
                            post_id=n.post_id, is_read=n.is_read, created_at=n.created_at)
            for n in db.query(Notification).filter(Notification.recipient_id == uid)
            .order_by(Notification.created_at.desc()).limit(50).all()]


def mark_notifications_read(db: Session, uid: int) -> None:
    db.query(Notification).filter(Notification.recipient_id == uid,
                                  Notification.is_read == False).update({"is_read": True})  # noqa
    db.commit()
