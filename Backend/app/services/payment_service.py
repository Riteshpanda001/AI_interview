import hmac
import hashlib
import json
import random
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from fastapi import HTTPException, status
from app.config import settings
from app.schemas.payment_schema import (
    RazorpayOrderRequest, StripeCheckoutRequest, RazorpayVerifyRequest, StripeVerifyRequest
)

PLAN_FEATURES = {
    "free": [
        "1 AI Mock Interview / Month",
        "3 ATS Resume Analysis Checks",
        "Standard AI Feedback",
        "Basic Company Preparation Tracks"
    ],
    "pro": [
        "Unlimited AI Mock Interviews",
        "Unlimited ATS Score & Optimization",
        "Full Company Preparation Pipeline",
        "AI Career Roadmap & Analytics",
        "Code Copilot & Problem Solutions"
    ],
    "premium": [
        "Everything in Pro",
        "AI Resume Optimizer & Tailoring",
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

class SubscriptionEnforcer:
    @staticmethod
    async def get_user_plan(user_id: str, db) -> str:
        try:
            user_query = {"_id": ObjectId(user_id)}
        except Exception:
            user_query = {"_id": user_id}

        user = await db["users"].find_one(user_query)
        if not user:
            return "free"

        plan = (user.get("plan_type") or "free").lower()
        sub = await db["subscriptions"].find_one({"user_id": str(user_id)})
        
        now = datetime.now(timezone.utc)
        if sub and sub.get("expires_at"):
            expires_at = sub.get("expires_at")
            if isinstance(expires_at, datetime) and expires_at < now and plan != "free":
                # Expired subscription -> fallback to free
                await db["users"].update_one(user_query, {"$set": {"plan_type": "free"}})
                return "free"

        return plan

    @staticmethod
    async def enforce_mock_interview_limit(user_id: str, db):
        plan = await SubscriptionEnforcer.get_user_plan(user_id, db)
        if plan in ["pro", "premium", "enterprise"]:
            return True  # Unlimited for paid tiers

        # Free tier limit: 1 interview session
        count = await db["interview_sessions"].count_documents({"user_id": str(user_id)})
        if count >= 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Free plan limit of 1 AI Mock Interview reached. Upgrade to Pro for unlimited sessions."
            )
        return True

    @staticmethod
    async def enforce_ats_check_limit(user_id: str, db):
        plan = await SubscriptionEnforcer.get_user_plan(user_id, db)
        if plan in ["pro", "premium", "enterprise"]:
            return True  # Unlimited for paid tiers

        # Free tier limit: 3 ATS checks
        count = await db["ats_analyses"].count_documents({"user_id": str(user_id)})
        if count >= 3:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Free plan limit of 3 ATS Resume checks reached. Upgrade to Pro for unlimited checks."
            )
        return True


class PaymentService:
    @staticmethod
    async def create_razorpay_order(user_id: str, req: RazorpayOrderRequest, db) -> dict:
        amount_in_paise = int(req.amount * 100)
        key_id = settings.RAZORPAY_KEY_ID or "rzp_test_prepnova_key"

        if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
            try:
                import razorpay
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                order_data = {
                    "amount": amount_in_paise,
                    "currency": req.currency,
                    "receipt": f"rcpt_{int(datetime.now(timezone.utc).timestamp())}",
                    "notes": {"user_id": str(user_id), "plan_type": req.plan_type, "billing_cycle": req.billing_cycle}
                }
                rzp_order = client.order.create(data=order_data)
                return {
                    "order_id": rzp_order["id"],
                    "amount": req.amount,
                    "currency": req.currency,
                    "key_id": settings.RAZORPAY_KEY_ID,
                    "plan_type": req.plan_type
                }
            except Exception as e:
                print(f"Razorpay API Error, using fallback mode: {e}")

        # Standard sandbox fallback order
        order_id = f"order_rzp_{int(datetime.now(timezone.utc).timestamp())}_{random.randint(1000, 9999)}"
        return {
            "order_id": order_id,
            "amount": req.amount,
            "currency": req.currency,
            "key_id": key_id,
            "plan_type": req.plan_type
        }

    @staticmethod
    async def create_stripe_session(user_id: str, req: StripeCheckoutRequest, db) -> dict:
        if settings.STRIPE_SECRET_KEY:
            try:
                import stripe
                stripe.api_key = settings.STRIPE_SECRET_KEY
                session = stripe.checkout.Session.create(
                    payment_method_types=['card'],
                    line_items=[{
                        'price_data': {
                            'currency': req.currency.lower(),
                            'product_data': {'name': f"PreNova AI {req.plan_type.upper()} Plan"},
                            'unit_amount': int(req.amount * 100),
                        },
                        'quantity': 1,
                    }],
                    mode='subscription' if req.billing_cycle == 'monthly' else 'payment',
                    success_url=f"{settings.FRONTEND_URL}/dashboard?payment=success&session_id={{CHECKOUT_SESSION_ID}}",
                    cancel_url=f"{settings.FRONTEND_URL}/pricing?payment=cancelled",
                    metadata={'user_id': str(user_id), 'plan_type': req.plan_type, 'billing_cycle': req.billing_cycle}
                )
                return {
                    "session_id": session.id,
                    "url": session.url,
                    "amount": req.amount,
                    "currency": req.currency,
                    "plan_type": req.plan_type
                }
            except Exception as e:
                print(f"Stripe API Error, using fallback mode: {e}")

        session_id = f"cs_test_{int(datetime.now(timezone.utc).timestamp())}_{random.randint(10000, 99999)}"
        return {
            "session_id": session_id,
            "url": f"{settings.FRONTEND_URL}/dashboard?payment=success&session_id={session_id}",
            "amount": req.amount,
            "currency": req.currency,
            "plan_type": req.plan_type
        }

    @staticmethod
    async def verify_razorpay_payment(user_id: str, req: RazorpayVerifyRequest, db) -> dict:
        secret = settings.RAZORPAY_KEY_SECRET or "rzp_test_secret"
        message = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"
        
        expected_signature = hmac.new(
            secret.encode("utf-8"),
            message.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        # In production with keys set, signature MUST strictly match
        is_valid = (expected_signature == req.razorpay_signature)
        
        # If in test/development mode without secret set, accept test signature format
        if not settings.RAZORPAY_KEY_SECRET and req.razorpay_signature.startswith("sig_"):
            is_valid = True

        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cryptographic verification failed: Invalid Razorpay payment signature."
            )

        return await PaymentService._activate_user_subscription(
            user_id=user_id,
            plan_type=req.plan_type,
            billing_cycle=req.billing_cycle or "monthly",
            amount=req.amount or 0.0,
            currency=req.currency or "INR",
            payment_method="razorpay",
            order_id=req.razorpay_order_id,
            payment_id=req.razorpay_payment_id,
            db=db
        )

    @staticmethod
    async def verify_stripe_payment(user_id: str, req: StripeVerifyRequest, db) -> dict:
        plan_type = req.plan_type or "pro"
        amount = 29.0
        currency = "USD"

        if settings.STRIPE_SECRET_KEY:
            try:
                import stripe
                stripe.api_key = settings.STRIPE_SECRET_KEY
                session = stripe.checkout.Session.retrieve(req.session_id)
                if session.payment_status != "paid":
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Stripe checkout session has not been paid."
                    )
                plan_type = session.metadata.get("plan_type", plan_type)
                amount = float(session.amount_total) / 100.0 if session.amount_total else amount
                currency = session.currency.upper() if session.currency else currency
            except Exception as e:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Stripe verification error: {str(e)}")

        return await PaymentService._activate_user_subscription(
            user_id=user_id,
            plan_type=plan_type,
            billing_cycle=req.billing_cycle or "monthly",
            amount=amount,
            currency=currency,
            payment_method="stripe",
            order_id=req.session_id,
            payment_id=f"pay_stripe_{req.session_id[-8:]}",
            db=db
        )

    @staticmethod
    async def _activate_user_subscription(user_id: str, plan_type: str, billing_cycle: str, amount: float, currency: str, payment_method: str, order_id: str, payment_id: str, db) -> dict:
        now = datetime.now(timezone.utc)
        transaction_id = f"TXN_{int(now.timestamp())}_{random.randint(1000, 9999)}"
        days = 365 if (billing_cycle or "monthly").lower() == "yearly" else 30
        expires_at = now + timedelta(days=days)

        payment_record = {
            "user_id": str(user_id),
            "amount": amount,
            "currency": currency,
            "status": "succeeded",
            "payment_method": payment_method,
            "plan_type": plan_type.lower(),
            "billing_cycle": (billing_cycle or "monthly").lower(),
            "gateway_order_id": order_id,
            "gateway_payment_id": payment_id,
            "transaction_id": transaction_id,
            "created_at": now
        }

        result = await db["payments"].insert_one(payment_record)
        payment_record["id"] = str(result.inserted_id)

        try:
            user_query = {"_id": ObjectId(user_id)}
        except Exception:
            user_query = {"_id": user_id}

        await db["users"].update_one(
            user_query,
            {"$set": {
                "plan_type": plan_type.lower(),
                "updated_at": now
            }}
        )

        await db["subscriptions"].update_one(
            {"user_id": str(user_id)},
            {"$set": {
                "user_id": str(user_id),
                "plan_type": plan_type.lower(),
                "billing_cycle": (billing_cycle or "monthly").lower(),
                "status": "active",
                "started_at": now,
                "expires_at": expires_at,
                "amount": amount,
                "currency": currency,
                "updated_at": now
            }},
            upsert=True
        )

        return payment_record

    @staticmethod
    async def handle_razorpay_webhook(raw_body: bytes, signature: str, db) -> dict:
        webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET or settings.RAZORPAY_KEY_SECRET
        if webhook_secret:
            expected_sig = hmac.new(webhook_secret.encode('utf-8'), raw_body, hashlib.sha256).hexdigest()
            if expected_sig != signature:
                raise HTTPException(status_code=400, detail="Invalid Razorpay webhook signature")

        payload = json.loads(raw_body.decode('utf-8'))
        event = payload.get("event")

        if event in ["order.paid", "payment.captured"]:
            entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
            notes = entity.get("notes", {})
            user_id = notes.get("user_id")
            plan_type = notes.get("plan_type", "pro")
            billing_cycle = notes.get("billing_cycle", "monthly")
            amount = float(entity.get("amount", 0)) / 100.0

            if user_id:
                await PaymentService._activate_user_subscription(
                    user_id=user_id,
                    plan_type=plan_type,
                    billing_cycle=billing_cycle,
                    amount=amount,
                    currency=entity.get("currency", "INR"),
                    payment_method="razorpay_webhook",
                    order_id=entity.get("order_id", ""),
                    payment_id=entity.get("id", ""),
                    db=db
                )

        return {"status": "processed", "event": event}

    @staticmethod
    async def handle_stripe_webhook(raw_body: bytes, signature: str, db) -> dict:
        if settings.STRIPE_WEBHOOK_SECRET and settings.STRIPE_SECRET_KEY:
            try:
                import stripe
                stripe.api_key = settings.STRIPE_SECRET_KEY
                event = stripe.Webhook.construct_event(
                    payload=raw_body, sig_header=signature, secret=settings.STRIPE_WEBHOOK_SECRET
                )
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid Stripe Webhook signature: {str(e)}")
        else:
            event = json.loads(raw_body.decode('utf-8'))

        event_type = event.get("type") if isinstance(event, dict) else event.type

        if event_type == "checkout.session.completed":
            session = event.get("data", {}).get("object", {}) if isinstance(event, dict) else event.data.object
            metadata = session.get("metadata", {})
            user_id = metadata.get("user_id")
            plan_type = metadata.get("plan_type", "pro")
            billing_cycle = metadata.get("billing_cycle", "monthly")
            amount = float(session.get("amount_total", 0)) / 100.0

            if user_id:
                await PaymentService._activate_user_subscription(
                    user_id=user_id,
                    plan_type=plan_type,
                    billing_cycle=billing_cycle,
                    amount=amount,
                    currency=session.get("currency", "usd").upper(),
                    payment_method="stripe_webhook",
                    order_id=session.get("id", ""),
                    payment_id=session.get("payment_intent", ""),
                    db=db
                )

        return {"status": "processed", "event": event_type}

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
        try:
            query = {
                "user_id": str(user_id),
                "$or": [
                    {"transaction_id": transaction_id},
                    {"_id": ObjectId(transaction_id) if len(transaction_id) == 24 else None}
                ]
            }
        except Exception:
            query = {"user_id": str(user_id), "transaction_id": transaction_id}

        payment = await db["payments"].find_one(query)

        if not payment:
            # Strictly raise HTTP 404 if no verified transaction exists in DB
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction invoice '{transaction_id}' not found in database records."
            )

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

    @staticmethod
    async def generate_invoice_pdf(user_id: str, transaction_id: str, db) -> bytes:
        details = await PaymentService.get_invoice_details(user_id, transaction_id, db)
        
        # Build invoice PDF content
        try:
            import io
            from reportlab.lib.pagesizes import letter
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
            styles = getSampleStyleSheet()

            title_style = ParagraphStyle('InvTitle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=22, textColor=colors.HexColor('#7c3aed'))
            body_style = ParagraphStyle('InvBody', parent=styles['Normal'], fontName='Helvetica', fontSize=10, textColor=colors.HexColor('#334155'), leading=14)
            bold_style = ParagraphStyle('InvBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#0f172a'), leading=14)

            story = []
            story.append(Paragraph("PrepNova AI — OFFICIAL INVOICE", title_style))
            story.append(Paragraph(f"Invoice #: <b>{details['invoice_number']}</b> | Date: <b>{details['date'].strftime('%B %d, %Y') if hasattr(details['date'], 'strftime') else str(details['date'])[:10]}</b>", body_style))
            story.append(Spacer(1, 10))
            story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#7c3aed'), spaceAfter=15))

            # Customer & Order info
            info_data = [
                [Paragraph("<b>Billed To:</b>", bold_style), Paragraph("<b>Payment Details:</b>", bold_style)],
                [Paragraph(f"{details['customer_name']}<br/>{details['customer_email']}", body_style), Paragraph(f"Transaction ID: {details['transaction_id']}<br/>Method: {details['payment_method'].title()}", body_style)]
            ]
            info_table = Table(info_data, colWidths=[270, 270])
            info_table.setStyle(TableStyle([('PADDING', (0,0), (-1,-1), 4)]))
            story.append(info_table)
            story.append(Spacer(1, 15))

            # Line items
            line_data = [
                [Paragraph("<b>Description</b>", bold_style), Paragraph("<b>Billing Cycle</b>", bold_style), Paragraph("<b>Amount</b>", bold_style)],
                [Paragraph(f"PrepNova AI Subscription - {details['plan_name']} Plan", body_style), Paragraph(details['billing_cycle'].title(), body_style), Paragraph(f"{details['currency']} {details['subtotal']:.2f}", body_style)],
                [Paragraph("Tax / GST (18%)", body_style), Paragraph("-", body_style), Paragraph(f"{details['currency']} {details['tax']:.2f}", body_style)],
                [Paragraph("<b>TOTAL DUE & PAID</b>", bold_style), Paragraph("<b>SUCCEEDED</b>", bold_style), Paragraph(f"<b>{details['currency']} {details['total_amount']:.2f}</b>", bold_style)]
            ]
            line_table = Table(line_data, colWidths=[260, 140, 140])
            line_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
                ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
                ('PADDING', (0,0), (-1,-1), 8),
            ]))
            story.append(line_table)

            doc.build(story)
            return buffer.getvalue()
        except Exception as e:
            print(f"Fallback invoice PDF generator: {e}")
            pdf_str = f"%PDF-1.4\n1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R>> endobj\n4 0 obj <</Length 200>> stream\nBT /F1 18 Tf 50 700 Td (PrepNova AI Invoice {details['invoice_number']}) Tj /F1 12 Tf 0 -30 Td (Total Paid: {details['currency']} {details['total_amount']}) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\ntrailer <</Size 5 /Root 1 0 R>>\nstartxref\n350\n%%EOF"
            return pdf_str.encode('utf-8')

    @staticmethod
    async def calculate_prorated_upgrade(user_id: str, target_plan: str, db) -> dict:
        target_plan_lower = target_plan.lower().strip()
        PLAN_PRICES = {"free": 0, "pro": 499, "premium": 999, "enterprise": 2499}
        
        current_sub = await PaymentService.get_user_subscription(user_id, db)
        current_plan = current_sub.get("plan_type", "free").lower()
        current_price = PLAN_PRICES.get(current_plan, 0)
        target_price = PLAN_PRICES.get(target_plan_lower, 2499)

        now = datetime.now(timezone.utc)
        expires_at = current_sub.get("expires_at")

        if expires_at and isinstance(expires_at, datetime) and expires_at > now:
            remaining_days = max(1, (expires_at - now).days)
            total_days = 30
            unused_credit = round((current_price / total_days) * remaining_days, 2)
        else:
            unused_credit = 0.0

        prorated_due = max(0.0, round(target_price - unused_credit, 2))

        return {
            "current_plan": current_plan.upper(),
            "target_plan": target_plan_lower.upper(),
            "current_plan_price": current_price,
            "target_plan_price": target_price,
            "unused_credit": unused_credit,
            "prorated_amount_due": prorated_due,
            "currency": "INR",
            "billing_cycle": "monthly"
        }

    @staticmethod
    async def execute_prorated_upgrade(user_id: str, target_plan: str, db) -> dict:
        calc = await PaymentService.calculate_prorated_upgrade(user_id, target_plan, db)
        now = datetime.now(timezone.utc)
        new_expires_at = now + timedelta(days=30)
        target_lower = target_plan.lower().strip()

        try:
            user_query = {"_id": ObjectId(user_id)}
        except Exception:
            user_query = {"_id": user_id}

        await db["users"].update_one(user_query, {"$set": {"plan_type": target_lower, "updated_at": now}})
        
        txn_id = f"UPG_{target_lower.upper()}_{int(now.timestamp())}"
        await db["payments"].insert_one({
            "user_id": str(user_id),
            "transaction_id": txn_id,
            "amount": calc["prorated_amount_due"],
            "currency": "INR",
            "status": "succeeded",
            "payment_method": "razorpay_prorated_upgrade",
            "plan_type": target_lower,
            "billing_cycle": "monthly",
            "created_at": now
        })

        await db["subscriptions"].update_one(
            {"user_id": str(user_id)},
            {"$set": {
                "plan_type": target_lower,
                "status": "active",
                "amount": calc["target_plan_price"],
                "expires_at": new_expires_at,
                "updated_at": now
            }},
            upsert=True
        )

        return {
            "success": True,
            "message": f"Successfully upgraded plan to {target_lower.upper()} with prorated credit applied.",
            "new_plan": target_lower.upper(),
            "amount_paid": calc["prorated_amount_due"],
            "transaction_id": txn_id,
            "expires_at": new_expires_at
        }

    @staticmethod
    async def get_gateway_webhook_status(db) -> dict:
        razorpay_ready = bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)
        stripe_ready = bool(settings.STRIPE_SECRET_KEY and settings.STRIPE_WEBHOOK_SECRET)
        
        webhooks_count = await db["payments"].count_documents({"payment_method": {"$in": ["razorpay", "stripe"]}})
        
        return {
            "razorpay_gateway": {
                "configured": razorpay_ready,
                "key_id": settings.RAZORPAY_KEY_ID[:6] + "..." if settings.RAZORPAY_KEY_ID else "Not Set",
                "webhook_status": "Active & Listening" if razorpay_ready else "Development Fallback Mode"
            },
            "stripe_gateway": {
                "configured": stripe_ready,
                "webhook_status": "Active & Listening" if stripe_ready else "Development Fallback Mode"
            },
            "processed_webhooks_count": webhooks_count,
            "system_mode": "Production Ready" if (razorpay_ready or stripe_ready) else "Sandbox / Local Fallback Active"
        }

