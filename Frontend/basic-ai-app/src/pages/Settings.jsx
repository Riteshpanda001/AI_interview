import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaSave, FaUserShield, FaKey, FaCog } from "react-icons/fa";

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
    <div style={{ fontFamily: "'Poppins', sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1f2937", marginBottom: "8px" }}>
          Dashboard Settings
        </h2>
        <p style={{ color: "#6b7280" }}>
          Manage your account preferences, system parameters, and LLM integrations.
        </p>
      </div>

      <div className="settingsCard" style={{
        background: "#ffffff",
        padding: "35px",
        borderRadius: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,.06)"
      }}>
        {/* User Account Info Section */}
        <h3 style={{
          fontSize: "18px",
          fontWeight: "700",
          color: "#7c3aed",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <FaUserShield /> Profile details
        </h3>

        <div className="settingItem">
          <div>
            <strong style={{ display: "block", color: "#374151" }}>Full Name</strong>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>Your profile display name</span>
          </div>
          <span style={{ fontWeight: "600", color: "#111827" }}>{user?.full_name || "N/A"}</span>
        </div>

        <div className="settingItem">
          <div>
            <strong style={{ display: "block", color: "#374151" }}>Email Address</strong>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>Primary login credentials identifier</span>
          </div>
          <span style={{ fontWeight: "600", color: "#111827" }}>{user?.email || "N/A"}</span>
        </div>

        <div className="settingItem">
          <div>
            <strong style={{ display: "block", color: "#374151" }}>Account Tier</strong>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>Your current access subscription plan tier</span>
          </div>
          <span className="profile-badge plan" style={{
            background: "#e0e7ff",
            color: "#4f46e5",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "bold",
            textTransform: "uppercase"
          }}>{user?.plan_type || "Free"} plan</span>
        </div>

        {/* API Credentials Integration */}
        <h3 style={{
          fontSize: "18px",
          fontWeight: "700",
          color: "#7c3aed",
          marginTop: "40px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <FaKey /> LLM Service Integration (Optional)
        </h3>
        <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, marginBottom: "20px" }}>
          You can specify your custom LLM API Keys to bypass default simulated evaluation modules and use real-time Google Gemini or Groq model instances for mock interview reviews.
        </p>

        {saved && (
          <div style={{
            background: "#ecfdf5",
            color: "#10b981",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "20px",
            textAlign: "center"
          }}>
            API Credentials configuration saved successfully!
          </div>
        )}

        <form onSubmit={handleSaveKeys} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              Google Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              Groq API Key
            </label>
            <input
              type="password"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              alignSelf: "flex-start",
              padding: "12px 25px",
              background: "#7c3aed",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 6px 15px rgba(124,58,237,0.2)"
            }}
          >
            <FaSave /> Save Keys Configuration
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
