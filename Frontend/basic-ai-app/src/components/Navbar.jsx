import React, { useState } from "react";
import "./Navbar.css";
import logo from "../assets/prenova_ai_logo.png";
import FeatureDropdown from "./FeatureDropdown";
import { useNavigate } from "react-router-dom";

const Navbar = () => {

  const navigate = useNavigate();

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

      {/* ================= Buttons ================= */}
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

    </nav>
  );
};

export default Navbar;