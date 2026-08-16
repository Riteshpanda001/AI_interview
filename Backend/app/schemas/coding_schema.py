from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional
from datetime import datetime

class CodingProblemResponse(BaseModel):
    id: str
    title: str
    slug: str
    difficulty: str
    description: str
    starter_code: Dict[str, str]

    model_config = ConfigDict(populate_by_name=True)

class CodingSubmitRequest(BaseModel):
    language: str
    submitted_code: str

class TestCaseResultItem(BaseModel):
    test_case: int
    is_public: bool = True
    input: str = ""
    expected: str = ""
    actual: str = ""
    passed: bool = False
    status: str = "PASSED"
    runtime_ms: int = 0
    error: Optional[str] = ""

class CodingSubmissionResponse(BaseModel):
    id: str
    problem_id: str
    language: str
    submitted_code: str
    status: str
    run_time_ms: Optional[int] = 0
    runtime_percentile: Optional[float] = 90.0
    memory_percentile: Optional[float] = 85.0
    evaluation_result: Dict[str, Any]
    test_case_results: Optional[List[Dict[str, Any]]] = []
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)

class CodingSubmissionHistoryItem(BaseModel):
    id: str
    problem_id: str
    language: str
    submitted_code: str
    status: str
    run_time_ms: Optional[int] = 0
    runtime_percentile: Optional[float] = 90.0
    memory_percentile: Optional[float] = 85.0
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)

