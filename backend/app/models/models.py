from datetime import datetime
from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey,
    Integer, String, Text, UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100), nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    bio           = Column(Text, nullable=True)
    avatar_url    = Column(String(500), nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow)
    posts         = relationship("Post",         back_populates="author",    cascade="all, delete-orphan")
    likes         = relationship("Like",         back_populates="user",      cascade="all, delete-orphan")
    comments      = relationship("Comment",      back_populates="author",    cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="recipient", cascade="all, delete-orphan")


class Post(Base):
    __tablename__ = "posts"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    author     = relationship("User",    back_populates="posts")
    likes      = relationship("Like",    back_populates="post", cascade="all, delete-orphan")
    comments   = relationship("Comment", back_populates="post", cascade="all, delete-orphan")


class Like(Base):
    __tablename__ = "likes"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id    = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("user_id", "post_id", name="uq_user_post_like"),)
    user = relationship("User", back_populates="likes")
    post = relationship("Post", back_populates="likes")


class Comment(Base):
    __tablename__ = "comments"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id    = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    author     = relationship("User", back_populates="comments")
    post       = relationship("Post", back_populates="comments")


class Notification(Base):
    __tablename__ = "notifications"
    id           = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_name   = Column(String(100), nullable=False)
    action       = Column(String(100), nullable=False)
    post_id      = Column(Integer, nullable=True)
    is_read      = Column(Boolean, default=False, nullable=False)
    created_at   = Column(DateTime, default=datetime.utcnow)
    recipient    = relationship("User", back_populates="notifications")
