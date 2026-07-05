from bson import ObjectId

class CompanyService:
    @staticmethod
    async def get_companies(db) -> list:
        # Check if company data exists
        count = await db["companies"].count_documents({})
        if count == 0:
            # Seed standard companies
            companies_list = [
                {
                    "name": "Google",
                    "slug": "google",
                    "description": "Tech giant specializing in search, cloud computing, and AI systems.",
                    "industry": "Technology",
                    "interview_process": [
                        {"round_name": "Online Assessment", "details": "Coding challenges on data structures and algorithms."},
                        {"round_name": "Technical Phone Screen", "details": "Algorithm discussion and basic algorithmic complexity checking."},
                        {"round_name": "Onsite Rounds", "details": "3 coding sessions, 1 system design, and 1 behavioral (Googlyness) interview."}
                    ],
                    "typical_questions": [
                        {"question": "Implement an LRU Cache.", "type": "technical"},
                        {"question": "How do you handle conflict in a software engineering team?", "type": "behavioral"}
                    ]
                },
                {
                    "name": "Meta",
                    "slug": "meta",
                    "description": "Social media and metaverse pioneer focusing on virtual systems and social graphs.",
                    "industry": "Social Media / VR",
                    "interview_process": [
                        {"round_name": "Screening", "details": "Rapid questions on algorithm efficiency."},
                        {"round_name": "Onsite Loops", "details": "System design, product design, and system reliability checking."}
                    ],
                    "typical_questions": [
                        {"question": "Design a news feed delivery service.", "type": "technical"}
                    ]
                }
            ]
            await db["companies"].insert_many(companies_list)
            
        cursor = db["companies"].find({})
        companies = await cursor.to_list(length=100)
        for comp in companies:
            comp["id"] = str(comp["_id"])
        return companies
