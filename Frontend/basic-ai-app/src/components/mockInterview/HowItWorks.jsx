import React from "react";
import "./HowItWorks.css";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Upload Resume & Job Description",
      description: "Simply drop your resume and specify the role or paste the job description you are preparing for.",
      icon: "📄",
    },
    {
      number: "02",
      title: "Start AI-Powered Mock Session",
      description: "Our intelligent conversational AI interviewer conducts a realistic role-based technical or HR interview.",
      icon: "🎤",
    },
    {
      number: "03",
      title: "Get Instant Score & Feedback",
      description: "Receive immediate detailed analytics on your communication, confidence levels, correct answers, and tips.",
      icon: "📊",
    },
  ];

  return (
    <section className="how-section">
      <div className="how-container">
        <div className="how-header">
          <span className="how-tag">🛠 Process Flow</span>
          <h2>How It Works</h2>
          <p>
            Three simple steps to build your confidence and ace your upcoming job interview.
          </p>
        </div>

        <div className="how-steps">
          {steps.map((step, index) => (
            <div className="how-card" key={index}>
              <div className="how-step-num">{step.number}</div>
              <div className="how-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
