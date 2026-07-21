import pytest
from app.services.auth_service import AuthService
from app.schemas.auth_schema import UserRegisterRequest

def test_password_hashing():
    password = "securepassword123"
    hashed = AuthService.get_password_hash(password)
    assert hashed != password
    assert AuthService.verify_password(password, hashed)
    assert not AuthService.verify_password("wrong_password", hashed)

