from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WebhookPayload(BaseModel):
    org_id: str
    phone_number: str
    profile_name: Optional[str] = None
    message: str

class WhatsAppMemberResponse(BaseModel):
    id: str
    phone_number: str
    profile_name: Optional[str]
    status: str
    integration_status: str
    last_seen: datetime

    class Config:
        orm_mode = True
        from_attributes = True
