import React from "react";
import "./PracticeSection.css";

import preview from "../../assets/practice-preview.png";

const PracticeSection = () => {
  return (
    <section className="practice">

      <div className="practice-title">

        <h2>
          Practice Makes You Interview-Perfect
        </h2>

        <p>
          Get real-life interview practice and impress recruiters with
          confident answers powered by AI.
        </p>

      </div>

      <div className="practice-container">

        <div className="practice-left">

          <h3>
            Your Next Interview = Your Dream Job
          </h3>

          <p>
            Ace your upcoming interviews with AI-powered mock interview
            practice. Improve technical knowledge, HR communication,
            behavioral skills, and confidence through personalized
            interview sessions based on your resume and target company.
          </p>

          <div className="practice-list">

            <div>✔ Increased Selection Chances</div>

            <div>✔ Reliable Interview Practice</div>

            <div>✔ Recruiter-trained AI Questions</div>

            <div>✔ Free AI Imterview Practice</div>

          </div>

        </div>

        <div className="practice-right">

          <img
            src={preview}
            alt="AI Interview Preview"
          />

        </div>

      </div>

    </section>
  );
};

export default PracticeSection;