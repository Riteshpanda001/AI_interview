from fastapi import APIRouter, Depends
from typing import List
from app.schemas.pricing_schema import PricingResponse
from app.dependencies import get_db
from app.services.pricing_service import PricingService

router = APIRouter()

@router.get("/", response_model=List[PricingResponse])
async def get_pricing_tiers(db = Depends(get_db)):
    plans = await PricingService.get_plans(db)
    return plans
