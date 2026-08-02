import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/prenova_ai_logo.png";
import Dashboard from "../components/MockInterviews/Dashboard";
import InterviewSetup from "../components/MockInterviews/InterviewSetup";
import AIInterviewRoom from "../components/MockInterviews/AIInterviewRoom";
import InterviewHistory from "../components/MockInterviews/InterviewHistory";
import Settings from "../components/MockInterviews/Settings";
import "./DashboardPage.css";

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const pathname = window.location.pathname;
  const getSection = () => {
    if (pathname.includes("new-interview")) return "new-interview";
    if (pathname.includes("history")) return "history";
    if (pathname.includes("settings")) return "settings";
    return "dashboard";
  };

  const [section, setSection] = useState(getSection);
  const [interviewConfig, setInterviewConfig] = useState(null);
  const [interviewActive, setInterviewActive] = useState(false);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner" />
        <p>Loading your workspace...</p>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleStartInterview = (config) => {
    setInterviewConfig(config);
    setInterviewActive(true);
  };

  const handleInterviewEnd = () => {
    setInterviewActive(false);
    setInterviewConfig(null);
    setSection("history");
  };

  const renderContent = () => {
    if (interviewActive && interviewConfig) {
      return (
        <AIInterviewRoom
          config={interviewConfig}
          onInterviewEnd={handleInterviewEnd}
        />
      );
    }

    switch (section) {
      case "new-interview":
        return <InterviewSetup onStartInterview={handleStartInterview} />;
      case "history":
        return <InterviewHistory />;
      case "settings":
        return <Settings />;
      default:
        return (
          <Dashboard
            onPracticeNow={() => setSection("new-interview")}
          />
        );
    }
  };

  const pageTitles = {
    dashboard: "Dashboard",
    "new-interview": "New Interview",
    history: "Interview History",
    settings: "Settings",
  };

  return (
    <div className="dashboard-shell">
      <SidebarWithState section={section} setSection={setSection} />

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">{pageTitles[section] || "Dashboard"}</h1>
            <p className="topbar-subtitle">
              {section === "dashboard" && `Welcome back, ${user?.full_name?.split(" ")[0] || "there"}! 👋`}
              {section === "new-interview" && "Configure and start a new AI-powered mock interview session"}
              {section === "history" && "Review your past interview sessions and performance scores"}
              {section === "settings" && "Manage your account preferences and integrations"}
            </p>
          </div>
          <div className="topbar-right">
            <div className="topbar-avatar">{user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}</div>
          </div>
        </header>

        <div className="dashboard-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const SidebarWithState = ({ section, setSection }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNav = (path) => {
    if (path.includes("resume-builder")) {
      navigate("/resume-builder");
      return;
    }
    if (path.includes("ats-score") || path.includes("job-matcher")) {
      navigate("/ats-score");
      return;
    }
    if (path.includes("new-interview")) setSection("new-interview");
    else if (path.includes("history")) setSection("history");
    else if (path.includes("settings")) setSection("settings");
    else setSection("dashboard");
  };

  return (
    <SidebarInner
      onNav={handleNav}
      section={section}
      onLogout={() => { logout(); navigate("/login"); }}
    />
  );
};

const SidebarInner = ({ onNav, section, onLogout }) => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const NAV = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
    },
    {
      id: "new-interview",
      label: "New Interview",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
    },
    {
      id: "job-matcher",
      label: "AI Job Matcher",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>,
    },
    {
      id: "resume-builder",
      label: "AI Resume Builder",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    },
    {
      id: "history",
      label: "Interview History",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14" /><path d="M3.05 11a9 9 0 1 0 .5-4" /><polyline points="3 3 3 8 8 8" /></svg>,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img
          src={logo}
          alt="PrepNova AI"
          className="sidebar-logo-img"
        />
      </div>

      {user && (
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">{getInitials(user.full_name)}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.full_name || "User"}</span>
            <span className="sidebar-user-email">{user.email}</span>
          </div>
        </div>
      )}

      <div className="sidebar-divider" />

      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Main Menu</p>
        {NAV.map((item) => (
          <button
            key={item.id}
            id={`sidebar-${item.id}`}
            className={`sidebar-nav-btn${section === item.id ? " active" : ""}`}
            onClick={() => onNav(item.id === "job-matcher" ? "/ats-score" : item.id === "resume-builder" ? "/resume-builder" : `/dashboard/${item.id}`)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
            {section === item.id && <span className="sidebar-active-dot" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="sidebar-bottom">
        <div className="sidebar-divider" />

        <button
          id="sidebar-settings"
          className={`sidebar-nav-btn${section === "settings" ? " active" : ""}`}
          onClick={() => onNav("/dashboard/settings")}
        >
          <span className="sidebar-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          <span className="sidebar-nav-label">Settings</span>
          {section === "settings" && <span className="sidebar-active-dot" />}
        </button>

        <button
          id="sidebar-logout-btn"
          className="sidebar-logout-btn"
          onClick={onLogout}
        >
          <span className="sidebar-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          <span className="sidebar-nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardPage;
