import React, { useState } from "react";
import "./MissingSkills.css";

const MissingSkills = () => {
  const [skills, setSkills] = useState([
    { name: "Docker", importance: "High", category: "DevOps", reason: "Found in 84% of related Software Engineer postings.", added: false },
    { name: "Kubernetes", importance: "Medium", category: "DevOps", reason: "Highly requested for container orchestration and scaling.", added: false },
    { name: "AWS Cloud Services", importance: "High", category: "Cloud", reason: "Critical for applications hosted in cloud-native infrastructures.", added: false },
    { name: "Unit Testing (Jest/React Testing Library)", importance: "High", category: "Frontend Testing", reason: "Essential for robust front-end deployment reliability.", added: false },
    { name: "CI/CD Pipeline Design", importance: "Medium", category: "DevOps", reason: "Ensures automated deployment flow competence.", added: false }
  ]);

  const toggleSkillAdded = (idx) => {
    setSkills(prev => prev.map((s, i) => i === idx ? { ...s, added: !s.added } : s));
  };

  return (
    <div className="missing-skills-container">
      <div className="skills-header">
        <h2>Missing Skills Detection</h2>
        <p>AI identified these high-frequency missing skills based on your target job categories.</p>
      </div>

      <div className="skills-list">
        {skills.map((skill, idx) => (
          <div key={idx} className={`skill-card ${skill.importance.toLowerCase()} ${skill.added ? "added" : ""}`}>
            <div className="skill-meta">
              <span className="skill-cat">{skill.category}</span>
              <span className={`importance-badge ${skill.importance.toLowerCase()}`}>
                {skill.importance} Priority
              </span>
            </div>
            
            <div className="skill-info">
              <h3>{skill.name}</h3>
              <p>{skill.reason}</p>
            </div>

            <button 
              className={`add-skill-action-btn ${skill.added ? "active" : ""}`}
              onClick={() => toggleSkillAdded(idx)}
            >
              {skill.added ? "✓ Marked Added" : "+ Add to Resume"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissingSkills;
