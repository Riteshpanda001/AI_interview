import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaSave, FaUserShield, FaKey } from "react-icons/fa";
import "./Settings.css";

const Settings = () => {
  const { user } = useAuth();
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem("custom_gemini_key") || "");
  const [groqKey, setGroqKey] = useState(localStorage.getItem("custom_groq_key") || "");
  const [saved, setSaved] = useState(false);

  const handleSaveKeys = (e) => {
    e.preventDefault();
    localStorage.setItem("custom_gemini_key", geminiKey);
    localStorage.setItem("custom_groq_key", groqKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Dashboard Settings</h2>
        <p>
          Manage your account preferences, system parameters, and LLM integrations.
        </p>
      </div>

      <div className="settings-card">
        {/* User Account Info Section */}
        <h3 className="settings-section-title">
          <FaUserShield /> Profile details
        </h3>

        <div className="settingItem">
          <div>
            <strong className="settings-item-title">Full Name</strong>
            <span className="settings-item-desc">Your profile display name</span>
          </div>
          <span className="settings-item-value">{user?.full_name || "N/A"}</span>
        </div>

        <div className="settingItem">
          <div>
            <strong className="settings-item-title">Email Address</strong>
            <span className="settings-item-desc">Primary login credentials identifier</span>
          </div>
          <span className="settings-item-value">{user?.email || "N/A"}</span>
        </div>

        <div className="settingItem">
          <div>
            <strong className="settings-item-title">Account Tier</strong>
            <span className="settings-item-desc">Your current access subscription plan tier</span>
          </div>
          <span className="settings-badge-plan">{user?.plan_type || "Free"} plan</span>
        </div>

        {/* API Credentials Integration */}
        <h3 className="settings-section-title llm-section">
          <FaKey /> LLM Service Integration (Optional)
        </h3>
        <p className="settings-description">
          You can specify your custom LLM API Keys to bypass default simulated evaluation modules and use real-time Google Gemini or Groq model instances for mock interview reviews.
        </p>

        {saved && (
          <div className="settings-success-msg">
            API Credentials configuration saved successfully!
          </div>
        )}

        <form onSubmit={handleSaveKeys} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label className="settings-item-label">
              Google Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="settings-input"
            />
          </div>

          <div>
            <label className="settings-item-label">
              Groq API Key
            </label>
            <input
              type="password"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="settings-input"
            />
          </div>

          <button type="submit" className="settings-save-btn">
            <FaSave /> Save Keys Configuration
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
