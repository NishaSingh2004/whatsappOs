from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from models.admin import Settings
from api.deps import get_current_active_org_admin
from core.jira import JiraService

router = APIRouter()

class JiraConfig(BaseModel):
    jira_base_url: str
    jira_email: str
    jira_api_token: str

@router.post("/config")
def save_jira_config(config: JiraConfig, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_org_admin)):
    settings = db.query(Settings).filter(Settings.org_id == current_user.org_id).first()
    if not settings:
        settings = Settings(org_id=current_user.org_id)
        db.add(settings)
    
    settings.jira_base_url = config.jira_base_url
    settings.jira_email = config.jira_email
    settings.jira_api_token = config.jira_api_token
    
    db.commit()
    return {"message": "Jira configuration saved successfully."}

@router.get("/test")
async def test_jira_connection(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_org_admin)):
    settings = db.query(Settings).filter(Settings.org_id == current_user.org_id).first()
    if not settings or not settings.jira_base_url or not settings.jira_api_token:
        raise HTTPException(status_code=400, detail="Jira not configured for this organization.")
        
    jira = JiraService(settings.jira_base_url, settings.jira_email, settings.jira_api_token)
    try:
        projects = await jira.get_projects()
        return {"status": "success", "projects_count": len(projects)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Jira connection failed: {str(e)}")

@router.post("/webhook")
async def jira_webhook(payload: dict, db: Session = Depends(get_db)):
    # Very basic implementation for syncing Jira webhooks
    webhook_event = payload.get("webhookEvent")
    if webhook_event in ["jira:issue_updated", "jira:issue_created"]:
        issue = payload.get("issue", {})
        issue_key = issue.get("key")
        fields = issue.get("fields", {})
        summary = fields.get("summary", "")
        
        # Example logic: log it, or update internal db
        print(f"Received Jira Webhook for issue {issue_key}: {summary}")
        
    return {"status": "received"}
