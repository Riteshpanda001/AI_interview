from datetime import datetime
from bson import ObjectId

class DashboardService:
    @staticmethod
    async def get_user_dashboard(user_id: str, db) -> dict:
        # Total interviews completed
        total_interviews = await db["interview_sessions"].count_documents({
            "user_id": user_id,
            "status": "completed"
        })
        
        # Calculate average overall score
        avg_score = 0.0
        cursor = db["interview_results"].find({"user_id": user_id})
        results = await cursor.to_list(length=100)
        
        if results:
            total_sum = sum(res["overall_score"] for res in results)
            avg_score = round(total_sum / len(results), 1)
            
        # Mock skill gaps progress metrics
        skills_progress = {
            "Communication": 80.0,
            "System Design": 65.0,
            "Algorithms": 72.0,
            "Behavioral Response": 88.0
        }
        
        # Compile recent logs
        recent_activity = []
        for res in results[:5]:
            recent_activity.append({
                "activity_type": "interview",
                "score": res["overall_score"],
                "verdict": res["verdict"],
                "date": res["created_at"].isoformat()
            })
            
        return {
            "total_interviews": total_interviews,
            "average_score": avg_score,
            "skills_progress": skills_progress,
            "recent_activity": recent_activity,
            "last_updated": datetime.utcnow()
        }
