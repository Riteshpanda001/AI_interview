from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class DashboardMetricsModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    total_interviews: int = 0
    average_score: float = 0.0
    skills_progress: Dict[str, float] = Field(default_factory=dict)
    recent_activity: list = Field(default_factory=list)
    last_updated: datetime = Field(default_factory=datetime.now)

    class Config:
        populate_by_name = True

class ActivityModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    type: str
    title: str
    description: Optional[str] = ""
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True

class GoalModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    title: str
    target_value: float
    current_value: float = 0.0
    unit: str = ""
    category: str = "general"
    completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True

