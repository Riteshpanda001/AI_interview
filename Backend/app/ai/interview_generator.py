from app.ai.llm import LLMService
import json
import uuid

class InterviewGenerator:
    @staticmethod
    async def generate_questions(role_target: str, interview_type: str, count: int = 5) -> list:
        prompt = f"Role: {role_target}, Interview Type: {interview_type}, Count: {count}"
        system_instruction = (
            "You are a Senior Interviewer. Generate a list of realistic interview questions based on the input parameters. "
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
