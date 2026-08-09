from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class ATSAnalysisRequest(BaseModel):
    resume_id: Optional[str] = ""
    resume_data: Optional[Dict[str, Any]] = None
    resume_text: Optional[str] = ""
    job_title: Optional[str] = ""
    experience_level: Optional[str] = "Mid Level"
    target_company: Optional[str] = ""
    target_location: Optional[str] = ""
    job_description: str

class ResumeQualityAudit(BaseModel):
    quality_score: int = 85
    extracted_sections: Dict[str, Any] = {}
    missing_sections: List[str] = []
    improvement_suggestions: List[str] = []

class HardSkillsBreakdown(BaseModel):
    score: int = 75
    matched: List[str] = []
    missing_critical: List[str] = []
    missing_optional: List[str] = []

class SoftSkillsBreakdown(BaseModel):
    score: int = 80
    matched: List[str] = []
    missing: List[str] = []

class ExperienceBreakdown(BaseModel):
    score: int = 85
    status: str = "Strong Match"
    details: str = "Experience level aligns well with role seniority requirements."

class ImpactMetricsBreakdown(BaseModel):
    score: int = 70
    details: str = "Good quantitative metrics included; can add more percentage/revenue impact figures."

class TailoredBulletPoint(BaseModel):
    original: str
    tailored: str
    target_keyword: str

class JobInterviewQuestion(BaseModel):
    id: str
    category: str
    question: str
    sample_answer_key: str
    target_gap: str

class ATSAnalysisResponse(BaseModel):
    id: str
    resume_id: Optional[str] = ""
    job_title: Optional[str] = "Target Role"
    target_company: Optional[str] = ""
    target_location: Optional[str] = ""
    experience_level_target: Optional[str] = ""
    score: int
    matched_skills: List[str]
    missing_skills: List[str]
    resume_quality_audit: Optional[ResumeQualityAudit] = None
    hard_skills: Optional[HardSkillsBreakdown] = None
    soft_skills: Optional[SoftSkillsBreakdown] = None
    experience_level: Optional[ExperienceBreakdown] = None
    impact_quantification: Optional[ImpactMetricsBreakdown] = None
    tailored_bullet_suggestions: Optional[List[TailoredBulletPoint]] = []
    interview_questions: Optional[List[JobInterviewQuestion]] = []
    recommendations: List[str]
    detailed_feedback: str
    ai_engine: Optional[str] = "Hugging Face & Gemini Hybrid Engine"
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)

class TailorResumeRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_description: str

class ParseJobDescriptionResponse(BaseModel):
    job_title: str = ""
    extracted_text: str = ""
    required_skills: List[str] = []
    soft_skills: List[str] = []
    experience_level: str = ""
    responsibilities: List[str] = []

