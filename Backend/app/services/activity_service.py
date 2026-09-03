from datetime import datetime, timezone
from typing import Dict, Any, Optional

class ActivityService:
    @staticmethod
    async def log_activity(
        user_id: str,
        activity_type: str,
        title: str,
        description: str = "",
        metadata: Optional[Dict[str, Any]] = None,
        db = None
    ) -> dict:
        if db is None:
            return {}

        record = {
            "user_id": str(user_id),
            "type": activity_type,
            "title": title,
            "description": description or "",
            "metadata": metadata or {},
            "created_at": datetime.now(timezone.utc)
        }

        try:
            res = await db["activities"].insert_one(record)
            record["_id"] = str(res.inserted_id)
            record["id"] = str(res.inserted_id)
        except Exception as e:
            print(f"Error logging activity: {e}")

        return record

    @staticmethod
    async def get_user_activities(user_id: str, db, limit: int = 20) -> list:
        try:
            cursor = db["activities"].find({"user_id": str(user_id)}).sort("created_at", -1).limit(limit)
            activities = await cursor.to_list(length=limit)
            for act in activities:
                if "_id" in act:
                    act["_id"] = str(act["_id"])
                act["id"] = str(act.get("_id", ""))
                if "created_at" in act and hasattr(act["created_at"], "isoformat"):
                    act["created_at"] = act["created_at"].isoformat()
            return activities
        except Exception as e:
            print(f"Error fetching activities: {e}")
            return []
