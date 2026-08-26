from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional, List
from app.dependencies import get_current_active_user, get_db
from app.services.admin_service import AdminService

router = APIRouter()

async def get_current_admin_user(current_user = Depends(get_current_active_user)):
    role = current_user.get("role", "user")
    email = current_user.get("email", "").lower().strip()
    # Allow admin access only if user role is admin and email matches prenovaai01@gmail.com
    if role.lower() != "admin" or email != "prenovaai01@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to access administrative dashboard endpoints."
        )
    return current_user

class UserStatusUpdateRequest(BaseModel):
    is_active: bool

class UserRoleUpdateRequest(BaseModel):
    role: str

class GrantSubscriptionRequest(BaseModel):
    plan_type: str
    duration_days: int = 30

class TicketReplyRequest(BaseModel):
    reply_message: str
    status: str = "RESOLVED"

class CodingProblemSaveRequest(BaseModel):
    title: str
    slug: Optional[str] = None
    difficulty: str = "Medium"
    description: str
    public_test_cases: List[dict] = []
    hidden_test_cases: List[dict] = []
    starter_code: dict = {}

class SystemPromptSaveRequest(BaseModel):
    name: str
    category: str  # ats, technical, hr, behavioral, coding
    system_instruction: str

@router.get("/stats")
async def get_system_stats(
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.get_system_stats(db)

@router.get("/users")
async def get_all_users(
    search: Optional[str] = Query(None),
    role: Optional[str] = Query("all"),
    limit: int = Query(100),
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.get_all_users(db, search=search or "", role=role or "all", limit=limit)

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    request: UserStatusUpdateRequest,
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.update_user_status(user_id, request.is_active, db)

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    request: UserRoleUpdateRequest,
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.update_user_role(user_id, request.role, db)

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.delete_user(user_id, db)

@router.get("/resumes")
async def get_resumes_list(
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.get_resumes_list(db)

@router.delete("/resumes/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.delete_resume(resume_id, db)

@router.get("/ats-reports")
async def get_ats_reports_list(
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.get_ats_reports_list(db)

@router.get("/prompts")
async def get_system_prompts(
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.get_system_prompts(db)

@router.post("/prompts")
async def save_system_prompt(
    request: SystemPromptSaveRequest,
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.save_system_prompt(
        name=request.name,
        category=request.category,
        system_instruction=request.system_instruction,
        db=db
    )

@router.get("/interviews")
async def get_interviews_list(
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.get_interviews_list(db)

@router.get("/coding-problems")
async def get_coding_problems_list(
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.get_coding_problems_list(db)

@router.post("/coding-problems")
async def save_coding_problem(
    request: CodingProblemSaveRequest,
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.save_coding_problem(request.dict(), db)

@router.delete("/coding-problems/{problem_id}")
async def delete_coding_problem(
    problem_id: str,
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.delete_coding_problem(problem_id, db)

@router.get("/payments")
async def get_payments_list(
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.get_payments_list(db)

@router.get("/subscriptions")
async def get_subscriptions_list(
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.get_subscriptions_list(db)

@router.post("/subscriptions/{user_id}/grant")
async def grant_user_subscription(
    user_id: str,
    request: GrantSubscriptionRequest,
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.grant_user_subscription(user_id, request.plan_type, request.duration_days, db)

@router.get("/tickets")
async def get_tickets_list(
    status: Optional[str] = Query("all"),
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.get_tickets_list(db, status_filter=status or "all")

@router.post("/tickets/{ticket_number}/reply")
async def reply_to_ticket(
    ticket_number: str,
    request: TicketReplyRequest,
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.reply_to_ticket(ticket_number, request.reply_message, request.status, db)

@router.get("/system-health")
async def get_system_health(
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.get_system_health(db)

@router.get("/llm-usage")
async def get_llm_token_usage(
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.get_llm_token_usage(db)

@router.get("/audit-logs")
async def get_audit_logs(
    limit: int = Query(50),
    current_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    return await AdminService.get_audit_logs(db, limit=limit)


