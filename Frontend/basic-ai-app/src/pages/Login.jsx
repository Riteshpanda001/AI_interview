import React, { useState } from "react";
import "./Login.css";
import logo from "../assets/prenova_ai_logo.png";
import googleLogo from "../assets/google.png";


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">

      <div className="login-container">

        {/* Left Side */}

        <div className="login-left">

          <img src={logo} alt="PrepNova AI" />
          <h1>Welcome Back 👋</h1>

          <p>
            Sign in to continue your interview preparation journey
            with PrepNova AI.
          </p>
          <img src="/images/login-ai.png" alt="AI Interview" className="login-image" />

        </div>

        {/* Right Side */}

        <div className="login-right">

          <h2>Login</h2>

          <form>

            <div className="input-group">
              <label>Email Address</label>
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

            <div className="login-options">

              <label>
                <input type="checkbox" />
                Remember Me
              </label>

              <a href="/">Forgot Password?</a>

            </div>

            <button className="login-btn-main">Login</button>

            <button className="google-btn">
              <img src={googleLogo} alt="Google" className="google-icon" />
              Continue with Google
            </button>

            <p className="signup-text">
              Don't have an account?
              <a href="/register"> Create Account</a>
            </p>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Login;