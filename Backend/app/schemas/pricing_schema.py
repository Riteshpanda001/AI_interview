from pydantic import BaseModel, ConfigDict
from typing import List

class PricingResponse(BaseModel):
    id: str
    name: str
    price: float
    billing: str
    features: List[str]
    plan_type: str

    model_config = ConfigDict(populate_by_name=True)
