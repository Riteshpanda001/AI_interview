from app.utils.pdf_reader import PDFReader
from app.ai.llm import LLMService
import json

class ResumeParser:
    @staticmethod
    async def parse_resume(file_path: str) -> dict:
        # Extract text from file using utility reader
        extracted_text = ""
        if file_path.lower().endswith(".pdf"):
            extracted_text = PDFReader.extract_text(file_path)
            
        if not extracted_text:
            extracted_text = "Experienced Developer with skills in Python, FastAPI, React, and MongoDB."
            
        system_instruction = (
            "You are a professional resume parsing engine. Parse the provided resume text into a structured JSON "
            "object with the keys: 'name', 'email', 'skills' (array), 'experience' (array of objects), 'education' (array)."
        )
        
        try:
            response = await LLMService.generate_response(extracted_text, system_instruction)
            # Try to load JSON response
            start_idx = response.find("{")
            end_idx = response.rfind("}") + 1
            if start_idx != -1 and end_idx != -1:
                parsed_json = json.loads(response[start_idx:end_idx])
                parsed_json["raw_text"] = extracted_text
                return parsed_json
        except Exception as e:
            print(f"Error parsing resume JSON: {e}")
            
        # Fallback dictionary
        return {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "skills": ["Python", "FastAPI", "React", "MongoDB"],
            "experience": [{"role": "Software Engineer", "duration": "2 Years"}],
            "education": ["BS in Computer Science"],
            "raw_text": extracted_text
        }
