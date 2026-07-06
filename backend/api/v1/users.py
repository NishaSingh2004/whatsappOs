from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User, RoleEnum
from schemas.user import UserInvite, UserResponse, InviteResponse, RegisterUser
from api.deps import get_current_user
from core.security import get_password_hash, create_access_token, decode_access_token
from core.security import get_password_hash
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter()

from core.config import settings

def send_invitation_email(email: str, first_name: str, invite_link: str):
    msg = MIMEMultipart()
    msg['From'] = f"WorkOS Alerts <{settings.SMTP_USER}>"
    msg['To'] = email
    msg['Subject'] = "You've been invited to WorkOS!"
    
    body = f"""
    Hello {first_name},
    
    You have been invited to join your team on WorkOS.
    
    Please click the link below to set your password and register your account:
    
    {invite_link}
    """
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        
        # Only attempt to login if credentials aren't placeholders
        if settings.SMTP_USER != "your_email@gmail.com":
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            print(f"Real Email sent successfully to {email}")
        else:
            print(f"Mock Email sent (Please configure SMTP_USER in config.py to send real emails)")
            
        server.quit()
    except Exception as e:
        print(f"Failed to send email: {e}")

@router.post("/invite", response_model=InviteResponse)
def invite_user(invite: UserInvite, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == invite.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
        
    # Create the user with a temporary password and inactive state
    new_user = User(
        email=invite.email,
        hashed_password=get_password_hash(""), # No password yet
        first_name=invite.first_name,
        last_name=invite.last_name,
        role=RoleEnum(invite.role),
        org_id=current_user.org_id,
        is_active=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate token
    token = create_access_token({"sub": str(new_user.id), "type": "invite"})
    invite_link = f"http://localhost:3000/register?token={token}"
    
    # Send email in background
    background_tasks.add_task(send_invitation_email, invite.email, invite.first_name, invite_link)
    
    return InviteResponse(
        user=UserResponse.model_validate(new_user),
        invite_link=invite_link
    )

@router.post("/register", response_model=UserResponse)
def register_user(reg: RegisterUser, db: Session = Depends(get_db)):
    payload = decode_access_token(reg.token)
    if not payload or payload.get("type") != "invite":
        raise HTTPException(status_code=400, detail="Invalid or expired invite token")
        
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.is_active:
        raise HTTPException(status_code=400, detail="User is already registered")
        
    user.hashed_password = get_password_hash(reg.password)
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user

@router.get("", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(User).filter(User.org_id == current_user.org_id).all()
