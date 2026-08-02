from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

class PersonalInfo(BaseModel):
    name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    linkedin: Optional[str] = ""
    role: Optional[str] = ""

class ExperienceItem(BaseModel):
    company: Optional[str] = ""
    role: Optional[str] = ""
    duration: Optional[str] = ""
    details: Optional[str] = ""

class EducationItem(BaseModel):
    institution: Optional[str] = ""
    degree: Optional[str] = ""
    duration: Optional[str] = ""

class ProjectItem(BaseModel):
    name: Optional[str] = ""
    description: Optional[str] = ""

class CertificationItem(BaseModel):
    title: Optional[str] = ""
    issuer: Optional[str] = ""
    year: Optional[str] = ""

class AchievementItem(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""

class ResumeContent(BaseModel):
    personal: Optional[PersonalInfo] = Field(default_factory=PersonalInfo)
    summary: Optional[str] = ""
    experience: Optional[List[ExperienceItem]] = Field(default_factory=list)
    education: Optional[List[EducationItem]] = Field(default_factory=list)
    skills: Optional[List[str]] = Field(default_factory=list)
    projects: Optional[List[ProjectItem]] = Field(default_factory=list)
    certifications: Optional[List[CertificationItem]] = Field(default_factory=list)
    achievements: Optional[List[AchievementItem]] = Field(default_factory=list)
    languages: Optional[List[str]] = Field(default_factory=list)

class ResumeResponse(BaseModel):
    id: str
    filename: Optional[str] = "Untitled Resume.pdf"
    title: Optional[str] = "Untitled Resume"
    parsed_content: Dict[str, Any]
    selected_template: Optional[str] = "london"
    ats_score: Optional[int] = 85
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(populate_by_name=True)

class ResumeSaveRequest(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = "Untitled Resume"
    selected_template: Optional[str] = "london"
    resume_data: ResumeContent
    ats_score: Optional[int] = 85

class ResumeRenameRequest(BaseModel):
    title: str

class AIGenerateResumeRequest(BaseModel):
    role: str
    experience_level: Optional[str] = "Mid-Level"
    industry: Optional[str] = "Technology"
    key_skills: Optional[str] = ""
    bio_prompt: Optional[str] = ""
    full_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    linkedin: Optional[str] = ""
    degree: Optional[str] = ""
    achievements: Optional[str] = ""
    job_description: Optional[str] = ""

class OptimizeResumeRequest(BaseModel):
    personal: Optional[PersonalInfo] = None
    summary: Optional[str] = None
    experience: Optional[List[ExperienceItem]] = None
    education: Optional[List[EducationItem]] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[ProjectItem]] = None
    certifications: Optional[List[CertificationItem]] = None
    achievements: Optional[List[AchievementItem]] = None
    selected_features: Optional[List[str]] = None
    target_role: Optional[str] = None

class OptimizeResumeResponse(BaseModel):
    personal: Optional[PersonalInfo] = None
    summary: Optional[str] = None
    experience: Optional[List[ExperienceItem]] = None
    education: Optional[List[EducationItem]] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[ProjectItem]] = None
    certifications: Optional[List[CertificationItem]] = None
    achievements: Optional[List[AchievementItem]] = None

class AIAssistantRequest(BaseModel):
    action: str  # e.g., "improve_summary", "rewrite_project", "suggest_skills", "improve_ats", "suggest_certifications", "tailor_role"
    target_role: Optional[str] = "Software Engineer"
    current_content: Optional[Dict[str, Any]] = None
    prompt: Optional[str] = ""

class JobMatchRequest(BaseModel):
    resume_id: Optional[str] = ""
    resume_data: Optional[Dict[str, Any]] = None
    job_description: str
    target_role: Optional[str] = "Software Engineer"

class JobMatchResponse(BaseModel):
    match_percentage: int
    matched_skills: List[str]
    missing_skills: List[str]
    missing_keywords: List[str]
    formatting_score: int
    readability_score: int
    suggestions: List[str]

class InterviewReadinessResponse(BaseModel):
    readiness_score: int
    ats_score: int
    resume_quality: int
    skills_score: int
    projects_score: int
    experience_score: int
    suggestions: List[str]

class ShareSettingsRequest(BaseModel):
    access_type: str = "public"  # "public", "private", "password"
    password: Optional[str] = None

class ShareResponse(BaseModel):
    share_token: str
    share_url: str
    access_type: Optional[str] = "public"
    is_protected: Optional[bool] = False

class VersionSnapshot(BaseModel):
    id: str
    resume_id: str
    version_name: str
    created_at: datetime
    resume_data: Dict[str, Any]
