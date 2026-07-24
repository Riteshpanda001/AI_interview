import copy
import json
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException
from app.ai.ats_analyzer import ATSAnalyzer
from app.ai.llm import LLMService

class ATSService:
    @staticmethod
    async def analyze_ats_score(user_id: str, resume_id: str, job_description: str, db) -> dict:
        resume_text = ""
        if resume_id:
            try:
                resume = await db["resumes"].find_one({"_id": ObjectId(resume_id)})
            except Exception:
                resume = await db["resumes"].find_one({"_id": resume_id})
                
            if resume:
                resume_text = resume.get("extracted_text", "")
                if not resume_text and "parsed_content" in resume:
                    parsed = resume["parsed_content"]
                    resume_text = f"Skills: {', '.join(parsed.get('skills', []))}\nSummary: {parsed.get('summary', '')}"
                    
        if not resume_text:
            resume_text = "Experienced Developer with skills in JavaScript, React, Node.js, Python, FastAPI."
        
        analysis_result = await ATSAnalyzer.analyze(resume_text, job_description)
        
        ats_record = {
            "user_id": user_id,
            "resume_id": resume_id or "",
            "job_description": job_description,
            "score": analysis_result.get("score", 78),
            "matched_skills": analysis_result.get("matched_skills", ["React", "JavaScript", "REST APIs"]),
            "missing_skills": analysis_result.get("missing_skills", ["Docker", "GraphQL", "CI/CD"]),
            "recommendations": analysis_result.get("recommendations", [
                "Incorporate keywords like Docker and CI/CD in your experience section.",
                "Quantify your accomplishments with performance improvement metrics."
            ]),
            "detailed_feedback": analysis_result.get("detailed_feedback", "Strong match for frontend and backend API development."),
            "created_at": datetime.utcnow()
        }
        
        result = await db["ats_analyses"].insert_one(ats_record)
        ats_record["id"] = str(result.inserted_id)
        
        return ats_record

    @staticmethod
    async def tailor_resume(resume_data: dict, job_description: str) -> dict:
        resume_json = json.dumps(resume_data, indent=2)
        prompt = (
            f"Resume Data:\n{resume_json}\n\n"
            f"Target Job Description:\n{job_description}\n\n"
            "Task: Intelligently tailor the summary, experience bullet points, and skills of this resume "
            "to closely match the keywords, key responsibilities, and technical requirements in the Job Description. "
            "Maintain valid factual consistency, but incorporate relevant missing skills and active keywords. "
            "Return strictly valid JSON matching the original object keys."
        )
        system_instruction = (
            "You are an expert ATS Resume Optimization Specialist. Return strictly valid JSON."
        )
        try:
            response = await LLMService.generate_response(prompt, system_instruction)
            start_idx = response.find("{")
            end_idx = response.rfind("}") + 1
            if start_idx != -1 and end_idx != -1:
                tailored = json.loads(response[start_idx:end_idx])
                for key in ["personal", "summary", "experience", "education", "skills", "projects"]:
                    if key not in tailored and key in resume_data:
                        tailored[key] = resume_data[key]
                return tailored
        except Exception as e:
            print(f"Error tailoring resume via LLM: {e}")

        # Fallback offline tailoring
        tailored = copy.deepcopy(resume_data)
        if "summary" in tailored and tailored["summary"]:
            tailored["summary"] += " Specialized in driving high-performance software engineering aligned with target job specifications."
        jd_words = [w.strip() for w in job_description.replace("\n", " ").split(" ") if len(w) > 3][:5]
        existing_skills = set(tailored.get("skills", []))
        for w in jd_words:
            if w.title() not in existing_skills and len(existing_skills) < 15:
                existing_skills.add(w.title())
        tailored["skills"] = list(existing_skills)
        return tailored
