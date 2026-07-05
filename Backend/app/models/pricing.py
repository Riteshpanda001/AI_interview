from typing import Optional, List
from pydantic import BaseModel, Field

class PricingModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    name: str  # Free Plan, Pro Plan, etc.
    price: float
    billing: str  # monthly, yearly
    features: List[str] = Field(default_factory=list)
    plan_type: str  # free, pro, enterprise

    class Config:
        populate_by_name = True
