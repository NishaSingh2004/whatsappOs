from sqlalchemy import Column, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .tenant import TenantModel

class Settings(TenantModel):
    __tablename__ = "settings"
    jira_base_url = Column(String, nullable=True)
    jira_email = Column(String, nullable=True)
    jira_api_token = Column(String, nullable=True)
    
    organization = relationship("Organization", back_populates="settings")

class Subscription(TenantModel):
    __tablename__ = "subscriptions"
    plan_tier = Column(String, default="starter") # starter, growth, enterprise
    status = Column(String, default="active") # active, suspended
    
    organization = relationship("Organization", back_populates="subscription")

class AuditLog(TenantModel):
    __tablename__ = "audit_logs"
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    
    actor_id = Column(String, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    actor = relationship("User")

class Notification(TenantModel):
    __tablename__ = "notifications"
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False) # system, task, ai
    is_read = Column(String, default="false") # "true", "false"
    
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user = relationship("User")
