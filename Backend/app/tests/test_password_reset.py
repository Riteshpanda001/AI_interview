import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException
from app.services.auth_service import AuthService
from app.schemas.auth_schema import ChangePasswordRequest

def test_forgot_password_user_not_found():
    async def run():
        mock_db = MagicMock()
        mock_db["users"] = MagicMock()
        mock_db["users"].find_one = AsyncMock(return_value=None)

        with pytest.raises(HTTPException) as exc_info:
            await AuthService.forgot_password("missing@example.com", mock_db)
        
        assert exc_info.value.status_code == 404
        assert "No account" in exc_info.value.detail

    asyncio.run(run())

def test_forgot_password_success():
    async def run():
        mock_db = MagicMock()
        mock_db["users"] = MagicMock()
        mock_db["users"].find_one = AsyncMock(return_value={"_id": "60d5ec49f83a2c2b3c4d5e6f", "email": "user@example.com", "is_active": True})

        result = await AuthService.forgot_password("user@example.com", mock_db)
        assert result["success"] is True
        assert "code sent" in result["message"]

    asyncio.run(run())

def test_change_password_incorrect_old():
    async def run():
        mock_db = MagicMock()
        mock_db["users"] = MagicMock()
        
        old_hash = AuthService.get_password_hash("OldPassword123!")
        mock_db["users"].find_one = AsyncMock(return_value={
            "_id": "60d5ec49f83a2c2b3c4d5e6f",
            "email": "user@example.com",
            "hashed_password": old_hash
        })

        request = ChangePasswordRequest(old_password="wrong_password", new_password="NewPassword123!")
        
        with pytest.raises(HTTPException) as exc_info:
            await AuthService.change_password("60d5ec49f83a2c2b3c4d5e6f", request, mock_db)
            
        assert exc_info.value.status_code == 400
        assert "Incorrect current password" in exc_info.value.detail

    asyncio.run(run())

def test_change_password_success():
    async def run():
        mock_db = MagicMock()
        mock_db["users"] = MagicMock()
        mock_db["users"].update_one = AsyncMock()
        
        old_hash = AuthService.get_password_hash("OldPassword123!")
        mock_db["users"].find_one = AsyncMock(return_value={
            "_id": "60d5ec49f83a2c2b3c4d5e6f",
            "email": "user@example.com",
            "hashed_password": old_hash
        })

        request = ChangePasswordRequest(old_password="OldPassword123!", new_password="NewPassword123!")
        result = await AuthService.change_password("60d5ec49f83a2c2b3c4d5e6f", request, mock_db)
        
        assert result["success"] is True
        assert "changed successfully" in result["message"]
        mock_db["users"].update_one.assert_called_once()

    asyncio.run(run())
