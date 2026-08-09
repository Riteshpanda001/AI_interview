from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from pydantic import BaseModel
from app.dependencies import get_current_active_user, get_db
from app.services.company_service import CompanyService

router = APIRouter()

class CompanySaveRequest(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = ""
    industry: Optional[str] = "Technology"
    difficulty_rating: Optional[str] = "Hard"
    eligibility: Optional[dict] = None
    hiring_process: Optional[list] = None
    online_assessment_specs: Optional[dict] = None
    personalized_prep_plan: Optional[list] = None

class CompanyQuestionSaveRequest(BaseModel):
    company_slug: str
    category: str # "dsa", "technical", "hr", "behavioral"
    title: str
    difficulty: Optional[str] = "Medium"
    instructions: Optional[str] = ""
    code_template: Optional[str] = ""
    solution_explanation: Optional[str] = ""

@router.get("/all")
@router.get("/")
async def list_companies(db = Depends(get_db)):
    return await CompanyService.get_all_companies(db)

@router.get("/{slug}")
async def get_company_profile(slug: str, db = Depends(get_db)):
    return await CompanyService.get_company_by_slug(slug, db)

@router.get("/{slug}/questions")
async def get_company_questions(
    slug: str,
    category: Optional[str] = "all",
    db = Depends(get_db)
):
    return await CompanyService.get_company_questions(slug, category, db)

@router.get("/{company_name}/dsa-questions")
async def get_company_dsa_questions(company_name: str, db = Depends(get_db)):
    return await CompanyService.get_company_questions(company_name, "dsa", db)

@router.post("/admin/save")
async def save_company_profile(
    request: CompanySaveRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await CompanyService.save_or_update_company(request.dict(), db)

@router.delete("/admin/{company_id}")
async def delete_company_profile(
    company_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await CompanyService.delete_company(company_id, db)

@router.post("/admin/question")
async def add_company_question(
    request: CompanyQuestionSaveRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await CompanyService.add_company_question(request.dict(), db)

@router.put("/admin/question/{question_id}")
async def update_company_question(
    question_id: str,
    request: CompanyQuestionSaveRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await CompanyService.update_company_question(question_id, request.dict(), db)

@router.delete("/admin/question/{question_id}")
async def delete_company_question(
    question_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await CompanyService.delete_company_question(question_id, db)

@router.post("/admin/seed")
async def trigger_seed_database(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    from app.database.seed import seed_database
    await seed_database()
    return {"message": "Database successfully seeded with top companies and questions."}

