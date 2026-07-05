import React, { useState } from "react";
import "./Register.css";
import logo from "../assets/prenova_ai_logo.png";
import googleLogo from "../assets/google.png";


const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="register-page">

      <div className="register-container">

        <div className="register-left">

          <img src={logo} alt="PrepNova AI" />

          <h1>🚀Join PrepNova AI</h1>

          <p>
            Create your account and start preparing
            for your dream job with AI-powered interviews.
          </p>
          <img src="/images/register-ai.png" alt="AI Career" className="register-image"/>
 

        </div>

        <div className="register-right">

          <h2>Create Account</h2>

          <form>

            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <div className="password-box">

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>
            </div>

            <button className="register-btn">
              Create Account
            </button>

            <button className="google-btn">
              <img src={googleLogo} alt="Google" className="google-icon" />
              Continue with Google
            </button>

            <p className="login-link">
              Already have an account?
              <a href="/login"> Login</a>
            </p>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Register;