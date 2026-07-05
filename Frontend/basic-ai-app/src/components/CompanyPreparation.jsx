import React from "react";
import "./CompanyPreparation.css";
import { useNavigate } from "react-router-dom";

const CompanyPreparation = () => {
  const navigate = useNavigate();
  const companies = [
    {
      name: "Google",
      icon: "🔍",
      desc: "DSA, System Design, Behavioral Questions"
    },
    {
      name: "Microsoft",
      icon: "💻",
      desc: "Coding, OOPs, Problem Solving"
    },
    {
      name: "Amazon",
      icon: "📦",
      desc: "Leadership Principles & Coding"
    },
    {
      name: "Meta",
      icon: "🌐",
      desc: "Product Thinking & Algorithms"
    },
    {
      name: "TCS",
      icon: "🏢",
      desc: "Aptitude, HR & Technical Questions"
    },
    {
      name: "Infosys",
      icon: "📈",
      desc: "Coding, Aptitude & System Design"
    }
  ];

  return (
    <section className="company-section">

      <div className="company-header">

        <span className="company-tag">
          🏢 Company Preparation
        </span>

        <h2>
          Prepare for Interviews at
          <span> Top Companies</span>
        </h2>

        <p>
          Access company-specific interview questions,
          coding challenges, HR rounds, and preparation
          roadmaps designed by AI.
        </p>

      </div>

      <div className="company-grid">

        {companies.map((company, index) => (
          <div className="company-card" key={index}>

            <div className="company-icon">
              {company.icon}
            </div>

            <h3>{company.name}</h3>

            <p>{company.desc}</p>

            <button 
              className="company-btn"
              onClick={() => navigate("/company-preparation")}
            >
              Start Preparation
            </button>

          </div>
        ))}

      </div>

    </section>
  );
};

export default CompanyPreparation;