import React, { useState } from "react";
import "./CodingCategories.css";
import { PROBLEMS } from "./CodingProblems";

const CATEGORIES = [
  {
    id: "Time & Space Complexity",
    icon: "⏱️",
    title: "Time & Space Complexity",
    desc: "Big O notation, worst/average/best case analyses, and complexity computation.",
    solved: "0/1",
    percent: 0,
    level: "Easy"
  },
  {
    id: "Array",
    icon: "🔢",
    title: "Array",
    desc: "Linear search, binary search, reversing arrays, finding min/max, and prefix sums.",
    solved: "0/5",
    percent: 0,
    level: "Easy - Medium"
  },
  {
    id: "Linked Lists",
    icon: "🔗",
    title: "Linked Lists",
    desc: "Singly, doubly, and circular linked lists. Traversals, insertion, deletion, and merging.",
    solved: "0/4",
    percent: 0,
    level: "Easy - Medium"
  },
  {
    id: "Stack & Queue",
    icon: "🥞",
    title: "Stack & Queue",
    desc: "LIFO/FIFO structures, stack/queue implementations, parentheses matching, and recent calls.",
    solved: "0/7",
    percent: 0,
    level: "Easy - Medium"
  },
  {
    id: "Strings",
    icon: "🔤",
    title: "Strings",
    desc: "Sequence of characters, palindrome checks, reversing, casing, and basic manipulations.",
    solved: "0/4",
    percent: 0,
    level: "Easy"
  },
  {
    id: "Searching",
    icon: "🔍",
    title: "Searching",
    desc: "Linear and binary search algorithms on sorted and unsorted collections.",
    solved: "0/3",
    percent: 0,
    level: "Easy"
  },
  {
    id: "Sorting",
    icon: "📊",
    title: "Sorting",
    desc: "Insertion sort, merge sort, quick sort, and selection sort algorithms.",
    solved: "0/4",
    percent: 0,
    level: "Easy - Medium"
  },
  {
    id: "Hashing",
    icon: "🔑",
    title: "Hashing",
    desc: "Hash maps, hash sets, collision handling, open addressing, and chaining.",
    solved: "0/2",
    percent: 0,
    level: "Easy"
  },
  {
    id: "Recursion",
    icon: "🔄",
    title: "Recursion",
    desc: "Base cases, call stack tracking, factorials, Fibonacci sequences, and mathematical powers.",
    solved: "0/5",
    percent: 0,
    level: "Easy - Medium"
  },
  {
    id: "Trees",
    icon: "🌳",
    title: "Trees",
    desc: "Binary trees, traversals (inorder, preorder, postorder), depth calculations, and path sums.",
    solved: "0/6",
    percent: 0,
    level: "Easy - Medium"
  },
  {
    id: "Heap",
    icon: "🏔️",
    title: "Heap",
    desc: "Min/Max heap structures, heapify operations, insertion/deletion, and heap sort.",
    solved: "0/5",
    percent: 0,
    level: "Easy - Medium"
  },
  {
    id: "Greedy Algorithm",
    icon: "💰",
    title: "Greedy Algorithm",
    desc: "Local optimization, interval partitions, resource allocation, and change-making problems.",
    solved: "0/5",
    percent: 0,
    level: "Easy"
  },
  {
    id: "Dynamic Programming",
    icon: "📐",
    title: "Dynamic Programming",
    desc: "Overlapping subproblems, memoization, tabulation, climbing stairs, and stock trading.",
    solved: "0/5",
    percent: 0,
    level: "Easy - Medium"
  },
  {
    id: "Graph",
    icon: "🕸️",
    title: "Graph",
    desc: "Adjacency matrices & lists, BFS (Rotting Oranges), DFS (Islands, cycle detection).",
    solved: "0/5",
    percent: 0,
    level: "Medium - Hard"
  }
];

const CodingCategories = ({ selectedCategory, onSelectCategory, onSelectProblem }) => {
  const [showAll, setShowAll] = useState(false);

  const visibleCategories = showAll ? CATEGORIES : CATEGORIES.slice(0, 4);

  return (
    <section className="coding-categories-section">
      <div className="coding-categories-container">
        
        <div className="section-header-mini">
          <span className="section-mini-tag">🗂️ Practice Domains</span>
          <h2>Explore by <span>Category</span></h2>
          <p>Click any category card below to filter the practice challenge directory and target specific concepts.</p>
        </div>

        <div className="categories-grid">
          {visibleCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;

            const catProblems = PROBLEMS.filter(p => p.category === cat.id);
            const totalProblems = catProblems.length || (cat.solved ? parseInt(cat.solved.split("/")[1], 10) : 0);
            const solvedCount = catProblems.filter(p => p.status === "Solved").length;
            const percent = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

            const difficulties = Array.from(new Set(catProblems.map(p => p.difficulty))).filter(Boolean);
            const diffText = cat.level || (difficulties.length ? difficulties.join(" - ") : "Easy");

            return (
              <div 
                className={`category-card card ${isActive ? "active" : ""}`} 
                key={cat.id}
                onClick={() => onSelectCategory(isActive ? null : cat.id)}
              >
                <div className="category-card-top">
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-problems-badge">{diffText}</span>
                </div>
                <h3>{cat.title}</h3>
                <p>{cat.desc}</p>
                
                <div className="cat-progress-container">
                  <div className="cat-progress-meta">
                    <span>Solved: {solvedCount}/{totalProblems}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="cat-progress-bar">
                    <div className="cat-progress-fill" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>

                <div className="category-action-link">
                  {isActive ? "Viewing Problems ✓" : "Explore Topic →"}
                </div>
              </div>
            );
          })}
        </div>

        {CATEGORIES.length > 4 && (
          <div className="view-more-container">
            <button 
              className="view-more-btn"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less Topics ▲" : `View All Topics (${CATEGORIES.length}) ▼`}
            </button>
          </div>
        )}

        {/* Selected Category Details Panel */}
        {selectedCategory && (() => {
          const selectedProbs = PROBLEMS.filter(p => p.category === selectedCategory);
          const solvedProbsCount = selectedProbs.filter(p => p.status === "Solved").length;
          const totalProbsCount = selectedProbs.length;
          const unsolvedProbsCount = totalProbsCount - solvedProbsCount;

          return (
            <div className="category-details-panel card">
              <div className="panel-header">
                <div className="panel-title-area">
                  <span className="panel-icon">{CATEGORIES.find(c => c.id === selectedCategory)?.icon}</span>
                  <div>
                    <h3>{selectedCategory} Questions</h3>
                    <p>{CATEGORIES.find(c => c.id === selectedCategory)?.desc}</p>
                    <span className="panel-unsolved-summary">
                      📋 {totalProbsCount} Total Problems ({unsolvedProbsCount} Unsolved)
                    </span>
                  </div>
                </div>
                <button className="panel-close-btn" onClick={() => onSelectCategory(null)}>
                  × Close Topic
                </button>
              </div>

              <div className="category-questions-list">
                {selectedProbs.map((prob, idx) => (
                  <div key={prob.id} className="category-question-item">
                    <div className="q-left">
                      <span className="q-number">{(idx + 1).toString().padStart(2, '0')}</span>
                      <span className="q-title">{prob.title}</span>
                      <span className={`diff-chip ${prob.difficulty.toLowerCase()}`}>
                        {prob.difficulty}
                      </span>
                      <span className={`q-status-chip ${prob.status ? prob.status.toLowerCase() : 'unsolved'}`}>
                        {prob.status || 'Unsolved'}
                      </span>
                      <span className="q-acceptance">Acceptance: {prob.acceptance}</span>
                    </div>

                    <div className="q-actions">
                      {prob.practiceLink && (
                        <a 
                          href={prob.practiceLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="official-link-btn"
                        >
                          {prob.practiceLink.includes("leetcode.com") ? "LeetCode 🔗" : prob.practiceLink.includes("geeksforgeeks.org") ? "GeeksforGeeks 🔗" : "Practice 🔗"}
                        </a>
                      )}
                      <button 
                        className="solve-sandbox-btn"
                        onClick={() => onSelectProblem(prob)}
                      >
                        Solve locally 💻
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      </div>
    </section>
  );
};

export default CodingCategories;
