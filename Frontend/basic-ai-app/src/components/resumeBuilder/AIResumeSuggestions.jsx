import React, { useState } from "react";
import "./AIResumeSuggestions.css";

const initialSuggestions = [
  {
    id: 1,
    section: "Summary",
    before:
      "Results-driven Software Engineer with 3+ years of experience...",
    after:
      "Results-driven Software Engineer with 3+ years of experience building scalable web applications using React, Node.js, and cloud technologies. Improved user engagement by 25% while reducing infrastructure costs by 18%.",
    reason:
      "Make your summary more impact-driven by adding measurable achievements."
  },
  {
    id: 2,
    section: "Experience",
    before:
      "Developed and maintained responsive web applications.",
    after:
      "Developed and maintained high-performance React applications using TypeScript and Tailwind CSS, improving Lighthouse performance from 65 to 94.",
    reason:
      "Mention technologies used and measurable performance improvements."
  },
  {
    id: 3,
    section: "Experience",
    before:
      "Optimized API performance, reducing page load time.",
    after:
      "Optimized REST APIs and database indexing, reducing API response time by 35% and significantly improving application performance.",
    reason:
      "Clearly explain how optimization was achieved."
  }
];

const AIResumeSuggestions = ({
  setResumeData = () => {}
}) => {

  const [suggestions, setSuggestions] = useState(initialSuggestions);

  const applySuggestion = (suggestion) => {

    setResumeData((prev) => {

      const updatedResume = { ...prev };

      if (suggestion.section === "Summary") {

        updatedResume.summary = suggestion.after;

      } else if (suggestion.section === "Experience") {

        const experiences = [...(prev.experience || [])];

        if (experiences.length > 0) {

          experiences[0] = {
            ...experiences[0],
            details: suggestion.after
          };

          updatedResume.experience = experiences;
        }
      }

      return updatedResume;
    });

    setSuggestions((prev) =>
      prev.filter((item) => item.id !== suggestion.id)
    );
  };

  return (
    <section className="suggestions-section">

      <div className="section-header">

        <span className="suggestions-badge">
          🤖 AI Recommendations
        </span>

        <h2 className="section-title">
          Smart <span>AI Resume Suggestions</span>
        </h2>

        <p className="section-subtitle">
          Instantly improve your resume with AI-generated recommendations.
          Click <strong>Apply</strong> to update your resume automatically.
        </p>

      </div>

      <div className="suggestions-container">

        {suggestions.length === 0 ? (

          <div className="no-suggestions-card">

            <h3>🎉 Congratulations!</h3>

            <p>
              All AI recommendations have been applied successfully.
              Your resume is now better optimized for ATS systems
              and recruiters.
            </p>

          </div>

        ) : (

          <div className="suggestions-list">

            {suggestions.map((suggestion) => (

              <div
                key={suggestion.id}
                className="suggestion-card"
              >

                <div className="sug-header">

                  <span className="sug-section">
                    {suggestion.section} Improvement
                  </span>

                  <span className="sug-reason">
                    💡 {suggestion.reason}
                  </span>

                </div>

                <div className="sug-diff">

                  <div className="diff-box before">

                    <strong>Original</strong>

                    <p>{suggestion.before}</p>

                  </div>

                  <div className="diff-arrow">
                    ➜
                  </div>

                  <div className="diff-box after">

                    <strong>AI Recommendation</strong>

                    <p>{suggestion.after}</p>

                  </div>

                </div>

                <button
                  className="apply-sug-btn"
                  onClick={() => applySuggestion(suggestion)}
                >
                  ⚡ Apply AI Suggestion
                </button>

              </div>

            ))}

          </div>

        )}

      </div>

    </section>
  );
};

export default AIResumeSuggestions;