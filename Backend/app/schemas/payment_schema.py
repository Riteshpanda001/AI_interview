from pydantic import BaseModel
from datetime import datetime

class PaymentCreateRequest(BaseModel):
    amount: float
    payment_method: str
    plan_type: str  # pro, enterprise

class PaymentResponse(BaseModel):
    id: str
    amount: float
    currency: str
    status: str
    transaction_id: str
    created_at: datetime

    class Config:
        populate_by_name = True
