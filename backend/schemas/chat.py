from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrgMessageCreate(BaseModel):
    content: str

class UserSnippet(BaseModel):
    first_name: str
    last_name: str
    
    class Config:
        from_attributes = True

class OrgMessageResponse(BaseModel):
    id: str
    content: str
    is_ai: bool
    created_at: datetime
    user: Optional[UserSnippet] = None
    
    class Config:
        from_attributes = True
