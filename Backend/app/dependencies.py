from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
import jwt
from app.config import settings
from app.database import db_manager
from app.constants import ERROR_TOKEN_INVALID, ERROR_USER_NOT_FOUND
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

async def get_db():
    if db_manager.db is None:
        await db_manager.connect_to_databases()
    return db_manager.db

async def get_redis():
    if db_manager.redis_client is None:
        await db_manager.connect_to_databases()
    return db_manager.redis_client

async def get_current_user(
    request: Request,
    token: str = Depends(oauth2_scheme), 
    db = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=ERROR_TOKEN_INVALID,
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Check Authorization header or HttpOnly Cookie
    raw_token = token
    if not raw_token and request:
        raw_token = request.cookies.get("access_token")
        
    if not raw_token:
        raise credentials_exception

    try:
        redis = db_manager.redis_client
        if redis and await redis.get(f"blacklist:{raw_token}"):
            raise credentials_exception

        payload = jwt.decode(
            raw_token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        token_type = payload.get("type", "access")
        if token_type != "access":
            raise credentials_exception

        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

        
    try:
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = await db["users"].find_one({"_id": user_id})

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=ERROR_USER_NOT_FOUND
        )
    return user

async def get_current_active_user(current_user = Depends(get_current_user)):
    if not current_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user
