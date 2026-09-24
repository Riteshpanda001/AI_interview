import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-shell">
      <div className="notfound-glow glow-1" />
      <div className="notfound-glow glow-2" />

      <div className="notfound-card">
        {/* Animated 404 number */}
        <div className="notfound-code">
          <span className="digit digit-4">4</span>
          <span className="digit digit-0">
            <span className="orbit" />
            0
          </span>
          <span className="digit digit-4">4</span>
        </div>

        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-subtitle">
          The page you're looking for doesn't exist or has been moved.
          <br />
          Let's get you back on track.
        </p>

        <div className="notfound-actions">
          <button
            id="btn-back-dashboard"
            className="notfound-btn notfound-btn-primary"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
          <button
            id="btn-go-home"
            className="notfound-btn notfound-btn-secondary"
            onClick={() => navigate("/")}
          >
            Go Home
          </button>
        </div>

        <p className="notfound-hint">
          If you believe this is an error, please{" "}
          <span
            className="notfound-link"
            onClick={() => navigate("/contact")}
          >
            contact support
          </span>
          .
        </p>
      </div>
    </div>
  );
};

export default NotFound;
