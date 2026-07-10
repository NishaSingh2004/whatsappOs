from sqlalchemy import Column, String, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .tenant import TenantModel

class WhatsAppMember(TenantModel):
    __tablename__ = "whatsapp_members"

    phone_number = Column(String, nullable=False, index=True)
    profile_name = Column(String, nullable=True)
    status = Column(String, default="Active")
    integration_status = Column(String, default="Connected")
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint('org_id', 'phone_number', name='uix_org_phone'),
    )
