from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.schemas.resume_schema import ResumeResponse
from app.dependencies import get_current_active_user, get_db
from app.services.resume_service import ResumeService

router = APIRouter()

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed.")
        
    resume_details = await ResumeService.save_and_parse_resume(
        user_id=str(current_user["_id"]),
        upload_file=file,
        db=db
    )
    return resume_details
