from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, List
from datetime import datetime

class DashboardMetricsResponse(BaseModel):
    total_interviews: int
    average_score: float
    skills_progress: Dict[str, float]
    recent_activity: List[Dict[str, Any]]
    last_updated: datetime

    model_config = ConfigDict(populate_by_name=True)
