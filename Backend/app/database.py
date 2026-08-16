from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as aioredis
from app.config import settings
from bson import ObjectId

class UpdateResult:
    def __init__(self, matched_count=0, modified_count=0):
        self.matched_count = matched_count
        self.modified_count = modified_count

class DeleteResult:
    def __init__(self, deleted_count=0):
        self.deleted_count = deleted_count

class MockCursor:
    def __init__(self, data):
        self.data = data

    def sort(self, key_or_list, direction=1):
        if isinstance(key_or_list, list):
            for item in reversed(key_or_list):
                if isinstance(item, (tuple, list)) and len(item) >= 2:
                    k, d = item[0], item[1]
                    self.data.sort(key=lambda x: str(x.get(k, "") or ""), reverse=(d == -1))
        elif isinstance(key_or_list, str):
            self.data.sort(key=lambda x: str(x.get(key_or_list, "") or ""), reverse=(direction == -1))
        return self

    def skip(self, n):
        if isinstance(n, int) and n > 0:
            self.data = self.data[n:]
        return self

    def limit(self, n):
        if isinstance(n, int) and n >= 0:
            self.data = self.data[:n]
        return self

    async def to_list(self, length=100):
        if length is not None:
            return self.data[:length]
        return self.data

class MockCollection:
    def __init__(self, name):
        self.name = name
        self.data = {}

    async def find_one(self, filter_dict):
        clean_filter = {}
        for k, v in filter_dict.items():
            if (k == "_id" or k.endswith("_id")) and isinstance(v, ObjectId):
                clean_filter[k] = str(v)
            else:
                clean_filter[k] = str(v) if isinstance(v, ObjectId) else v

        for doc in self.data.values():
            match = True
            for k, v in clean_filter.items():
                val = doc.get(k)
                if isinstance(val, ObjectId):
                    val = str(val)
                if val != v:
                    match = False
                    break
            if match:
                doc_copy = doc.copy()
                if isinstance(doc_copy.get("_id"), str):
                    try:
                        doc_copy["_id"] = ObjectId(doc_copy["_id"])
                    except Exception:
                        pass
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
        try:
            return InsertResult(ObjectId(_id_str))
        except Exception:
            return InsertResult(_id_str)

    async def insert_many(self, docs):
        for doc in docs:
            await self.insert_one(doc)
        return True

    async def delete_one(self, filter_dict):
        doc = await self.find_one(filter_dict)
        if doc:
            key = str(doc["_id"])
            if key in self.data:
                del self.data[key]
                return DeleteResult(deleted_count=1)
        return DeleteResult(deleted_count=0)

    async def delete_many(self, filter_dict):
        if not filter_dict:
            count = len(self.data)
            self.data.clear()
            return DeleteResult(deleted_count=count)
        else:
            keys_to_delete = []
            for k, v in self.data.items():
                match = True
                for fk, fv in filter_dict.items():
                    val = v.get(fk)
                    target = str(fv) if isinstance(fv, ObjectId) else fv
                    val_str = str(val) if isinstance(val, ObjectId) else val
                    if val_str != target:
                        match = False
                        break
                if match:
                    keys_to_delete.append(k)
            for k in keys_to_delete:
                del self.data[k]
            return DeleteResult(deleted_count=len(keys_to_delete))

    def find(self, filter_dict):
        results = []
        clean_filter = {}
        for k, v in filter_dict.items():
            if isinstance(v, ObjectId):
                clean_filter[k] = str(v)
            else:
                clean_filter[k] = v

        for doc in self.data.values():
            match = True
            for k, v in clean_filter.items():
                val = doc.get(k)
                if isinstance(val, ObjectId):
                    val = str(val)
                if val != v:
                    match = False
                    break
            if match:
                doc_copy = doc.copy()
                if isinstance(doc_copy.get("_id"), str):
                    try:
                        doc_copy["_id"] = ObjectId(doc_copy["_id"])
                    except Exception:
                        pass
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
            return UpdateResult(matched_count=1, modified_count=1)
        return UpdateResult(matched_count=0, modified_count=0)

    async def create_index(self, key_name, unique=False):
        pass

class MockDatabase:
    def __init__(self):
        self.collections = {}

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection(name)
        return self.collections[name]

import time

class MockPipeline:
    def __init__(self, mock_redis):
        self.mock_redis = mock_redis
        self.ops = []

    def incr(self, key):
        self.ops.append(("incr", key))
        return self

    def expire(self, key, window):
        self.ops.append(("expire", key, window))
        return self

    async def execute(self):
        results = []
        for op in self.ops:
            if op[0] == "incr":
                res = await self.mock_redis.incr(op[1])
                results.append(res)
            elif op[0] == "expire":
                res = await self.mock_redis.expire(op[1], op[2])
                results.append(res)
        self.ops.clear()
        return results

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass

class MockRedis:
    def __init__(self):
        self.data = {}
        self.expires = {}

    def _is_expired(self, key):
        if key in self.expires:
            if time.time() > self.expires[key]:
                del self.expires[key]
                if key in self.data:
                    del self.data[key]
                return True
        return False

    async def set(self, key, value, ex=None):
        self.data[key] = str(value)
        if ex is not None:
            self.expires[key] = time.time() + float(ex)
        elif key in self.expires:
            del self.expires[key]
        return True

    async def get(self, key):
        if self._is_expired(key):
            return None
        return self.data.get(key)

    async def delete(self, key):
        if key in self.data:
            del self.data[key]
        if key in self.expires:
            del self.expires[key]
        return True

    async def exists(self, key):
        if self._is_expired(key):
            return 0
        return 1 if key in self.data else 0

    async def ttl(self, key):
        if self._is_expired(key) or key not in self.data:
            return -2
        if key in self.expires:
            remaining = int(self.expires[key] - time.time())
            return max(remaining, 0)
        return -1

    async def incr(self, key):
        if self._is_expired(key):
            val = 0
        else:
            val = int(self.data.get(key, 0))
        val += 1
        self.data[key] = str(val)
        return val

    async def expire(self, key, window):
        if key in self.data:
            self.expires[key] = time.time() + float(window)
            return True
        return False

    async def ping(self):
        return "PONG"

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
        redis_url = settings.REDIS_URL.replace("localhost", "127.0.0.1")
        try:
            self.redis_client = aioredis.from_url(
                redis_url, 
                encoding="utf-8", 
                decode_responses=True,
                socket_timeout=1.0
            )
            # Ping to verify
            await self.redis_client.ping()
            print("Connected to Redis cache successfully.")
        except Exception:
            print("[REDIS] External Redis server not active. Using Embedded In-Memory Cache.")
            self.redis_client = MockRedis()
            self.offline_mode = True

    async def close_database_connections(self):
        if self.mongo_client and not isinstance(self.db, MockDatabase):
            self.mongo_client.close()
        if self.redis_client:
            await self.redis_client.close()
        print("Closed database connections.")

db_manager = DatabaseManager()
