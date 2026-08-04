import React from "react";
import "./FeatureGateModal.css";
import { useNavigate } from "react-router-dom";

const FeatureGateModal = ({ isOpen, onClose, featureName, requiredPlan = "Pro" }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="feature-gate-overlay">
      <div className="feature-gate-card">
        <button className="gate-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="gate-icon-badge">🔒</div>

        <h2>Unlock <span>{featureName || "Premium Feature"}</span></h2>
        
        <p className="gate-description">
          This advanced AI feature is exclusively available for <strong>{requiredPlan}</strong> tier members and above. Upgrade now to get full access to unlimited interview sessions, detailed feedback, and premium tools!
        </p>

        <div className="gate-perks-list">
          <div className="perk-item">✓ Unlimited AI Mock Interviews & HR Practice</div>
          <div className="perk-item">✓ 98%+ ATS Resume Parsing & Keyword Suggestions</div>
          <div className="perk-item">✓ Company-Specific Question Banks & Code Editor</div>
        </div>

        <div className="gate-actions">
          <button className="btn-gate-cancel" onClick={onClose}>
            Maybe Later
          </button>
          
          <button
            className="btn-gate-upgrade"
            onClick={() => {
              onClose();
              navigate("/pricing");
            }}
          >
            Upgrade to {requiredPlan} 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureGateModal;
