from fastapi import APIRouter, Depends, HTTPException, Header, Request, Response, status
from app.schemas.payment_schema import (
    PaymentResponse, RazorpayOrderRequest, RazorpayOrderResponse,
    StripeCheckoutRequest, RazorpayVerifyRequest, StripeVerifyRequest,
    SubscriptionDetailsResponse, InvoiceResponse, UPIQRVerifyRequest
)
from app.dependencies import get_current_active_user, get_db
from app.services.payment_service import PaymentService
from typing import Optional
from pydantic import BaseModel

router = APIRouter()

class UpgradeRequest(BaseModel):
    target_plan: str = "enterprise"

@router.post("/create-razorpay-order", response_model=RazorpayOrderResponse)
async def create_razorpay_order(
    request: RazorpayOrderRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await PaymentService.create_razorpay_order(
        user_id=str(current_user["_id"]),
        req=request,
        db=db
    )

@router.post("/create-stripe-session")
async def create_stripe_session(
    request: StripeCheckoutRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await PaymentService.create_stripe_session(
        user_id=str(current_user["_id"]),
        req=request,
        db=db
    )

@router.post("/verify-razorpay", response_model=PaymentResponse)
async def verify_razorpay_payment(
    request: RazorpayVerifyRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await PaymentService.verify_razorpay_payment(
        user_id=str(current_user["_id"]),
        req=request,
        db=db
    )

@router.post("/verify-stripe", response_model=PaymentResponse)
async def verify_stripe_payment(
    request: StripeVerifyRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await PaymentService.verify_stripe_payment(
        user_id=str(current_user["_id"]),
        req=request,
        db=db
    )

@router.post("/verify-upi-qr", response_model=PaymentResponse)
async def verify_upi_qr_payment(
    request: UPIQRVerifyRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    from datetime import datetime, timezone
    import random
    return await PaymentService._activate_user_subscription(
        user_id=str(current_user["_id"]),
        plan_type=request.plan_type,
        billing_cycle=request.billing_cycle or "monthly",
        amount=request.amount,
        currency=request.currency or "INR",
        payment_method="upi_qr",
        order_id=f"qr_{int(datetime.now(timezone.utc).timestamp())}",
        payment_id=request.transaction_ref or f"pay_qr_{random.randint(100000, 999999)}",
        db=db
    )

@router.post("/webhook/razorpay")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None),
    db = Depends(get_db)
):
    raw_body = await request.body()
    return await PaymentService.handle_razorpay_webhook(
        raw_body=raw_body,
        signature=x_razorpay_signature or "",
        db=db
    )

@router.post("/webhook/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None),
    db = Depends(get_db)
):
    raw_body = await request.body()
    return await PaymentService.handle_stripe_webhook(
        raw_body=raw_body,
        signature=stripe_signature or "",
        db=db
    )

@router.get("/subscription", response_model=SubscriptionDetailsResponse)
async def get_subscription(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await PaymentService.get_user_subscription(
        user_id=str(current_user["_id"]),
        db=db
    )

@router.post("/cancel-subscription")
async def cancel_subscription(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await PaymentService.cancel_subscription(
        user_id=str(current_user["_id"]),
        db=db
    )

@router.get("/history")
async def get_payment_history(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await PaymentService.get_payment_history(
        user_id=str(current_user["_id"]),
        db=db
    )

@router.get("/invoice/{transaction_id}", response_model=InvoiceResponse)
async def get_invoice(
    transaction_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await PaymentService.get_invoice_details(
        user_id=str(current_user["_id"]),
        transaction_id=transaction_id,
        db=db
    )

@router.get("/invoice/{transaction_id}/pdf")
async def download_invoice_pdf(
    transaction_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    pdf_bytes = await PaymentService.generate_invoice_pdf(user_id, transaction_id, db)
    filename = f"PrepNova_Invoice_{transaction_id[:8]}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.post("/calculate-upgrade")
async def calculate_upgrade(
    request: UpgradeRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await PaymentService.calculate_prorated_upgrade(user_id, request.target_plan, db)

@router.post("/upgrade-subscription")
async def upgrade_subscription(
    request: UpgradeRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await PaymentService.execute_prorated_upgrade(user_id, request.target_plan, db)

@router.get("/webhook-status")
async def get_webhook_status(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await PaymentService.get_gateway_webhook_status(db)

