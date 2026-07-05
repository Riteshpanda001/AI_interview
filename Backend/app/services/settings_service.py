from bson import ObjectId
from app.schemas.settings_schema import SettingsUpdateRequest

class SettingsService:
    @staticmethod
    async def get_settings(user_id: str, db) -> dict:
        settings_data = await db["settings"].find_one({"user_id": user_id})
        if not settings_data:
            # Set defaults
            settings_data = {
                "user_id": user_id,
                "dark_mode": True,
                "email_notifications": True,
                "ai_voice_gender": "female",
                "preferred_language": "en",
                "target_role": None,
                "target_experience_years": None
            }
            await db["settings"].insert_one(settings_data)
            
        settings_data["id"] = str(settings_data["_id"])
        return settings_data

    @staticmethod
    async def update_settings(user_id: str, req: SettingsUpdateRequest, db) -> dict:
        await SettingsService.get_settings(user_id, db)  # ensures defaults are set
        
        update_data = {}
        for key, val in req.model_dump(exclude_unset=True).items():
            update_data[key] = val
            
        if update_data:
            await db["settings"].update_one(
                {"user_id": user_id},
                {"$set": update_data}
            )
            
        settings_data = await db["settings"].find_one({"user_id": user_id})
        return settings_data
