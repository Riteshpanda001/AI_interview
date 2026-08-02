from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import List, Dict, Any
from app.schemas.resume_schema import (
    ResumeResponse, OptimizeResumeRequest, OptimizeResumeResponse,
    ResumeSaveRequest, ResumeRenameRequest, AIGenerateResumeRequest, ShareResponse,
    AIAssistantRequest, JobMatchRequest, JobMatchResponse, InterviewReadinessResponse, ShareSettingsRequest
)
from app.dependencies import get_current_active_user, get_db
from app.services.resume_service import ResumeService

router = APIRouter()

@router.get("/list")
async def list_resumes(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await ResumeService.get_user_resumes(user_id, db)

@router.get("/public/{share_token}")
async def get_public_resume(
    share_token: str,
    db = Depends(get_db)
):
    return await ResumeService.get_shared_resume(share_token, db)

@router.get("/{resume_id}")
async def get_resume(
    resume_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await ResumeService.get_resume_by_id(resume_id, user_id, db)

@router.post("/save")
async def save_resume(
    request: ResumeSaveRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await ResumeService.save_or_update_resume(user_id, request.model_dump(), db)

@router.post("/generate")
async def generate_ai_resume(
    request: AIGenerateResumeRequest,
    current_user = Depends(get_current_active_user)
):
    return await ResumeService.generate_ai_resume(request.model_dump())

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    if not file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed.")
        
    return await ResumeService.save_and_parse_resume(
        user_id=str(current_user["_id"]),
        upload_file=file,
        db=db
    )

@router.post("/optimize")
async def optimize_resume(
    request: Dict[str, Any],
    current_user = Depends(get_current_active_user)
):
    return await ResumeService.optimize_resume(request)

@router.post("/assistant")
async def ai_resume_assistant(
    request: AIAssistantRequest,
    current_user = Depends(get_current_active_user)
):
    return await ResumeService.run_ai_assistant(
        action=request.action,
        target_role=request.target_role,
        current_content=request.current_content,
        prompt=request.prompt
    )

@router.post("/job-match", response_model=JobMatchResponse)
async def job_match_resume(
    request: JobMatchRequest,
    current_user = Depends(get_current_active_user)
):
    return await ResumeService.calculate_job_match(
        resume_id=request.resume_id,
        resume_data=request.resume_data,
        job_description=request.job_description,
        target_role=request.target_role
    )

@router.get("/{resume_id}/readiness", response_model=InterviewReadinessResponse)
async def get_interview_readiness(
    resume_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await ResumeService.calculate_interview_readiness(resume_id, user_id, db)

@router.get("/{resume_id}/analytics")
async def get_resume_analytics(
    resume_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await ResumeService.get_resume_analytics(resume_id, user_id, db)

@router.post("/{resume_id}/duplicate")
async def duplicate_resume(
    resume_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await ResumeService.duplicate_resume(resume_id, user_id, db)

@router.patch("/{resume_id}/title")
async def rename_resume(
    resume_id: str,
    request: ResumeRenameRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await ResumeService.rename_resume(resume_id, request.title, user_id, db)

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    success = await ResumeService.delete_resume(resume_id, user_id, db)
    return {"success": success}

@router.post("/{resume_id}/share", response_model=ShareResponse)
async def share_resume(
    resume_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await ResumeService.create_share_link(resume_id, user_id, db)

@router.post("/{resume_id}/share-settings", response_model=ShareResponse)
async def update_share_settings(
    resume_id: str,
    request: ShareSettingsRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await ResumeService.update_share_settings(
        resume_id=resume_id,
        user_id=user_id,
        access_type=request.access_type,
        password=request.password,
        db=db
    )

@router.get("/{resume_id}/versions")
async def get_versions(
    resume_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await ResumeService.get_version_history(resume_id, user_id, db)

@router.post("/{resume_id}/restore-version")
async def restore_version(
    resume_id: str,
    version_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await ResumeService.restore_version(resume_id, version_id, user_id, db)

@router.delete("/{resume_id}/versions/{version_id}")
async def delete_version(
    resume_id: str,
    version_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    success = await ResumeService.delete_version(resume_id, version_id, user_id, db)
    return {"success": success}

