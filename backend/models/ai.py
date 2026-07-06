from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .tenant import TenantModel

class AIChatSession(TenantModel):
    __tablename__ = "ai_sessions"
    title = Column(String, nullable=True)
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    user = relationship("User")
    messages = relationship("AIMessage", back_populates="session", cascade="all, delete-orphan", order_by="AIMessage.created_at")

class AIMessage(TenantModel):
    __tablename__ = "ai_messages"
    content = Column(Text, nullable=False)
    role = Column(String, nullable=False) # 'user' or 'assistant'
    session_id = Column(String, ForeignKey('ai_sessions.id', ondelete='CASCADE'), nullable=False)
    
    session = relationship("AIChatSession", back_populates="messages")
