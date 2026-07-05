from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class DashboardMetricsModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    total_interviews: int = 0
    average_score: float = 0.0
    skills_progress: Dict[str, float] = Field(default_factory=dict)  # e.g., {"python": 75.0, "communication": 85.0}
    recent_activity: list = Field(default_factory=list)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
