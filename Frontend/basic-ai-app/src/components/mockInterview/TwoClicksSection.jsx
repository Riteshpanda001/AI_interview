import React from "react";
import "./TwoClicksSection.css";

import preview from "../../assets/two-clicks-preview.png";

const TwoClicksSection = () => {
  return (
    <section className="two-clicks">

      <div className="two-container">

        {/* Left Side */}

        <div className="two-content">
          <h2>
            Crack Your Interview
            With Two Clicks
          </h2>

          <p>
            Simply upload your resume and the job description.
            PrepNova AI automatically analyzes both documents and
            generates recruiter-level interview questions.

            Practice unlimited interview questions, receive
            follow-up questions, and improve with instant AI
            feedback after every answer.
          </p>

          <div className="two-features">

            <div>✔ Resume And Job Description Upload</div>

            <div>✔ Answer In Real Time</div>

            <div>✔ Number Of Questions To Learn From</div>

            <div>✔ Real-Time Interview Experience</div>

          </div>
        </div>

        {/* Right Side */}

        <div className="two-image">

          <img
            src={preview}
            alt="AI Resume Interview"
          />

        </div>

      </div>

    </section>
  );
};

export default TwoClicksSection;