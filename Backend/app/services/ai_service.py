from app.ai.llm import LLMService

class AIService:
    @staticmethod
    async def chat_generate(prompt: str, system_instruction: str = None) -> str:
        return await LLMService.generate_response(prompt, system_instruction)
