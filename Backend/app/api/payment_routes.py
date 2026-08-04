from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.payment_schema import (
    PaymentCreateRequest, PaymentResponse,
    RazorpayOrderRequest, RazorpayOrderResponse,
    StripeCheckoutRequest, SubscriptionDetailsResponse,
    InvoiceResponse
)
from app.dependencies import get_current_active_user, get_db
from app.services.payment_service import PaymentService
from typing import List

router = APIRouter()

@router.post("/checkout", response_model=PaymentResponse)
async def create_payment_checkout(
    request: PaymentCreateRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    payment = await PaymentService.process_payment(
        user_id=str(current_user["_id"]),
        req=request,
        db=db
    )
    return payment

@router.post("/create-razorpay-order", response_model=RazorpayOrderResponse)
async def create_razorpay_order(
    request: RazorpayOrderRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await PaymentService.create_razorpay_order(request, db=db)

@router.post("/create-stripe-session")
async def create_stripe_session(
    request: StripeCheckoutRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await PaymentService.create_stripe_session(request, db=db)

@router.get("/subscription", response_model=SubscriptionDetailsResponse)
async def get_subscription(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await PaymentService.get_user_subscription(user_id=str(current_user["_id"]), db=db)

@router.post("/cancel-subscription")
async def cancel_subscription(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await PaymentService.cancel_subscription(user_id=str(current_user["_id"]), db=db)

@router.get("/history")
async def get_payment_history(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await PaymentService.get_payment_history(user_id=str(current_user["_id"]), db=db)

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
