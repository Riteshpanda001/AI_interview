from fastapi import APIRouter, Depends
from app.schemas.payment_schema import PaymentCreateRequest, PaymentResponse
from app.dependencies import get_current_active_user, get_db
from app.services.payment_service import PaymentService

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
