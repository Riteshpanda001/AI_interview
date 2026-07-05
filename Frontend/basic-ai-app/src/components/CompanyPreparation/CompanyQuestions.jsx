import React, { useState } from "react";
import "./CompanyQuestions.css";

const QUESTIONS_DATA = {
  Google: [
    { title: "Median of Two Sorted Arrays", difficulty: "Hard", topic: "Binary Search", acceptance: "36%" },
    { title: "LRU Cache", difficulty: "Hard", topic: "Design", acceptance: "34%" },
    { title: "Course Schedule", difficulty: "Medium", topic: "Graph", acceptance: "45%" },
    { title: "Longest Path in a Matrix", difficulty: "Hard", topic: "DFS / Memoization", acceptance: "49%" },
    { title: "Find Peak Element", difficulty: "Medium", topic: "Binary Search", acceptance: "52%" }
  ],
  Microsoft: [
    { title: "Valid Parentheses", difficulty: "Easy", topic: "Stack", acceptance: "61%" },
    { title: "Reverse Linked List", difficulty: "Easy", topic: "Linked List", acceptance: "72%" },
    { title: "Binary Tree Zigzag Traversal", difficulty: "Medium", topic: "Tree", acceptance: "58%" },
    { title: "Merge k Sorted Lists", difficulty: "Hard", topic: "Divide & Conquer", acceptance: "48%" },
    { title: "Search in Rotated Sorted Array", difficulty: "Medium", topic: "Binary Search", acceptance: "54%" }
  ],
  Amazon: [
    { title: "Best Time to Buy & Sell Stock", difficulty: "Easy", topic: "Arrays", acceptance: "52%" },
    { title: "Trapping Rain Water", difficulty: "Hard", topic: "Stack / Two Pointers", acceptance: "42%" },
    { title: "K Closest Points to Origin", difficulty: "Medium", topic: "Heap", acceptance: "62%" },
    { title: "Word Ladder", difficulty: "Hard", topic: "BFS", acceptance: "35%" },
    { title: "Group Anagrams", difficulty: "Medium", topic: "Strings / Map", acceptance: "66%" }
  ],
  Meta: [
    { title: "Subarray Sum Equals K", difficulty: "Medium", topic: "Arrays / Prefix Sum", acceptance: "43%" },
    { title: "Lowest Common Ancestor", difficulty: "Medium", topic: "Binary Tree", acceptance: "58%" },
    { title: "Product of Array Except Self", difficulty: "Medium", topic: "Arrays", acceptance: "64%" },
    { title: "Minimum Window Substring", difficulty: "Hard", topic: "Sliding Window", acceptance: "39%" },
    { title: "Verifying an Alien Dictionary", difficulty: "Easy", topic: "Strings", acceptance: "51%" }
  ],
  Netflix: [
    { title: "Design Netflix Video Player API", difficulty: "Hard", topic: "System Design", acceptance: "30%" },
    { title: "Merge k Sorted Lists", difficulty: "Hard", topic: "Heap", acceptance: "48%" },
    { title: "LRU Cache Implementation", difficulty: "Hard", topic: "Design", acceptance: "34%" },
    { title: "Maximum Subarray (Kadane's)", difficulty: "Medium", topic: "Dynamic Programming", acceptance: "55%" }
  ],
  Apple: [
    { title: "Design LRU Cache", difficulty: "Hard", topic: "Design", acceptance: "34%" },
    { title: "Rotate Image Matrix", difficulty: "Medium", topic: "Matrix", acceptance: "49%" },
    { title: "Valid Palindrome II", difficulty: "Easy", topic: "Strings / Two Pointers", acceptance: "48%" },
    { title: "Reverse Nodes in k-Group", difficulty: "Hard", topic: "Linked List", acceptance: "41%" }
  ],
  TCS: [
    { title: "Prime Factorization Logic", difficulty: "Easy", topic: "Math / Algorithms", acceptance: "80%" },
    { title: "Array Left Rotation", difficulty: "Easy", topic: "Arrays", acceptance: "85%" },
    { title: "String Palindrome Check", difficulty: "Easy", topic: "Strings", acceptance: "90%" },
    { title: "Leap Year & Leap Day Logic", difficulty: "Easy", topic: "Math / Logic", acceptance: "88%" }
  ],
  Infosys: [
    { title: "Fibonacci Series Optimizations", difficulty: "Easy", topic: "Recursion / DP", acceptance: "78%" },
    { title: "Matrix Transposition", difficulty: "Easy", topic: "Matrix", acceptance: "82%" },
    { title: "Anagram Check Using Hash Map", difficulty: "Easy", topic: "Strings", acceptance: "74%" },
    { title: "Second Largest Element in Array", difficulty: "Easy", topic: "Arrays", acceptance: "81%" }
  ]
};

const CompanyQuestions = ({ companyName }) => {
  const questions = QUESTIONS_DATA[companyName] || QUESTIONS_DATA.Google;
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  const filteredQuestions = questions.filter((q) => {
    return filterDifficulty === "All" || q.difficulty === filterDifficulty;
  });

  return (
    <section className="company-questions-section">
      <div className="company-questions-container">
        
        <div className="section-header-mini">
          <span className="section-mini-tag">🎯 Questions Prep</span>
          <h2>Frequently Asked Questions</h2>
          <p>Practice coding questions most frequently asked in actual interview rounds of {companyName}.</p>
        </div>

        {/* Toolbar filters */}
        <div className="questions-filter-bar">
          {["All", "Easy", "Medium", "Hard"].map((difficulty) => (
            <button
              key={difficulty}
              className={`filter-diff-btn ${filterDifficulty === difficulty ? "active" : ""} ${difficulty.toLowerCase()}`}
              onClick={() => setFilterDifficulty(difficulty)}
            >
              {difficulty}
            </button>
          ))}
        </div>

        {/* Questions Grid */}
        <div className="company-questions-grid">
          {filteredQuestions.map((q, idx) => (
            <div className="company-q-card card" key={idx}>
              <div className="q-card-top">
                <span className={`diff-badge-text ${q.difficulty.toLowerCase()}`}>
                  {q.difficulty}
                </span>
                <span className="acceptance-label">Acc: {q.acceptance}</span>
              </div>
              
              <h3>{q.title}</h3>
              <p className="q-topic">📂 {q.topic}</p>

              <div className="q-card-footer">
                <button className="q-solve-now-btn" onClick={() => alert(`Launching compiler workspace for: "${q.title}"!`)}>
                  Solve Problem →
                </button>
              </div>
            </div>
          ))}

          {filteredQuestions.length === 0 && (
            <div className="no-filtered-questions">
              <p>No {filterDifficulty} questions found for {companyName}.</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default CompanyQuestions;
