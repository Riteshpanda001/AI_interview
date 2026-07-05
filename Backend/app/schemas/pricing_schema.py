from pydantic import BaseModel
from typing import List

class PricingResponse(BaseModel):
    id: str
    name: str
    price: float
    billing: str
    features: List[str]
    plan_type: str

    class Config:
        populate_by_name = True
