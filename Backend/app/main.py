from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.config import settings
from app.database import db_manager

# Import routes
from app.api import (
    auth_routes, user_routes, resume_routes, ats_routes,
    interview_routes, coding_routes, company_routes, pricing_routes,
    payment_routes, contact_routes, dashboard_routes, history_routes,
    settings_routes
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to DBs
    await db_manager.connect_to_databases()
    
    # Create static directories if they don't exist
    for sub in ["uploads", "resumes", "reports", "avatars"]:
        os.makedirs(os.path.join(settings.STATIC_DIR, sub), exist_ok=True)
        
    yield
    # Shutdown: Close DBs
    await db_manager.close_database_connections()

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API service for AI Interview Preparation System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
os.makedirs(settings.STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Register routers
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Auth"])
app.include_router(user_routes.router, prefix="/api/users", tags=["Users"])
app.include_router(resume_routes.router, prefix="/api/resume", tags=["Resume"])
app.include_router(ats_routes.router, prefix="/api/ats", tags=["ATS"])
app.include_router(interview_routes.router, prefix="/api/interview", tags=["Interview"])
app.include_router(coding_routes.router, prefix="/api/coding", tags=["Coding"])
app.include_router(company_routes.router, prefix="/api/company", tags=["Company Preparation"])
app.include_router(pricing_routes.router, prefix="/api/pricing", tags=["Pricing"])
app.include_router(payment_routes.router, prefix="/api/payment", tags=["Payment"])
app.include_router(contact_routes.router, prefix="/api/contact", tags=["Contact"])
app.include_router(dashboard_routes.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(history_routes.router, prefix="/api/history", tags=["History"])
app.include_router(settings_routes.router, prefix="/api/settings", tags=["Settings"])

@app.get("/")
async def root():
    return {"message": "Welcome to AI Interview Preparation System API"}
