from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class PaymentCreateRequest(BaseModel):
    amount: float
    payment_method: str = "razorpay"  # razorpay, stripe, card
    plan_type: str  # free, pro, premium, enterprise
    billing_cycle: Optional[str] = "monthly"  # monthly, yearly
    currency: Optional[str] = "INR"
    gateway_order_id: Optional[str] = None
    gateway_payment_id: Optional[str] = None
    signature: Optional[str] = None

class PaymentResponse(BaseModel):
    id: str
    amount: float
    currency: str
    status: str
    transaction_id: str
    plan_type: str
    billing_cycle: Optional[str] = "monthly"
    payment_method: str
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)

class RazorpayOrderRequest(BaseModel):
    plan_type: str
    billing_cycle: str = "monthly"
    amount: float
    currency: str = "INR"

class RazorpayOrderResponse(BaseModel):
    order_id: str
    amount: float
    currency: str
    key_id: str
    plan_type: str

class StripeCheckoutRequest(BaseModel):
    plan_type: str
    billing_cycle: str = "monthly"
    amount: float
    currency: str = "USD"

class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_type: str
    billing_cycle: Optional[str] = "monthly"
    amount: Optional[float] = 0.0
    currency: Optional[str] = "INR"

class StripeVerifyRequest(BaseModel):
    session_id: str
    plan_type: Optional[str] = None
    billing_cycle: Optional[str] = "monthly"


class UPIQRVerifyRequest(BaseModel):
    plan_type: str
    billing_cycle: Optional[str] = "monthly"
    amount: float
    currency: Optional[str] = "INR"
    transaction_ref: Optional[str] = None



class SubscriptionDetailsResponse(BaseModel):
    plan_type: str
    billing_cycle: str
    status: str
    is_active: bool
    started_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    amount: float
    currency: str
    features: List[str]

class InvoiceResponse(BaseModel):
    invoice_number: str
    transaction_id: str
    date: datetime
    customer_name: str
    customer_email: str
    plan_name: str
    billing_cycle: str
    payment_method: str
    subtotal: float
    tax: float
    total_amount: float
    currency: str
    status: str
