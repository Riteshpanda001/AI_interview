class ScoreCalculator:
    @staticmethod
    def calculate_percentage(earned: float, total: float) -> float:
        if total <= 0:
            return 0.0
        return round((earned / total) * 100, 2)
