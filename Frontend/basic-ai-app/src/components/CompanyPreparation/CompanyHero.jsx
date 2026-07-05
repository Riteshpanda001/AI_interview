import React from "react";
import "./CompanyHero.css";

const CompanyHero = () => {
  return (
    <section className="company-prep-hero">
      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>
      
      <div className="company-hero-content">
        <span className="hero-tag-badge">🏢 Targeted Hiring Tracks</span>
        <h1>Master Company-Specific <span>Interviews</span></h1>
        <p>
          Prepare with actual hiring patterns, interview questions, and prep roadmaps curated from real candidates who cracked top product and service companies.
        </p>

        <div className="company-hero-stats">
          <div className="hero-stat-card">
            <h3>8+</h3>
            <p>Top Tech Giants</p>
          </div>
          <div className="hero-stat-card">
            <h3>150+</h3>
            <p>Interview Rounds</p>
          </div>
          <div className="hero-stat-card">
            <h3>500+</h3>
            <p>Solved Questions</p>
          </div>
          <div className="hero-stat-card">
            <h3>98%</h3>
            <p>Placement Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyHero;
