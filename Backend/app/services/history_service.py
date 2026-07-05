from bson import ObjectId

class HistoryService:
    @staticmethod
    async def get_user_interview_history(user_id: str, db) -> list:
        cursor = db["interview_results"].find({"user_id": user_id})
        results = await cursor.to_list(length=100)
        for res in results:
            res["id"] = str(res["_id"])
        return results
