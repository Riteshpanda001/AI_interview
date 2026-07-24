from pydantic import BaseModel, Field
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

class ResumeContent(BaseModel):
    personal: Optional[PersonalInfo] = Field(default_factory=PersonalInfo)
    summary: Optional[str] = ""
    experience: Optional[List[ExperienceItem]] = Field(default_factory=list)
    education: Optional[List[EducationItem]] = Field(default_factory=list)
    skills: Optional[List[str]] = Field(default_factory=list)
    projects: Optional[List[ProjectItem]] = Field(default_factory=list)

class ResumeResponse(BaseModel):
    id: str
    filename: Optional[str] = "Untitled Resume.pdf"
    title: Optional[str] = "Untitled Resume"
    parsed_content: Dict[str, Any]
    selected_template: Optional[str] = "london"
    ats_score: Optional[int] = 85
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True

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

class OptimizeResumeRequest(BaseModel):
    personal: Optional[PersonalInfo] = None
    summary: Optional[str] = None
    experience: Optional[List[ExperienceItem]] = None
    education: Optional[List[EducationItem]] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[ProjectItem]] = None

class OptimizeResumeResponse(BaseModel):
    personal: Optional[PersonalInfo] = None
    summary: Optional[str] = None
    experience: Optional[List[ExperienceItem]] = None
    education: Optional[List[EducationItem]] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[ProjectItem]] = None

class ShareResponse(BaseModel):
    share_token: str
    share_url: str

class VersionSnapshot(BaseModel):
    id: str
    resume_id: str
    version_name: str
    created_at: datetime
    resume_data: Dict[str, Any]
