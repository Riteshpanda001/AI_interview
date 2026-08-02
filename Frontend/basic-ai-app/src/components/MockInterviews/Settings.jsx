import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaUserShield, FaLock } from "react-icons/fa";
import "./Settings.css";

const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile update state
  const [fullName, setFullName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdError, setPwdError] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setProfileError("Full Name cannot be empty.");
      return;
    }

    setIsUpdatingProfile(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      await updateProfile(fullName.trim());
      setProfileSuccess("Display name successfully updated!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err) {
      setProfileError(err.message || "Failed to update profile name.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setPwdError("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPwdError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("New password and confirm password do not match.");
      return;
    }

    setIsChangingPwd(true);
    setPwdError("");
    setPwdSuccess("");

    try {
      await changePassword(currentPassword, newPassword);
      setPwdSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwdSuccess(""), 3000);
    } catch (err) {
      setPwdError(err.message || "Failed to change password. Make sure current password is correct.");
    } finally {
      setIsChangingPwd(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Dashboard Settings</h2>
        <p>
          Manage your profile information and account security.
        </p>
      </div>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="settings-card">
          <h3 className="settings-section-title">
            <FaUserShield /> Profile details
          </h3>

          <div className="settings-read-item">
            <span className="settings-read-label">Email Address</span>
            <span className="settings-read-value">{user?.email || "N/A"}</span>
          </div>

          <div className="settings-read-item">
            <span className="settings-read-label">Account Tier</span>
            <span className="settings-badge-plan">{(user?.plan_type || "Free").toUpperCase()} PLAN</span>
          </div>

          {profileSuccess && <div className="settings-feedback success">{profileSuccess}</div>}
          {profileError && <div className="settings-feedback error">{profileError}</div>}

          <form onSubmit={handleUpdateProfile} className="settings-form">
            <div className="settings-input-group">
              <label htmlFor="settings-full-name">Full Name</label>
              <input
                id="settings-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="settings-input"
                required
              />
            </div>
            <button type="submit" className="settings-submit-btn" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? "Saving..." : "Update Name"}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="settings-card">
          <h3 className="settings-section-title">
            <FaLock /> Security & Password
          </h3>

          {pwdSuccess && <div className="settings-feedback success">{pwdSuccess}</div>}
          {pwdError && <div className="settings-feedback error">{pwdError}</div>}

          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="settings-input-group">
              <label htmlFor="current-pwd">Current Password</label>
              <input
                id="current-pwd"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="settings-input"
                required
              />
            </div>

            <div className="settings-input-group">
              <label htmlFor="new-pwd">New Password</label>
              <input
                id="new-pwd"
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="settings-input"
                required
              />
            </div>

            <div className="settings-input-group">
              <label htmlFor="confirm-pwd">Confirm New Password</label>
              <input
                id="confirm-pwd"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="settings-input"
                required
              />
            </div>

            <button type="submit" className="settings-submit-btn" disabled={isChangingPwd}>
              {isChangingPwd ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
