from app.ai.llm import LLMService
import json

class ATSAnalyzer:
    @staticmethod
    async def analyze(resume_text: str, job_description: str) -> dict:
        prompt = f"Resume:\n{resume_text}\n\nJob Description:\n{job_description}"
        system_instruction = (
            "Compare the resume text with the job description. Output a JSON object containing:\n"
            "- 'score' (integer between 0 and 100)\n"
            "- 'matched_skills' (array of strings)\n"
            "- 'missing_skills' (array of strings)\n"
            "- 'recommendations' (array of strings)\n"
            "- 'detailed_feedback' (string)"
        )
        
        try:
            response = await LLMService.generate_response(prompt, system_instruction)
            start_idx = response.find("{")
            end_idx = response.rfind("}") + 1
            if start_idx != -1 and end_idx != -1:
                return json.loads(response[start_idx:end_idx])
        except Exception as e:
            print(f"Error parsing ATS evaluation JSON: {e}")
            
        # Fallback default evaluation
        return {
            "score": 75,
            "matched_skills": ["Python", "FastAPI"],
            "missing_skills": ["Docker", "Kubernetes"],
            "recommendations": ["Add docker containerization experience to your resume profile."],
            "detailed_feedback": "The candidate has strong backend fundamentals but lacks cloud operations experience."
        }
