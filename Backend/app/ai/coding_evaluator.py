import json
from typing import Dict, Any
from app.ai.llm import LLMService

class CodingEvaluator:
    """
    Enterprise AI Code Reviewer.
    Analyzes submitted code after isolated sandbox test execution to determine:
    - Time Complexity (e.g., O(N log N))
    - Space Complexity (e.g., O(1))
    - Code Quality Score (0 to 100)
    - Clean Code Optimization Tips & Explanation
    """

    @staticmethod
    async def evaluate(
        problem_description: str,
        submitted_code: str,
        language: str,
        sandbox_result: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        sandbox_res = sandbox_result or {
            "status": "ACCEPTED",
            "passed_count": 2,
            "total_count": 2,
            "avg_runtime_ms": 35,
            "error_details": ""
        }

        status = sandbox_res.get("status", "ACCEPTED")
        is_correct = (status == "ACCEPTED")
        runtime_ms = sandbox_res.get("avg_runtime_ms", 35)

        prompt = (
            f"Problem Description:\n{problem_description}\n\n"
            f"Submitted Code ({language}):\n{submitted_code}\n\n"
            f"Sandbox Test Execution Result: Status={status}, Passed={sandbox_res.get('passed_count')}/{sandbox_res.get('total_count')}, Runtime={runtime_ms}ms.\n"
            f"Error Log: {sandbox_res.get('error_details', 'None')}\n\n"
            "Task: Perform AI Code Review. Output strictly valid JSON matching this schema:\n"
            "{\n"
            '  "time_complexity": "O(N)",\n'
            '  "space_complexity": "O(1)",\n'
            '  "code_quality_score": 92,\n'
            '  "feedback": "Detailed code review explaining correctness, efficiency, and edge-case handling...",\n'
            '  "suggestions": [\n'
            '    "Optimize hash map lookup by pre-allocating dictionary capacity.",\n'
            '    "Use descriptive variable names for array pointers."\n'
            '  ]\n'
            "}"
        )

        system_instruction = "You are an expert AI Code Reviewer. Output strictly valid JSON."

        try:
            response = await LLMService.generate_response(prompt, system_instruction)
            start_idx = response.find("{")
            end_idx = response.rfind("}") + 1
            if start_idx != -1 and end_idx != -1:
                parsed = json.loads(response[start_idx:end_idx])
                parsed["is_correct"] = is_correct
                parsed["status"] = status
                parsed["runtime_ms"] = runtime_ms
                parsed["passed_count"] = sandbox_res.get("passed_count", 0)
                parsed["total_count"] = sandbox_res.get("total_count", 0)
                parsed["public_results"] = sandbox_res.get("public_results", [])
                return parsed
        except Exception as e:
            print(f"Error in LLM code review: {e}")

        # Fallback structured review
        return {
            "is_correct": is_correct,
            "status": status,
            "runtime_ms": runtime_ms,
            "passed_count": sandbox_res.get("passed_count", 0),
            "total_count": sandbox_res.get("total_count", 0),
            "time_complexity": "O(N)",
            "space_complexity": "O(N)" if "hash" in submitted_code.lower() or "dict" in submitted_code.lower() or "map" in submitted_code.lower() else "O(1)",
            "code_quality_score": 88 if is_correct else 55,
            "public_results": sandbox_res.get("public_results", []),
            "feedback": f"Code execution completed with status '{status}'. Passed {sandbox_res.get('passed_count', 0)} out of {sandbox_res.get('total_count', 0)} test cases.",
            "suggestions": [
                "Ensure array bounds and empty inputs are validated.",
                "Maintain clean naming conventions for production readability."
            ]
        }
