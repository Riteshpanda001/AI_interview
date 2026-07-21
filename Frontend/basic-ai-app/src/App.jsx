import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DashboardPage from "./pages/DashboardPage";
import MockInterview from "./pages/MockInterview";
import MockInterviews from "./pages/MockInterviews";
import ResumeBuilder from "./pages/ResumeBuilder";
import CodingPractice from "./pages/CodingPractice";
import CompanyPreparation from "./pages/CompanyPreparation";
import ATSScore from "./pages/ATSScore";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") || "theme-cyber-purple";
    document.body.className = savedTheme;
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<Profile />} />

      <Route path="/mock-interview" element={<MockInterview />} />
      <Route path="/mock-interviews" element={<MockInterviews />} />
      <Route path="/resume-builder" element={<ResumeBuilder />} />
      <Route path="/coding-practice" element={<CodingPractice />} />
      <Route path="/company-preparation" element={<CompanyPreparation />} />
      <Route path="/ats-score" element={<ATSScore />} />
      <Route path="/resume-upload" element={<ATSScore />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}

export default App;