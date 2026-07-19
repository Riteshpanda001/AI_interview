import React from "react";
import "./CodingCategories.css";
import { PROBLEMS } from "./CodingProblems";

const CATEGORIES = [
  {
    id: "Time & Space Complexity",
    icon: "⏱️",
    title: "Time & Space Complexity",
    desc: "Big O notation, worst/average/best case analyses, and complexity computation.",
    solved: "1/1",
    percent: 100,
    level: "Easy"
  },
  {
    id: "Array",
    icon: "🔢",
    title: "Array",
    desc: "Linear search, binary search, reversing arrays, finding min/max, and prefix sums.",
    solved: "3/5",
    percent: 60,
    level: "Easy - Medium"
  },
  {
    id: "Linked Lists",
    icon: "🔗",
    title: "Linked Lists",
    desc: "Singly, doubly, and circular linked lists. Traversals, insertion, deletion, and merging.",
    solved: "2/4",
    percent: 50,
    level: "Easy - Medium"
  },
  {
    id: "Stack & Queue",
    icon: "🥞",
    title: "Stack & Queue",
    desc: "LIFO/FIFO structures, stack/queue implementations, parentheses matching, and recent calls.",
    solved: "4/7",
    percent: 57,
    level: "Easy - Medium"
  },
  {
    id: "Strings",
    icon: "🔤",
    title: "Strings",
    desc: "Sequence of characters, palindrome checks, reversing, casing, and basic manipulations.",
    solved: "2/4",
    percent: 50,
    level: "Easy"
  },
  {
    id: "Searching",
    icon: "🔍",
    title: "Searching",
    desc: "Linear and binary search algorithms on sorted and unsorted collections.",
    solved: "2/3",
    percent: 66,
    level: "Easy"
  },
  {
    id: "Sorting",
    icon: "📊",
    title: "Sorting",
    desc: "Insertion sort, merge sort, quick sort, and selection sort algorithms.",
    solved: "2/4",
    percent: 50,
    level: "Easy - Medium"
  },
  {
    id: "Hashing",
    icon: "🔑",
    title: "Hashing",
    desc: "Hash maps, hash sets, collision handling, open addressing, and chaining.",
    solved: "1/2",
    percent: 50,
    level: "Easy"
  },
  {
    id: "Recursion",
    icon: "🔄",
    title: "Recursion",
    desc: "Base cases, call stack tracking, factorials, Fibonacci sequences, and mathematical powers.",
    solved: "3/5",
    percent: 60,
    level: "Easy - Medium"
  },
  {
    id: "Trees",
    icon: "🌳",
    title: "Trees",
    desc: "Binary trees, traversals (inorder, preorder, postorder), depth calculations, and path sums.",
    solved: "3/6",
    percent: 50,
    level: "Easy - Medium"
  },
  {
    id: "Heap",
    icon: "🏔️",
    title: "Heap",
    desc: "Min/Max heap structures, heapify operations, insertion/deletion, and heap sort.",
    solved: "2/5",
    percent: 40,
    level: "Easy - Medium"
  },
  {
    id: "Greedy Algorithm",
    icon: "💰",
    title: "Greedy Algorithm",
    desc: "Local optimization, interval partitions, resource allocation, and change-making problems.",
    solved: "2/5",
    percent: 40,
    level: "Easy"
  },
  {
    id: "Dynamic Programming",
    icon: "📐",
    title: "Dynamic Programming",
    desc: "Overlapping subproblems, memoization, tabulation, climbing stairs, and stock trading.",
    solved: "1/5",
    percent: 20,
    level: "Easy - Medium"
  },
  {
    id: "Graph",
    icon: "🕸️",
    title: "Graph",
    desc: "Adjacency matrices & lists, BFS (Rotting Oranges), DFS (Islands, cycle detection).",
    solved: "2/5",
    percent: 40,
    level: "Medium"
  }
];

const CodingCategories = ({ selectedCategory, onSelectCategory, onSelectProblem }) => {
  return (
    <section className="coding-categories-section">
      <div className="coding-categories-container">
        
        <div className="section-header-mini">
          <span className="section-mini-tag">🗂️ Practice Domains</span>
          <h2>Explore by Category</h2>
          <p>Click any category card below to filter the practice challenge directory and target specific concepts.</p>
        </div>

        <div className="categories-grid">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <div 
                className={`category-card card ${isActive ? "active" : ""}`} 
                key={cat.id}
                onClick={() => onSelectCategory(isActive ? null : cat.id)}
              >
                <div className="category-card-top">
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-level-badge">{cat.level}</span>
                </div>
                <h3>{cat.title}</h3>
                <p>{cat.desc}</p>
                
                <div className="cat-progress-container">
                  <div className="cat-progress-meta">
                    <span>Solved: {cat.solved}</span>
                    <span>{cat.percent}%</span>
                  </div>
                  <div className="cat-progress-bar">
                    <div className="cat-progress-fill" style={{ width: `${cat.percent}%` }}></div>
                  </div>
                </div>

                <div className="category-action-link">
                  {isActive ? "Viewing Problems ✓" : "Explore Topic →"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Category Details Panel */}
        {selectedCategory && (
          <div className="category-details-panel card">
            <div className="panel-header">
              <div className="panel-title-area">
                <span className="panel-icon">{CATEGORIES.find(c => c.id === selectedCategory)?.icon}</span>
                <div>
                  <h3>{selectedCategory} Questions</h3>
                  <p>{CATEGORIES.find(c => c.id === selectedCategory)?.desc}</p>
                </div>
              </div>
              <button className="panel-close-btn" onClick={() => onSelectCategory(null)}>
                × Close Topic
              </button>
            </div>

            <div className="category-questions-list">
              {PROBLEMS.filter(p => p.category === selectedCategory).map((prob, idx) => (
                <div key={prob.id} className="category-question-item">
                  <div className="q-left">
                    <span className="q-number">{(idx + 1).toString().padStart(2, '0')}</span>
                    <span className="q-title">{prob.title}</span>
                    <span className={`diff-chip ${prob.difficulty.toLowerCase()}`}>
                      {prob.difficulty}
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
        )}

      </div>
    </section>
  );
};

export default CodingCategories;
