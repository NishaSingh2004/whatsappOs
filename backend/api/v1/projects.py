from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User, RoleEnum
from models.project import Project
from models.admin import Settings
from schemas.project import ProjectCreate, ProjectResponse
from api.deps import get_current_user
from core.jira import JiraService

router = APIRouter()

@router.post("", response_model=ProjectResponse)
async def create_project(proj_in: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Create internal project
    new_proj = Project(
        name=proj_in.name,
        jira_key=proj_in.jira_key,
        description=proj_in.description,
        org_id=current_user.org_id
    )
    db.add(new_proj)
    db.commit()
    db.refresh(new_proj)
    
    # Sync with Jira instantly if configured
    settings = db.query(Settings).filter(Settings.org_id == current_user.org_id).first()
    if settings and settings.jira_base_url and settings.jira_api_token:
        try:
            jira = JiraService(settings.jira_base_url, settings.jira_email, settings.jira_api_token)
            # Pass a dummy account ID or leave empty if your Jira config allows it
            await jira.create_project(name=proj_in.name, key=proj_in.jira_key)
        except Exception as e:
            print(f"Non-fatal Jira Sync Error: {e}")
            
    return new_proj

@router.get("", response_model=list[ProjectResponse])
def get_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Project).filter(Project.org_id == current_user.org_id).all()

@router.get("/tasks")
async def get_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.query(Settings).filter(Settings.org_id == current_user.org_id).first()
    if not settings or not settings.jira_base_url or not settings.jira_api_token:
        return []
    
    try:
        jira = JiraService(settings.jira_base_url, settings.jira_email, settings.jira_api_token)
        # Assuming you want to fetch all issues in the org's projects, or assigned to current user
        # We'll just fetch a general query for now to demonstrate
        issues = await jira.get_issues("order by created DESC")
        return issues
    except Exception as e:
        print(f"Failed to fetch Jira issues: {e}")
        return []
