import React from "react";
import "./ATSScore.css";

import Navbar from "../components/Navbar";
import ATSHero from "../components/ATS Score/ATSHero";
import ResumeUpload from "../components/ATS Score/ResumeUpload";
import ATSAnalysis from "../components/ATS Score/ATSAnalysis";
import ATSScoreCard from "../components/ATS Score/ATSScoreCard";
import KeywordAnalysis from "../components/ATS Score/KeywordAnalysis";
import MissingSkills from "../components/ATS Score/MissingSkills";
import ATSSuggestions from "../components/ATS Score/ATSSuggestions";
import ResumePreview from "../components/ATS Score/ResumePreview";
import ResumeTemplates from "../components/ATS Score/ResumeTemplates";
import ATSStatistics from "../components/ATS Score/ATSStatistics";
import ATSFAQ from "../components/ATS Score/ATSFAQ";

import Footer from "../components/Footer";

const ATSScore = () => {
  return (
    <div className="ats-page">

      <Navbar />

      <ATSHero />

      <ResumeUpload />

      <ATSAnalysis />

      <ATSScoreCard />

      <KeywordAnalysis />

      <MissingSkills />

      <ATSSuggestions />

      <ResumePreview />

      <ResumeTemplates />

      <ATSStatistics />

      <ATSFAQ />

      <Footer />

    </div>
  );
};

export default ATSScore;