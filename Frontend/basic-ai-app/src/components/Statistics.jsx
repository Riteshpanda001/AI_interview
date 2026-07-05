import React from "react";
import "./Statistics.css";

const statisticsData = [
  {
    number: "50,000+",
    title: "Interview Questions",
    description: "Curated technical, HR, and coding questions."
  },
  {
    number: "20,000+",
    title: "Mock Interviews",
    description: "AI-powered interview sessions completed."
  },
  {
    number: "500+",
    title: "Companies Covered",
    description: "Questions from top product and service companies."
  },
  {
    number: "95%",
    title: "Success Rate",
    description: "Candidates reported improved interview confidence."
  }
];

const Statistics = () => {
  return (
    <section className="stats-section">

      <div className="stats-header">

        <span className="stats-tag">
          📊 Platform Statistics
        </span>

        <h2>
          Trusted by Thousands of
          <span> Job Seekers</span>
        </h2>

        <p>
          Join thousands of students and professionals preparing
          for their dream companies using PrepNova AI's intelligent
          interview preparation platform.
        </p>

      </div>

      <div className="stats-grid">

        {statisticsData.map((item, index) => (

          <div className="stat-card" key={index}>

            <div className="stat-number">
              {item.number}
            </div>

            <div className="stat-title">
              {item.title}
            </div>

            <div className="stat-description">
              {item.description}
            </div>

          </div>

        ))}

      </div>

    </section>
  );
};

export default Statistics;