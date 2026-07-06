import uuid
from sqlalchemy.orm import Session
from core.database import engine, SessionLocal
from core.security import get_password_hash
from models.user import User, RoleEnum
from models.tenant import Organization

def seed():
    db = SessionLocal()
    
    # Check if a super admin already exists
    admin = db.query(User).filter(User.email == "admin@workos.com").first()
    if admin:
        print("Super admin already exists!")
        return

    # Check if root organization exists
    org = db.query(Organization).filter(Organization.slug == "workos").first()
    if not org:
        org = Organization(
            id=str(uuid.uuid4()),
            name="WorkOS Global",
            slug="workos",
            is_active=True
        )
        db.add(org)
        db.commit()
        db.refresh(org)

    # Create super admin
    user = User(
        email="admin@workos.com",
        first_name="Super",
        last_name="Admin",
        hashed_password=get_password_hash("adminpassword"),
        role=RoleEnum.SUPER_ADMIN,
        org_id=org.id,
        is_active=True
    )
    db.add(user)
    db.commit()
    print("Seed complete! Super admin created: admin@workos.com / adminpassword")

if __name__ == "__main__":
    seed()
