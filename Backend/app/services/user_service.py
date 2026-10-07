from typing import Optional, Dict, Any
from datetime import datetime, timezone
from bson import ObjectId
from app.constants import ROLE_USER, PLAN_FREE

class UserService:
    @staticmethod
    async def find_by_email(email: str, db) -> Optional[Dict[str, Any]]:
        if not email:
            return None
        clean = email.lower().strip()
        if db is None:
            return None
        return await db["users"].find_one({
            "$or": [
                {"email_normalized": clean},
                {"email": clean}
            ]
        })

    @staticmethod
    async def find_by_phone(phone: str, db) -> Optional[Dict[str, Any]]:
        if not phone:
            return None
        from app.services.sms_service import normalize_phone_number
        clean_phone = normalize_phone_number(phone)
        if not clean_phone or db is None:
            return None
        return await db["users"].find_one({
            "$or": [
                {"phone_normalized": clean_phone},
                {"phone": clean_phone},
                {"mobile_number": clean_phone}
            ]
        })

    @staticmethod
    async def find_by_google_id(google_id: str, db) -> Optional[Dict[str, Any]]:
        if not google_id or db is None:
            return None
        return await db["users"].find_one({"google_id": google_id})

    @staticmethod
    async def find_by_id(user_id: str, db) -> Optional[Dict[str, Any]]:
        if db is None:
            return None
        try:
            user = await db["users"].find_one({"_id": ObjectId(user_id)})
            if user:
                return user
        except Exception:
            pass
        return await db["users"].find_one({"_id": str(user_id)})

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
        from app.services.sms_service import normalize_phone_number
        now = datetime.now(timezone.utc)
        auth_prov = "google" if provider == "google" else "local"
        clean_email = email.lower().strip()
        clean_phone = normalize_phone_number(phone) if phone else None

        new_user = {
            "email": clean_email,
            "email_normalized": clean_email,
            "full_name": full_name,
            "name": full_name,
            "hashed_password": password_hash,
            "password": password_hash,
            "provider": provider,
            "auth_provider": auth_prov,
            "profile_picture": profile_picture,
            "avatar_url": profile_picture,
            "gender": gender,
            "role": ROLE_USER,
            "plan_type": PLAN_FREE,
            "is_verified": is_verified,
            "is_active": is_verified,
            "account_status": "active" if is_verified else "pending",
            "target_role": "Software Engineer",
            "experience_level": "Mid Level",
            "bio": "",
            "created_at": now,
            "updated_at": now
        }
        if google_id:
            new_user["google_id"] = google_id
            new_user["google_email"] = clean_email
            new_user["google_verified"] = True
        else:
            new_user["google_verified"] = False

        if clean_phone or phone:
            new_user["phone"] = clean_phone or phone
            new_user["mobile_number"] = clean_phone or phone
            if clean_phone:
                new_user["phone_normalized"] = clean_phone
            new_user["phone_verified"] = is_verified
            new_user["phone_verified_at"] = now if (is_verified and clean_phone) else None
        else:
            new_user["phone_verified"] = False
        if db is not None:
            result = await db["users"].insert_one(new_user)
            new_user["_id"] = result.inserted_id
            new_user["id"] = str(result.inserted_id)
        else:
            new_user["_id"] = "dev_id"
            new_user["id"] = "dev_id"
        return new_user

    @staticmethod
    async def mark_user_verified(email: str, db) -> bool:
        now = datetime.now(timezone.utc)
        clean = email.lower().strip()
        if db is None:
            return True
        result = await db["users"].update_one(
            {"$or": [{"email_normalized": clean}, {"email": clean}]},
            {"$set": {
                "is_verified": True,
                "email_verified": True,
                "is_active": True,
                "account_status": "active",
                "updated_at": now
            }}
        )
        return result is not None
