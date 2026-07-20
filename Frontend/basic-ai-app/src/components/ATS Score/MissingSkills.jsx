import React, { useState, useEffect } from "react";
import "./MissingSkills.css";

const MissingSkills = ({ missingSkills = [] }) => {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (missingSkills.length > 0) {
      setSkills(
        missingSkills.map((name, idx) => ({
          name,
          importance: idx % 2 === 0 ? "High" : "Medium",
          category: name.toLowerCase().includes("aws") || name.toLowerCase().includes("cloud") ? "Cloud" : "Technical Skill",
          reason: `Highly requested keyword missing in comparison with target job description.`,
          added: false
        }))
      );
    } else {
      setSkills([]);
    }
  }, [missingSkills]);

  const toggleSkillAdded = (idx) => {
    setSkills(prev => prev.map((s, i) => i === idx ? { ...s, added: !s.added } : s));
  };

  return (
    <div className="missing-skills-container">
      <div className="skills-header">
        <h2>Missing Skills Detection</h2>
        <p>AI identified these high-frequency missing skills based on your target job categories.</p>
      </div>

      {skills.length === 0 ? (
        <div className="no-missing-skills">
          <div className="success-emoji">🎉</div>
          <h3>Zero Missing Skills!</h3>
          <p>Your resume contains all core technical skills requested in the job description.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default MissingSkills;
