from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrgCreate(BaseModel):
    name: str
    slug: str
    plan: Optional[str] = "Starter"
    admin_email: str
    admin_first_name: str
    admin_last_name: str
    admin_password: str

class OrgResponse(BaseModel):
    id: str
    name: str
    slug: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
