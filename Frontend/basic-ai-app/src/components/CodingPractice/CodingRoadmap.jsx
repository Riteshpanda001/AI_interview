import React, { useState } from "react";
import "./CodingRoadmap.css";

const LANGUAGE_ROADMAPS = {
  C: {
    name: "C Language",
    icon: "⚡",
    color: "#2563eb",
    badge: "Low-Level & Memory Mastery",
    description: "Master C programming fundamentals, memory management with pointers, custom data structures, and system-level interview questions.",
    phases: [
      {
        phase: "Phase 1",
        duration: "2 Weeks",
        title: "C Fundamentals & Pointers",
        desc: "Variables, Data Types, Control Structures, Functions, Arrays, Pointer Arithmetic, and Dynamic Memory Allocation (malloc, calloc, realloc, free).",
        topics: ["Pointers & References", "Memory Allocation", "Structs & Unions", "Bitwise Operations"]
      },
      {
        phase: "Phase 2",
        duration: "3 Weeks",
        title: "Data Structures in C",
        desc: "Implement core Data Structures from scratch: Singly & Doubly Linked Lists, Stacks, Queues, Binary Search Trees, and Hash Tables using C structs.",
        topics: ["Linked List Implementation", "Stack & Queue via Pointers", "Binary Trees in C", "Sorting & Searching Algorithms"]
      },
      {
        phase: "Phase 3",
        duration: "3 Weeks",
        title: "Advanced C & System Concepts",
        desc: "File I/O, Command Line Arguments, Preprocessor Directives (#define, macros), Memory Leak Prevention, Function Pointers, and OS basics.",
        topics: ["File Operations", "Function Pointers", "Memory Debugging", "Process & Thread Basics"]
      },
      {
        phase: "Phase 4",
        duration: "2 Weeks",
        title: "C Technical Interview Prep",
        desc: "Solve top technical interview problems in pure C: String manipulation, Bit manipulation, Custom Memory Pool, and System-level coding tasks.",
        topics: ["Bit Manipulation", "String Parsing in C", "Mock Technical Contests", "Memory Leak Prevention"]
      }
    ]
  },
  "C++": {
    name: "C++",
    icon: "🚀",
    color: "#7c3aed",
    badge: "High Performance & STL Mastery",
    description: "Master Modern C++ (C++17/20), Standard Template Library (STL), Object-Oriented Programming, and Competitive Programming DSA.",
    phases: [
      {
        phase: "Phase 1",
        duration: "2 Weeks",
        title: "Modern C++ & Syntax Basics",
        desc: "Primitive types, References vs Pointers, Functions, Pass-by-reference, Auto, Const, Namespace, and Standard I/O (cin/cout).",
        topics: ["References & Const", "Modern C++ Features", "Functions & Scope", "Strings & Vectors"]
      },
      {
        phase: "Phase 2",
        duration: "3 Weeks",
        title: "STL Containers & Algorithms",
        desc: "Master std::vector, std::list, std::map, std::unordered_map, std::set, std::priority_queue, std::stack, std::queue, and std::sort algorithms.",
        topics: ["Vectors & Maps", "Priority Queues", "Iterators & Algorithms", "Custom Comparators"]
      },
      {
        phase: "Phase 3",
        duration: "3 Weeks",
        title: "OOPs & Advanced DSA in C++",
        desc: "Classes, Inheritance, Polymorphism, Virtual Functions, Templates, Smart Pointers (unique_ptr, shared_ptr), Graph (BFS/DFS), and DP in C++.",
        topics: ["Classes & OOPs", "Templates & Smart Pointers", "Trees & Graphs", "Dynamic Programming"]
      },
      {
        phase: "Phase 4",
        duration: "2 Weeks",
        title: "C++ Interview & Contest Track",
        desc: "Timed LeetCode Medium/Hard contests in C++, System Design basics, Time/Space optimization, and Mock Technical Screenings.",
        topics: ["LeetCode Hard Patterns", "Bitsets & Segment Trees", "Timed Contests", "Company Mock Rounds"]
      }
    ]
  },
  Java: {
    name: "Java",
    icon: "☕",
    color: "#ea580c",
    badge: "Enterprise OOPs & Collections",
    description: "Master Java OOPs principles, Java Collections Framework (JCF), JVM memory management, and technical coding interview patterns.",
    phases: [
      {
        phase: "Phase 1",
        duration: "2 Weeks",
        title: "Java Fundamentals & Syntax",
        desc: "Variables, Operator Precedence, Conditional Statements, Arrays, Strings, StringBuilder, Methods, and Package structure.",
        topics: ["Primitive & Wrapper Classes", "Arrays & Strings", "Methods & Scopes", "Input Parsing"]
      },
      {
        phase: "Phase 2",
        duration: "3 Weeks",
        title: "Java Collections Framework (JCF)",
        desc: "Master ArrayList, LinkedList, HashMap, ConcurrentHashMap, HashSet, PriorityQueue, ArrayDeque, Iterators, and Comparable/Comparator interfaces.",
        topics: ["ArrayList & HashMap", "Priority Queue & Heap", "Iterators & Streams", "Custom Comparators"]
      },
      {
        phase: "Phase 3",
        duration: "3 Weeks",
        title: "OOPs Concepts & Core DSA",
        desc: "Encapsulation, Inheritance, Polymorphism, Abstraction, Interfaces, Exception Handling, Trees, Graphs, BFS/DFS, and DP in Java.",
        topics: ["Classes & Interfaces", "Exception Handling", "Tree & Graph Algorithms", "Dynamic Programming"]
      },
      {
        phase: "Phase 4",
        duration: "2 Weeks",
        title: "Java Multithreading & Mock Track",
        desc: "Threads, Runnable, Executor Framework, Synchronization, Object-Oriented System Design (LLD), and Timed Java Interview Contests.",
        topics: ["Multithreading Basics", "Low Level Design (LLD)", "LeetCode Practice", "Company Interview Loops"]
      }
    ]
  },
  Python: {
    name: "Python",
    icon: "🐍",
    color: "#059669",
    badge: "Rapid Development & Algorithmic Speed",
    description: "Master Pythonic syntax, built-in data structures (lists, dicts, sets, tuples), OOPs in Python, and fast algorithmic problem solving.",
    phases: [
      {
        phase: "Phase 1",
        duration: "2 Weeks",
        title: "Pythonic Fundamentals & Data Structures",
        desc: "Dynamic typing, Lists, Dictionaries, Sets, Tuples, Slicing, List Comprehensions, Functions, and Lambda expressions.",
        topics: ["Lists & Dictionaries", "List Comprehensions", "Functions & Modules", "String Operations"]
      },
      {
        phase: "Phase 2",
        duration: "3 Weeks",
        title: "Built-in Libraries & Core DSA",
        desc: "Utilize collections module (Counter, defaultdict, deque), heapq module for Heaps, bisect, Trees, Graphs, BFS/DFS in Python.",
        topics: ["collections & heapq", "Deque & Queue Operations", "Tree & Graph Traversals", "Sorting & Binary Search"]
      },
      {
        phase: "Phase 3",
        duration: "3 Weeks",
        title: "Advanced DSA & Python OOPs",
        desc: "Classes, Magic Methods (__init__, __str__), Inheritance, Decorators, Generators, Dynamic Programming, and Backtracking in Python.",
        topics: ["OOPs & Decorators", "Generators & Iterators", "Dynamic Programming", "Backtracking Patterns"]
      },
      {
        phase: "Phase 4",
        duration: "2 Weeks",
        title: "Python Interview & AI Preparation",
        desc: "Solve LeetCode Top 100 Liked problems in Python, time & memory profiling, timed contests, and AI/ML Coding track alignment.",
        topics: ["LeetCode Top 100", "Time Complexity Profiling", "Mock Contests", "AI & ML Code Standards"]
      }
    ]
  }
};

const CodingRoadmap = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("C++");

  const currentRoadmap = LANGUAGE_ROADMAPS[selectedLanguage] || LANGUAGE_ROADMAPS["C++"];

  return (
    <section className="coding-roadmap-section" id="coding-roadmap">
      <div className="coding-roadmap-container">
        
        {/* Section Header */}
        <div className="section-header-mini">
          <span className="section-mini-tag">🗓️ Language Learning Path</span>
          <h2>The Coding Roadmap</h2>
          <p>Accelerate your growth. Select your target programming language to view the curated step-by-step interview roadmap.</p>
        </div>

        {/* Language Selection Buttons Row */}
        <div className="language-selector-bar">
          {Object.keys(LANGUAGE_ROADMAPS).map((langKey) => {
            const langObj = LANGUAGE_ROADMAPS[langKey];
            const isSelected = selectedLanguage === langKey;
            return (
              <button
                key={langKey}
                className={`language-tab-btn ${isSelected ? "active" : ""}`}
                onClick={() => setSelectedLanguage(langKey)}
                style={{
                  "--lang-color": langObj.color,
                  "--lang-bg": `${langObj.color}12`,
                  "--lang-border": `${langObj.color}40`
                }}
              >
                <span className="lang-icon">{langObj.icon}</span>
                <span className="lang-name">{langObj.name}</span>
                {isSelected && <span className="lang-active-dot">●</span>}
              </button>
            );
          })}
        </div>

        {/* Language Banner & Info */}
        <div className="selected-roadmap-banner" style={{ borderColor: currentRoadmap.color }}>
          <div className="banner-top">
            <span className="roadmap-badge-tag" style={{ background: `${currentRoadmap.color}18`, color: currentRoadmap.color }}>
              {currentRoadmap.icon} {currentRoadmap.badge}
            </span>
            <h3>{currentRoadmap.name} Preparation Track</h3>
          </div>
          <p>{currentRoadmap.description}</p>
        </div>

        {/* Dynamic 4-Phase Grid Layout */}
        <div className="roadmap-grid-container">
          {currentRoadmap.phases.map((path, idx) => (
            <div className="roadmap-step-card card" key={idx}>
              <div className="roadmap-step-top">
                <span className="step-phase-tag" style={{ color: currentRoadmap.color, background: `${currentRoadmap.color}15` }}>
                  {path.phase}
                </span>
                <span className="step-duration">⏱️ {path.duration}</span>
              </div>

              <h3>{path.title}</h3>
              <p>{path.desc}</p>

              {/* Topics Pills */}
              <div className="step-topics-list">
                {path.topics.map((top, tIdx) => (
                  <span key={tIdx} className="topic-pill">
                    ✓ {top}
                  </span>
                ))}
              </div>

              <div className="step-footer">
                <span className="step-check" style={{ color: currentRoadmap.color }}>
                  ✓ Required Milestone
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CodingRoadmap;
