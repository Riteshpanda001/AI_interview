import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("info");

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState("Mid Level");
  const [bio, setBio] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  // Security Form States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [securityMessage, setSecurityMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setTargetRole(user.target_role || "Software Engineer");
      setExperienceLevel(user.experience_level || "Mid Level");
      setBio(user.bio || "");
    }
  }, [user]);

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
            🔒 Security & Password
          </button>
          <button
            className={`tab-btn ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            ⚡ Membership & Session
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

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === "security" && (
            <form className="profile-form" onSubmit={handlePasswordSubmit}>
              <h2>Security & Authentication</h2>
              <p className="form-subheading">Change your account password to maintain maximum account security.</p>

              {securityMessage.text && (
                <div className={`alert-box ${securityMessage.type}`}>
                  {securityMessage.text}
                </div>
              )}

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
          )}

          {/* TAB 3: MEMBERSHIP & SESSION */}
          {activeTab === "account" && (
            <div className="account-overview">
              <h2>Membership & Active Session</h2>
              <p className="form-subheading">Overview of your PreNovaAi subscription and session control.</p>

              <div className="overview-cards">
                <div className="overview-card">
                  <span className="card-label">Current Tier</span>
                  <span className="card-val highlight">{(user.plan_type || "Free").toUpperCase()}</span>
                  <p className="card-desc">Includes AI interviews, resume parsing, and coding practice.</p>
                </div>

                <div className="overview-card">
                  <span className="card-label">Verification Status</span>
                  <span className="card-val success">Verified Account</span>
                  <p className="card-desc">Email and OTP identity verified.</p>
                </div>

                <div className="overview-card">
                  <span className="card-label">Joined On</span>
                  <span className="card-val">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently"}
                  </span>
                  <p className="card-desc">PreNovaAi member.</p>
                </div>
              </div>

              <div className="signout-section">
                <h3>Session Management</h3>
                <p>Logging out will end your current session and revoke your authentication tokens.</p>
                <button type="button" className="btn-signout" onClick={handleSignOut}>
                  Sign Out of PreNovaAi
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
