import os
from fastapi import UploadFile
from app.config import settings
from app.ai.resume_parser import ResumeParser
from datetime import datetime
from bson import ObjectId

class ResumeService:
    @staticmethod
    async def save_and_parse_resume(user_id: str, upload_file: UploadFile, db) -> dict:
        # Save file to static storage
        filename = f"{user_id}_{int(datetime.utcnow().timestamp())}_{upload_file.filename}"
        file_path = os.path.join(settings.STATIC_DIR, "resumes", filename)
        
        # Write contents to local storage
        contents = await upload_file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
            
        # Parse resume text & generate structured JSON content
        parsed_data = await ResumeParser.parse_resume(file_path)
        
        # Save info to database
        resume_record = {
            "user_id": user_id,
            "filename": upload_file.filename,
            "file_path": file_path,
            "file_size": len(contents),
            "parsed_content": parsed_data,
            "extracted_text": parsed_data.get("raw_text", ""),
            "created_at": datetime.utcnow()
        }
        
        result = await db["resumes"].insert_one(resume_record)
        resume_record["id"] = str(result.inserted_id)
        
        return resume_record
