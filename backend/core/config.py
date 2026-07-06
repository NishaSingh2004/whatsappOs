from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "WorkOS Enterprise"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: Optional[str] = "sqlite:///./workos.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Auth
    JWT_SECRET: str = "a-very-secure-secret-key-for-jwt-signing"
    JWT_REFRESH_SECRET: str = "another-secret-for-refresh"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # AI
    GEMINI_API_KEY: str = ""
    
    # Jira (Optional/Global)
    JIRA_CLIENT_ID: Optional[str] = None
    JIRA_CLIENT_SECRET: Optional[str] = None
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # SMTP Email
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "your_email@gmail.com"
    SMTP_PASSWORD: str = "your_app_password"
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        # If DATABASE_URL is provided, use it (Neon PostgreSQL). Otherwise fallback to sqlite.
        if self.DATABASE_URL and self.DATABASE_URL.startswith("postgres"):
            return self.DATABASE_URL.replace("postgres://", "postgresql://")
        return self.DATABASE_URL or "sqlite:///./workos.db"
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()
