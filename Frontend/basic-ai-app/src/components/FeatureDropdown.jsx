import React from "react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: "📄",
    title: "AI Resume Builder",
    desc: "Build a standout resume with AI including ATS optimization."
  },
  {
    icon: "💻",
    title: "Coding Practice",
    desc: "Solve coding challenges and receive real-time AI feedback."
  },
  {
    icon: "🏢",
    title: "Company Preparation",
    desc: "Prepare for top company interview patterns and questions."
  },
  {
    icon: "🎤",
    title: "Mock Interviews",
    desc: "Practice AI-powered HR and technical interviews."
  }
];

const FeatureDropdown = () => {
  const navigate = useNavigate();

  return (
    <div className="feature-dropdown">
      {features.map((item, index) => (
        <div 
          className="dropdown-item" 
          key={index}
          onClick={() => {
            if (item.title === "Coding Practice") {
              navigate("/coding-practice");
            } else if (item.title === "Company Preparation") {
              navigate("/company-preparation");
            } else if (item.title === "Mock Interviews") {
              navigate("/mock-interview");
            } else if (item.title === "AI Resume Builder") {
              navigate("/resume-builder");
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="dropdown-icon">
            {item.icon}
          </div>

          <div>
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureDropdown;