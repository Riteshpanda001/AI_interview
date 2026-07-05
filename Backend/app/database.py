from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as aioredis
from app.config import settings

class DatabaseManager:
    def __init__(self):
        self.mongo_client: AsyncIOMotorClient = None
        self.db = None
        self.redis_client: aioredis.Redis = None

    async def connect_to_databases(self):
        # Connect to MongoDB
        self.mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
        self.db = self.mongo_client[settings.DATABASE_NAME]
        
        # Connect to Redis
        self.redis_client = aioredis.from_url(
            settings.REDIS_URL, 
            encoding="utf-8", 
            decode_responses=True
        )
        print("Connected to MongoDB and Redis databases.")

    async def close_database_connections(self):
        if self.mongo_client:
            self.mongo_client.close()
        if self.redis_client:
            await self.redis_client.close()
        print("Closed database connections.")

db_manager = DatabaseManager()
