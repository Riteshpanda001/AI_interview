"""
Pricing Seed Script — PreNova AI
Run from the Backend/ directory:  python seed_pricing.py
"""
import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ai_interview_prep")

PRICING_PLANS = [
    {
        "name": "Free Trial",
        "slug": "free",
        "description": "Get started with AI-powered interview preparation. No credit card required.",
        "price_monthly": 0,
        "price_yearly": 0,
        "currency": "INR",
        "billing_period": "monthly",
        "display_price_monthly": "Rs.0",
        "display_price_yearly": "Rs.0",
        "yearly_note": "",
        "features": [
            "1 AI Mock Interview per month",
            "Basic ATS Resume Analysis",
            "Basic Performance Analytics",
            "Limited Company Questions (10/company)",
            "Community Support",
        ],
        "popular": False,
        "active": True,
        "display_order": 1,
        "plan_type": "free",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "Pro",
        "slug": "pro",
        "description": "Unlimited AI interviews, advanced analytics, and company-specific preparation.",
        "price_monthly": 499,
        "price_yearly": 399,
        "currency": "INR",
        "billing_period": "monthly",
        "display_price_monthly": "Rs.499",
        "display_price_yearly": "Rs.399",
        "yearly_note": "Billed annually (Rs.4,788/yr)",
        "features": [
            "Unlimited AI Mock Interviews",
            "Advanced ATS Resume Analysis",
            "Company-Specific Preparation",
            "Full Performance Dashboard",
            "Interview History & Analytics",
            "AI Resume Enhancement",
            "Coding Practice (All Levels)",
            "Priority Email Support",
        ],
        "popular": True,
        "active": True,
        "display_order": 2,
        "plan_type": "pro",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "Premium",
        "slug": "premium",
        "description": "Everything in Pro plus AI career roadmap, resume templates, and exclusive interview sets.",
        "price_monthly": 999,
        "price_yearly": 799,
        "currency": "INR",
        "billing_period": "monthly",
        "display_price_monthly": "Rs.999",
        "display_price_yearly": "Rs.799",
        "yearly_note": "Billed annually (Rs.9,588/yr)",
        "features": [
            "Everything in Pro",
            "AI Career Roadmap Generator",
            "Exclusive Interview Question Sets",
            "Premium Resume Templates",
            "Skill Gap Analysis Reports",
            "1-on-1 AI Coaching Sessions",
            "Priority 24/7 Support",
            "Early Access to New Features",
        ],
        "popular": False,
        "active": True,
        "display_order": 3,
        "plan_type": "premium",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
]


async def seed_pricing():
    client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    db = client[DATABASE_NAME]

    existing = await db["pricing"].count_documents({})
    if existing > 0:
        print(f"[PRICING SEED] {existing} plan(s) already exist - skipping seed.")
        client.close()
        return

    result = await db["pricing"].insert_many(PRICING_PLANS)
    print(f"[PRICING SEED] Inserted {len(result.inserted_ids)} pricing plans into MongoDB.")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_pricing())
