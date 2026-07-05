import os
import aiofiles
from fastapi import UploadFile

class FileUploader:
    @staticmethod
    async def upload_file(file: UploadFile, destination_path: str) -> bool:
        try:
            # Create destination folder if not exists
            os.makedirs(os.path.dirname(destination_path), exist_ok=True)
            
            async with aiofiles.open(destination_path, 'wb') as out_file:
                while content := await file.read(1024 * 1024):  # read 1MB at a time
                    await out_file.write(content)
            return True
        except Exception as e:
            print(f"File upload error: {e}")
            return False
