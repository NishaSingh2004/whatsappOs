from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProjectCreate(BaseModel):
    name: str
    jira_key: str
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    jira_key: str
    status: str
    org_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True
