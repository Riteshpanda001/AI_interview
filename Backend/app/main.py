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
    settings_routes, ws_routes, admin_routes
)

async def seed_admin_user():
    """Seed the default admin user prenovaai01@gmail.com with admin role."""
    from app.services.auth_service import AuthService
    from app.services.user_service import UserService
    from app.constants import ROLE_ADMIN
    
    email = "prenovaai01@gmail.com"
    db = db_manager.db
    
    if db is not None:
        user = await db["users"].find_one({"email": email})
        hashed_password = AuthService.get_password_hash("PreNovaAI01@2005")
        if not user:
            print(f"[SEED] Seeding admin user {email}...")
            await UserService.create_user(
                email=email,
                full_name="Admin",
                password_hash=hashed_password,
                is_verified=True,
                db=db
            )
            await db["users"].update_one(
                {"email": email},
                {"$set": {"role": ROLE_ADMIN, "is_verified": True, "is_active": True}}
            )
        else:
            print(f"[SEED] Aligning admin user credentials for {email}...")
            await db["users"].update_one(
                {"email": email},
                {"$set": {
                    "hashed_password": hashed_password,
                    "password": hashed_password,
                    "role": ROLE_ADMIN,
                    "is_verified": True,
                    "is_active": True
                }}
            )

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to DBs
    await db_manager.connect_to_databases()
    
    # Seed admin user
    await seed_admin_user()
    
    # Create static directories if they don't exist
    for sub in ["uploads", "resumes", "reports", "avatars", "audio"]:
        os.makedirs(os.path.join(settings.STATIC_DIR, sub), exist_ok=True)

    # ── SMTP startup diagnostic ──────────────────────────────────────────────
    _print_smtp_status()
    # ────────────────────────────────────────────────────────────────────────

    yield
    # Shutdown: Close DBs
    await db_manager.close_database_connections()


def _print_smtp_status():
    """Print a one-time SMTP configuration summary on startup."""
    import smtplib
    smtp_user = settings.effective_smtp_user
    raw_pw = (settings.SMTP_PASSWORD or "").strip()
    clean_pw = raw_pw.replace(" ", "")

    placeholder_emails = {"user@example.com", "noreply@example.com", "your-gmail@gmail.com", ""}
    placeholder_passwords = {
        "password", "your-16-char-app-password",
        "YOUR_GOOGLE_APP_PASSWORD", "YOUR_16_CHAR_GMAIL_APP_PASSWORD", ""
    }

    print("\n" + "-" * 60)
    print("  SMTP CONFIGURATION SUMMARY")
    print("-" * 60)
    print(f"  Host     : {settings.SMTP_HOST}:{settings.SMTP_PORT}")
    print(f"  User     : {smtp_user}")
    pw_display = f"{clean_pw[:4]}...{clean_pw[-4:]}" if len(clean_pw) >= 8 else "(not set)"
    print(f"  Password : {pw_display}  ({len(clean_pw)} chars)")

    if smtp_user in placeholder_emails or raw_pw in placeholder_passwords or not clean_pw:
        print("  Status   : [WARNING] PLACEHOLDER — emails will NOT be sent")
        if settings.DEBUG:
            print("             OTP codes will be printed to this terminal instead.")
    else:
        # Quick TCP connect test (no auth) so we know if the host is reachable
        try:
            conn = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=5)
            conn.quit()
            print("  Status   : [OK] SMTP host is reachable")
            print("             Auth will be verified on first email send.")
        except Exception as e:
            print(f"  Status   : [ERROR] SMTP host unreachable — {e}")
            if settings.DEBUG:
                print("             OTP codes will be printed to this terminal as fallback.")

    print("-" * 60 + "\n")



app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API service for AI Interview Preparation System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
app.include_router(ws_routes.router, tags=["WebSockets"])
app.include_router(coding_routes.router, prefix="/api/coding", tags=["Coding"])
app.include_router(company_routes.router, prefix="/api/company", tags=["Company Preparation"])
app.include_router(pricing_routes.router, prefix="/api/pricing", tags=["Pricing"])
app.include_router(payment_routes.router, prefix="/api/payment", tags=["Payment"])
app.include_router(contact_routes.router, prefix="/api/contact", tags=["Contact"])
app.include_router(dashboard_routes.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(history_routes.router, prefix="/api/history", tags=["History"])
app.include_router(settings_routes.router, prefix="/api/settings", tags=["Settings"])
app.include_router(admin_routes.router, prefix="/api/admin", tags=["Admin Dashboard"])


@app.get("/")
async def root():
    return {"message": "Welcome to AI Interview Preparation System API"}
