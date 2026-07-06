from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx

from core.database import get_db
from models.user import User, RoleEnum
from models.admin import Settings
from schemas.settings import SettingsUpdate, SettingsResponse
from api.deps import get_current_user
from core.jira import JiraService

router = APIRouter()

def get_or_create_settings(db: Session, org_id: str):
    settings = db.query(Settings).filter(Settings.org_id == org_id).first()
    if not settings:
        settings = Settings(org_id=org_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [RoleEnum.ORG_ADMIN, RoleEnum.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    settings = get_or_create_settings(db, current_user.org_id)
    return SettingsResponse(
        id=settings.id,
        org_id=settings.org_id,
        jira_base_url=settings.jira_base_url,
        jira_email=settings.jira_email,
        has_api_token=bool(settings.jira_api_token)
    )

@router.put("", response_model=SettingsResponse)
def update_settings(settings_in: SettingsUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [RoleEnum.ORG_ADMIN, RoleEnum.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    settings = get_or_create_settings(db, current_user.org_id)
    
    if settings_in.jira_base_url is not None:
        settings.jira_base_url = settings_in.jira_base_url
    if settings_in.jira_email is not None:
        settings.jira_email = settings_in.jira_email
    if settings_in.jira_api_token is not None and settings_in.jira_api_token != "":
        settings.jira_api_token = settings_in.jira_api_token
        
    db.commit()
    db.refresh(settings)
    
    return SettingsResponse(
        id=settings.id,
        org_id=settings.org_id,
        jira_base_url=settings.jira_base_url,
        jira_email=settings.jira_email,
        has_api_token=bool(settings.jira_api_token)
    )

@router.post("/test")
async def test_jira_connection(settings_in: SettingsUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [RoleEnum.ORG_ADMIN, RoleEnum.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    # If no token provided in request, try to load from DB
    token_to_use = settings_in.jira_api_token
    if not token_to_use:
        settings = db.query(Settings).filter(Settings.org_id == current_user.org_id).first()
        if settings:
            token_to_use = settings.jira_api_token
            
    if not token_to_use or not settings_in.jira_base_url or not settings_in.jira_email:
        raise HTTPException(status_code=400, detail="Missing Jira connection parameters")
        
    jira = JiraService(settings_in.jira_base_url, settings_in.jira_email, token_to_use)
    
    # Try fetching current user to test auth
    url = f"{jira.base_url}/rest/api/3/myself"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, auth=jira._get_auth(), headers=jira._get_headers())
            if response.status_code == 200:
                return {"status": "success", "detail": "Connection successful"}
            else:
                raise HTTPException(status_code=response.status_code, detail=f"Jira API Error: {response.text}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")
