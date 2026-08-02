import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Sub-components with correct casing
import CodingHero from "../components/CodingPractice/CodingHero";
import CodingCategories from "../components/CodingPractice/CodingCategories";
import CompanyCoding from "../components/CodingPractice/CompanyCoding";
import CodingProblems, { PROBLEMS } from "../components/CodingPractice/CodingProblems";
import CodingStatistics from "../components/CodingPractice/CodingStatistics";
import AICodingAssistant from "../components/CodingPractice/AICodingAssistant";
import DailyChallenge from "../components/CodingPractice/DailyChallenge";
import CodingRoadmap from "../components/CodingPractice/CodingRoadmap";
import CodingLeaderboard from "../components/CodingPractice/CodingLeaderboard";
import CodingFAQ from "../components/CodingPractice/CodingFAQ";

import "./CodingPractice.css";

const CodingPractice = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);

  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
  };

  const handleExploreProblems = () => {
    const listElement = document.getElementById("coding-problems-list");
    if (listElement) {
      listElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleExploreRoadmap = () => {
    const roadmapElement = document.querySelector(".coding-roadmap-section");
    if (roadmapElement) {
      roadmapElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSolveDailyChallenge = () => {
    // Find Binary Search in database
    const dailyProb = PROBLEMS.find((p) => p.id === "arr-binary-search") || PROBLEMS[0];
    handleSelectProblem(dailyProb);
  };

  return (
    <>
      <Navbar />

      <main className="coding-page">
        {/* Hero Section */}
        <CodingHero 
          onStartCoding={handleExploreProblems} 
          onExploreRoadmap={handleExploreRoadmap} 
        />

        {/* User Analytics Dashboard */}
        <CodingStatistics />

        {/* Category Selector Grid */}
        <CodingCategories 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
          onSelectProblem={handleSelectProblem}
        />

        {/* Company Target Selector */}
        <CompanyCoding 
          selectedCompany={selectedCompany} 
          onSelectCompany={setSelectedCompany} 
        />

        {/* Targeted Problems Directory */}
        <CodingProblems 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
          selectedCompany={selectedCompany} 
          onSelectCompany={setSelectedCompany} 
          onSelectProblem={handleSelectProblem}
        />

        {/* Daily challenges & streak stats */}
        <DailyChallenge onSolve={handleSolveDailyChallenge} />

        {/* AI Coding Workspace */}
        <AICodingAssistant selectedProblem={selectedProblem} />

        {/* Dynamic Roadmaps */}
        <CodingRoadmap />

        {/* Practice Leaderboard */}
        <CodingLeaderboard />

        {/* General Practice FAQ */}
        <CodingFAQ />


      </main>

      <Footer />
    </>
  );
};

export default CodingPractice;