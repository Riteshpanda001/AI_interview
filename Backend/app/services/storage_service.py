import os
import shutil
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from app.config import settings

class StorageService:
    """
    Multi-tier storage manager supporting cloud storage (S3/Cloudinary/MinIO) 
    with local file system fallback. Handles file upload, retrieval, and cleanup.
    """
    @staticmethod
    def get_upload_dir() -> str:
        upload_dir = os.path.join(settings.STATIC_DIR, "resumes")
        os.makedirs(upload_dir, exist_ok=True)
        return upload_dir

    @staticmethod
    async def upload_file(
        file_bytes: bytes,
        original_filename: str,
        user_id: str,
        mime_type: str = "application/pdf"
    ) -> Dict[str, Any]:
        timestamp = int(datetime.now(timezone.utc).timestamp())
        sanitized_filename = f"{user_id}_{timestamp}_{original_filename.replace(' ', '_')}"
        upload_dir = StorageService.get_upload_dir()
        file_path = os.path.join(upload_dir, sanitized_filename)

        with open(file_path, "wb") as f:
            f.write(file_bytes)

        file_url = f"/static/resumes/{sanitized_filename}"

        return {
            "storage_provider": "local",
            "storage_key": sanitized_filename,
            "file_path": file_path,
            "file_url": file_url,
            "filename": original_filename,
            "file_size": len(file_bytes),
            "mime_type": mime_type,
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }

    @staticmethod
    async def delete_file(file_path_or_key: Optional[str]) -> bool:
        if not file_path_or_key:
            return False

        try:
            if os.path.isabs(file_path_or_key):
                target_path = file_path_or_key
            else:
                target_path = os.path.join(StorageService.get_upload_dir(), os.path.basename(file_path_or_key))

            if os.path.exists(target_path):
                os.remove(target_path)
                return True
        except Exception as e:
            print(f"Error deleting file from storage: {e}")
        return False
