from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User, RoleEnum
from models.tenant import Organization
from schemas.org import OrgCreate, OrgResponse, OrgUpdate
from api.deps import get_current_user

router = APIRouter()

from core.security import get_password_hash

@router.post("", response_model=OrgResponse)
def create_org(org_in: OrgCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only super admins can create new organizations
    if current_user.role != RoleEnum.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    org = db.query(Organization).filter(Organization.slug == org_in.slug).first()
    if org:
        raise HTTPException(status_code=400, detail="Organization with this slug already exists")
        
    admin_exists = db.query(User).filter(User.email == org_in.admin_email).first()
    if admin_exists:
        raise HTTPException(status_code=400, detail="Admin email already in use")
        
    new_org = Organization(name=org_in.name, slug=org_in.slug)
    db.add(new_org)
    db.flush() # flush to get new_org.id
    
    admin_user = User(
        email=org_in.admin_email,
        first_name=org_in.admin_first_name,
        last_name=org_in.admin_last_name,
        hashed_password=get_password_hash(org_in.admin_password),
        role=RoleEnum.ORG_ADMIN,
        org_id=new_org.id
    )
    db.add(admin_user)
    
    db.commit()
    db.refresh(new_org)
    return new_org

@router.get("", response_model=list[OrgResponse])
def get_orgs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return db.query(Organization).all()

@router.put("/{org_id}", response_model=OrgResponse)
def update_org(org_id: str, org_in: OrgUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    if org_in.name is not None:
        org.name = org_in.name
    if org_in.slug is not None:
        existing = db.query(Organization).filter(Organization.slug == org_in.slug, Organization.id != org_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug already in use")
        org.slug = org_in.slug
    if org_in.is_active is not None:
        org.is_active = org_in.is_active
        
    db.commit()
    db.refresh(org)
    return org

@router.delete("/{org_id}")
def delete_org(org_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    users = db.query(User).filter(User.org_id == org_id).all()
    for u in users:
        db.delete(u)
    db.delete(org)
    db.commit()
    return {"status": "success", "message": "Organization deleted"}
