from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as aioredis
from app.config import settings
from bson import ObjectId

class MockCursor:
    def __init__(self, data):
        self.data = data

    async def to_list(self, length=100):
        return self.data[:length]

class MockCollection:
    def __init__(self, name):
        self.name = name
        self.data = {}

    async def find_one(self, filter_dict):
        clean_filter = {}
        for k, v in filter_dict.items():
            if k == "_id" and isinstance(v, ObjectId):
                clean_filter["_id"] = str(v)
            else:
                clean_filter[k] = v

        for doc in self.data.values():
            match = True
            for k, v in clean_filter.items():
                val = doc.get(k)
                if k == "_id":
                    val = str(val)
                if val != v:
                    match = False
                    break
            if match:
                doc_copy = doc.copy()
                if isinstance(doc_copy.get("_id"), str):
                    doc_copy["_id"] = ObjectId(doc_copy["_id"])
                return doc_copy
        return None

    async def insert_one(self, doc):
        doc_copy = doc.copy()
        if "_id" not in doc_copy:
            doc_copy["_id"] = ObjectId()
        _id_str = str(doc_copy["_id"])
        doc_copy["_id"] = _id_str
        self.data[_id_str] = doc_copy
        
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(ObjectId(_id_str))

    async def insert_many(self, docs):
        for doc in docs:
            await self.insert_one(doc)
        return True

    async def delete_many(self, filter_dict):
        if not filter_dict:
            self.data.clear()
        else:
            keys_to_delete = []
            for k, v in self.data.items():
                match = True
                for fk, fv in filter_dict.items():
                    if v.get(fk) != fv:
                        match = False
                        break
                if match:
                    keys_to_delete.append(k)
            for k in keys_to_delete:
                del self.data[k]
        return True

    def find(self, filter_dict):
        results = []
        for doc in self.data.values():
            match = True
            for k, v in filter_dict.items():
                val = doc.get(k)
                if k == "_id":
                    val = str(val)
                if val != v:
                    match = False
                    break
            if match:
                doc_copy = doc.copy()
                if isinstance(doc_copy.get("_id"), str):
                    doc_copy["_id"] = ObjectId(doc_copy["_id"])
                results.append(doc_copy)
        return MockCursor(results)

    async def count_documents(self, filter_dict):
        cursor = self.find(filter_dict)
        results = await cursor.to_list()
        return len(results)

    async def update_one(self, filter_dict, update_dict):
        doc = await self.find_one(filter_dict)
        if doc:
            key = str(doc["_id"])
            if "$set" in update_dict:
                for k, v in update_dict["$set"].items():
                    self.data[key][k] = v
            if "$push" in update_dict:
                for k, v in update_dict["$push"].items():
                    if k not in self.data[key]:
                        self.data[key][k] = []
                    self.data[key][k].append(v)
            return True
        return False

    async def create_index(self, key_name, unique=False):
        pass

class MockDatabase:
    def __init__(self):
        self.collections = {}

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection(name)
        return self.collections[name]

class MockPipeline:
    def __init__(self, mock_redis):
        self.mock_redis = mock_redis

    def incr(self, key):
        val = self.mock_redis.data.get(key, 0)
        self.mock_redis.data[key] = int(val) + 1
        return self

    def expire(self, key, window):
        return self

    async def execute(self):
        return [True]

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass

class MockRedis:
    def __init__(self):
        self.data = {}

    async def set(self, key, value, ex=None):
        self.data[key] = str(value)
        return True

    async def get(self, key):
        return self.data.get(key)

    async def delete(self, key):
        if key in self.data:
            del self.data[key]
        return True

    def pipeline(self, transaction=True):
        return MockPipeline(self)

    async def close(self):
        pass

class DatabaseManager:
    def __init__(self):
        self.mongo_client: AsyncIOMotorClient = None
        self.db = None
        self.redis_client: aioredis.Redis = None
        self.offline_mode = False

    async def connect_to_databases(self):
        # 1. MongoDB Connection
        try:
            self.mongo_client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
            # Ping to verify
            await self.mongo_client.admin.command('ping')
            self.db = self.mongo_client[settings.DATABASE_NAME]
            print("Connected to MongoDB database successfully.")
        except Exception as e:
            print(f"MongoDB connection failed: {e}. Swapping to In-Memory Mock Database.")
            self.db = MockDatabase()
            self.offline_mode = True

        # 2. Redis Connection
        try:
            self.redis_client = aioredis.from_url(
                settings.REDIS_URL, 
                encoding="utf-8", 
                decode_responses=True,
                socket_timeout=2.0
            )
            # Ping to verify
            await self.redis_client.ping()
            print("Connected to Redis cache successfully.")
        except Exception as e:
            print(f"Redis connection failed: {e}. Swapping to In-Memory Mock Cache.")
            self.redis_client = MockRedis()
            self.offline_mode = True

    async def close_database_connections(self):
        if self.mongo_client and not isinstance(self.db, MockDatabase):
            self.mongo_client.close()
        if self.redis_client:
            await self.redis_client.close()
        print("Closed database connections.")

db_manager = DatabaseManager()
