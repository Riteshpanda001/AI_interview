import json
import math
import httpx
from typing import Dict, Any, List, Optional
from app.config import settings

class HuggingFaceService:
    HF_BASE_URL = "https://api-inference.huggingface.co/models"
    
    @staticmethod
    def is_configured() -> bool:
        api_key = settings.HUGGINGFACE_API_KEY
        return bool(api_key and api_key != "your-huggingface-api-key-here")

    @staticmethod
    async def compute_sentence_embeddings(text: str) -> Optional[List[float]]:
        """
        Gets sentence embeddings from Hugging Face sentence-transformers model.
        """
        if not HuggingFaceService.is_configured():
            return None

        model_name = "sentence-transformers/all-MiniLM-L6-v2"
        url = f"{HuggingFaceService.HF_BASE_URL}/{model_name}"
        headers = {
            "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {"inputs": text[:1000]}

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    res_json = resp.json()
                    # MiniLM returns list of floats or nested floats
                    if isinstance(res_json, list):
                        if res_json and isinstance(res_json[0], float):
                            return res_json
                        elif res_json and isinstance(res_json[0], list):
                            return res_json[0]
        except Exception as e:
            print(f"Error fetching HuggingFace embeddings: {e}")

        return None

    @staticmethod
    def calculate_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.75
        dot = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = math.sqrt(sum(a * a for a in vec1))
        norm2 = math.sqrt(sum(b * b for b in vec2))
        if norm1 == 0 or norm2 == 0:
            return 0.75
        similarity = dot / (norm1 * norm2)
        return max(0.0, min(1.0, similarity))

    @staticmethod
    async def generate_match_analysis(resume_text: str, job_description: str, job_title: str = "") -> Optional[Dict[str, Any]]:
        """
        Generates ATS match evaluation JSON using Hugging Face LLM inference models.
        """
        if not HuggingFaceService.is_configured():
            return None

        model_name = settings.HUGGINGFACE_MODEL or "meta-llama/Llama-3.2-3B-Instruct"
        url = f"{HuggingFaceService.HF_BASE_URL}/{model_name}"
        headers = {
            "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json"
        }

        system_prompt = (
            "You are an enterprise AI Resume ATS Matcher powered by Hugging Face Models. "
            "Analyze candidate fit and output strictly valid JSON matching keys:\n"
            "score (int), matched_skills (list), missing_skills (list), hard_skills (object), soft_skills (object), "
            "experience_level (object), impact_quantification (object), tailored_bullet_suggestions (list), "
            "interview_questions (list), recommendations (list), detailed_feedback (str)."
        )

        user_content = (
            f"Candidate Resume:\n{resume_text[:2000]}\n\n"
            f"Target Job Title: {job_title}\n"
            f"Target Job Description:\n{job_description[:2000]}"
        )

        payload = {
            "inputs": f"<s>[INST] {system_prompt}\n\n{user_content} [/INST]",
            "parameters": {
                "max_new_tokens": 800,
                "temperature": 0.3,
                "return_full_text": False
            }
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    result = resp.json()
                    gen_text = ""
                    if isinstance(result, list) and len(result) > 0:
                        gen_text = result[0].get("generated_text", "")
                    elif isinstance(result, dict):
                        gen_text = result.get("generated_text", "")

                    start_idx = gen_text.find("{")
                    end_idx = gen_text.rfind("}") + 1
                    if start_idx != -1 and end_idx != -1:
                        parsed = json.loads(gen_text[start_idx:end_idx])
                        parsed["ai_engine"] = f"Hugging Face AI ({model_name})"
                        return parsed
        except Exception as e:
            print(f"Error calling HuggingFace LLM inference: {e}")

        return None
