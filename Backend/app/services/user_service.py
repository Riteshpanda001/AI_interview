from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from app.constants import ROLE_USER, PLAN_FREE

class UserService:
    @staticmethod
    async def find_by_email(email: str, db) -> Optional[Dict[str, Any]]:
        if not email:
            return None
        return await db["users"].find_one({"email": email.lower().strip()})

    @staticmethod
    async def find_by_google_id(google_id: str, db) -> Optional[Dict[str, Any]]:
        if not google_id:
            return None
        return await db["users"].find_one({"google_id": google_id})

    @staticmethod
    async def find_by_id(user_id: str, db) -> Optional[Dict[str, Any]]:
        try:
            return await db["users"].find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None

    @staticmethod
    async def create_user(
        email: str,
        full_name: str,
        password_hash: Optional[str] = None,
        provider: str = "email",
        google_id: Optional[str] = None,
        profile_picture: Optional[str] = None,
        phone: Optional[str] = None,
        gender: Optional[str] = None,
        is_verified: bool = False,
        db: Any = None
    ) -> Dict[str, Any]:
        now = datetime.utcnow()
        new_user = {
            "email": email.lower().strip(),
            "full_name": full_name,
            "name": full_name,
            "hashed_password": password_hash,
            "password": password_hash,
            "provider": provider,
            "google_id": google_id,
            "profile_picture": profile_picture,
            "avatar_url": profile_picture,
            "phone": phone,
            "mobile_number": phone,
            "gender": gender,
            "role": ROLE_USER,
            "plan_type": PLAN_FREE,
            "is_verified": is_verified,
            "is_active": is_verified,
            "target_role": "Software Engineer",
            "experience_level": "Mid Level",
            "bio": "",
            "created_at": now,
            "updated_at": now
        }
        result = await db["users"].insert_one(new_user)
        new_user["_id"] = result.inserted_id
        new_user["id"] = str(result.inserted_id)
        return new_user

    @staticmethod
    async def mark_user_verified(email: str, db) -> bool:
        now = datetime.utcnow()
        result = await db["users"].update_one(
            {"email": email.lower().strip()},
            {"$set": {
                "is_verified": True,
                "is_active": True,
                "updated_at": now
            }}
        )
        return result is not None
