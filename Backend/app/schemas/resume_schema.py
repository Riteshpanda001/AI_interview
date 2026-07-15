from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class ResumeResponse(BaseModel):
    id: str
    filename: str
    parsed_content: Dict[str, Any]
    created_at: datetime

    class Config:
        populate_by_name = True

class PersonalInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    role: Optional[str] = None

class ExperienceItem(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    duration: Optional[str] = None
    details: Optional[str] = None

class EducationItem(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    duration: Optional[str] = None

class ProjectItem(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

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

