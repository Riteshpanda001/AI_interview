from typing import List, Dict

class ScoringService:
    @staticmethod
    def calculate_overall_rating(scores: List[int]) -> int:
        if not scores:
            return 0
        return int(sum(scores) / len(scores))

    @staticmethod
    def generate_breakdown(communication_score: int, technical_score: int, confidence_score: int) -> Dict[str, int]:
        return {
            "communication": communication_score,
            "technical": technical_score,
            "confidence": confidence_score
        }
