from sqlalchemy import Column, String, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from .tenant import TenantModel
import enum

class RoleEnum(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ORG_ADMIN = "ORG_ADMIN"
    MANAGER = "MANAGER"
    TEAM_LEAD = "TEAM_LEAD"
    EMPLOYEE = "EMPLOYEE"

class User(TenantModel):
    __tablename__ = "users"

    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(SQLEnum(RoleEnum), default=RoleEnum.EMPLOYEE, nullable=False)
    is_active = Column(Boolean, default=True)
    department_id = Column(String, ForeignKey('departments.id', ondelete='SET NULL'), nullable=True)
    team_id = Column(String, ForeignKey('teams.id', ondelete='SET NULL'), nullable=True)

    organization = relationship("Organization", back_populates="users")
    department = relationship("Department", back_populates="users")
    team = relationship("Team", back_populates="users")

class Department(TenantModel):
    __tablename__ = "departments"
    name = Column(String, nullable=False)
    organization = relationship("Organization", back_populates="departments")
    users = relationship("User", back_populates="department")
    teams = relationship("Team", back_populates="department")

class Team(TenantModel):
    __tablename__ = "teams"
    name = Column(String, nullable=False)
    department_id = Column(String, ForeignKey('departments.id', ondelete='CASCADE'), nullable=False)
    
    organization = relationship("Organization", back_populates="teams")
    department = relationship("Department", back_populates="teams")
    users = relationship("User", back_populates="team")
