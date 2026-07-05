import httpx
from app.config import settings
from typing import List

class EmbeddingService:
    @staticmethod
    async def get_embedding(text: str) -> List[float]:
        """
        Calculates text vector embeddings using Gemini API or returns a dummy vector.
        """
        api_key = settings.GEMINI_API_KEY
        if api_key and api_key != "your-gemini-api-key-here":
            url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "model": "models/text-embedding-004",
                "content": {"parts": [{"text": text}]}
            }
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        return resp.json()["embedding"]["values"]
            except Exception as e:
                print(f"Error calling Embedding API: {e}")
                
        # Return simple dummy vector
        return [0.1] * 768
