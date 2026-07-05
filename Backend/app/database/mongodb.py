from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class MongoDB:
    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self.db = None

    def connect(self):
        self.client = AsyncIOMotorClient(settings.MONGODB_URL)
        self.db = self.client[settings.DATABASE_NAME]
        return self.db

    async def create_indexes(self):
        # Create necessary unique indexes
        if self.db is not None:
            await self.db["users"].create_index("email", unique=True)
            await self.db["coding_problems"].create_index("slug", unique=True)
            print("MongoDB indexes created successfully.")

mongodb = MongoDB()
