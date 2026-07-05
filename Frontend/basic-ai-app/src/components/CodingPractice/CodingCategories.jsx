import React from "react";
import "./CodingCategories.css";

const CATEGORIES = [
  {
    id: "Arrays & Hashing",
    icon: "🔢",
    title: "Arrays & Hashing",
    desc: "HashMaps, sets, sorting, dynamic arrays, sub-arrays, and linear scans.",
    solved: "12/25",
    percent: 48,
    level: "Easy - Medium"
  },
  {
    id: "Two Pointers",
    icon: "⇄",
    title: "Two Pointers",
    desc: "Optimizing search intervals, index collisions, and list partitions.",
    solved: "8/15",
    percent: 53,
    level: "Easy - Medium"
  },
  {
    id: "Sliding Window",
    icon: "↔️",
    title: "Sliding Window",
    desc: "Dynamic subarrays, substring searches, and fixed interval maximums.",
    solved: "6/12",
    percent: 50,
    level: "Medium - Hard"
  },
  {
    id: "Stacks & Queues",
    icon: "🥞",
    title: "Stacks & Queues",
    desc: "LIFO/FIFO mechanisms, monotonic stacks, and breadth-first pipelines.",
    solved: "5/14",
    percent: 35,
    level: "Easy - Medium"
  },
  {
    id: "Binary Trees",
    icon: "🌳",
    title: "Binary Trees",
    desc: "DFS, BFS, BST mutations, ancestor trees, and depth-first searches.",
    solved: "9/22",
    percent: 40,
    level: "Medium - Hard"
  },
  {
    id: "Dynamic Programming",
    icon: "🧗",
    title: "Dynamic Programming",
    desc: "Memoization patterns, tabulation matrices, grid paths, and Knapsacks.",
    solved: "3/28",
    percent: 10,
    level: "Medium - Hard"
  },
  {
    id: "Graphs",
    icon: "🕸️",
    title: "Graphs",
    desc: "BFS/DFS matrices, Dijkstra's algorithm, Kruskal's MST, union-find.",
    solved: "4/20",
    percent: 20,
    level: "Medium - Hard"
  },
  {
    id: "Backtracking",
    icon: "🔄",
    title: "Backtracking",
    desc: "Recursion state trees, combinations, subsets, Sudoku, N-Queens.",
    solved: "1/14",
    percent: 7,
    level: "Medium - Hard"
  }
];

const CodingCategories = ({ selectedCategory, onSelectCategory }) => {
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
                  {isActive ? "Viewing Problems ✓" : "Filter by Category →"}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CodingCategories;
