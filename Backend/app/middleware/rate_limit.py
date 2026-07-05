from fastapi import Request, HTTPException, status
from app.database import db_manager
import time

async def rate_limiter(request: Request, limit: int = 60, window: int = 60):
    """
    Simple rate limiter using Redis.
    limit: Number of allowed requests
    window: Time window in seconds
    """
    redis = db_manager.redis_client
    if not redis:
        # If redis is not configured, skip rate limiting
        return
        
    client_ip = request.client.host
    current_time = int(time.time())
    key = f"rate_limit:{client_ip}:{current_time // window}"
    
    current_requests = await redis.get(key)
    if current_requests and int(current_requests) >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later."
        )
        
    async with redis.pipeline(transaction=True) as pipe:
        await (
            pipe.incr(key)
            .expire(key, window)
            .execute()
        )
