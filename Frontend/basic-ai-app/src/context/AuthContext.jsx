import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_BASE_URL = "http://localhost:8000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access_token") || null);
  const [refreshTokenStr, setRefreshTokenStr] = useState(localStorage.getItem("refresh_token") || null);
  const [loading, setLoading] = useState(true);

  // Helper: Save tokens to state & localStorage
  const saveTokens = (accessToken, newRefreshToken) => {
    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      setToken(accessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem("refresh_token", newRefreshToken);
      setRefreshTokenStr(newRefreshToken);
    }
  };

  // Helper: Clear tokens from state & localStorage
  const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setRefreshTokenStr(null);
    setUser(null);
  };

  // Perform Token Refresh
  const refreshToken = async () => {
    const currentRefreshToken = localStorage.getItem("refresh_token");
    if (!currentRefreshToken) {
      clearTokens();
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: currentRefreshToken }),
      });

      if (!response.ok) {
        clearTokens();
        return null;
      }

      const data = await response.json();
      saveTokens(data.access_token, data.refresh_token);
      return data.access_token;
    } catch (err) {
      console.error("Token refresh failed:", err);
      clearTokens();
      return null;
    }
  };

  // Authenticated Fetch Wrapper with Automatic Token Renewal on 401
  const authFetch = async (url, options = {}) => {
    let currentToken = localStorage.getItem("access_token");

    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${currentToken}`,
    };

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        const retryHeaders = {
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`,
        };
        response = await fetch(url, { ...options, headers: retryHeaders });
      }
    }

    return response;
  };

  // Fetch current user details
  const fetchCurrentUser = async (authToken) => {
    if (authToken === "mock-access-token-12345") {
      setUser({
        email: "simulated@prepnova.ai",
        full_name: "Simulated PrepNova Candidate",
        role: "User",
        plan_type: "free",
        target_role: "Software Engineer",
        experience_level: "Mid Level",
        bio: "AI Interview enthusiast",
        created_at: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/users/me`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        clearTokens();
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    } finally {
      setLoading(false);
    }
  };

  const loginSimulated = () => {
    saveTokens("mock-access-token-12345", "mock-refresh-token-12345");
    setUser({
      email: "simulated@prepnova.ai",
      full_name: "Simulated PrepNova Candidate",
      role: "User",
      plan_type: "free",
      target_role: "Software Engineer",
      experience_level: "Mid Level",
      bio: "AI Interview enthusiast",
      created_at: new Date().toISOString(),
    });
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  // Check if email exists in database
  const checkEmail = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to check email");
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Check email error:", error);
      throw error;
    }
  };

  // Register a new user
  const register = async (fullName, email, password, confirmPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          confirm_password: confirmPassword,
          full_name: fullName,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Resend OTP Code
  const resendOtp = async (email, purpose = "email_verification") => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to resend verification code");
      }
      return data;
    } catch (error) {
      console.error("Resend OTP error:", error);
      throw error;
    }
  };

  // Verify OTP & save dual tokens
  const verifyOtp = async (email, otp, purpose = "email_verification") => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "OTP verification failed");
      }

      saveTokens(data.access_token, data.refresh_token);
      await fetchCurrentUser(data.access_token);
      return data;
    } catch (error) {
      console.error("OTP verification error:", error);
      throw error;
    }
  };

  // Login with Email & Password
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
          throw { status: 403, message: data.detail || "Verify your email first." };
        }
        throw new Error(data.detail || "Login failed");
      }

      if (data.require_otp) {
        return data;
      }

      saveTokens(data.access_token, data.refresh_token);
      await fetchCurrentUser(data.access_token);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Google Login
  const googleLogin = async (credential) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Google authentication failed");
      }

      saveTokens(data.access_token, data.refresh_token);
      await fetchCurrentUser(data.access_token);
      return data;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  // Update Profile
  const updateProfile = async (updateData) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to update profile");
      }

      setUser(data);
      return data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  // Change Password
  const changePassword = async (oldPassword, newPassword, confirmPassword) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/users/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to change password");
      }
      return data;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Forgot password request failed");
      }
      return data;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  };

  // Reset Password
  const resetPassword = async (email, otp, newPassword, confirmPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Reset password failed");
      }
      return data;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  // Logout Endpoint & Session Cleanup
  const logout = async () => {
    try {
      if (token && token !== "mock-access-token-12345") {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.warn("Logout API call failed, proceeding to clear local session:", err);
    } finally {
      clearTokens();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        checkEmail,
        register,
        resendOtp,
        verifyOtp,
        login,
        googleLogin,
        loginSimulated,
        refreshToken,
        updateProfile,
        forgotPassword,
        resetPassword,
        changePassword,
        logout,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
