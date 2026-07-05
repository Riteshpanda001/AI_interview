import React from "react";
import "./CodingRoadmap.css";

const PATHS = [
  {
    phase: "Phase 1",
    title: "Language & Syntax Basics",
    desc: "Master primitives, pointers, loops, lists, maps, complexity models, and standard collections.",
    duration: "2 Weeks"
  },
  {
    phase: "Phase 2",
    title: "Core Data Structures",
    desc: "Trees (BST, Binary), Recursion, Stack/Queue operations, Graphs, DFS/BFS traversals, and Sorting algorithms.",
    duration: "3 Weeks"
  },
  {
    phase: "Phase 3",
    title: "Advanced DSA Optimization",
    desc: "Dynamic Programming patterns, Greedy, Segment Trees, sliding window designs, and Trie index architectures.",
    duration: "3 Weeks"
  },
  {
    phase: "Phase 4",
    title: "Mock Interview Loops & Scale",
    desc: "Concurrency, System design basics, object design patterns, timed mock contests, and review sheets.",
    duration: "2 Weeks"
  }
];

const CodingRoadmap = () => {
  return (
    <section className="coding-roadmap-section">
      <div className="coding-roadmap-container">
        
        <div className="section-header-mini">
          <span className="section-mini-tag">🗓️ Learning Path</span>
          <h2>The Coding Roadmap</h2>
          <p>Accelerate your growth. Master coding interview concepts sequentially from basic variables to high scale system design.</p>
        </div>

        <div className="roadmap-grid-container">
          {PATHS.map((path, idx) => (
            <div className="roadmap-step-card card" key={idx}>
              <div className="roadmap-step-top">
                <span className="step-phase-tag">{path.phase}</span>
                <span className="step-duration">{path.duration}</span>
              </div>
              <h3>{path.title}</h3>
              <p>{path.desc}</p>
              <div className="step-footer">
                <span className="step-check">✓ Required Phase</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CodingRoadmap;
