import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyOTP from "./pages/VerifyOTP";
import DashboardPage from "./pages/DashboardPage";
import MockInterview from "./pages/MockInterview";
import MockInterviews from "./pages/MockInterviews";
import ResumeBuilder from "./pages/ResumeBuilder";
import SharedResumePage from "./pages/SharedResumePage";
import CodingPractice from "./pages/CodingPractice";
import CompanyPreparation from "./pages/CompanyPreparation";
import ATSScore from "./pages/ATSScore";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import PayUpiQr from "./pages/PayUpiQr";
import ActivityHistory from "./pages/ActivityHistory";
import ProtectedRoute from "./components/ProtectedRoute";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace("#", "");
        const element = document.getElementById(id) || document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") || "theme-cyber-purple";
    document.body.className = savedTheme;
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/share/resume/:shareToken" element={<SharedResumePage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />

        {/* Feature Pages (Viewable by all users, feature actions are guarded by auth) */}
        <Route path="/mock-interview" element={<MockInterview />} />
        <Route path="/mock-interviews" element={<MockInterviews />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/coding-practice" element={<CodingPractice />} />
        <Route path="/company-preparation" element={<CompanyPreparation />} />
        <Route path="/ats-score" element={<ATSScore />} />
        <Route path="/resume-upload" element={<ATSScore />} />

        {/* User Account & Dashboard Routes (Protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity-history"
          element={
            <ProtectedRoute>
              <ActivityHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pay-upi-qr"
          element={
            <ProtectedRoute>
              <PayUpiQr />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;