from pydantic import BaseModel
from typing import Optional

class SettingsUpdate(BaseModel):
    jira_base_url: Optional[str] = None
    jira_email: Optional[str] = None
    jira_api_token: Optional[str] = None

class SettingsResponse(BaseModel):
    id: str
    org_id: str
    jira_base_url: Optional[str] = None
    jira_email: Optional[str] = None
    has_api_token: bool = False
    
    class Config:
        from_attributes = True
