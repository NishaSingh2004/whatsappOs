import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship, declared_attr
from core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class TenantModel(Base):
    __abstract__ = True

    id = Column(String, primary_key=True, default=generate_uuid)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    @declared_attr
    def org_id(cls):
        return Column(String, ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False, index=True)

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    departments = relationship("Department", back_populates="organization", cascade="all, delete-orphan")
    teams = relationship("Team", back_populates="organization", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="organization", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="organization", uselist=False, cascade="all, delete-orphan")
    settings = relationship("Settings", back_populates="organization", uselist=False, cascade="all, delete-orphan")
