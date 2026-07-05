from datetime import datetime
from bson import ObjectId
from app.schemas.payment_schema import PaymentCreateRequest
import random

class PaymentService:
    @staticmethod
    async def process_payment(user_id: str, req: PaymentCreateRequest, db) -> dict:
        transaction_id = f"tx_{int(datetime.utcnow().timestamp())}_{random.randint(1000, 9999)}"
        
        # Save invoice transaction log
        payment_record = {
            "user_id": user_id,
            "amount": req.amount,
            "currency": "USD",
            "status": "succeeded",
            "payment_method": req.payment_method,
            "transaction_id": transaction_id,
            "created_at": datetime.utcnow()
        }
        
        result = await db["payments"].insert_one(payment_record)
        payment_record["id"] = str(result.inserted_id)
        
        # Upgrade User's plan type
        await db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"plan_type": req.plan_type}}
        )
        
        return payment_record
