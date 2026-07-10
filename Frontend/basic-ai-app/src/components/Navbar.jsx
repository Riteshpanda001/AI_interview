import React, { useState } from "react";
import "./Navbar.css";
import logo from "../assets/prenova_ai_logo.png";
import FeatureDropdown from "./FeatureDropdown";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Active Menu
  const [active, setActive] = useState("Home");

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
            onClick={() => setActive("Home")}
          >
            Home
          </a>
        </li>

        <li
          className="features-menu"
          onMouseEnter={() => setActive("Features")}
          onMouseLeave={() => setActive("")}
        >
          <a
            href="/#features"
            className={active === "Features" ? "active" : ""}
          >
            Features
            <span
              className={
                active === "Features"
                  ? "arrow rotate"
                  : "arrow"
              }
            >
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
          <div className="navbar-profile-box">
            <div className="navbar-avatar">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="navbar-profile-details">
              <span className="navbar-username">{user.full_name}</span>
              <span className="navbar-tier">{user.plan_type.toUpperCase()}</span>
            </div>
            <button
              className="navbar-logout-btn"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
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