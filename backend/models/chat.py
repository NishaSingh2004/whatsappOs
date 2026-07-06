from sqlalchemy import Column, String, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .tenant import TenantModel

class OrganizationMessage(TenantModel):
    __tablename__ = "org_messages"
    content = Column(Text, nullable=False)
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=True) # null if AI
    is_ai = Column(Boolean, default=False)
    
    user = relationship("User")
