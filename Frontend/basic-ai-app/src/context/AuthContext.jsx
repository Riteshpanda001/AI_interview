import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_BASE_URL = "http://localhost:8000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access_token") || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details if token exists
  const fetchCurrentUser = async (authToken) => {
    if (authToken === "mock-access-token-12345") {
      setUser({
        email: "simulated@prepnova.ai",
        full_name: "Simulated PrepNova Candidate",
        role: "User",
        plan_type: "free",
        created_at: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token might be expired or invalid
        logout();
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    } finally {
      setLoading(false);
    }
  };

  const loginSimulated = () => {
    localStorage.setItem("access_token", "mock-access-token-12345");
    setToken("mock-access-token-12345");
    setUser({
      email: "simulated@prepnova.ai",
      full_name: "Simulated PrepNova Candidate",
      role: "User",
      plan_type: "free",
      created_at: new Date().toISOString()
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to check email");
      }

      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Check email error:", error);
      throw error;
    }
  };

  // Register a new user (requires verification next)
  const register = async (fullName, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
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

  // Verify OTP to active account and log in
  const verifyOtp = async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "OTP verification failed");
      }

      localStorage.setItem("access_token", data.access_token);
      setToken(data.access_token);
      await fetchCurrentUser(data.access_token);
      return data;
    } catch (error) {
      console.error("OTP verification error:", error);
      throw error;
    }
  };

  // Standard login for active users
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        // Pass along verification requirements
        if (response.status === 403) {
          throw { status: 403, message: data.detail };
        }
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("access_token", data.access_token);
      setToken(data.access_token);
      await fetchCurrentUser(data.access_token);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Update profile details
  const updateProfile = async (fullName, password) => {
    try {
      const bodyData = {};
      if (fullName !== undefined) bodyData.full_name = fullName;
      if (password !== undefined) bodyData.password = password;

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
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

  // Logout
  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        checkEmail,
        register,
        verifyOtp,
        login,
        loginSimulated,
        updateProfile,
        logout,
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
