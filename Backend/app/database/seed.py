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
            "public_test_cases": [
                {"input": "[2, 7, 11, 15]\n9", "expected_output": "[0, 1]"},
                {"input": "[3, 2, 4]\n6", "expected_output": "[1, 2]"}
            ],
            "hidden_test_cases": [
                {"input": "[3, 3]\n6", "expected_output": "[0, 1]"},
                {"input": "[1, 5, 8, 12]\n13", "expected_output": "[1, 2]"}
            ],
            "starter_code": {
                "python": "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, n in enumerate(nums):\n            diff = target - n\n            if diff in seen:\n                return [seen[diff], i]\n            seen[n] = i\n        return []",
                "javascript": "function twoSum(nums, target) {\n    const seen = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (seen.has(diff)) return [seen.get(diff), i];\n        seen.set(nums[i], i);\n    }\n    return [];\n}"
            }
        },
        {
            "title": "Reverse Linked List",
            "slug": "reverse-linked-list",
            "difficulty": "Medium",
            "description": "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
            "public_test_cases": [
                {"input": "[1, 2, 3, 4, 5]", "expected_output": "[5, 4, 3, 2, 1]"}
            ],
            "hidden_test_cases": [
                {"input": "[1, 2]", "expected_output": "[2, 1]"}
            ],
            "starter_code": {
                "python": "class Solution:\n    def reverseList(self, head):\n        prev = None\n        curr = head\n        while curr:\n            nxt = curr.next\n            curr.next = prev\n            prev = curr\n            curr = nxt\n        return prev"
            }
        }
    ]
    # 3. Seed Company Preparation Profiles & Questions
    await db["companies"].delete_many({})
    await db["company_questions"].delete_many({})

    companies_seed = [
        {
            "name": "Google",
            "slug": "google",
            "description": "Global technology leader specializing in search engine architecture, cloud infrastructure, AI systems, and Android OS.",
            "industry": "Technology / Artificial Intelligence",
            "difficulty_rating": "Hard",
            "eligibility": {
                "degree": "B.E. / B.Tech / M.Tech / MS / Ph.D in Computer Science, IT, or related quantitative field",
                "min_cgpa": "7.5 CGPA / 70% aggregate with strong algorithmic foundations",
                "batch_eligibility": "2024 / 2025 graduating batches & experienced hires (0-10+ years)",
                "backlogs_allowed": "0 active backlogs at time of interview loop"
            },
            "hiring_process": [
                {"stage": 1, "title": "Online Assessment (OA)", "duration": "90 Mins", "details": "2 Graph / DP algorithmic challenges on HackerRank"},
                {"stage": 2, "title": "Technical Phone Screen", "duration": "45 Mins", "details": "1 Data Structures challenge + complexity optimization inquiry"},
                {"stage": 3, "title": "Onsite Technical Round 1", "duration": "45 Mins", "details": "Advanced Data Structures & Algorithms (Trees, Graphs, Tries)"},
                {"stage": 4, "title": "Onsite Technical Round 2", "duration": "45 Mins", "details": "System Design / Low Level Design (HLD/LLD)"},
                {"stage": 5, "title": "Googlyness & HR Round", "duration": "45 Mins", "details": "Behavioral STAR scenarios, leadership, teamwork, ethical decision making"}
            ],
            "online_assessment_specs": {
                "platform": "HackerRank / CodeSignal",
                "duration_mins": 90,
                "sections": ["2 Advanced Coding Problems"],
                "cutoff_percentage": "90%"
            },
            "personalized_prep_plan": [
                {"week": "Week 1", "focus": "Graph & Tree Algorithms", "tasks": ["Solve top 20 Google LeetCode tagged questions", "Master Topological Sort & Segment Trees"]},
                {"week": "Week 2", "focus": "System Design Architecture", "tasks": ["Study Google Spanner, BigTable, MapReduce architecture", "Practice LLD for Google Docs / YouTube"]},
                {"week": "Week 3", "focus": "Googlyness & Behavioral STAR", "tasks": ["Prepare 5 STAR stories on ambiguity and cross-team conflict", "Review Google Leadership Principles"]},
                {"week": "Week 4", "focus": "Google Mock Interview Simulation", "tasks": ["Complete 1-click Google Mock Interview Session", "Verify runtime complexity explanations"]}
            ]
        },
        {
            "name": "Amazon",
            "slug": "amazon",
            "description": "Multinational technology company focusing on e-commerce, cloud computing (AWS), digital streaming, and artificial intelligence.",
            "industry": "Cloud Computing / E-Commerce",
            "difficulty_rating": "Hard",
            "eligibility": {
                "degree": "B.E. / B.Tech / M.Tech / MCA in CS, IT, ECE, EEE",
                "min_cgpa": "6.5 CGPA / 65% aggregate",
                "batch_eligibility": "All active graduating batches & industry professionals",
                "backlogs_allowed": "Up to 1 active backlog permitted"
            },
            "hiring_process": [
                {"stage": 1, "title": "Online Assessment (OA)", "duration": "120 Mins", "details": "2 Coding Problems + Work Style Assessment + Reasoning"},
                {"stage": 2, "title": "Onsite Round 1 (Technical)", "duration": "60 Mins", "details": "20 Mins Amazon Leadership Principles + 40 Mins Coding"},
                {"stage": 3, "title": "Onsite Round 2 (System Design)", "duration": "60 Mins", "details": "Scalable AWS Architecture & Database Selection"},
                {"stage": 4, "title": "Bar Raiser Round", "duration": "60 Mins", "details": "Rigorous Leadership Principles & Technical Deep Dive"}
            ],
            "online_assessment_specs": {
                "platform": "Amazon Online Assessment (AMCAT)",
                "duration_mins": 120,
                "sections": ["Coding (2 Problems)", "Work Simulation", "Work Style Survey"],
                "cutoff_percentage": "85%"
            },
            "personalized_prep_plan": [
                {"week": "Week 1", "focus": "Amazon Leadership Principles", "tasks": ["Master Customer Obsession, Ownership, Bias for Action stories", "Draft 14 STAR responses"]},
                {"week": "Week 2", "focus": "Sliding Window & Hash Map DSA", "tasks": ["Solve top Amazon tagged questions on LeetCode", "Practice Two-Pointer techniques"]},
                {"week": "Week 3", "focus": "AWS System Design Patterns", "tasks": ["Design S3 / DynamoDB / Kinesis data flow", "Review microservices fault tolerance"]},
                {"week": "Week 4", "focus": "Bar Raiser Mock Interview", "tasks": ["Run Amazon 1-Click Mock Interview", "Refine metric-driven STAR results"]}
            ]
        },
        {
            "name": "Microsoft",
            "slug": "microsoft",
            "description": "Global enterprise software leader powering Azure cloud, Office 365, Windows OS, Developer Tools, and OpenAI partnership.",
            "industry": "Enterprise Software / Cloud",
            "difficulty_rating": "Hard",
            "eligibility": {
                "degree": "B.E. / B.Tech / M.Tech in CS, IT, ECE, EEE or Data Science",
                "min_cgpa": "7.0 CGPA / 70% aggregate",
                "batch_eligibility": "Graduating batch & experienced engineers",
                "backlogs_allowed": "0 active backlogs"
            },
            "hiring_process": [
                {"stage": 1, "title": "Online Coding Assessment", "duration": "90 Mins", "details": "3 Algorithmic questions on Codility"},
                {"stage": 2, "title": "Technical Round 1", "duration": "60 Mins", "details": "Data structures, Trees, Strings, Code correctness & edge cases"},
                {"stage": 3, "title": "Technical Round 2", "duration": "60 Mins", "details": "Low Level Design (LLD) & Object-Oriented Programming (OOP)"},
                {"stage": 4, "title": "AA (As Appropriate) Round", "duration": "60 Mins", "details": "Architectural discussion, engineering mindset & cultural fit"}
            ],
            "online_assessment_specs": {
                "platform": "Codility",
                "duration_mins": 90,
                "sections": ["3 Algorithmic Coding Problems"],
                "cutoff_percentage": "85%"
            },
            "personalized_prep_plan": [
                {"week": "Week 1", "focus": "String & Tree Manipulations", "tasks": ["Solve top 15 Microsoft Codility problems", "Review Tree traversals and Dynamic Programming"]},
                {"week": "Week 2", "focus": "LLD & Clean Code Design Patterns", "tasks": ["Implement Singleton, Factory, and Strategy patterns", "Design Parking Lot & Elevator systems"]},
                {"week": "Week 3", "focus": "Azure Cloud & Systems Concepts", "tasks": ["Study concurrency, threads, and memory management in C++/C#/Java"]},
                {"week": "Week 4", "focus": "AA Round Preparation", "tasks": ["Practice design trade-off explanations", "Run Microsoft 1-Click Mock Interview"]}
            ]
        },
        {
            "name": "Meta",
            "slug": "meta",
            "description": "Social technology innovator connecting billions through Facebook, Instagram, WhatsApp, Meta Quest VR, and PyTorch AI.",
            "industry": "Social Media / AI / Metaverse",
            "difficulty_rating": "Hard",
            "eligibility": {
                "degree": "B.S. / B.E. / B.Tech / M.S. in CS or related STEM",
                "min_cgpa": "7.5 CGPA / 75% aggregate",
                "batch_eligibility": "All active software engineering candidates",
                "backlogs_allowed": "0 active backlogs"
            },
            "hiring_process": [
                {"stage": 1, "title": "Technical Screen", "duration": "45 Mins", "details": "2 Coding problems solved under speed pressure (20 mins per problem)"},
                {"stage": 2, "title": "Onsite Coding Round 1", "duration": "45 Mins", "details": "2 Graph / Array problems with bug-free execution"},
                {"stage": 3, "title": "Onsite Coding Round 2", "duration": "45 Mins", "details": "Complex DS (Tries, Heap, Recursion)"},
                {"stage": 4, "title": "System Design Round", "duration": "45 Mins", "details": "High scale architecture (Newsfeed, Messenger, Instagram Stories)"},
                {"stage": 5, "title": "Behavioral Round", "duration": "45 Mins", "details": "Meta core values: Move Fast, Focus on Impact, Be Bold"}
            ],
            "online_assessment_specs": {
                "platform": "Meta Internal Portal",
                "duration_mins": 45,
                "sections": ["2 Speed Coding Problems"],
                "cutoff_percentage": "95%"
            },
            "personalized_prep_plan": [
                {"week": "Week 1", "focus": "Speed Coding & Meta Tagged Top 50", "tasks": ["Practice solving LeetCode Meta tagged questions within 15 mins", "Master Graph BFS/DFS"]},
                {"week": "Week 2", "focus": "High-Scale Product Architecture", "tasks": ["Design Instagram Feed, Messenger real-time chat, Typeahead search"]},
                {"week": "Week 3", "focus": "Behavioral & Meta Core Values", "tasks": ["Prepare stories showcasing rapid execution and bold innovation"]},
                {"week": "Week 4", "focus": "Full Meta Onsite Simulation", "tasks": ["Run timed mock coding rounds", "Complete Meta 1-Click Mock Interview"]}
            ]
        },
        {
            "name": "TCS",
            "slug": "tcs",
            "description": "Leading global IT service consultant delivering enterprise digital transformation, cloud migrations, and software solutions.",
            "industry": "IT Services / Consulting",
            "difficulty_rating": "Medium",
            "eligibility": {
                "degree": "B.E. / B.Tech / M.Tech / MCA / B.Sc in CS, IT, ECE, EEE, Mechanical, Civil",
                "min_cgpa": "6.0 CGPA / 60% aggregate in 10th, 12th, and Graduation",
                "batch_eligibility": "Current graduating batch (TCS NQT National Qualifier Test)",
                "backlogs_allowed": "Up to 1 active backlog allowed at time of test"
            },
            "hiring_process": [
                {"stage": 1, "title": "TCS NQT Online Test", "duration": "165 Mins", "details": "Foundation (Verbal, Reasoning, Numerical) + Advanced Coding (2 Problems)"},
                {"stage": 2, "title": "Technical Round", "duration": "30 Mins", "details": "Basic CS concepts (C/C++/Java, DBMS SQL queries, OOPs, Data Structures)"},
                {"stage": 3, "title": "Managerial & HR Round", "duration": "20 Mins", "details": "Relocation willingness, shift flexibility, project discussion"}
            ],
            "online_assessment_specs": {
                "platform": "TCS iON Portal",
                "duration_mins": 165,
                "sections": ["Aptitude & Verbal (75 Mins)", "Advanced Coding (2 Problems, 60 Mins)"],
                "cutoff_percentage": "70%"
            },
            "personalized_prep_plan": [
                {"week": "Week 1", "focus": "Aptitude & Numerical Reasoning", "tasks": ["Practice TCS NQT quantitative aptitude questions", "Revise verbal ability grammar"]},
                {"week": "Week 2", "focus": "C/C++/Java & Basic Data Structures", "tasks": ["Solve Array, String, Matrix manipulation problems", "Write SQL SELECT, JOIN, and GROUP BY queries"]},
                {"week": "Week 3", "focus": "Core CS & Resume Project Defense", "tasks": ["Prepare OOPs concepts (Inheritance, Polymorphism)", "Review final year project architecture"]},
                {"week": "Week 4", "focus": "TCS Mock Interview & HR Round", "tasks": ["Practice HR response strategies", "Launch TCS 1-Click Mock Interview"]}
            ]
        }
    ]
    await db["companies"].insert_many(companies_seed)

    questions_seed = [
        {"company_slug": "google", "category": "dsa", "title": "LRU Cache", "difficulty": "Hard", "instructions": "Design LRU cache with O(1) get/put operations.", "code_template": "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n  }\n}"},
        {"company_slug": "google", "category": "dsa", "title": "Word Search II", "difficulty": "Hard", "instructions": "Find all words in 2D board using Trie and Backtracking.", "code_template": "function findWords(board, words) {\n}"},
        {"company_slug": "google", "category": "technical", "title": "Google Search Indexing System Design", "difficulty": "Hard", "instructions": "Design web crawler and inverted index search engine.", "code_template": "def design_crawler():\n    pass"},
        {"company_slug": "google", "category": "hr", "title": "Why Google?", "difficulty": "Easy", "instructions": "Explain your technical passion for Google's engineering scale.", "code_template": ""},
        {"company_slug": "google", "category": "behavioral", "title": "Handling Ambiguity", "difficulty": "Medium", "instructions": "Describe a project where requirements were vague. How did you proceed?", "code_template": ""},
        {"company_slug": "amazon", "category": "dsa", "title": "Best Time to Buy and Sell Stock", "difficulty": "Easy", "instructions": "Maximize stock profit with single buy/sell day.", "code_template": "function maxProfit(prices) {\n}"},
        {"company_slug": "amazon", "category": "dsa", "title": "Trapping Rain Water", "difficulty": "Hard", "instructions": "Compute total trapped rain water given elevation map.", "code_template": "function trap(height) {\n}"},
        {"company_slug": "amazon", "category": "technical", "title": "Design Amazon Shopping Cart & Inventory", "difficulty": "Hard", "instructions": "Design high-concurrency inventory reservation system.", "code_template": "class InventoryService {\n}"},
        {"company_slug": "amazon", "category": "hr", "title": "Tell Me About Yourself", "difficulty": "Easy", "instructions": "Deliver a 2-minute elevator pitch focusing on software achievements.", "code_template": ""},
        {"company_slug": "amazon", "category": "behavioral", "title": "Customer Obsession Scenario", "difficulty": "Medium", "instructions": "Describe a time you went out of your way to deliver value for a customer.", "code_template": ""},
        {"company_slug": "microsoft", "category": "dsa", "title": "Binary Tree Zigzag Level Order Traversal", "difficulty": "Medium", "instructions": "Traverse tree in alternating level order directions.", "code_template": "function zigzagLevelOrder(root) {\n}"},
        {"company_slug": "microsoft", "category": "technical", "title": "Design Azure Blob Storage Service", "difficulty": "Hard", "instructions": "Design cloud object storage with high availability and replication.", "code_template": ""},
        {"company_slug": "microsoft", "category": "behavioral", "title": "Conflict Resolution in Engineering Teams", "difficulty": "Medium", "instructions": "Describe a disagreement with a peer on technical architecture.", "code_template": ""},
        {"company_slug": "meta", "category": "dsa", "title": "Subarray Sum Equals K", "difficulty": "Medium", "instructions": "Find total continuous subarrays summing to K using Prefix Sum & Hash Map.", "code_template": "function subarraySum(nums, k) {\n}"},
        {"company_slug": "meta", "category": "technical", "title": "Design Instagram Newsfeed", "difficulty": "Hard", "instructions": "Design newsfeed fan-out strategy for push vs pull models.", "code_template": ""},
        {"company_slug": "meta", "category": "behavioral", "title": "Move Fast and Break Things", "difficulty": "Medium", "instructions": "Give an example where rapid iteration helped achieve a critical goal.", "code_template": ""},
        {"company_slug": "tcs", "category": "dsa", "title": "Find Second Largest Element in Array", "difficulty": "Easy", "instructions": "Find second maximum element in single pass.", "code_template": "function secondLargest(arr) {\n}"},
        {"company_slug": "tcs", "category": "technical", "title": "Explain SQL Joins and Indexing", "difficulty": "Easy", "instructions": "Explain INNER, LEFT, RIGHT JOINs and B-Tree indexing.", "code_template": ""},
        {"company_slug": "tcs", "category": "hr", "title": "Are you willing to relocate across India?", "difficulty": "Easy", "instructions": "Express flexibility and enthusiasm for learning.", "code_template": ""}
    ]

    await db["company_questions"].insert_many(questions_seed)
    print("Seeded company preparation profiles and question banks.")

    print("Database seeding completed successfully.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
