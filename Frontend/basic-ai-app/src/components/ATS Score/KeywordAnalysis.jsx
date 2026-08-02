import React, { useState } from "react";
import "./KeywordAnalysis.css";

const KeywordAnalysis = ({ matchedSkills = [], missingSkills = [], hardSkills, onInjectSkill }) => {
  const [injectedSet, setInjectedSet] = useState(new Set());

  const criticalMissing = hardSkills?.missing_critical || missingSkills.slice(0, Math.ceil(missingSkills.length / 2));
  const optionalMissing = hardSkills?.missing_optional || missingSkills.slice(Math.ceil(missingSkills.length / 2));

  const handleInject = (skillName) => {
    setInjectedSet(prev => new Set(prev).add(skillName));
    if (onInjectSkill) {
      onInjectSkill(skillName);
    }
  };

  return (
    <div className="keyword-analysis-container">
      <div className="section-title">
        <h2>🔍 Skill & Keyword Alignment Matrix</h2>
        <p>Real-time breakdown of matched terms and 1-click keyword injection into your resume.</p>
      </div>

      <div className="keywords-grid">
        <div className="keyword-card matches">
          <h3>✅ Matched Technical & Soft Skills ({matchedSkills.length})</h3>
          <div className="keyword-tags">
            {matchedSkills.map((skill, i) => (
              <div key={i} className="keyword-tag match">
                <span className="word">{skill}</span>
                <span className="count">Found</span>
              </div>
            ))}
          </div>
        </div>

        <div className="keyword-card missing">
          <h3>⚠️ Missing Critical Skills ({criticalMissing.length})</h3>
          <div className="keyword-tags">
            {criticalMissing.map((skill, i) => (
              <div key={i} className={`keyword-tag miss critical ${injectedSet.has(skill) ? 'injected' : ''}`}>
                <span className="word">{skill}</span>
                <button 
                  className="inject-btn" 
                  onClick={() => handleInject(skill)}
                  disabled={injectedSet.has(skill)}
                >
                  {injectedSet.has(skill) ? "✓ Added" : "+ Inject Skill"}
                </button>
              </div>
            ))}
          </div>

          {optionalMissing.length > 0 && (
            <>
              <h4 className="optional-title">💡 Secondary / Bonus Keywords ({optionalMissing.length})</h4>
              <div className="keyword-tags">
                {optionalMissing.map((skill, i) => (
                  <div key={i} className={`keyword-tag miss optional ${injectedSet.has(skill) ? 'injected' : ''}`}>
                    <span className="word">{skill}</span>
                    <button 
                      className="inject-btn" 
                      onClick={() => handleInject(skill)}
                      disabled={injectedSet.has(skill)}
                    >
                      {injectedSet.has(skill) ? "✓ Added" : "+ Inject"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeywordAnalysis;

