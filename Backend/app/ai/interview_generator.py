from app.ai.llm import LLMService
import json
import uuid

class InterviewGenerator:
    @staticmethod
    async def generate_questions(
        role_target: str,
        interview_type: str,
        experience_level: str = None,
        language: str = None,
        duration: int = None,
        difficulty: str = None,
        resume_text: str = None,
        count: int = 5
    ) -> list:
        prompt_parts = [
            f"Role: {role_target}",
            f"Interview Type: {interview_type}",
            f"Question Count: {count}"
        ]
        if experience_level:
            prompt_parts.append(f"Experience Level Required: {experience_level}")
        if language:
            prompt_parts.append(f"Language: {language}")
        if duration:
            prompt_parts.append(f"Expected Duration: {duration} minutes")
        if difficulty:
            prompt_parts.append(f"Difficulty Level: {difficulty}")
        if resume_text:
            prompt_parts.append(f"Candidate's Resume Text:\n{resume_text[:2000]}")

        prompt = ", ".join(prompt_parts)
        
        system_instruction = (
            "You are a Senior Interviewer. Generate a list of realistic interview questions based on the input parameters. "
            "Make sure to design the questions to target the specified experience level, difficulty level, and resume experience. "
            "If a specific language is requested, generate the questions and texts in that language. "
            "Output a JSON list of objects containing 'question_id' (a unique slug/string) and 'text' (the question itself) and 'type' (e.g. technical, HR)."
        )
        
        try:
            response = await LLMService.generate_response(prompt, system_instruction)
            start_idx = response.find("[")
            end_idx = response.rfind("]") + 1
            if start_idx != -1 and end_idx != -1:
                questions_list = json.loads(response[start_idx:end_idx])
                # Ensure each has a unique question_id
                for q in questions_list:
                    if "question_id" not in q:
                        q["question_id"] = str(uuid.uuid4())[:8]
                return questions_list
        except Exception as e:
            print(f"Error parsing questions list JSON: {e}")
            
        # Fallback default questions
        return [
            {"question_id": "q1", "text": f"Why do you want to work as a {role_target}?", "type": interview_type},
            {"question_id": "q2", "text": "Describe a challenging technical problem you solved.", "type": interview_type},
            {"question_id": "q3", "text": "How do you handle tight project deadlines?", "type": interview_type}
        ]
