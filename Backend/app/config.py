import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "AI Interview Preparation System"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # JWT Settings
    JWT_SECRET: str = "super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # DB Connection URLs
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "ai_interview_prep"
    REDIS_URL: str = "redis://localhost:6379/0"

    # API Keys
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    HUGGINGFACE_API_KEY: Optional[str] = None
    HUGGINGFACE_MODEL: str = "meta-llama/Llama-3.2-3B-Instruct"

    # Google OAuth Settings
    GOOGLE_CLIENT_ID: Optional[str] = None

    # SMTP Credentials
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_EMAIL: Optional[str] = None
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: str = "PreNova AI"

    @property
    def effective_smtp_user(self) -> str:
        return self.SMTP_EMAIL or self.SMTP_USER or "prenovaai001@gmail.com"

    @property
    def effective_emails_from(self) -> str:
        return self.EMAILS_FROM_EMAIL or self.effective_smtp_user

    # Directory Paths
    STATIC_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
