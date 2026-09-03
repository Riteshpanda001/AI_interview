from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException
from app.schemas.dashboard_schema import GoalCreate, GoalUpdate

class GoalService:
    @staticmethod
    async def get_user_goals(user_id: str, db) -> list:
        try:
            cursor = db["user_goals"].find({"user_id": str(user_id)}).sort("created_at", -1)
            goals = await cursor.to_list(length=100)
            for goal in goals:
                if "_id" in goal:
                    goal["_id"] = str(goal["_id"])
                goal["id"] = str(goal.get("_id", ""))
                if "created_at" in goal and hasattr(goal["created_at"], "isoformat"):
                    goal["created_at"] = goal["created_at"].isoformat()
            return goals
        except Exception as e:
            print(f"Error fetching goals: {e}")
            return []

    @staticmethod
    async def create_goal(user_id: str, goal_in: GoalCreate, db) -> dict:
        record = {
            "user_id": str(user_id),
            "title": goal_in.title,
            "target_value": goal_in.target_value,
            "current_value": goal_in.current_value or 0.0,
            "unit": goal_in.unit or "",
            "category": goal_in.category or "general",
            "completed": (goal_in.current_value or 0.0) >= goal_in.target_value,
            "created_at": datetime.now(timezone.utc)
        }
        res = await db["user_goals"].insert_one(record)
        record["_id"] = str(res.inserted_id)
        record["id"] = str(res.inserted_id)
        record["created_at"] = record["created_at"].isoformat()
        return record

    @staticmethod
    async def update_goal(user_id: str, goal_id: str, goal_in: GoalUpdate, db) -> dict:
        try:
            query = {"_id": ObjectId(goal_id), "user_id": str(user_id)}
        except Exception:
            query = {"_id": goal_id, "user_id": str(user_id)}

        existing = await db["user_goals"].find_one(query)
        if not existing:
            raise HTTPException(status_code=404, detail="Goal not found.")

        update_fields = {}
        if goal_in.title is not None:
            update_fields["title"] = goal_in.title
        if goal_in.target_value is not None:
            update_fields["target_value"] = goal_in.target_value
        if goal_in.current_value is not None:
            update_fields["current_value"] = goal_in.current_value
        if goal_in.unit is not None:
            update_fields["unit"] = goal_in.unit
        if goal_in.category is not None:
            update_fields["category"] = goal_in.category

        target = update_fields.get("target_value", existing.get("target_value", 1.0))
        current = update_fields.get("current_value", existing.get("current_value", 0.0))
        if goal_in.completed is not None:
            update_fields["completed"] = goal_in.completed
        else:
            update_fields["completed"] = current >= target

        await db["user_goals"].update_one(query, {"$set": update_fields})
        updated = await db["user_goals"].find_one(query)
        updated["_id"] = str(updated["_id"])
        updated["id"] = str(updated.get("_id", ""))
        if "created_at" in updated and hasattr(updated["created_at"], "isoformat"):
            updated["created_at"] = updated["created_at"].isoformat()
        return updated

    @staticmethod
    async def delete_goal(user_id: str, goal_id: str, db) -> dict:
        try:
            query = {"_id": ObjectId(goal_id), "user_id": str(user_id)}
        except Exception:
            query = {"_id": goal_id, "user_id": str(user_id)}

        res = await db["user_goals"].delete_one(query)
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Goal not found.")
        return {"message": "Goal deleted successfully", "id": goal_id}
