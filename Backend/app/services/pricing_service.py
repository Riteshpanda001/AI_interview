class PricingService:
    @staticmethod
    async def get_plans(db) -> list:
        cursor = db["pricing"].find({})
        plans = await cursor.to_list(length=100)
        for plan in plans:
            plan["id"] = str(plan["_id"])
        return plans
