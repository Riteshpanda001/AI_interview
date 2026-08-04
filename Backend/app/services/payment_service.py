from datetime import datetime, timezone, timedelta
from bson import ObjectId
from fastapi import HTTPException, status
from app.schemas.payment_schema import PaymentCreateRequest, RazorpayOrderRequest, StripeCheckoutRequest
import random

PLAN_FEATURES = {
    "free": [
        "5 AI Mock Interviews",
        "Basic ATS Resume Analysis",
        "Basic Performance Analytics",
        "Limited Company Questions"
    ],
    "pro": [
        "Unlimited AI Mock Interviews",
        "Advanced ATS Score & Suggestions",
        "Company-Specific Preparation Sets",
        "Full Analytics & History",
        "Code Editor & Problem Solutions"
    ],
    "premium": [
        "Everything in Pro",
        "AI Resume Optimizer & Assistant",
        "AI Career Roadmap & Interview Sets",
        "Priority Support",
        "Custom Mock Interview Prompts"
    ],
    "enterprise": [
        "Everything in Premium",
        "Team Workspace & Shared Candidates",
        "Dedicated Account Specialist",
        "Custom API Integrations"
    ]
}

class PaymentService:
    @staticmethod
    async def create_razorpay_order(req: RazorpayOrderRequest, db) -> dict:
        order_id = f"order_rzp_{int(datetime.now(timezone.utc).timestamp())}_{random.randint(1000, 9999)}"
        return {
            "order_id": order_id,
            "amount": req.amount,
            "currency": req.currency,
            "key_id": "rzp_test_mock_prepnova_key_12345",
            "plan_type": req.plan_type
        }

    @staticmethod
    async def create_stripe_session(req: StripeCheckoutRequest, db) -> dict:
        session_id = f"cs_test_{int(datetime.now(timezone.utc).timestamp())}_{random.randint(10000, 99999)}"
        return {
            "session_id": session_id,
            "url": f"https://checkout.stripe.com/pay/{session_id}",
            "amount": req.amount,
            "currency": req.currency,
            "plan_type": req.plan_type
        }

    @staticmethod
    async def process_payment(user_id: str, req: PaymentCreateRequest, db) -> dict:
        now = datetime.now(timezone.utc)
        transaction_id = f"TXN_{int(now.timestamp())}_{random.randint(1000, 9999)}"
        
        # Calculate subscription expiration (30 days for monthly, 365 for yearly)
        days = 365 if (req.billing_cycle or "monthly").lower() == "yearly" else 30
        expires_at = now + timedelta(days=days)

        payment_record = {
            "user_id": str(user_id),
            "amount": req.amount,
            "currency": req.currency or ("INR" if req.payment_method == "razorpay" else "USD"),
            "status": "succeeded",
            "payment_method": req.payment_method,
            "plan_type": req.plan_type.lower(),
            "billing_cycle": (req.billing_cycle or "monthly").lower(),
            "gateway_order_id": req.gateway_order_id or f"order_{random.randint(10000, 99999)}",
            "gateway_payment_id": req.gateway_payment_id or f"pay_{random.randint(10000, 99999)}",
            "transaction_id": transaction_id,
            "created_at": now
        }
        
        result = await db["payments"].insert_one(payment_record)
        payment_record["id"] = str(result.inserted_id)
        
        # Upgrade or Downgrade User's plan type
        try:
            user_query = {"_id": ObjectId(user_id)}
        except Exception:
            user_query = {"_id": user_id}

        await db["users"].update_one(
            user_query,
            {"$set": {
                "plan_type": req.plan_type.lower(),
                "updated_at": now
            }}
        )

        # Upsert subscription record
        await db["subscriptions"].update_one(
            {"user_id": str(user_id)},
            {"$set": {
                "user_id": str(user_id),
                "plan_type": req.plan_type.lower(),
                "billing_cycle": (req.billing_cycle or "monthly").lower(),
                "status": "active",
                "started_at": now,
                "expires_at": expires_at,
                "amount": req.amount,
                "currency": payment_record["currency"],
                "updated_at": now
            }},
            upsert=True
        )
        
        return payment_record

    @staticmethod
    async def get_user_subscription(user_id: str, db) -> dict:
        try:
            user_query = {"_id": ObjectId(user_id)}
        except Exception:
            user_query = {"_id": user_id}

        user = await db["users"].find_one(user_query)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        current_plan = (user.get("plan_type") or "free").lower()
        sub = await db["subscriptions"].find_one({"user_id": str(user_id)})

        now = datetime.now(timezone.utc)
        if sub and sub.get("expires_at"):
            expires_at = sub.get("expires_at")
            if isinstance(expires_at, datetime) and expires_at < now and current_plan != "free":
                # Subscription expired, revert to free
                current_plan = "free"
                await db["users"].update_one(user_query, {"$set": {"plan_type": "free"}})

        features = PLAN_FEATURES.get(current_plan, PLAN_FEATURES["free"])

        return {
            "plan_type": current_plan,
            "billing_cycle": sub.get("billing_cycle", "monthly") if sub else "monthly",
            "status": sub.get("status", "active") if (sub and current_plan != "free") else "active",
            "is_active": True,
            "started_at": sub.get("started_at") if sub else user.get("created_at"),
            "expires_at": sub.get("expires_at") if sub else None,
            "amount": sub.get("amount", 0.0) if sub else 0.0,
            "currency": sub.get("currency", "INR") if sub else "INR",
            "features": features
        }

    @staticmethod
    async def cancel_subscription(user_id: str, db) -> dict:
        try:
            user_query = {"_id": ObjectId(user_id)}
        except Exception:
            user_query = {"_id": user_id}

        now = datetime.now(timezone.utc)
        await db["users"].update_one(user_query, {"$set": {"plan_type": "free", "updated_at": now}})
        await db["subscriptions"].update_one(
            {"user_id": str(user_id)},
            {"$set": {"status": "cancelled", "updated_at": now}}
        )

        return {"success": True, "message": "Subscription cancelled successfully. Plan downgraded to Free."}

    @staticmethod
    async def get_payment_history(user_id: str, db) -> list:
        cursor = db["payments"].find({"user_id": str(user_id)}).sort("created_at", -1)
        payments = await cursor.to_list(length=50)

        history = []
        for p in payments:
            history.append({
                "id": str(p["_id"]),
                "transaction_id": p.get("transaction_id", f"TXN_{str(p['_id'])[:8]}"),
                "amount": p.get("amount", 0.0),
                "currency": p.get("currency", "INR"),
                "status": p.get("status", "succeeded"),
                "payment_method": p.get("payment_method", "razorpay"),
                "plan_type": p.get("plan_type", "pro"),
                "billing_cycle": p.get("billing_cycle", "monthly"),
                "created_at": p.get("created_at")
            })
        return history

    @staticmethod
    async def get_invoice_details(user_id: str, transaction_id: str, db) -> dict:
        payment = await db["payments"].find_one({
            "user_id": str(user_id),
            "$or": [{"transaction_id": transaction_id}, {"_id": ObjectId(transaction_id) if len(transaction_id) == 24 else None}]
        })

        if not payment:
            # Fallback mock invoice if testing with generated transaction ID
            payment = {
                "transaction_id": transaction_id,
                "amount": 499.0,
                "currency": "INR",
                "plan_type": "pro",
                "billing_cycle": "monthly",
                "payment_method": "razorpay",
                "status": "succeeded",
                "created_at": datetime.now(timezone.utc)
            }

        try:
            user = await db["users"].find_one({"_id": ObjectId(user_id)})
        except Exception:
            user = await db["users"].find_one({"_id": user_id})

        subtotal = round(float(payment.get("amount", 0.0)) / 1.18, 2) if payment.get("currency") == "INR" else round(float(payment.get("amount", 0.0)) / 1.1, 2)
        tax = round(float(payment.get("amount", 0.0)) - subtotal, 2)

        return {
            "invoice_number": f"INV-{payment.get('transaction_id', '1001')}",
            "transaction_id": payment.get("transaction_id", transaction_id),
            "date": payment.get("created_at", datetime.now(timezone.utc)),
            "customer_name": user.get("full_name", "Valued Customer") if user else "Valued Customer",
            "customer_email": user.get("email", "customer@prepnova.ai") if user else "customer@prepnova.ai",
            "plan_name": (payment.get("plan_type") or "pro").upper(),
            "billing_cycle": payment.get("billing_cycle", "monthly"),
            "payment_method": payment.get("payment_method", "razorpay"),
            "subtotal": subtotal,
            "tax": tax,
            "total_amount": float(payment.get("amount", 0.0)),
            "currency": payment.get("currency", "INR"),
            "status": payment.get("status", "succeeded")
        }
