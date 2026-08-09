import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import logo from "../assets/prenova_ai_logo.png";
import FeatureDropdown from "./FeatureDropdown";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useRequireAuth from "../hooks/useRequireAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { requireAuth } = useRequireAuth();

  const getActiveTabFromLocation = (pathname, hash) => {
    if (pathname === "/ats-score" || pathname === "/resume-upload") return "ATS Score";
    if (pathname === "/pricing") return "Pricing";
    if (pathname === "/contact") return "Contact";
    if (
      pathname === "/mock-interview" ||
      pathname === "/mock-interviews" ||
      pathname === "/resume-builder" ||
      pathname === "/coding-practice" ||
      pathname === "/company-preparation" ||
      hash === "#features"
    ) {
      return "Features";
    }
    if (pathname === "/") return "Home";
    return "Home";
  };

  const [active, setActive] = useState(() =>
    getActiveTabFromLocation(location.pathname, location.hash)
  );

  useEffect(() => {
    setActive(getActiveTabFromLocation(location.pathname, location.hash));
  }, [location.pathname, location.hash]);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
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

  const getPlanColor = (plan) => {
    if (!plan) return { bg: "#ede9fe", color: "#7c3aed" };
    const p = plan.toLowerCase();
    if (p === "pro") return { bg: "#fef3c7", color: "#d97706" };
    if (p === "enterprise") return { bg: "#dcfce7", color: "#16a34a" };
    return { bg: "#ede9fe", color: "#7c3aed" };
  };

  return (
    <nav className="navbar">

      {/* ================= Logo ================= */}
      <div className="logo">
        <img src={logo} alt="PrepNova AI" />
      </div>

      {/* ================= Navigation ================= */}
      <ul className="nav-links">

        <li>
          <a
            href="/"
            className={active === "Home" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActive("Home");
              navigate("/");
            }}
          >
            Home
          </a>
        </li>

        <li className="features-menu">
          <a
            href="/#features"
            className={active === "Features" ? "active" : ""}
            onClick={() => setActive("Features")}
          >
            Features
            <span className="arrow">
              ▼
            </span>
          </a>
          <FeatureDropdown />
        </li>

        <li>
          <a
            href="#"
            className={active === "ATS Score" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActive("ATS Score");
              navigate("/ats-score");
            }}
          >
            ATS Score
          </a>
        </li>

        <li>
          <a
            href="#"
            className={active === "Pricing" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActive("Pricing");
              navigate("/pricing");
            }}
          >
            Pricing
          </a>
        </li>

        <li>
          <a
            href="#"
            className={active === "Contact" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActive("Contact");
              navigate("/contact");
            }}
          >
            Contact
          </a>
        </li>

      </ul>

      {/* ================= Buttons / Profile ================= */}
      <div className="nav-buttons-container">
        {user ? (
          <div className="navbar-profile-wrapper" ref={profileRef}>

            {/* Clickable Avatar Circle */}
            <button
              id="navbar-profile-pill"
              className={`navbar-profile-pill icon-only${profileOpen ? " open" : ""}`}
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              aria-haspopup="true"
              title={user.full_name || "Profile"}
            >
              <div className="navbar-avatar">
                {getInitials(user.full_name)}
              </div>
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="profile-dropdown" role="menu">

                {/* Header */}
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-avatar">
                    {getInitials(user.full_name)}
                  </div>
                  <div className="profile-dropdown-info">
                    <span className="profile-dropdown-name">{user.full_name || "User"}</span>
                    <span className="profile-dropdown-email">{user.email}</span>
                  </div>
                </div>

                <div className="profile-dropdown-divider" />

                {/* Badges Row */}
                <div className="profile-dropdown-badges">
                  <span
                    className="profile-plan-badge"
                    style={{
                      background: getPlanColor(user.plan_type).bg,
                      color: getPlanColor(user.plan_type).color,
                    }}
                  >
                    {(user.plan_type || "Free").toUpperCase()} PLAN
                  </span>
                  <span className="profile-verified-badge">
                    ✓ Verified
                  </span>
                </div>

                {/* Member Since */}
                {user.created_at && (
                  <div className="profile-dropdown-meta">
                    <span className="profile-meta-label">Member since</span>
                    <span className="profile-meta-value">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}

                <div className="profile-dropdown-divider" />

                <button
                  className="profile-dropdown-item"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/dashboard");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "10px 14px",
                    background: "none",
                    border: "none",
                    color: "#e4e4e7",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "left",
                    borderRadius: "6px"
                  }}
                >
                  <span>📊</span> Dashboard
                </button>

                <button
                  className="profile-dropdown-item"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "10px 14px",
                    background: "none",
                    border: "none",
                    color: "#e4e4e7",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "left",
                    borderRadius: "6px"
                  }}
                >
                  <span>👤</span> My Profile & Security
                </button>

                {/* Logout */}
                <button
                  id="navbar-logout-btn"
                  className="profile-dropdown-logout"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <span className="logout-icon">⏻</span>
                  Sign Out
                </button>

              </div>
            )}
          </div>
        ) : (
          <div className="nav-buttons">
            <button
              className="navbar-login-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

            <button
              className="navbar-start-btn"
              onClick={() => navigate("/register")}
            >
              Get Started
            </button>
          </div>
        )}
      </div>

    </nav>
  );
};

export default Navbar;