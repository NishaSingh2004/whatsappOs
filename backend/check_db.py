from core.database import SessionLocal
from models.user import User
from models.tenant import Organization

db = SessionLocal()
users = db.query(User).all()
orgs = db.query(Organization).all()

print(f"Users: {len(users)}")
for u in users:
    print(f"- {u.email} ({u.role})")

print(f"\nOrgs: {len(orgs)}")
for o in orgs:
    print(f"- {o.name} ({o.slug})")
