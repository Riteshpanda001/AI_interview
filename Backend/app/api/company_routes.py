from fastapi import APIRouter, Depends
from typing import List
from app.schemas.company_schema import CompanyResponse
from app.dependencies import get_current_active_user, get_db
from app.services.company_service import CompanyService

router = APIRouter()

@router.get("/", response_model=List[CompanyResponse])
async def list_companies(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    companies = await CompanyService.get_companies(db)
    return companies
