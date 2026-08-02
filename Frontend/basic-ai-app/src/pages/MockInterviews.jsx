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

import Dashboard from "../components/MockInterviews/Dashboard";
import InterviewSetup from "../components/MockInterviews/InterviewSetup";
import AIInterviewRoom from "../components/MockInterviews/AIInterviewRoom";
import InterviewHistory from "../components/MockInterviews/InterviewHistory";
import Settings from "../components/MockInterviews/Settings";

const MockInterviews = () => {
  const navigate = useNavigate();
  const { token, loading, logout } = useAuth();

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
            Loading PrepNova AI Dashboard...
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
            className={`menuBtn ${activePage === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setInterviewStarted(false);
              setActivePage("dashboard");
            }}
          >
            <FaHome />
            <span>Dashboard</span>
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