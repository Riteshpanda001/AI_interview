import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./MockInterviews.css";

import logo from "../assets/prenova_ai_logo.png";

import {
  FaHome,
  FaPlus,
  FaHistory,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import MockInterviewWelcome from "../components/MockInterviews/MockInterviewWelcome";
import InterviewSetup from "../components/MockInterviews/InterviewSetup";
import AIInterviewRoom from "../components/MockInterviews/AIInterviewRoom";
import InterviewHistory from "../components/MockInterviews/InterviewHistory";
import Settings from "../components/MockInterviews/Settings";

const MockInterviews = () => {
  const navigate = useNavigate();
  const { token, loading, logout } = useAuth();

  const [activePage, setActivePage] = useState("welcome");

  const [interviewStarted, setInterviewStarted] = useState(false);

  const [interviewDetails, setInterviewDetails] = useState({
    company: "",
    role: "",
    experience: "",
    interviewType: "",
    language: "",
    duration: "",
  });

  /* ======================================
     Redirect to Login
  ====================================== */

  useEffect(() => {
    if (!loading && !token) {
      navigate("/login");
    }
  }, [loading, token, navigate]);

  /* ======================================
     Loader
  ====================================== */

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-box">
          <div className="loader-spinner"></div>

          <h3 className="loader-text">
            Loading PrepNova AI Workspace...
          </h3>
        </div>
      </div>
    );
  }

  if (!token) return null;

  /* ======================================
     Handlers
  ====================================== */

  const handlePracticeNow = () => {
    localStorage.removeItem("active_interview_session_id");
    localStorage.removeItem("active_interview_role_target");
    localStorage.removeItem("active_interview_type");
    setActivePage("setup");
  };

  const handleStartInterview = (data) => {
    localStorage.removeItem("active_interview_session_id");
    localStorage.removeItem("active_interview_role_target");
    localStorage.removeItem("active_interview_type");
    setInterviewDetails(data);
    setInterviewStarted(true);
    setActivePage("room");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* ======================================
     JSX
  ====================================== */

  return (
    <div className="mockInterview">

      {/* ================= Sidebar ================= */}

      <aside className="sidebar">

        <div className="sidebarHeader">

          <img
            src={logo}
            alt="PrepNova AI"
            className="sidebarLogo"
          />

          <span className="sidebarSubtitle">AI Interview Assistant</span>

        </div>

        <div className="sidebarMenu">

          <button
            className={`menuBtn ${activePage === "welcome" ? "active" : ""}`}
            onClick={() => {
              setInterviewStarted(false);
              setActivePage("welcome");
            }}
          >
            <FaHome />
            <span>Welcome</span>
          </button>

          <button
            className={`menuBtn ${activePage === "setup" || activePage === "room" ? "active" : ""}`}
            onClick={() => {
              setInterviewStarted(false);
              setActivePage("setup");
            }}
          >
            <FaPlus />
            <span>New Interview</span>
          </button>

          <button
            className={`menuBtn ${activePage === "history" ? "active" : ""}`}
            onClick={() => setActivePage("history")}
          >
            <FaHistory />
            <span>Interview History</span>
          </button>

        </div>

        <div className="bottomMenu">

          <button
            className={`menuBtn ${activePage === "settings" ? "active" : ""}`}
            onClick={() => setActivePage("settings")}
          >
            <FaCog />
            <span>Settings</span>
          </button>

          <button
            className="logoutBtn"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* ================= Main Content ================= */}

      <main className="mockContent">

        {activePage === "welcome" && (
          <MockInterviewWelcome
            onStartInterview={handlePracticeNow}
            onViewHistory={() => setActivePage("history")}
            onQuickPreset={handleStartInterview}
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
            onViewHistory={() => {
              setInterviewStarted(false);
              setActivePage("history");
            }}
            onStartNewSession={() => {
              setInterviewStarted(false);
              setActivePage("setup");
            }}
          />
        )}

        {activePage === "history" && (
          <InterviewHistory onStartNewSession={() => { setInterviewStarted(false); setActivePage("setup"); }} />
        )}

        {activePage === "settings" && (
          <Settings />
        )}

      </main>

    </div>
  );
};

export default MockInterviews;