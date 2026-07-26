import React from "react";
import { useNavigate } from "react-router-dom";
import "./MockHero.css";
import useRequireAuth from "../../hooks/useRequireAuth";

import heroImage from "../../assets/hero.png";

const MockHero = () => {
  const navigate = useNavigate();
  const { requireAuth } = useRequireAuth();

  return (
    <section className="mock-hero">

      <div className="mock-hero-left">
        <h2>
          Ace Interviews with our
          <span> AI Mock Interview </span>
          Platform
        </h2>

        <p>
          Crack your next interview with the right preparation.
          Practice real-time Technical, HR and Behavioral interviews
          using our AI interviewer.

          Receive instant AI feedback, improve your communication,
          confidence, technical knowledge and maximize your chances
          of getting selected in your dream company.
        </p>

        <div className="hero-buttons">

          <button 
            className="practice-btn"
            onClick={() => requireAuth(() => navigate("/mock-interviews"), "/mock-interviews")}
          >
            Practice Now
          </button>

          <button className="demo-btn">
            Watch Demo
          </button>

        </div>
      </div>

      <div className="mock-hero-right">

        <img
          src={heroImage}
          alt="AI Mock Interview"
        />

      </div>

    </section>
  );
};

export default MockHero;