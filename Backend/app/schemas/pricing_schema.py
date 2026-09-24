from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional


class PricingResponse(BaseModel):
    id: str
    name: str
    slug: str = ""
    plan_type: str
    description: str = ""
    price_monthly: float = 0
    price_yearly: float = 0
    currency: str = "INR"
    display_price_monthly: str = ""
    display_price_yearly: str = ""
    yearly_note: str = ""
    features: List[str]
    popular: bool = False
    active: bool = True
    display_order: int = 99

    model_config = ConfigDict(populate_by_name=True)
