import React from "react";
import "./CompanyPreparation.css";
import { useNavigate } from "react-router-dom";
import useRequireAuth from "../hooks/useRequireAuth";

const CompanyPreparation = () => {
  const navigate = useNavigate();
  const { requireAuth } = useRequireAuth();
  const companies = [
    {
      name: "Google",
      logo: "/logos/google.png",
      desc: "DSA, System Design, Behavioral Questions"
    },
    {
      name: "Microsoft",
      logo: "/logos/microsoft.png",
      desc: "Coding, OOPs, Problem Solving"
    },
    {
      name: "Amazon",
      logo: "/logos/amazon.png",
      desc: "Leadership Principles & Coding"
    },
    {
      name: "Meta",
      logo: "/logos/meta.png",
      desc: "Product Thinking & Algorithms"
    },
    {
      name: "TCS",
      logo: "/logos/tcs.png",
      desc: "Aptitude, HR & Technical Questions"
    },
    {
      name: "Infosys",
      logo: "/logos/Infosys.png",
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
              <img src={company.logo} alt={`${company.name} logo`} className="company-logo-img" />
            </div>

            <h3>{company.name}</h3>

            <p>{company.desc}</p>

            <button 
              className="company-btn"
              onClick={() => requireAuth(null, "/company-preparation")}
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