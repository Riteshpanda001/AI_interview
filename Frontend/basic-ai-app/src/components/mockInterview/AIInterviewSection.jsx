import React from "react";
import "./AIInterviewSection.css";

import preview from "../../assets/ai-interview-preview.png";

const AIInterviewSection = () => {
  return (
    <section className="ai-section">

      <div className="ai-container">

        {/* Left Image */}

        <div className="ai-image">

          <img
            src={preview}
            alt="AI Interview Analysis"
          />

        </div>

        {/* Right Content */}

        <div className="ai-content">

          <h2>
            The Right AI Interview Practice

            With The Right Questions
          </h2>

          <p>
            Experience realistic AI-powered mock interviews that ask
            company-specific and role-based questions. Our intelligent
            interviewer evaluates every response, provides follow-up
            questions, and delivers detailed performance insights to
            help you improve before your real interview.
          </p>

          <div className="ai-list">

            <div>✔ Best AI Interview Experience</div>

            <div>✔ Evaluation And Follow-Ups</div>

            <div>✔ Tailored Questions To The Applied Role</div>

            <div>✔ Online Interview Practice</div>
          </div>

        </div>

      </div>

    </section>
  );
};

export default AIInterviewSection;