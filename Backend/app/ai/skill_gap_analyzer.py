from app.ai.llm import LLMService
import json

class SkillGapAnalyzer:
    @staticmethod
    async def analyze_gap(candidate_skills: list, target_role: str) -> dict:
        prompt = f"Candidate Skills: {candidate_skills}\nTarget Role: {target_role}"
        system_instruction = (
            "Analyze the gap between the candidate's skills and the requirements for the target role. "
            "Output a JSON object containing:\n"
            "- 'gap_score' (integer between 0 and 100 representing readiness)\n"
            "- 'skills_to_learn' (array of strings)\n"
            "- 'recommended_courses_or_topics' (array of strings)"
        )
        
        try:
            response = await LLMService.generate_response(prompt, system_instruction)
            start_idx = response.find("{")
            end_idx = response.rfind("}") + 1
            if start_idx != -1 and end_idx != -1:
                return json.loads(response[start_idx:end_idx])
        except Exception as e:
            print(f"Error parsing skill gap analysis JSON: {e}")
            
        # Fallback default evaluation
        return {
            "gap_score": 80,
            "skills_to_learn": ["Docker", "Kubernetes", "AWS Cloud"],
            "recommended_courses_or_topics": ["Docker & Kubernetes: The Practical Guide", "AWS Certified Solutions Architect"]
        }
