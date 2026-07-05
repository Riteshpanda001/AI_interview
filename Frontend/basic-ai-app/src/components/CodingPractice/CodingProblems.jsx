import React, { useState } from "react";
import "./CodingProblems.css";

// Sample Problems Database
const PROBLEMS = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    acceptance: "49.6%",
    companies: ["Google", "Amazon"],
    status: "Solved",
    instructions: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    codeTemplate: `// Solve: Two Sum\n// Find two indices that sum up to target\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`
  },
  {
    id: "best-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    category: "Sliding Window",
    acceptance: "54.2%",
    companies: ["Google", "Amazon"],
    status: "Solved",
    instructions: "You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    codeTemplate: `// Solve: Best Time to Buy and Sell Stock\nfunction maxProfit(prices) {\n  let minPrice = Infinity;\n  let maxProfit = 0;\n  \n  for (let price of prices) {\n    if (price < minPrice) {\n      minPrice = price;\n    } else if (price - minPrice > maxProfit) {\n      maxProfit = price - minPrice;\n    }\n  }\n  return maxProfit;\n}`
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stacks & Queues",
    acceptance: "41.0%",
    companies: ["Meta", "Apple"],
    status: "Solved",
    instructions: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    codeTemplate: `// Solve: Valid Parentheses\nfunction isValid(s) {\n  const stack = [];\n  const pairs = {\n    ')': '(',\n    '}': '{',\n    ']': '['\n  };\n  \n  for (let char of s) {\n    if (char === '(' || char === '{' || char === '[') {\n      stack.push(char);\n    } else {\n      if (stack.pop() !== pairs[char]) return false;\n    }\n  }\n  return stack.length === 0;\n}`
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Sliding Window",
    acceptance: "33.8%",
    companies: ["Amazon", "Microsoft"],
    status: "In Progress",
    instructions: "Given a string s, find the length of the longest substring without repeating characters.\n\nOptimize for O(N) runtime execution using sliding window protocols.",
    codeTemplate: `// Solve: Longest Substring Without Repeating Characters\nfunction lengthOfLongestSubstring(s) {\n  let set = new Set();\n  let left = 0;\n  let maxSize = 0;\n  \n  for (let right = 0; right < s.length; right++) {\n    while (set.has(s[right])) {\n      set.delete(s[left]);\n      left++;\n    }\n    set.add(s[right]);\n    maxSize = Math.max(maxSize, right - left + 1);\n  }\n  return maxSize;\n}`
  },
  {
    id: "container-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    category: "Two Pointers",
    acceptance: "54.1%",
    companies: ["Google", "Meta"],
    status: "Unsolved",
    instructions: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
    codeTemplate: `// Solve: Container With Most Water\nfunction maxArea(height) {\n  let maxVal = 0;\n  let left = 0;\n  let right = height.length - 1;\n  \n  while (left < right) {\n    const currentArea = Math.min(height[left], height[right]) * (right - left);\n    maxVal = Math.max(maxVal, currentArea);\n    if (height[left] < height[right]) {\n      left++;\n    } else {\n      right--;\n    }\n  }\n  return maxVal;\n}`
  },
  {
    id: "validate-bst",
    title: "Validate Binary Search Tree",
    difficulty: "Medium",
    category: "Binary Trees",
    acceptance: "32.2%",
    companies: ["Microsoft", "Amazon"],
    status: "Unsolved",
    instructions: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST is defined as follows:\n1. The left subtree of a node contains only nodes with keys less than the node's key.\n2. The right subtree of a node contains only nodes with keys greater than the node's key.\n3. Both the left and right subtrees must also be binary search trees.",
    codeTemplate: `// Solve: Validate Binary Search Tree\nfunction isValidBST(root) {\n  function validate(node, min, max) {\n    if (!node) return true;\n    if (node.val <= min || node.val >= max) return false;\n    return validate(node.left, min, node.val) && validate(node.right, node.val, max);\n  }\n  return validate(root, -Infinity, Infinity);\n}`
  },
  {
    id: "clone-graph",
    title: "Clone Graph",
    difficulty: "Medium",
    category: "Graphs",
    acceptance: "51.4%",
    companies: ["Meta", "Google"],
    status: "Unsolved",
    instructions: "Given a reference of a node in a connected undirected graph.\n\nReturn a deep copy (clone) of the graph.\n\nEach node in the graph contains a value (int) and a list (List[Node]) of its neighbors.",
    codeTemplate: `// Solve: Clone Graph\nfunction cloneGraph(node) {\n  if (!node) return null;\n  const visited = new Map();\n  \n  function dfs(curr) {\n    if (visited.has(curr)) return visited.get(curr);\n    const clone = { val: curr.val, neighbors: [] };\n    visited.set(curr, clone);\n    for (let neighbor of curr.neighbors) {\n      clone.neighbors.push(dfs(neighbor));\n    }\n    return clone;\n  }\n  return dfs(node);\n}`
  },
  {
    id: "word-search",
    title: "Word Search",
    difficulty: "Medium",
    category: "Backtracking",
    acceptance: "40.5%",
    companies: ["Apple", "Google"],
    status: "Unsolved",
    instructions: "Given an m x n grid of characters board and a string word, return true if word exists in the grid.\n\nThe word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.",
    codeTemplate: `// Solve: Word Search\nfunction exist(board, word) {\n  // Write backtracking logic\n  return false;\n}`
  },
  {
    id: "merge-k-lists",
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    category: "Binary Trees",
    acceptance: "48.2%",
    companies: ["Amazon", "Netflix"],
    status: "Unsolved",
    instructions: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
    codeTemplate: `// Solve: Merge k Sorted Lists\nfunction mergeKLists(lists) {\n  // Write heap or divide-and-conquer logic\n  return null;\n}`
  },
  {
    id: "edit-distance",
    title: "Edit Distance",
    difficulty: "Hard",
    category: "Dynamic Programming",
    acceptance: "52.4%",
    companies: ["Google", "Microsoft"],
    status: "Unsolved",
    instructions: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.\n\nYou have the following three operations permitted on a word:\n1. Insert a character\n2. Delete a character\n3. Replace a character",
    codeTemplate: `// Solve: Edit Distance\nfunction minDistance(word1, word2) {\n  // Write Dynamic Programming memo/tabulation matrix logic\n  return 0;\n}`
  }
];

const CodingProblems = ({ selectedCategory, onSelectCategory, selectedCompany, onSelectCompany, onSelectProblem }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Filtering Logic
  const filteredProblems = PROBLEMS.filter((problem) => {
    // 1. Search filter
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Category filter (from external categories grid)
    const matchesCategory = !selectedCategory || problem.category === selectedCategory;

    // 3. Company filter (from external companies pills)
    const matchesCompany = !selectedCompany || problem.companies.includes(selectedCompany);

    // 4. Difficulty dropdown filter
    const matchesDifficulty = difficultyFilter === "All" || problem.difficulty === difficultyFilter;

    // 5. Status dropdown filter
    const matchesStatus = statusFilter === "All" || problem.status === statusFilter;

    return matchesSearch && matchesCategory && matchesCompany && matchesDifficulty && matchesStatus;
  });

  return (
    <section className="coding-problems-section" id="coding-problems-list">
      <div className="coding-problems-container">
        
        <div className="section-header-mini">
          <span className="section-mini-tag">💻 Code Sandbox Directory</span>
          <h2>Practice Problems</h2>
          <p>Search, filter, and choose a challenge. Click "Solve" to load the boilerplate template into the workspace below.</p>
        </div>

        {/* Filters Panel */}
        <div className="problems-filter-panel card">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search problem title..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="dropdowns-wrap">
            <select 
              value={difficultyFilter} 
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="Solved">Solved</option>
              <option value="Unsolved">Unsolved</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedCategory || selectedCompany) && (
          <div className="active-filter-chips">
            {selectedCategory && (
              <span className="filter-chip">
                Category: <strong>{selectedCategory}</strong>
                <button onClick={() => onSelectCategory(null)}>×</button>
              </span>
            )}
            {selectedCompany && (
              <span className="filter-chip">
                Company: <strong>{selectedCompany}</strong>
                <button onClick={() => onSelectCompany(null)}>×</button>
              </span>
            )}
          </div>
        )}

        {/* Problems Table */}
        <div className="table-responsive card">
          <table className="problems-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Title</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Acceptance</th>
                <th>Ask Target</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.length > 0 ? (
                filteredProblems.map((problem) => (
                  <tr key={problem.id}>
                    <td>
                      <span className={`status-badge ${problem.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {problem.status === "Solved" ? "✓ Solved" : problem.status === "In Progress" ? "⚡ In Progress" : "○ Unsolved"}
                      </span>
                    </td>
                    <td className="problem-title-cell">
                      <strong>{problem.title}</strong>
                    </td>
                    <td>
                      <span className="category-cell-tag">{problem.category}</span>
                    </td>
                    <td>
                      <span className={`diff-chip ${problem.difficulty.toLowerCase()}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>{problem.acceptance}</td>
                    <td>
                      <div className="company-logos-row">
                        {problem.companies.map((comp) => (
                          <span key={comp} className={`mini-company-tag ${comp.toLowerCase()}`}>
                            {comp}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="problem-solve-cta"
                        onClick={() => onSelectProblem(problem)}
                      >
                        Solve ⚙️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-results-cell">
                    <p>🔍 No practice problems match your search criteria. Try removing some filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
};

export default CodingProblems;
export { PROBLEMS };
