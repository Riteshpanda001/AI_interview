from pydantic import BaseModel, ConfigDict, Field
from typing import Dict, Any, List, Optional
from datetime import datetime

class GoalCreate(BaseModel):
    title: str
    target_value: float
    current_value: Optional[float] = 0.0
    unit: Optional[str] = ""
    category: Optional[str] = "general"

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    completed: Optional[bool] = None

class GoalResponse(BaseModel):
    id: str
    user_id: str
    title: str
    target_value: float
    current_value: float
    unit: str
    category: str
    completed: bool
    created_at: Any

    model_config = ConfigDict(populate_by_name=True)

class DashboardMetricsResponse(BaseModel):
    # Backward compatibility fields
    total_interviews: int = 0
    average_score: float = 0.0
    skills_progress: Dict[str, float] = Field(default_factory=dict)
    recent_activity: List[Dict[str, Any]] = Field(default_factory=list)
    last_updated: Any = None

    # Enhanced dynamic dashboard fields
    ats_score: Optional[int] = 0
    resume_completion: Optional[int] = 0
    job_match_score: Optional[int] = 0
    interview_score: Optional[int] = 0
    coding_score: Optional[int] = 0
    questions_attempted: Optional[int] = 0
    questions_correct: Optional[int] = 0
    strong_skills: List[str] = Field(default_factory=list)
    weak_skills: List[str] = Field(default_factory=list)
    weekly_improvement: Optional[int] = 0
    monthly_improvement: Optional[int] = 0
    interview_readiness: Optional[int] = 0
    ai_recommendations: List[str] = Field(default_factory=list)

    # Detailed structured blocks
    readiness: Optional[Dict[str, Any]] = None
    metrics: Optional[Dict[str, Any]] = None
    resume_progress: Optional[Dict[str, Any]] = None
    ats_performance: Optional[Dict[str, Any]] = None
    coding_progress: Optional[Dict[str, Any]] = None
    company_preparation: Optional[Dict[str, Any]] = None
    interview_performance: Optional[Dict[str, Any]] = None
    recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    career_roadmap: List[Dict[str, Any]] = Field(default_factory=list)
    weak_areas: List[Dict[str, Any]] = Field(default_factory=list)
    weekly_activity: List[Dict[str, Any]] = Field(default_factory=list)
    performance_history: Dict[str, Any] = Field(default_factory=dict)
    goals: List[Dict[str, Any]] = Field(default_factory=list)
    achievements: Dict[str, Any] = Field(default_factory=dict)
    quick_actions: List[Dict[str, Any]] = Field(default_factory=list)
    streak: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(populate_by_name=True)

