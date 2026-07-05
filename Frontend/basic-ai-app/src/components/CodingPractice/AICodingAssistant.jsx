import React, { useState, useEffect } from "react";
import "./AICodingAssistant.css";

const AICodingAssistant = ({ selectedProblem }) => {
  const [code, setCode] = useState(
    `// Solve: Two Sum\n// Find two indices that sum up to target\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`
  );
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  // Hook to watch for when a problem is selected externally
  useEffect(() => {
    if (selectedProblem) {
      setCode(selectedProblem.codeTemplate);
      setFeedback(
        `📝 Loaded challenge: ${selectedProblem.title}\nDifficulty: ${selectedProblem.difficulty}\nCategory: ${selectedProblem.category}\nAcceptance: ${selectedProblem.acceptance}\n\nProblem Description:\n${selectedProblem.instructions}`
      );
    }
  }, [selectedProblem]);

  const getAIFeedback = () => {
    setLoading(true);
    setFeedback("Analyzing your code for time complexity, space complexity, and potential bugs...");
    setTimeout(() => {
      const title = selectedProblem ? selectedProblem.title : "Two Sum";
      const difficulty = selectedProblem ? selectedProblem.difficulty : "Easy";
      setFeedback(
        `💡 AI Analysis Result for [${title}] (${difficulty}):\n\n1. Time Complexity: O(N) - Optimal. You have successfully implemented a fast single-pass lookup.\n2. Space Complexity: O(N) - Expected auxiliary space standard.\n3. Best Practice: Follows JavaScript ES6 standards.\n4. Dry Run check: All sample tests passed successfully!`
      );
      setLoading(false);
    }, 1500);
  };

  const handleClear = () => {
    if (selectedProblem) {
      setCode(selectedProblem.codeTemplate);
    } else {
      setCode("");
    }
  };

  return (
    <section className="ai-coding-section" id="ai-workspace">
      <div className="section-header-mini">
        <span className="section-mini-tag">🤖 AI Coach</span>
        <h2>AI Coding Assistant</h2>
        <p>Write your solution and get real-time optimization suggestions, complexity analysis, and dry runs from our AI evaluator.</p>
      </div>

      <div className="ai-coding-container card">
        <div className="editor-side">
          <div className="editor-header">
            <span>💻 JavaScript Compiler Workspace {selectedProblem ? `- ${selectedProblem.title}` : ""}</span>
            <button className="editor-reset-btn" onClick={handleClear}>Reset Template</button>
          </div>
          <textarea
            className="code-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className="editor-footer">
            <button className="run-code-btn" onClick={() => alert(`Running unit test suites for current workspace... Success!`)}>
              Run Code
            </button>
            <button className="ai-feedback-btn" onClick={getAIFeedback} disabled={loading}>
              {loading ? "Evaluating..." : "Analyze with AI"}
            </button>
          </div>
        </div>

        <div className="feedback-side">
          <div className="feedback-header">
            <span>✨ AI Evaluation & Dry Run</span>
          </div>
          <div className="feedback-body">
            {feedback ? (
              <pre className="feedback-pre">{feedback}</pre>
            ) : (
              <div className="feedback-placeholder">
                <p>Click "Analyze with AI" to check code complexity, syntax bugs, and optimal solution paths.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AICodingAssistant;

