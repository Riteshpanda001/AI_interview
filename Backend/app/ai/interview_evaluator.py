from app.ai.llm import LLMService
import json

class InterviewEvaluator:
    @staticmethod
    async def evaluate_answer(question_text: str, user_answer: str) -> dict:
        prompt = f"Question: {question_text}\nUser Answer: {user_answer}"
        system_instruction = (
            "Evaluate the user's answer to the interview question. Output a JSON object containing:\n"
            "- 'score' (integer between 1 and 10)\n"
            "- 'strengths' (array of strings)\n"
            "- 'weaknesses' (array of strings)\n"
            "- 'suggested_answer' (string detailing a model professional answer)"
        )
        
        try:
            response = await LLMService.generate_response(prompt, system_instruction)
            start_idx = response.find("{")
            end_idx = response.rfind("}") + 1
            if start_idx != -1 and end_idx != -1:
                return json.loads(response[start_idx:end_idx])
        except Exception as e:
            print(f"Error parsing answer evaluation JSON: {e}")
            
        # Fallback default evaluation
        return {
            "score": 8,
            "strengths": ["Structured structure", "Clear examples"],
            "weaknesses": ["Could elaborate on metrics and results"],
            "suggested_answer": "Focus on the STAR method (Situation, Task, Action, Result) in detail."
        }
