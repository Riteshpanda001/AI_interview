import httpx
from fastapi import HTTPException, status
from app.config import settings

class LLMService:
    @staticmethod
    async def generate_response(prompt: str, system_instruction: str = None) -> str:
        """
        Sends requests to Google Gemini or OpenAI. If no keys are configured,
        returns structured mock text responses for local simulation.
        """
        # Gemini API call
        api_key = settings.GEMINI_API_KEY
        if api_key and api_key != "your-gemini-api-key-here":
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{system_instruction or ''}\n\nUser request: {prompt}"}
                        ]
                    }
                ]
            }
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["candidates"][0]["content"]["parts"][0]["text"]
            except Exception as e:
                print(f"Error calling Gemini: {e}")

        # Groq API call
        groq_api_key = settings.GROQ_API_KEY
        if groq_api_key and groq_api_key != "your-groq-api-key-here":
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json"
            }
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})

            payload = {
                "model": "llama-3.1-8b-instant",
                "messages": messages,
                "temperature": 0.7
            }
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"Error calling Groq: {e}")
                
        # If both Gemini and Groq failed or are unconfigured, raise HTTP 503 error
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI Analysis Service is currently unavailable. Please configure GEMINI_API_KEY or GROQ_API_KEY in environment or try again shortly."
        )

