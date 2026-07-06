from pydantic import BaseModel, EmailStr
from typing import Optional

class UserInvite(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: str = "EMPLOYEE"
    
class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    
    class Config:
        from_attributes = True

class InviteResponse(BaseModel):
    user: UserResponse
    invite_link: str

class RegisterUser(BaseModel):
    token: str
    password: str
