import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add parent directory to path to enable importing app module
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from app.config import settings

async def seed_database():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    print("Seeding database...")

    # 1. Seed Pricing Plans
    await db["pricing"].delete_many({})
    pricing_plans = [
        {
            "name": "Free Plan",
            "price": 0.0,
            "billing": "monthly",
            "features": [
                "1 AI Mock Interview / month",
                "Resume Parsing & ATS Check (Limit 3)",
                "Standard AI Feedback",
                "Basic Coding Problems"
            ],
            "plan_type": "free"
        },
        {
            "name": "Pro Plan",
            "price": 29.0,
            "billing": "monthly",
            "features": [
                "Unlimited AI Mock Interviews",
                "Unlimited Resume Parsing & ATS Check",
                "Deep Technical/HR/Behavioral Feedbacks",
                "Custom Mock Companies Preparation",
                "AI Coding Co-Pilot & Debugger",
                "Priority Email Support"
            ],
            "plan_type": "pro"
        },
        {
            "name": "Enterprise Plan",
            "price": 99.0,
            "billing": "monthly",
            "features": [
                "Everything in Pro Plan",
                "Dedicated Custom Company Pipelines",
                "Integrations with Hiring Dashboards",
                "Team Analytics & Benchmarking Reports",
                "1-on-1 Human Mock Interview Session Option"
            ],
            "plan_type": "enterprise"
        }
    ]
    await db["pricing"].insert_many(pricing_plans)
    print("Seeded pricing plans.")

    # 2. Seed Coding Problems
    await db["coding_problems"].delete_many({})
    coding_problems = [
        {
            "title": "Two Sum",
            "slug": "two-sum",
            "difficulty": "Easy",
            "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
            "test_cases": [
                {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"},
                {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"}
            ],
            "starter_code": {
                "python": "def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your code here\n    pass",
                "javascript": "function twoSum(nums, target) {\n    // Write your code here\n    \n}"
            }
        },
        {
            "title": "Reverse Linked List",
            "slug": "reverse-linked-list",
            "difficulty": "Medium",
            "description": "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
            "test_cases": [
                {"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"}
            ],
            "starter_code": {
                "python": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverseList(head: ListNode) -> ListNode:\n    # Write your code here\n    pass"
            }
        }
    ]
    await db["coding_problems"].insert_many(coding_problems)
    print("Seeded coding problems.")

    print("Database seeding completed successfully.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
