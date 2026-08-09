from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Optional

class CompanyResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    industry: str
    interview_process: List[Dict[str, str]]
    typical_questions: List[Dict[str, str]]
    logo_url: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)
