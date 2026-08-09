import jwt
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from app.config import settings

class JWTService:
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None, session_id: Optional[str] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            
        to_encode.update({"exp": expire, "type": "access"})
        if session_id:
            to_encode["session_id"] = str(session_id)
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt

    @staticmethod
    def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None, session_id: Optional[str] = None, jti: Optional[str] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
            
        token_jti = jti or str(uuid.uuid4())
        to_encode.update({
            "exp": expire,
            "type": "refresh",
            "jti": token_jti
        })
        if session_id:
            to_encode["session_id"] = str(session_id)
            
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_token(token: str) -> Dict[str, Any]:
        try:
            return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        except jwt.PyJWTError:
            return {}

