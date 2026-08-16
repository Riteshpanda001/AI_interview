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
    REDIS_URL: str = "redis://127.0.0.1:6379/0"

    # API Keys
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    HUGGINGFACE_API_KEY: Optional[str] = None
    HUGGINGFACE_MODEL: str = "meta-llama/Llama-3.2-3B-Instruct"

    # Google OAuth Settings
    GOOGLE_CLIENT_ID: Optional[str] = None

    # Payment Gateway Credentials (Razorpay & Stripe)
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None
    RAZORPAY_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    FRONTEND_URL: str = "http://localhost:5173"


    # SMS Provider Credentials (Twilio, Fast2SMS, MSG91, Console)
    SMS_PROVIDER: str = "console"
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    FAST2SMS_API_KEY: Optional[str] = None
    MSG91_AUTH_KEY: Optional[str] = None
    MSG91_SENDER_ID: Optional[str] = None
    MSG91_TEMPLATE_ID: Optional[str] = None

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
