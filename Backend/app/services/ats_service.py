from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException
from app.ai.ats_analyzer import ATSAnalyzer

class ATSService:
    @staticmethod
    async def analyze_ats_score(user_id: str, resume_id: str, job_description: str, db) -> dict:
        resume = await db["resumes"].find_one({"_id": ObjectId(resume_id)})
        if not resume:
            raise HTTPException(status_code=404, detail="Resume record not found.")
            
        resume_text = resume.get("extracted_text", "")
        
        # Analyze using ATS analyzer module
        analysis_result = await ATSAnalyzer.analyze(resume_text, job_description)
        
        ats_record = {
            "user_id": user_id,
            "resume_id": resume_id,
            "job_description": job_description,
            "score": analysis_result.get("score", 70),
            "matched_skills": analysis_result.get("matched_skills", []),
            "missing_skills": analysis_result.get("missing_skills", []),
            "recommendations": analysis_result.get("recommendations", []),
            "detailed_feedback": analysis_result.get("detailed_feedback", ""),
            "created_at": datetime.utcnow()
        }
        
        result = await db["ats_analyses"].insert_one(ats_record)
        ats_record["id"] = str(result.inserted_id)
        
        return ats_record
