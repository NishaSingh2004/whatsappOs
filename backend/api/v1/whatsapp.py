from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from models.whatsapp import WhatsAppMember
from api.deps import get_current_user
from schemas.whatsapp import WebhookPayload, WhatsAppMemberResponse
from core.ai_whatsapp import WhatsAppAIAssistant
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.get("/config")
def get_whatsapp_config(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"status": "success", "message": "WhatsApp config endpoint ready"}

@router.post("/config")
def update_whatsapp_config(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"status": "success", "message": "WhatsApp config updated"}

@router.get("/status")
def get_whatsapp_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"status": "success", "data": {"connected": False}}

@router.get("/members", response_model=dict)
def get_whatsapp_members(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    members = db.query(WhatsAppMember).filter(WhatsAppMember.org_id == current_user.org_id).all()
    # Format to match frontend structure expected by the page
    formatted_members = []
    for m in members:
        formatted_members.append({
            "id": m.id,
            "name": m.profile_name or "Unknown",
            "empId": "WA-" + m.id[:4],
            "phone": m.phone_number,
            "department": "WhatsApp",
            "role": "EMPLOYEE",
            "status": m.status,
            "integrationStatus": m.integration_status,
            "lastSeen": m.last_seen.strftime("%Y-%m-%d %H:%M") if m.last_seen else "Just now",
            "joined": m.created_at.strftime("%Y-%m-%d") if m.created_at else "Today"
        })
    return {"status": "success", "members": formatted_members}

@router.post("/webhook")
async def whatsapp_webhook(payload: WebhookPayload, db: Session = Depends(get_db)):
    """Receives messages from the Node.js Baileys service"""
    member = db.query(WhatsAppMember).filter(
        WhatsAppMember.org_id == payload.org_id,
        WhatsAppMember.phone_number == payload.phone_number
    ).first()

    if not member:
        # New connection! Create the member
        new_member = WhatsAppMember(
            org_id=payload.org_id,
            phone_number=payload.phone_number,
            profile_name=payload.profile_name,
            status="Active",
            integration_status="Connected"
        )
        db.add(new_member)
        db.commit()
        db.refresh(new_member)
        
        # Send back the automated reply instruction
        return {"status": "success", "reply": "You are connected successfully to WorkOS!"}
    
    # Update last seen
    member.last_seen = datetime.now(timezone.utc)
    if payload.profile_name:
        member.profile_name = payload.profile_name
    db.commit()

    # Pass the message to the AI assistant
    assistant = WhatsAppAIAssistant(db, payload.org_id, member.profile_name or "Employee")
    ai_reply = await assistant.process_message(payload.message)

    return {"status": "success", "reply": ai_reply}
