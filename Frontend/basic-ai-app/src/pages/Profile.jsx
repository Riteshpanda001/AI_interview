import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const {
    user,
    updateProfile,
    changePassword,
    logout,
    deleteAccount,
    getMfaStatus,
    setupTotp,
    enableTotp,
    disableTotp,
    togglePhoneMfa,
    sendMobileOtp,
    verifyMobileOtp,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("info");

  // Profile Form States
  const [fullName, setFullName] = useState(() => user?.full_name || "");
  const [phone, setPhone] = useState(() => user?.phone || "");
  const [gender, setGender] = useState(() => user?.gender || "Male");
  const [targetRole, setTargetRole] = useState(() => user?.target_role || "Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState(() => user?.experience_level || "Mid Level");
  const [bio, setBio] = useState(() => user?.bio || "");

  // MFA States
  const [mfaStatus, setMfaStatus] = useState({
    mfa_phone_enabled: false,
    mfa_totp_enabled: false,
    phone_verified: false,
    phone: ""
  });
  const [totpSetupData, setTotpSetupData] = useState(null); // { secret, qr_code_url }
  const [totpCode, setTotpCode] = useState("");
  const [disableTotpCode, setDisableTotpCode] = useState("");
  const [showTotpSetup, setShowTotpSetup] = useState(false);
  const [showTotpDisable, setShowTotpDisable] = useState(false);
  
  // Phone Verification for MFA States
  const [mfaPhoneNum, setMfaPhoneNum] = useState(() => user?.phone || "");
  const [mfaPhoneCode, setMfaPhoneCode] = useState("");
  const [isMfaPhoneVerifying, setIsMfaPhoneVerifying] = useState(false);
  const [showMfaPhoneVerify, setShowMfaPhoneVerify] = useState(false);
  
  const [mfaMessage, setMfaMessage] = useState({ type: "", text: "" });

  const fetchMfaStatus = async () => {
    try {
      const status = await getMfaStatus();
      setMfaStatus(status);
      if (status.phone) setMfaPhoneNum(status.phone);
    } catch (err) {
      console.error("Failed to load MFA status:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "security") {
      fetchMfaStatus();
    }
  }, [activeTab]);

  const handleInitiateTotp = async () => {
    setMfaMessage({ type: "", text: "" });
    try {
      const setupData = await setupTotp();
      setTotpSetupData(setupData);
      setShowTotpSetup(true);
    } catch (err) {
      setMfaMessage({ type: "error", text: err.message || "Failed to initiate TOTP setup." });
    }
  };

  const handleEnableTotpSubmit = async (e) => {
    e.preventDefault();
    setMfaMessage({ type: "", text: "" });
    try {
      await enableTotp(totpCode);
      setMfaMessage({ type: "success", text: "Google Authenticator MFA enabled successfully!" });
      setTotpCode("");
      setTotpSetupData(null);
      setShowTotpSetup(false);
      fetchMfaStatus();
    } catch (err) {
      setMfaMessage({ type: "error", text: err.message || "Invalid verification code." });
    }
  };

  const handleDisableTotpSubmit = async (e) => {
    e.preventDefault();
    setMfaMessage({ type: "", text: "" });
    try {
      await disableTotp(disableTotpCode);
      setMfaMessage({ type: "success", text: "Google Authenticator MFA disabled successfully." });
      setDisableTotpCode("");
      setShowTotpDisable(false);
      fetchMfaStatus();
    } catch (err) {
      setMfaMessage({ type: "error", text: err.message || "Invalid verification code." });
    }
  };

  const handleTogglePhoneMfa = async (e) => {
    const checked = e.target.checked;
    setMfaMessage({ type: "", text: "" });
    try {
      await togglePhoneMfa(checked);
      setMfaMessage({ type: "success", text: `Phone OTP MFA ${checked ? "enabled" : "disabled"} successfully.` });
      fetchMfaStatus();
    } catch (err) {
      setMfaMessage({ type: "error", text: err.message || "Failed to toggle Phone OTP MFA." });
    }
  };

  const handleSendPhoneVerifySms = async () => {
    setMfaMessage({ type: "", text: "" });
    if (!mfaPhoneNum || mfaPhoneNum.trim().length < 10) {
      setMfaMessage({ type: "error", text: "Please enter a valid phone number." });
      return;
    }
    try {
      await sendMobileOtp(mfaPhoneNum.trim());
      setShowMfaPhoneVerify(true);
      setMfaMessage({ type: "success", text: "SMS verification code sent to your phone." });
    } catch (err) {
      setMfaMessage({ type: "error", text: err.message || "Failed to send verification SMS." });
    }
  };

  const handleVerifyPhoneCodeSubmit = async (e) => {
    e.preventDefault();
    setMfaMessage({ type: "", text: "" });
    try {
      setIsMfaPhoneVerifying(true);
      await verifyMobileOtp(mfaPhoneNum.trim(), mfaPhoneCode);
      setMfaMessage({ type: "success", text: "Phone number verified successfully! You can now enable Phone OTP MFA." });
      setMfaPhoneCode("");
      setShowMfaPhoneVerify(false);
      fetchMfaStatus();
    } catch (err) {
      setMfaMessage({ type: "error", text: err.message || "Invalid phone verification code." });
    } finally {
      setIsMfaPhoneVerifying(false);
    }
  };
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  // Security Form States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [securityMessage, setSecurityMessage] = useState({ type: "", text: "" });

  // Account Deletion Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (user) {
      if (user.full_name) setFullName(user.full_name);
      if (user.phone) setPhone(user.phone);
      if (user.gender) setGender(user.gender);
      if (user.target_role) setTargetRole(user.target_role);
      if (user.experience_level) setExperienceLevel(user.experience_level);
      if (user.bio) setBio(user.bio);
    }
  }, [user?.full_name, user?.phone, user?.gender, user?.target_role, user?.experience_level, user?.bio]);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount(deletePassword);
      setShowDeleteModal(false);
      navigate("/register");
    } catch (err) {
      setDeleteError(err.message || "Failed to delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-loading-screen">
        <Navbar />
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage({ type: "", text: "" });

    try {
      await updateProfile({
        full_name: fullName,
        phone,
        gender,
        target_role: targetRole,
        experience_level: experienceLevel,
        bio,
      });
      setProfileMessage({ type: "success", text: "Profile details updated successfully!" });
    } catch (err) {
      setProfileMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSecurityMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setSecurityMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setIsChangingPassword(true);
    setSecurityMessage({ type: "", text: "" });

    try {
      await changePassword(oldPassword, newPassword, confirmPassword);
      setSecurityMessage({ type: "success", text: "Password changed successfully!" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setSecurityMessage({ type: "error", text: err.message || "Failed to change password." });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
      : parts[0][0].toUpperCase();
  };

  return (
    <div className="profile-page">
      <Navbar />

      <main className="profile-container">
        {/* Profile Banner */}
        <div className="profile-banner">
          <div className="profile-avatar-large">
            {getInitials(user.full_name)}
          </div>
          <div className="profile-header-details">
            <h1>{user.full_name || "PreNova Candidate"}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-header-badges">
              <span className="badge badge-plan">
                {(user.plan_type || "Free").toUpperCase()} PLAN
              </span>
              <span className="badge badge-role">
                {user.role || "Candidate"}
              </span>
              <span className="badge badge-status">
                ✓ Active & Verified
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            👤 Personal Details
          </button>
          <button
            className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            🔒 Security & Activity
          </button>
          <button
            className={`tab-btn ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            💳 Subscription & Plan
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-tab-content">
          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === "info" && (
            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <h2>Personal Information</h2>
              <p className="form-subheading">Update your interview profile and career target preferences.</p>

              {profileMessage.text && (
                <div className={`alert-box ${profileMessage.type}`}>
                  {profileMessage.text}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={user.email} disabled className="disabled-input" />
                  <span className="input-hint">Email cannot be changed directly</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 555-0199"
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Target Job Role</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  >
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Data Scientist / AI Engineer">Data Scientist / AI Engineer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                  >
                    <option value="Entry Level (0-2 yrs)">Entry Level (0-2 yrs)</option>
                    <option value="Mid Level (2-5 yrs)">Mid Level (2-5 yrs)</option>
                    <option value="Senior Level (5+ yrs)">Senior Level (5+ yrs)</option>
                    <option value="Staff / Lead Engineer">Staff / Lead Engineer</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Professional Bio / Goals</label>
                <textarea
                  rows="4"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short summary of your background and career target..."
                />
              </div>

              <button
                type="submit"
                className="btn-save-profile"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? "Saving Changes..." : "Save Profile Details"}
              </button>
            </form>
          )}

          {/* TAB 2: SECURITY & ACTIVITY */}
          {activeTab === "security" && (
            <div>
              <form className="profile-form" onSubmit={handlePasswordSubmit}>
                <h2>Security & Password</h2>
                <p className="form-subheading">Change your account password to maintain maximum account security.</p>

                {securityMessage.text && (
                  <div className={`alert-box ${securityMessage.type}`}>
                    {securityMessage.text}
                  </div>
                )}

                {user.provider === "email" && (
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-save-security"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? "Updating Password..." : "Change Password"}
                </button>
              </form>

              {/* MFA Section */}
              <div className="profile-form" style={{ marginTop: "32px" }}>
                <h2>Multi-Factor Authentication (MFA)</h2>
                <p className="form-subheading">Enhance your account security by requiring an extra verification code upon logging in.</p>
                
                {mfaMessage.text && (
                  <div className={`alert-box ${mfaMessage.type}`} style={{ marginBottom: "20px" }}>
                    {mfaMessage.text}
                  </div>
                )}

                <div className="mfa-methods-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  
                  {/* Method 1: Google Authenticator (TOTP) */}
                  <div className="mfa-method-card" style={{ padding: "20px", border: "1px solid #27272a", borderRadius: "12px", backgroundColor: "#09090b" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                      <div>
                        <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "#e4e4e7", display: "flex", alignItems: "center", gap: "8px" }}>
                          📱 Authenticator App (2FA/TOTP)
                        </h3>
                        <p style={{ color: "#a1a1aa", fontSize: "0.9rem", marginTop: "4px" }}>
                          Use Google Authenticator, Microsoft Authenticator, or Authy to generate secure verification codes.
                        </p>
                      </div>
                      
                      {!mfaStatus.mfa_totp_enabled ? (
                        <button
                          type="button"
                          onClick={handleInitiateTotp}
                          style={{
                            background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          Set Up 2FA
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setMfaMessage({ type: "", text: "" });
                            setShowTotpDisable(true);
                          }}
                          style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          Disable 2FA
                        </button>
                      )}
                    </div>

                    {/* TOTP Setup flow */}
                    {showTotpSetup && totpSetupData && (
                      <div style={{ marginTop: "20px", padding: "16px", borderTop: "1px solid #27272a", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                        <div style={{ color: "#e4e4e7", fontSize: "0.95rem", textAlign: "center" }}>
                          1. Scan the QR code below using your authenticator app, or enter the text key manually.
                        </div>
                        <img src={totpSetupData.qr_code_url} alt="Scan QR Code" style={{ border: "4px solid white", borderRadius: "8px" }} />
                        <div style={{ color: "#c084fc", fontSize: "0.85rem", wordBreak: "break-all", fontFamily: "monospace" }}>
                          Secret Key: <strong>{totpSetupData.secret}</strong>
                        </div>
                        <form onSubmit={handleEnableTotpSubmit} style={{ width: "100%", maxWidth: "320px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                          <div style={{ color: "#e4e4e7", fontSize: "0.95rem", textAlign: "center" }}>
                            2. Enter the 6-digit verification code from your authenticator app below to verify setup.
                          </div>
                          <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            maxLength="6"
                            value={totpCode}
                            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                            style={{
                              width: "100%",
                              padding: "10px",
                              backgroundColor: "#18181b",
                              border: "1px solid #27272a",
                              color: "white",
                              borderRadius: "8px",
                              textAlign: "center",
                              letterSpacing: "4px",
                              fontSize: "1.1rem"
                            }}
                            required
                          />
                          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setShowTotpSetup(false);
                                setTotpSetupData(null);
                              }}
                              style={{
                                flex: 1,
                                padding: "8px",
                                border: "1px solid #27272a",
                                backgroundColor: "transparent",
                                color: "#a1a1aa",
                                borderRadius: "8px",
                                cursor: "pointer"
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              style={{
                                flex: 1,
                                padding: "8px",
                                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "600",
                                cursor: "pointer"
                              }}
                            >
                              Verify & Enable
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* TOTP Disable flow */}
                    {showTotpDisable && (
                      <form onSubmit={handleDisableTotpSubmit} style={{ marginTop: "20px", padding: "16px", borderTop: "1px solid #27272a", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                        <div style={{ color: "#e4e4e7", fontSize: "0.95rem", textAlign: "center" }}>
                          Enter the 6-digit code from your authenticator app to confirm disabling TOTP MFA.
                        </div>
                        <input
                          type="text"
                          placeholder="Enter 6-digit code"
                          maxLength="6"
                          value={disableTotpCode}
                          onChange={(e) => setDisableTotpCode(e.target.value.replace(/\D/g, ""))}
                          style={{
                            width: "100%",
                            maxWidth: "240px",
                            padding: "10px",
                            backgroundColor: "#18181b",
                            border: "1px solid #27272a",
                            color: "white",
                            borderRadius: "8px",
                            textAlign: "center",
                            letterSpacing: "4px",
                            fontSize: "1.1rem"
                          }}
                          required
                        />
                        <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "240px" }}>
                          <button
                            type="button"
                            onClick={() => setShowTotpDisable(false)}
                            style={{
                              flex: 1,
                              padding: "8px",
                              border: "1px solid #27272a",
                              backgroundColor: "transparent",
                              color: "#a1a1aa",
                              borderRadius: "8px",
                              cursor: "pointer"
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            style={{
                              flex: 1,
                              padding: "8px",
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            Confirm Disable
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Method 2: Phone OTP (SMS) */}
                  <div className="mfa-method-card" style={{ padding: "20px", border: "1px solid #27272a", borderRadius: "12px", backgroundColor: "#09090b" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                      <div>
                        <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "#e4e4e7", display: "flex", alignItems: "center", gap: "8px" }}>
                          💬 Phone OTP (SMS) MFA
                        </h3>
                        <p style={{ color: "#a1a1aa", fontSize: "0.9rem", marginTop: "4px" }}>
                          Receive a 6-digit verification code via SMS to your verified phone number on login.
                        </p>
                      </div>
                      
                      {mfaStatus.phone_verified && (
                        <label className="switch" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={mfaStatus.mfa_phone_enabled}
                            onChange={handleTogglePhoneMfa}
                            style={{ width: "18px", height: "18px", accentColor: "#a855f7" }}
                          />
                          <span style={{ color: "#e4e4e7", fontSize: "0.95rem" }}>
                            {mfaStatus.mfa_phone_enabled ? "Enabled" : "Disabled"}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Link/Verify Phone flow */}
                    {!mfaStatus.phone_verified ? (
                      <div style={{ marginTop: "16px", padding: "16px 0", borderTop: "1px solid #27272a" }}>
                        <div style={{ color: "#e4e4e7", fontSize: "0.95rem", marginBottom: "12px" }}>
                          Enter and verify your phone number to enable SMS-based MFA.
                        </div>
                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", width: "100%" }}>
                          <input
                            type="tel"
                            placeholder="e.g. +91 98765 43210"
                            value={mfaPhoneNum}
                            onChange={(e) => setMfaPhoneNum(e.target.value)}
                            style={{
                              flex: 1,
                              minWidth: "200px",
                              padding: "10px",
                              backgroundColor: "#18181b",
                              border: "1px solid #27272a",
                              color: "white",
                              borderRadius: "8px"
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleSendPhoneVerifySms}
                            style={{
                              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                              color: "white",
                              border: "none",
                              padding: "10px 20px",
                              borderRadius: "8px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            Send Verification Code
                          </button>
                        </div>

                        {showMfaPhoneVerify && (
                          <form onSubmit={handleVerifyPhoneCodeSubmit} style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px", maxWidth: "320px" }}>
                            <div style={{ color: "#e4e4e7", fontSize: "0.9rem" }}>
                              Enter the 6-digit SMS verification code:
                            </div>
                            <div style={{ display: "flex", gap: "12px" }}>
                              <input
                                type="text"
                                placeholder="Enter code"
                                maxLength="6"
                                value={mfaPhoneCode}
                                onChange={(e) => setMfaPhoneCode(e.target.value.replace(/\D/g, ""))}
                                style={{
                                  flex: 1,
                                  padding: "10px",
                                  backgroundColor: "#18181b",
                                  border: "1px solid #27272a",
                                  color: "white",
                                  borderRadius: "8px",
                                  textAlign: "center",
                                  letterSpacing: "2px"
                                }}
                                required
                              />
                              <button
                                type="submit"
                                disabled={isMfaPhoneVerifying}
                                style={{
                                  background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                                  color: "white",
                                  border: "none",
                                  padding: "10px 20px",
                                  borderRadius: "8px",
                                  fontWeight: "600",
                                  cursor: "pointer"
                                }}
                              >
                                {isMfaPhoneVerifying ? "Verifying..." : "Verify"}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ) : (
                      <div style={{ marginTop: "12px", fontSize: "0.9rem", color: "#a1a1aa", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>✓ Verified Phone: <strong>{mfaStatus.phone}</strong></span>
                        <button
                          type="button"
                          onClick={() => {
                            // Let user change phone number by resetting verification status in local UI state
                            setMfaStatus({ ...mfaStatus, phone_verified: false });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#c084fc",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            textDecoration: "underline",
                            padding: 0,
                            marginLeft: "8px"
                          }}
                        >
                          Change Number
                        </button>
                      </div>
                    )}
                  </div>
                  
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUBSCRIPTION & PLAN */}
          {activeTab === "account" && (
            <div className="account-overview">
              <h2>Subscription & Plan</h2>
              <p className="form-subheading">Manage your PreNova AI membership, plan features, and pricing options.</p>

              <div className="subscription-card">
                <div className="subscription-card-header">
                  <div className="subscription-plan-details">
                    <span className="subscription-badge">
                      {(user.plan_type || "Free").toUpperCase()} PLAN
                    </span>
                    <h3>Current Membership: {(user.plan_type || "Free").toUpperCase()}</h3>
                    <p>Upgrade to unlock unlimited AI mock interviews, detailed ATS analytics, and premium practice tools.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-upgrade-subscription"
                    onClick={() => navigate("/pricing")}
                  >
                    ⚡ View Plans & Pricing
                  </button>
                </div>

                <div className="subscription-features-list">
                  <div className="sub-feature-item">
                    <span className="check-icon">✓</span> AI Mock Interviews
                  </div>
                  <div className="sub-feature-item">
                    <span className="check-icon">✓</span> ATS Resume Analyzer
                  </div>
                  <div className="sub-feature-item">
                    <span className="check-icon">✓</span> Coding & Technical Practice
                  </div>
                  <div className="sub-feature-item">
                    <span className="check-icon">✓</span> Company Preparation Guides
                  </div>
                </div>
              </div>

              {/* Connected Devices & Sessions (Removed) */}

              {/* Sign out section */}
              <div className="signout-section" style={{ marginTop: "32px" }}>
                <h3>Session Controls</h3>
                <p>Logging out will end your current session and require logging in again.</p>
                <button type="button" className="btn-signout" onClick={handleSignOut}>
                  Sign Out of PreNovaAi
                </button>
              </div>

              {/* Danger Zone: Delete Account */}
              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <p>Permanently delete your account and remove all stored resumes, interview history, and data.</p>
                <button
                  type="button"
                  className="btn-delete-account"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Account Permanently
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>⚠️ Delete Your Account?</h3>
            <p>
              This action is permanent and cannot be undone. All your saved resumes, AI interview records, practice scores, and account data will be erased forever.
            </p>

            {deleteError && (
              <div className="alert-box error" style={{ marginBottom: "16px" }}>
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount}>
              {user.provider === "email" && (
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label>Enter Account Password to Confirm</label>
                  <input
                    type="password"
                    placeholder="Your password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-confirm-delete"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting Account..." : "Confirm & Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
