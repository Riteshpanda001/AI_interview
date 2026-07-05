from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class PaymentModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    amount: float
    currency: str = "USD"
    status: str  # pending, succeeded, failed, refunded
    payment_method: str  # stripe, paypal, razorpay, etc.
    transaction_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
