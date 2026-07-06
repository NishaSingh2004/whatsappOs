from fastapi import APIRouter
from . import auth, chat, jira, orgs, projects, users, settings

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(jira.router, prefix="/jira", tags=["jira"])
api_router.include_router(orgs.router, prefix="/orgs", tags=["orgs"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
