import React, { createContext, useContext, useState, useEffect } from "react";

import { API_BASE_URL } from "../utils/apiConfig";

const AuthContext = createContext(null);

export class AuthError extends Error {
  constructor(message, status = 0, code = null, isNetworkError = false) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.code = code;
    this.isNetworkError = isNetworkError;
  }
}

export const extractErrorMessage = (data, defaultMsg = null) => {
  if (!data) return defaultMsg;
  if (typeof data.detail === "string" && data.detail.trim()) {
    return data.detail;
  }
  if (Array.isArray(data.detail) && data.detail.length > 0) {
    const firstErr = data.detail[0];
    if (typeof firstErr === "string") return firstErr;
    if (firstErr && typeof firstErr.msg === "string") return firstErr.msg;
  }
  if (typeof data.detail === "object" && data.detail !== null) {
    if (typeof data.detail.msg === "string") return data.detail.msg;
    if (typeof data.detail.message === "string") return data.detail.message;
  }
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }
  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }
  return defaultMsg;
};

export const handleApiError = async (response) => {
  const status = response.status;
  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    // Body is not JSON
  }

  const extractedMsg = extractErrorMessage(data, null);
  const code = data?.code || data?.status || null;

  let message = "";

  switch (status) {
    case 400:
      message = extractedMsg || "Invalid request. Please check your details.";
      break;
    case 401:
      message = extractedMsg || "Authentication failed. Please log in again.";
      break;
    case 403:
      message = extractedMsg || "You do not have permission to perform this action.";
      break;
    case 409:
      if (extractedMsg) {
        message = extractedMsg;
      } else if (code === "EMAIL_ALREADY_REGISTERED") {
        message = "An account with this email already exists.";
      } else if (code === "PHONE_ALREADY_REGISTERED") {
        message = "This mobile number is already registered.";
      } else {
        message = "An account with these details already exists.";
      }
      break;
    case 422:
      message = extractedMsg || "Please enter valid information.";
      break;
    case 429:
      message = "Too many requests. Please wait and try again.";
      break;
    case 500:
      message = "Something went wrong on the server. Please try again.";
      break;
    case 503:
      message = "The service is temporarily unavailable. Please try again later.";
      break;
    default:
      message = extractedMsg || `Request failed with status code ${status}.`;
  }

  throw new AuthError(message, status, code, false);
};

export const catchNetworkError = (error, defaultMsg = "Operation failed.") => {
  if (error instanceof AuthError) {
    throw error;
  }

  const isNetworkFailure =
    (error?.name === "TypeError" &&
      (error?.message?.toLowerCase().includes("fetch") ||
       error?.message?.toLowerCase().includes("networkerror") ||
       error?.message?.toLowerCase().includes("network error") ||
       error?.message?.toLowerCase().includes("failed to fetch"))) ||
    error?.message === "Failed to fetch" ||
    error?.message?.includes("ECONNREFUSED");

  if (isNetworkFailure) {
    throw new AuthError(
      "Unable to connect to backend server. Please make sure the backend is running on http://localhost:8000.",
      0,
      "NETWORK_ERROR",
      true
    );
  }

  throw new AuthError(error?.message || defaultMsg, 0, null, false);
};

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

  // Helper: Clear tokens and ALL user/session state from localStorage & sessionStorage
  const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("active_interview_session_id");
    localStorage.removeItem("active_interview_role_target");
    localStorage.removeItem("active_interview_type");
    localStorage.removeItem("mock_setup_prefill");
    localStorage.removeItem("active_resume_data");
    localStorage.removeItem("user_solved_problem_ids");
    localStorage.removeItem("coding_problems_solved");
    localStorage.removeItem("company_dsa_solved_ids");
    try {
      sessionStorage.clear();
    } catch (e) {
      // Ignore
    }
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

  // Helper to check if URL is a public auth endpoint that should not receive Bearer tokens
  const isPublicAuthEndpoint = (urlStr) => {
    if (!urlStr) return false;
    const publicPaths = [
      "/auth/register",
      "/auth/login",
      "/auth/google",
      "/auth/check-registration",
      "/auth/check-email",
      "/auth/forgot-password",
      "/auth/verify-otp",
      "/auth/resend-otp",
      "/auth/verify-email-link",
      "/auth/resend-verification-email",
      "/auth/reset-password",
      "/auth/verify-password-reset-otp",
      "/auth/send-mobile-otp",
      "/auth/verify-mobile-otp",
      "/auth/verify-mfa-login"
    ];
    return publicPaths.some((p) => urlStr.includes(p));
  };

  // Authenticated Fetch Wrapper with Automatic Token Renewal on 401
  const authFetch = async (url, options = {}) => {
    const isPublic = isPublicAuthEndpoint(url);
    let currentToken = isPublic ? null : (localStorage.getItem("access_token") || localStorage.getItem("token"));

    const headers = {
      ...(options.headers || {}),
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
    };

    let response = await fetch(url, { ...options, headers, credentials: options.credentials || "include" });

    if (response.status === 401 && !isPublic) {
      const newToken = await refreshToken();
      if (newToken) {
        const retryHeaders = {
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`,
        };
        response = await fetch(url, { ...options, headers: retryHeaders, credentials: options.credentials || "include" });
      }
    }

    return response;
  };

  // Fetch current user details from backend
  const fetchCurrentUser = async (authToken) => {
    if (!authToken) {
      setLoading(false);
      return null;
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
      clearTokens();
      return null;
    } finally {
      setLoading(false);
    }
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

      if (!response.ok) {
        await handleApiError(response);
      }
      const data = await response.json();
      return data.exists;
    } catch (error) {
      catchNetworkError(error, "Failed to check email");
    }
  };

  // Check registration status
  const checkRegistration = async (email, phone) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return await response.json();
    } catch (error) {
      catchNetworkError(error, "Registration check failed");
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

      if (!response.ok) {
        await handleApiError(response);
      }
      return await response.json();
    } catch (error) {
      catchNetworkError(error, "Registration failed");
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

      if (!response.ok) {
        await handleApiError(response);
      }
      return await response.json();
    } catch (error) {
      catchNetworkError(error, "Failed to resend verification code");
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      saveTokens(data.access_token, data.refresh_token);
      const userObj = await fetchCurrentUser(data.access_token);
      return { ...data, user: userObj };
    } catch (error) {
      catchNetworkError(error, "OTP verification failed");
    }
  };

  // Verify Email Link
  const verifyEmailLink = async (linkToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: linkToken }),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      if (data.access_token && data.refresh_token) {
        saveTokens(data.access_token, data.refresh_token);
      }
      return data;
    } catch (error) {
      catchNetworkError(error, "Email link verification failed");
    }
  };

  // Resend Verification Email Link
  const resendVerificationLink = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return await response.json();
    } catch (error) {
      catchNetworkError(error, "Failed to resend verification link");
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();

      if (data.require_otp) {
        return data;
      }

      saveTokens(data.access_token, data.refresh_token);
      const userObj = await fetchCurrentUser(data.access_token);
      return { ...data, user: userObj };
    } catch (error) {
      catchNetworkError(error, "Login failed");
    }
  };

  // Google Login
  const googleLogin = async (credential, phone = null, otp = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential, phone, otp }),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();

      if (data.access_token) {
        saveTokens(data.access_token, data.refresh_token);
        const userObj = await fetchCurrentUser(data.access_token);
        return { ...data, user: userObj };
      }
      return data;
    } catch (error) {
      catchNetworkError(error, "Google authentication failed");
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      setUser(data);
      return data;
    } catch (error) {
      catchNetworkError(error, "Failed to update profile");
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

      if (!response.ok) {
        await handleApiError(response);
      }
      return await response.json();
    } catch (error) {
      catchNetworkError(error, "Failed to change password");
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

      if (!response.ok) {
        await handleApiError(response);
      }
      return await response.json();
    } catch (error) {
      catchNetworkError(error, "Forgot password request failed");
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

      if (!response.ok) {
        await handleApiError(response);
      }
      return await response.json();
    } catch (error) {
      catchNetworkError(error, "Verify password reset OTP error");
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

      if (!response.ok) {
        await handleApiError(response);
      }
      return await response.json();
    } catch (error) {
      catchNetworkError(error, "Reset password failed");
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

      if (!response.ok) {
        await handleApiError(response);
      }
      return await response.json();
    } catch (error) {
      catchNetworkError(error, "Failed to send mobile verification SMS");
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      if (data.access_token) {
        saveTokens(data.access_token, data.refresh_token);
        const userObj = await fetchCurrentUser(data.access_token);
        return { ...data, user: userObj };
      }

      if (user) {
        setUser({ ...user, phone, phone_verified: true });
      }
      return data;
    } catch (error) {
      catchNetworkError(error, "SMS verification code invalid");
    }
  };

  // Logout Endpoint & Complete Session Cleanup
  const logout = async () => {
    try {
      const currentToken = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (currentToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${currentToken}` },
          credentials: "include",
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
      if (!response.ok) await handleApiError(response);
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
      if (!response.ok) await handleApiError(response);
      return await response.json();
    } catch (error) {
      catchNetworkError(error, "Failed to revoke session");
    }
  };

  const revokeOtherSessions = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/users/sessions/revoke-others`, {
        method: "POST",
      });
      if (!response.ok) await handleApiError(response);
      return await response.json();
    } catch (error) {
      catchNetworkError(error, "Failed to revoke other sessions");
    }
  };

  // Login Activity
  const getLoginActivity = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/users/login-activity`);
      if (!response.ok) await handleApiError(response);
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      clearTokens();
      return data;
    } catch (error) {
      catchNetworkError(error, "Account deletion failed");
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

      if (!response.ok) {
        await handleApiError(response);
      }
      return await response.json();
    } catch (error) {
      catchNetworkError(error, "Failed to send email verification code.");
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      const currentToken = localStorage.getItem("access_token") || localStorage.getItem("token");
      await fetchCurrentUser(currentToken);
      return data;
    } catch (error) {
      catchNetworkError(error, "Failed to verify email change.");
    }
  };

  // Get MFA Status
  const getMfaStatus = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/auth/mfa/status`);
      if (!response.ok) await handleApiError(response);
      return await response.json();
    } catch (error) {
      catchNetworkError(error, "Failed to fetch MFA status");
    }
  };

  // Setup TOTP
  const setupTotp = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/auth/mfa/setup-totp`, {
        method: "POST",
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return await response.json();
    } catch (error) {
      catchNetworkError(error, "Failed to initiate TOTP setup");
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      if (user) {
        setUser({ ...user, mfa_totp_enabled: true });
      }
      return data;
    } catch (error) {
      catchNetworkError(error, "Failed to verify and enable TOTP");
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      if (user) {
        setUser({ ...user, mfa_totp_enabled: false });
      }
      return data;
    } catch (error) {
      catchNetworkError(error, "Failed to disable TOTP");
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      if (user) {
        setUser({ ...user, mfa_phone_enabled: enabled });
      }
      return data;
    } catch (error) {
      catchNetworkError(error, "Failed to toggle Phone OTP MFA");
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      saveTokens(data.access_token, data.refresh_token);
      const userObj = await fetchCurrentUser(data.access_token);
      return { ...data, user: userObj };
    } catch (error) {
      catchNetworkError(error, "MFA login verification failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        checkEmail,
        checkRegistration,
        register,
        resendOtp,
        verifyOtp,
        verifyEmailLink,
        resendVerificationLink,
        login,
        googleLogin,
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

