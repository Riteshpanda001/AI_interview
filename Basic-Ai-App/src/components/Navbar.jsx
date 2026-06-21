import React from "react";
import "./Navbar.css";
import logo from "../assets/prenova_ai_logo.png";

const Navbar = () => {
  return (
    <nav className="navbar">

      {/* Logo Section */}
      <div className="logo">
        <img src={logo} alt="PrepNova AI" />
      </div>

      {/* Center Navigation */}
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#ats">ATS Score</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      {/* Right Buttons */}
      <div className="nav-buttons">
        <button className="login-btn">Login</button>
        <button className="start-btn">Get Started</button>
      </div>

    </nav>
  );
};

export default Navbar;