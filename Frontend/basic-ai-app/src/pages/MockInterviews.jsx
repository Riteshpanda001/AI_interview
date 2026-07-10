import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./MockInterviews.css";

import {
  FaRobot,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaPlus,
  FaHome,
} from "react-icons/fa";

import Dashboard from "./Dashboard";
import InterviewSetup from "./InterviewSetup";
import AIInterviewRoom from "./AIInterviewRoom";
import InterviewHistory from "./InterviewHistory";
import Settings from "./Settings";

const MockInterviews = () => {
  const navigate = useNavigate();
  const { user, token, loading, logout } = useAuth();

  const [activePage, setActivePage] = useState("dashboard");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState({
    company: "",
    role: "",
    experience: "",
    interviewType: "",
    language: "",
    duration: "",
  });

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !token) {
      navigate("/login");
    }
  }, [loading, token, navigate]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily: "'Poppins', sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #7c3aed",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }} />
          <h3 style={{ color: "#374151" }}>Loading PrepNova AI Dashboard...</h3>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!token) {
    return null; // Prevents render flicker before redirect
  }

  const handlePracticeNow = () => {
    setActivePage("setup");
  };

  const handleStartInterview = (data) => {
    setInterviewDetails(data);
    setInterviewStarted(true);
    setActivePage("room");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="mockInterview">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="logo">
          <FaRobot />
          <h2>PrepNova AI</h2>
        </div>

        <button
          className={`menuBtn ${activePage === "dashboard" ? "active" : ""}`}
          onClick={() => {
            setInterviewStarted(false);
            setActivePage("dashboard");
          }}
        >
          <FaHome />
          Dashboard
        </button>

        <button
          className={`menuBtn ${activePage === "setup" || activePage === "room" ? "active" : ""}`}
          onClick={() => {
            setInterviewStarted(false);
            setActivePage("setup");
          }}
        >
          <FaPlus />
          New Interview
        </button>

        <button
          className={`menuBtn ${activePage === "history" ? "active" : ""}`}
          onClick={() => setActivePage("history")}
        >
          <FaHistory />
          Interview History
        </button>

        <button
          className={`menuBtn ${activePage === "settings" ? "active" : ""}`}
          onClick={() => setActivePage("settings")}
        >
          <FaCog />
          Settings
        </button>

        <button
          className="logoutBtn"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          Logout
        </button>

      </aside>

      {/* Main Content */}

      <div className="mockContent">

        {activePage === "dashboard" && (
          <Dashboard
            onPracticeNow={handlePracticeNow}
          />
        )}

        {activePage === "setup" && (
          <InterviewSetup
            onStartInterview={handleStartInterview}
          />
        )}

        {activePage === "room" && interviewStarted && (
          <AIInterviewRoom
            interviewDetails={interviewDetails}
          />
        )}

        {activePage === "history" && (
          <InterviewHistory />
        )}

        {activePage === "settings" && (
          <Settings />
        )}

      </div>

    </div>
  );
};

export default MockInterviews;