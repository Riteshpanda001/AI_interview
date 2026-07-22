import asyncio
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.database import db_manager

async def clean_database():
    print("Connecting to databases...")
    await db_manager.connect_to_databases()
    db = db_manager.db

    if db is None:
        print("❌ Error: Database connection failed.")
        return

    print("Purging old authentication data from MongoDB...")
    # Remove all old demo users and testing accounts
    result_users = await db["users"].delete_many({})
    result_otps = await db["otps"].delete_many({})

    print(f"[SUCCESS] Deleted {result_users.deleted_count if hasattr(result_users, 'deleted_count') else 'all'} users from 'users' collection.")
    print(f"[SUCCESS] Deleted {result_otps.deleted_count if hasattr(result_otps, 'deleted_count') else 'all'} OTP records from 'otps' collection.")

    # Reset in-memory Redis mock cache if applicable
    if db_manager.redis_client:
        try:
            if hasattr(db_manager.redis_client, 'data'):
                db_manager.redis_client.data.clear()
                db_manager.redis_client.expires.clear()
            print("[SUCCESS] Reset Redis cache.")
        except Exception as e:
            print(f"Redis reset warning: {e}")

    await db_manager.close_database_connections()
    print("[SUCCESS] Database clean slate completed. Only newly registered users will exist.")

if __name__ == "__main__":
    asyncio.run(clean_database())
