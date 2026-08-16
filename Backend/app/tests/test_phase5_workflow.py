import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.auth_service import AuthService
from app.services.ats_service import ATSService
from app.schemas.auth_schema import UserRegisterRequest
from app.ai.resume_parser import ResumeParser
from app.ai.ats_analyzer import ATSAnalyzer

def test_phase5_complete_resume_ats_workflow():
    async def run_workflow():
        # Mock Database
        users_col = MagicMock()
        users_col.find_one = AsyncMock(return_value=None)
        users_col.insert_one = AsyncMock(return_value=MagicMock(inserted_id="507f1f77bcf86cd799439011"))
        users_col.update_one = AsyncMock(return_value=None)

        resumes_col = MagicMock()
        resumes_col.insert_one = AsyncMock(return_value=MagicMock(inserted_id="res_12345"))
        resumes_col.update_one = AsyncMock(return_value=None)

        ats_col = MagicMock()
        ats_col.insert_one = AsyncMock(return_value=MagicMock(inserted_id="ats_12345"))

        mock_db = {
            "users": users_col,
            "otps": MagicMock(find_one=AsyncMock(return_value=None), insert_one=AsyncMock(), delete_many=AsyncMock()),
            "sessions": MagicMock(insert_one=AsyncMock(return_value=MagicMock(inserted_id="sess_123"))),
            "refresh_tokens": MagicMock(insert_one=AsyncMock(), find_one=AsyncMock(return_value=None)),
            "resumes": resumes_col,
            "ats_analyses": ats_col,
            "audit_logs": MagicMock(insert_one=AsyncMock()),
            "login_activity": MagicMock(insert_one=AsyncMock())
        }

        # Step 1: Register User
        with patch("app.services.otp_service.OTPService.send_otp", new_callable=AsyncMock) as mock_send_otp, \
             patch("app.services.otp_service.OTPService.verify_otp", new_callable=AsyncMock) as mock_verify_otp:

            mock_send_otp.return_value = "654321"
            mock_verify_otp.return_value = True

            reg_req = UserRegisterRequest(
                email="candidate.ats@prepnova.ai",
                password="SecurePassword123!",
                full_name="ATS Candidate"
            )
            reg_res = await AuthService.register_user(reg_req, mock_db)
            assert reg_res["success"] is True

            # Step 2: Verify OTP & Login
            users_col.find_one = AsyncMock(return_value={
                "_id": "507f1f77bcf86cd799439011",
                "email": "candidate.ats@prepnova.ai",
                "full_name": "ATS Candidate",
                "hashed_password": AuthService.get_password_hash("SecurePassword123!"),
                "is_verified": True,
                "is_active": True,
                "role": "User",
                "plan_type": "free"
            })

            auth_tokens = await AuthService.verify_user_otp("candidate.ats@prepnova.ai", "654321", db=mock_db)
            assert "access_token" in auth_tokens
            assert "refresh_token" in auth_tokens

        # Step 3: Upload Resume & Parse
        sample_resume_text = """
        John Doe | john.ats@prepnova.ai | (555) 987-6543
        Senior Full Stack Engineer with 5+ years of experience architecting web systems.
        Skills: Python, FastAPI, React, JavaScript, AWS, Docker, PostgreSQL, REST APIs.
        Experience:
        Tech Solutions Inc. - Senior Developer (2021 - Present)
        - Developed microservices in Python and FastAPI servicing 100k daily requests.
        - Managed PostgreSQL database clusters and optimized query runtime by 40%.
        Education:
        B.S. in Computer Science - State University
        """

        parsed_data = await ResumeParser.parse_text(sample_resume_text)
        assert "personal" in parsed_data
        assert "skills" in parsed_data
        assert any(s.lower() == "python" for s in parsed_data["skills"])

        # Step 4 & 5: Enter Job Description & Run ATS Analysis
        job_description = """
        We are seeking a Senior Full Stack Software Engineer to build scalable microservices.
        Required Skills: Python, FastAPI, React, Docker, AWS, PostgreSQL, Kubernetes, Redis.
        Key Responsibilities: Design cloud APIs, write unit tests, and optimize database queries.
        """

        analysis_result = await ATSAnalyzer.analyze(
            resume_text=sample_resume_text,
            job_description=job_description,
            job_title="Senior Full Stack Engineer",
            experience_level="Senior"
        )

        # Step 6: Verify ATS Score & 7-Category Breakdown
        assert "score" in analysis_result
        assert 0 <= analysis_result["score"] <= 100
        assert "category_breakdown" in analysis_result

        # Step 7 & 8: Verify Matched & Missing Skills
        assert "matched_skills" in analysis_result
        assert "missing_skills" in analysis_result
        assert isinstance(analysis_result["matched_skills"], list)
        assert isinstance(analysis_result["missing_skills"], list)

        # Step 9 & 10: Verify AI Suggestions & Detailed Recommendations
        assert "detailed_feedback" in analysis_result
        assert "recommendations" in analysis_result
        assert "tailored_bullet_suggestions" in analysis_result

        # Step 11: Save Result in ATSService
        save_response = await ATSService.analyze_ats_score(
            user_id="507f1f77bcf86cd799439011",
            resume_id="res_12345",
            job_description=job_description,
            db=mock_db,
            resume_text=sample_resume_text,
            job_title="Senior Full Stack Engineer",
            experience_level="Senior"
        )
        assert "score" in save_response
        assert save_response["user_id"] == "507f1f77bcf86cd799439011"

    asyncio.run(run_workflow())
