import React from "react";
import "./PreparationRoadmap.css";

const PreparationRoadmap = ({ companyName }) => {
  const isServiceCompany = companyName === "TCS" || companyName === "Infosys";

  const weeks = isServiceCompany 
    ? [
        {
          week: "Week 1",
          goal: "Aptitude & General Reasoning",
          focus: "Quantitative calculations, logical deductions, coding patterns, and speed puzzles.",
          actions: ["Practice 3 mock aptitude sets", "Solve basic array logic problems", "Review basic syntax structure"]
        },
        {
          week: "Week 2",
          goal: "Core Coding and SQL Foundations",
          focus: "Fundamental linear structures, primary sorting logics, and essential SQL query writing.",
          actions: ["Solve 15 Easy recursion/array questions", "Learn JOINs, GROUP BY, and aggregate queries", "Review standard database schemas"]
        },
        {
          week: "Week 3",
          goal: "Academic Projects & CS Fundamentals",
          focus: "Deep dive into your university projects, OOPs definitions, and Operating System constructs.",
          actions: ["Draft 30-second descriptions for each project", "Revise inheritance, polymorphism, and encapsulation", "Review basic network layers"]
        },
        {
          week: "Week 4",
          goal: "Mock Interviews & Soft Skills",
          focus: "Simulating face-to-face panels, HR negotiations, and body language alignment.",
          actions: ["Perform 2 AI Mock HR rounds", "Practice standard questions like 'Tell me about yourself'", "Draft formal resume files"]
        }
      ]
    : [
        {
          week: "Week 1",
          goal: "Core DSA Patterns",
          focus: "Array intervals, Sliding window, Hash Map lookups, and fast stack logic patterns.",
          actions: ["Solve 15 Medium sliding window problems", "Practice 10 Prefix sum and two-pointer scenarios", "Review optimal runtime models"]
        },
        {
          week: "Week 2",
          goal: "Advanced Data Structures",
          focus: "Graphs navigation (DFS/BFS), Tree structures, BST searches, and Binary Searches.",
          actions: ["Implement custom BST traversals", "Solve 10 Graph pathfinding problems", "Solve 10 Binary Search optimization questions"]
        },
        {
          week: "Week 3",
          goal: "System Design Foundations",
          focus: "Database selection, load balancers, caching strategies, and HLD/LLD patterns.",
          actions: ["Read microservices and API gateway structures", "Practice designing TinyURL or WhatsApp block structures", "Compare SQL vs NoSQL DB performance"]
        },
        {
          week: "Week 4",
          goal: "Mock Loop & Core Values",
          focus: "Timed coding simulations, STAR-based behavioral scenarios, and company culture fits.",
          actions: ["Execute 3 mock technical rounds on PrepNova", "Deep dive into company core leadership principles", "Optimize code dry-run speeds"]
        }
      ];

  return (
    <section className="prep-roadmap-section">
      <div className="prep-roadmap-container">
        
        <div className="section-header-mini">
          <span className="section-mini-tag">🗓️ Prep Timeline</span>
          <h2>4-Week Custom Roadmap</h2>
          <p>An interactive, week-by-week blueprint customized specifically for the recruitment criteria of {companyName}.</p>
        </div>

        <div className="roadmap-grid-timeline">
          {weeks.map((item, idx) => (
            <div className="roadmap-week-card card" key={idx}>
              <div className="week-badge-row">
                <span className="week-label-tag">{item.week}</span>
                <span className="week-goal-title">{item.goal}</span>
              </div>
              <p className="week-focus-para">{item.focus}</p>
              
              <div className="week-checklist">
                <strong>Weekly Checklist:</strong>
                <ul>
                  {item.actions.map((act, i) => (
                    <li key={i}>
                      <span className="checkbox-dot">○</span>
                      {act}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PreparationRoadmap;
