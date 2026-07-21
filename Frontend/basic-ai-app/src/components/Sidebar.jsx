import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/prenova_ai_logo.png";
import "./Sidebar.css";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "new-interview",
    label: "New Interview",
    path: "/dashboard/new-interview",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    id: "interview-history",
    label: "Interview History",
    path: "/dashboard/history",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="12 8 12 12 14 14" />
        <path d="M3.05 11a9 9 0 1 0 .5-4" />
        <polyline points="3 3 3 8 8 8" />
      </svg>
    ),
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
      : parts[0][0].toUpperCase();
  };

  return (
    <aside className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo" onClick={() => navigate("/")}>
        <img src={logo} alt="PrepNova AI" className="sidebar-logo-img" />
      </div>

      {/* ── User mini-profile ── */}
      {user && (
        <div className="sidebar-user-card" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
          <div className="sidebar-user-avatar">{getInitials(user.full_name)}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.full_name || "User"}</span>
            <span className="sidebar-user-email">{user.email}</span>
          </div>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="sidebar-divider" />

      {/* ── Main Nav ── */}
      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Main Menu</p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            id={`sidebar-${item.id}`}
            className={`sidebar-nav-btn${isActive(item.path) ? " active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
            {isActive(item.path) && <span className="sidebar-active-dot" />}
          </button>
        ))}
      </nav>

      {/* ── Spacer ── */}
      <div className="sidebar-spacer" />

      {/* ── Bottom: Settings + Logout ── */}
      <div className="sidebar-bottom">
        <div className="sidebar-divider" />

        <button
          id="sidebar-settings"
          className={`sidebar-nav-btn${isActive("/profile") ? " active" : ""}`}
          onClick={() => navigate("/profile")}
        >
          <span className="sidebar-nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          <span className="sidebar-nav-label">Settings</span>
        </button>

        <button
          id="sidebar-logout-btn"
          className="sidebar-logout-btn"
          onClick={handleLogout}
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

export default Sidebar;
