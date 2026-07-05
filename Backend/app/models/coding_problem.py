from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class CodingProblemModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    title: str
    slug: str
    difficulty: str  # Easy, Medium, Hard
    description: str
    test_cases: List[Dict[str, str]] = Field(default_factory=list)  # input-output combinations
    starter_code: Dict[str, str] = Field(default_factory=dict)  # language to starter code snippet mapping

    class Config:
        populate_by_name = True
