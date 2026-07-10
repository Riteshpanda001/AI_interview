import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TrustedCompanies from "../components/TrustedCompanies";
import Features from "../components/Features";
import ATSResume from "../components/ATSResume";
import AIMockInterview from "../components/AIMockInterview";
import PerformanceAnalytics from "../components/PerformanceAnalytics";
import Statistics from "../components/Statistics";
import Testimonials from "../components/Testimonials";
import CompanyPreparation from "../components/CompanyPreparation";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

// Profile Section Component
const ProfileSection = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.full_name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Feedback states
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsUpdating(true);
    setError("");
    setSuccess("");

    try {
      await updateProfile(name, password || undefined);
      setSuccess("Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-dashboard-section">
      <div className="profile-dashboard-grid">
        {/* Profile Info Summary Card */}
        <div className="profile-summary-card">
          <div className="profile-avatar-large">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
          </div>
          <h2>{user.full_name}</h2>
          <p className="profile-email">{user.email}</p>
          <div className="profile-meta-badges">
            <span className="profile-badge role">{user.role}</span>
            <span className="profile-badge plan">{user.plan_type} plan</span>
          </div>
          <div className="profile-details-list">
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className="detail-value text-green">Active Verified</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created At</span>
              <span className="detail-value">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Just Now"}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Editing Form Card */}
        <div className="profile-edit-card">
          <h3>Edit Profile Details</h3>
          {success && <div className="alert-message info">{success}</div>}
          {error && <div className="alert-message error">{error}</div>}
          
          <form onSubmit={handleUpdate}>
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>New Password (leave blank to keep current)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {password && (
              <div className="input-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <button type="submit" className="profile-save-btn" disabled={isUpdating}>
              {isUpdating ? "Saving changes..." : "Save Profile Details"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      {user ? <ProfileSection /> : <Hero />}
      <TrustedCompanies />
      <Features />
      <ATSResume />
      <AIMockInterview />
      <PerformanceAnalytics />
      <Statistics />
      <Testimonials />
      <CompanyPreparation />
      <Pricing />
      <FAQ />
      <Footer />
    </>
  );
};

export default Home;