import redis.asyncio as aioredis
from app.config import settings

class RedisClient:
    def __init__(self):
        self.client: aioredis.Redis = None

    def connect(self):
        self.client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        return self.client

    async def get(self, key: str):
        if self.client:
            return await self.client.get(key)
        return None

    async def set(self, key: str, value: str, expire_seconds: int = None):
        if self.client:
            await self.client.set(key, value, ex=expire_seconds)

    async def delete(self, key: str):
        if self.client:
            await self.client.delete(key)

redis_client = RedisClient()
