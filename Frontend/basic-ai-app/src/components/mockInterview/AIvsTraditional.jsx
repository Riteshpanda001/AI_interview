import React from "react";
import "./AIvsTraditional.css";

import image from "../../assets/ai-vs-traditional.png";

const AIvsTraditional = () => {
  return (
    <section className="comparison-section">

      <div className="comparison-container">

        {/* Left Image */}

        <div className="comparison-image">

          <img
            src={image}
            alt="AI Interview vs Traditional"
          />

        </div>

        {/* Right Content */}

        <div className="comparison-content">

          <h2>
            AI Interview vs Traditional
            Mock: Which Is Better?
          </h2>

          <p>
            Traditional mock interviews often require scheduling,
            mentors, and waiting for feedback.

            PrepNova AI provides an intelligent AI interviewer
            available 24/7 that asks recruiter-level questions,
            analyzes your answers instantly, and provides
            detailed feedback with improvement suggestions.

            Practice anytime, anywhere without waiting.
          </p>

          <div className="comparison-features">

            <div>✔ 24/7 Interview Support</div>

            <div>✔ Instant AI Feedback</div>

            <div>✔ Free Online AI Interview Preparation </div>

            <div>✔ Efficiently Trained AI</div>
          </div>
        </div>

      </div>

    </section>
  );
};

export default AIvsTraditional;