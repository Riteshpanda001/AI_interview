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
      localStorage.setItem("token", accessToken);
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
    localStorage.removeItem("token");
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
    let currentToken = localStorage.getItem("access_token") || localStorage.getItem("token");

    const headers = {
      ...(options.headers || {}),
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
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
      const mockUser = {
        email: "simulated@prepnova.ai",
        full_name: "Simulated PrepNova Candidate",
        role: "User",
        plan_type: "free",
        target_role: "Software Engineer",
        experience_level: "Mid Level",
        bio: "AI Interview enthusiast",
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      setLoading(false);
      return mockUser;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/users/me`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return userData;
      } else {
        clearTokens();
        return null;
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
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
  const register = async (fullName, email, password, confirmPassword, phone, gender) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          confirm_password: confirmPassword,
          full_name: fullName,
          phone,
          gender,
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
      const userObj = await fetchCurrentUser(data.access_token);
      return { ...data, user: userObj };
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
      const userObj = await fetchCurrentUser(data.access_token);
      return { ...data, user: userObj };
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
      const userObj = await fetchCurrentUser(data.access_token);
      return { ...data, user: userObj };
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

  // Verify Password Reset OTP & Obtain Reset Token
  const verifyPasswordResetOtp = async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-password-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose: "password_reset" }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Invalid or expired recovery code.");
      }
      return data;
    } catch (error) {
      console.error("Verify password reset OTP error:", error);
      throw error;
    }
  };

  // Reset Password with reset_token or otp
  const resetPassword = async (email, newPassword, confirmPassword, resetToken = null, otp = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          new_password: newPassword,
          confirm_password: confirmPassword,
          reset_token: resetToken,
          otp: otp,
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

  // Send Mobile SMS OTP
  const sendMobileOtp = async (phone) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-mobile-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to send mobile verification SMS");
      }
      return data;
    } catch (error) {
      console.error("Send mobile OTP error:", error);
      throw error;
    }
  };

  // Verify Mobile SMS OTP
  const verifyMobileOtp = async (phone, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-mobile-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "SMS verification code invalid");
      }

      if (user) {
        setUser({ ...user, phone, phone_verified: true });
      }
      return data;
    } catch (error) {
      console.error("Verify mobile OTP error:", error);
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

  // Session Management
  const getSessions = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/users/sessions`);
      if (!response.ok) throw new Error("Failed to fetch sessions");
      return await response.json();
    } catch (error) {
      console.error("Fetch sessions error:", error);
      return [];
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/users/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to revoke session");
      return await response.json();
    } catch (error) {
      console.error("Revoke session error:", error);
      throw error;
    }
  };

  const revokeOtherSessions = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/users/sessions/revoke-others`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to revoke other sessions");
      return await response.json();
    } catch (error) {
      console.error("Revoke other sessions error:", error);
      throw error;
    }
  };

  // Login Activity
  const getLoginActivity = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/users/login-activity`);
      if (!response.ok) throw new Error("Failed to fetch login activity");
      return await response.json();
    } catch (error) {
      console.error("Fetch login activity error:", error);
      return [];
    }
  };

  // Account Deletion
  const deleteAccount = async (password) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/users/me`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Account deletion failed");
      }

      clearTokens();
      return data;
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
  };

  // Request Email Change
  const requestEmailChange = async (newEmail, password) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/auth/request-email-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_email: newEmail, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to send email verification code.");
      }
      return data;
    } catch (error) {
      console.error("Request email change error:", error);
      throw error;
    }
  };

  // Verify Email Change
  const verifyEmailChange = async (newEmail, otp) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/auth/verify-email-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_email: newEmail, otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to verify email change.");
      }
      const currentToken = localStorage.getItem("access_token") || localStorage.getItem("token");
      await fetchCurrentUser(currentToken);
      return data;
    } catch (error) {
      console.error("Verify email change error:", error);
      throw error;
    }
  };

  // Get MFA Status
  const getMfaStatus = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/auth/mfa/status`);
      if (!response.ok) throw new Error("Failed to fetch MFA status");
      return await response.json();
    } catch (error) {
      console.error("Get MFA status error:", error);
      throw error;
    }
  };

  // Setup TOTP
  const setupTotp = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/auth/mfa/setup-totp`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to initiate TOTP setup");
      }
      return data;
    } catch (error) {
      console.error("Setup TOTP error:", error);
      throw error;
    }
  };

  // Enable TOTP
  const enableTotp = async (code) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/auth/mfa/enable-totp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to verify and enable TOTP");
      }
      if (user) {
        setUser({ ...user, mfa_totp_enabled: true });
      }
      return data;
    } catch (error) {
      console.error("Enable TOTP error:", error);
      throw error;
    }
  };

  // Disable TOTP
  const disableTotp = async (code) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/auth/mfa/disable-totp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to disable TOTP");
      }
      if (user) {
        setUser({ ...user, mfa_totp_enabled: false });
      }
      return data;
    } catch (error) {
      console.error("Disable TOTP error:", error);
      throw error;
    }
  };

  // Toggle Phone MFA
  const togglePhoneMfa = async (enabled) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/auth/mfa/toggle-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to toggle Phone OTP MFA");
      }
      if (user) {
        setUser({ ...user, mfa_phone_enabled: enabled });
      }
      return data;
    } catch (error) {
      console.error("Toggle Phone MFA error:", error);
      throw error;
    }
  };

  // Verify MFA Login
  const verifyMfaLogin = async (email, otp, mfaType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-mfa-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, mfa_type: mfaType }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "MFA login verification failed");
      }
      saveTokens(data.access_token, data.refresh_token);
      const userObj = await fetchCurrentUser(data.access_token);
      return { ...data, user: userObj };
    } catch (error) {
      console.error("Verify MFA Login error:", error);
      throw error;
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
        verifyPasswordResetOtp,
        resetPassword,
        sendMobileOtp,
        verifyMobileOtp,
        changePassword,
        requestEmailChange,
        verifyEmailChange,
        logout,
        authFetch,
        getSessions,
        revokeSession,
        revokeOtherSessions,
        getLoginActivity,
        deleteAccount,
        getMfaStatus,
        setupTotp,
        enableTotp,
        disableTotp,
        togglePhoneMfa,
        verifyMfaLogin,
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
