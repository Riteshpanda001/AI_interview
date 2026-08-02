import React from "react";
import { useNavigate } from "react-router-dom";
import "./JobInterviewQuestions.css";

const JobInterviewQuestions = ({ questions = [], jobTitle = "Target Role" }) => {
  const navigate = useNavigate();

  if (!questions || questions.length === 0) {
    return (
      <div className="job-questions-card">
        <h3>🎯 Job-Specific Interview Questions</h3>
        <p className="no-questions-text">No custom interview questions generated yet. Scan a job description to extract tailored questions!</p>
      </div>
    );
  }

  const handleStartPractice = (q) => {
    // Navigate to Mock Interview page with pre-filled question & role context
    navigate("/mock-interview", {
      state: {
        role: jobTitle,
        question: q.question,
        category: q.category
      }
    });
  };

  return (
    <div className="job-questions-card">
      <div className="questions-header">
        <div>
          <h3>🎯 AI Job-Tailored Interview Prep Questions</h3>
          <p className="questions-subtitle">
            Targeted technical & behavioral questions generated directly from identified skill gaps in this job post:
          </p>
        </div>
        <button 
          className="practice-all-btn"
          onClick={() => navigate("/mock-interview", { state: { role: jobTitle } })}
        >
          🚀 Practice in AI Mock Studio
        </button>
      </div>

      <div className="questions-grid">
        {questions.map((q, idx) => (
          <div className="question-item-card" key={q.id || idx}>
            <div className="q-card-badge-row">
              <span className="q-number">Q{idx + 1}</span>
              <span className="q-category-tag">{q.category}</span>
              {q.target_gap && <span className="q-gap-tag">Target Gap: {q.target_gap}</span>}
            </div>

            <h4 className="q-text">{q.question}</h4>

            {q.sample_answer_key && (
              <div className="q-answer-guide">
                <strong>💡 Ideal Answer Framework:</strong>
                <p>{q.sample_answer_key}</p>
              </div>
            )}

            <div className="q-card-footer">
              <button className="start-single-q-btn" onClick={() => handleStartPractice(q)}>
                🎙️ Practice Answer Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobInterviewQuestions;
