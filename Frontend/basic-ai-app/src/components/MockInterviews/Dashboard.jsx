import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useRequireAuth from "../../hooks/useRequireAuth";
import { 
  FaArrowUp, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaFire, 
  FaTrophy, 
  FaBriefcase, 
  FaCode, 
  FaFileAlt, 
  FaChartLine, 
  FaSync, 
  FaPlus, 
  FaTrash, 
  FaChevronRight, 
  FaMicrophone, 
  FaBuilding, 
  FaInfoCircle
} from "react-icons/fa";
import "./Dashboard.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const Dashboard = ({ onPracticeNow }) => {
  const { user, token, authFetch } = useAuth();
  const { requireAuth } = useRequireAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Goal Form State
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("10");
  const [goalCategory, setGoalCategory] = useState("coding");

  const fetchDashboard = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const response = await authFetch(`${API_BASE_URL}/dashboard/`);
      if (response.ok) {
        const resData = await response.json();
        setData(resData);
      } else {
        throw new Error("Failed to load dashboard metrics");
      }
    } catch (err) {
      console.warn("Dashboard fetch error:", err);
      setError("Unable to connect to backend server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [token]);

  // Goal CRUD handlers
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    try {
      const resp = await authFetch(`${API_BASE_URL}/dashboard/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goalTitle,
          target_value: parseFloat(goalTarget) || 10,
          current_value: 0,
          category: goalCategory,
          unit: goalCategory === "coding" ? "problems" : goalCategory === "interview" ? "interviews" : "%"
        })
      });

      if (resp.ok) {
        setShowGoalModal(false);
        setGoalTitle("");
        fetchDashboard(true);
      }
    } catch (err) {
      console.error("Error creating goal:", err);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const resp = await authFetch(`${API_BASE_URL}/dashboard/goals/${goalId}`, {
        method: "DELETE"
      });
      if (resp.ok) {
        fetchDashboard(true);
      }
    } catch (err) {
      console.error("Error deleting goal:", err);
    }
  };

  if (loading) {
    return (
      <div className="prenova-dashboard">
        <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
          <div className="skeleton-box" style={{ height: "140px", width: "100%" }} />
          <div className="metrics-grid-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-box" style={{ height: "100px" }} />
            ))}
          </div>
          <div className="skeleton-box" style={{ height: "200px", width: "100%" }} />
        </div>
      </div>
    );
  }

  // Safe destructuring of aggregated API response payload
  const readiness = data?.readiness || {
    score: data?.interview_readiness || 0,
    level: "Getting Started",
    weeklyImprovement: data?.weekly_improvement || 0,
    monthlyGrowth: data?.monthly_improvement || 0,
    hasSufficientData: (data?.interview_readiness || 0) > 0,
    message: "Complete more preparation activities to generate your Interview Readiness Index."
  };

  const metrics = data?.metrics || {
    atsScore: data?.ats_score || 0,
    resumeCompletion: data?.resume_completion || 0,
    jobMatchFit: data?.job_match_score || 0,
    targetRoleName: "Add Target Role",
    interviewScore: data?.interview_score || 0,
    codingAccuracy: data?.coding_score || 0,
    problemsSolved: data?.questions_correct || 0,
    totalProblems: 120,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0
  };

  const recommendations = data?.recommendations || [];
  const careerRoadmap = data?.career_roadmap || [];
  const resumeProgress = data?.resume_progress || { completion: metrics.resumeCompletion, sections: {} };
  const atsPerformance = data?.ats_performance || { latestScore: metrics.atsScore, previousScore: 0, improvement: 0, missingKeywords: [] };
  const codingProgress = data?.coding_progress || { solved: metrics.problemsSolved, total: 120, accuracy: metrics.codingAccuracy, streak: 0, topicPerformance: {} };
  const companyPrep = data?.company_preparation || { companiesExplored: 0, questionsPracticed: 0, companyList: [] };
  const interviewPerf = data?.interview_performance || { overallScore: metrics.interviewScore, totalInterviews: data?.total_interviews || 0, lastInterview: "None" };
  const performanceHistory = data?.performance_history || { atsScoreHistory: [], interviewPerformanceHistory: [], codingProgressHistory: [] };
  const weeklyActivity = data?.weekly_activity || { days: [], totalTime: "0h 0m", mostProductiveDay: "N/A" };
  const weakAreas = data?.weak_areas || [];
  const recentActivity = data?.recent_activity || [];
  const goals = data?.goals || [];
  const achievements = data?.achievements || { unlocked: [], nextAchievement: null };
  const quickActions = data?.quick_actions || [];
  const streak = data?.streak || { count: codingProgress.streak || 0 };

  // Multi-colored Neon Line Graph Series Calculation for 5 Parts
  const chartDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];

  const rawModulesSeries = [
    {
      id: "resume",
      name: "AI Resume Builder",
      color: "#C084FC",
      glowColor: "rgba(192, 132, 252, 0.7)",
      score: metrics.resumeCompletion || 0,
      points: [
        Math.round((metrics.resumeCompletion || 0) * 0.35),
        Math.round((metrics.resumeCompletion || 0) * 0.5),
        Math.round((metrics.resumeCompletion || 0) * 0.65),
        Math.round((metrics.resumeCompletion || 0) * 0.72),
        Math.round((metrics.resumeCompletion || 0) * 0.85),
        Math.round((metrics.resumeCompletion || 0) * 0.95),
        metrics.resumeCompletion || 0
      ]
    },
    {
      id: "coding",
      name: "Coding Practice",
      color: "#00FF88",
      glowColor: "rgba(0, 255, 136, 0.7)",
      score: metrics.codingAccuracy || 0,
      points: [
        Math.round((metrics.codingAccuracy || 0) * 0.25),
        Math.round((metrics.codingAccuracy || 0) * 0.45),
        Math.round((metrics.codingAccuracy || 0) * 0.6),
        Math.round((metrics.codingAccuracy || 0) * 0.68),
        Math.round((metrics.codingAccuracy || 0) * 0.8),
        Math.round((metrics.codingAccuracy || 0) * 0.92),
        metrics.codingAccuracy || 0
      ]
    },
    {
      id: "company",
      name: "Company Preparation",
      color: "#FB7185",
      glowColor: "rgba(251, 113, 133, 0.7)",
      score: metrics.jobMatchFit || 0,
      points: [
        Math.round((metrics.jobMatchFit || 0) * 0.3),
        Math.round((metrics.jobMatchFit || 0) * 0.5),
        Math.round((metrics.jobMatchFit || 0) * 0.62),
        Math.round((metrics.jobMatchFit || 0) * 0.7),
        Math.round((metrics.jobMatchFit || 0) * 0.82),
        Math.round((metrics.jobMatchFit || 0) * 0.9),
        metrics.jobMatchFit || 0
      ]
    },
    {
      id: "interview",
      name: "AI Interview Prep",
      color: "#FBBF24",
      glowColor: "rgba(251, 191, 36, 0.7)",
      score: metrics.interviewScore || 0,
      points: [
        Math.round((metrics.interviewScore || 0) * 0.2),
        Math.round((metrics.interviewScore || 0) * 0.4),
        Math.round((metrics.interviewScore || 0) * 0.55),
        Math.round((metrics.interviewScore || 0) * 0.7),
        Math.round((metrics.interviewScore || 0) * 0.85),
        Math.round((metrics.interviewScore || 0) * 0.92),
        metrics.interviewScore || 0
      ]
    },
    {
      id: "ats",
      name: "ATS Score",
      color: "#38BDF8",
      glowColor: "rgba(56, 189, 248, 0.7)",
      score: metrics.atsScore || 0,
      points: [
        Math.round((metrics.atsScore || 0) * 0.4),
        Math.round((metrics.atsScore || 0) * 0.58),
        Math.round((metrics.atsScore || 0) * 0.7),
        Math.round((metrics.atsScore || 0) * 0.8),
        Math.round((metrics.atsScore || 0) * 0.88),
        Math.round((metrics.atsScore || 0) * 0.95),
        metrics.atsScore || 0
      ]
    }
  ];

  const calculatedSeries = rawModulesSeries.map((series) => {
    const coords = series.points.map((val, idx) => {
      const x = 55 + idx * ((760 - 55) / (chartDays.length - 1));
      const y = 140 - (val / 100) * 105;
      return { label: chartDays[idx], score: val, x, y };
    });

    const linePath = coords.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x},${pt.y}`;
      const prev = coords[i - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt.y;
      return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${pt.x},${pt.y}`;
    }, "");

    const areaPath = `${linePath} L ${coords[coords.length - 1].x},140 L ${coords[0].x},140 Z`;

    return { ...series, coords, linePath, areaPath };
  });

  const getTierClass = (level) => {
    if (level === "Top Candidate") return "tier-top";
    if (level === "Interview Ready") return "tier-ready";
    if (level === "Making Progress") return "tier-progress";
    if (level === "Building Foundation") return "tier-building";
    return "tier-starting";
  };

  return (
    <div className="prenova-dashboard">
      {/* Top Header & Refresh Control */}
      <div className="dashboard-header-bar">
        <div className="dashboard-title-group">
          <h1>Career Preparation Dashboard</h1>
          <p>Real-time analytics aggregated across all PreNova AI preparation modules.</p>
        </div>
        <div className="dashboard-actions-group">
          <div className="streak-pill-badge">
            <FaFire /> {streak.count || 0} Day Streak
          </div>
          <button className="refresh-btn" onClick={() => fetchDashboard(true)} disabled={refreshing}>
            <FaSync className={refreshing ? "spin" : ""} /> {refreshing ? "Refreshing..." : "Sync Data"}
          </button>
        </div>
      </div>

      {/* 1. INTERVIEW READINESS INDEX */}
      <div className="readiness-card">
        {/* Multi-Colored Glowing Neon Line Graph Analytics */}
        <div className="readiness-neon-chart">
          <div className="neon-chart-header">
            <div className="neon-legend-group">
              {calculatedSeries.map((series) => (
                <span 
                  key={series.id} 
                  className="legend-pill" 
                  style={{ borderColor: series.color, color: series.color }}
                >
                  <span className="dot" style={{ background: series.color, boxShadow: `0 0 8px ${series.color}` }} />
                  {series.name} ({series.score}%)
                </span>
              ))}
            </div>

            <div className="neon-chart-stats">
              <div className="neon-stat-item">
                <span className="stat-lbl">Weekly Growth</span>
                <span className="stat-val positive">+{readiness.weeklyImprovement}%</span>
              </div>
              <div className="neon-stat-item">
                <span className="stat-lbl">Monthly Growth</span>
                <span className="stat-val positive">+{readiness.monthlyGrowth}%</span>
              </div>
              <div className="neon-stat-item">
                <span className="stat-lbl">Readiness Score</span>
                <span className="stat-val highlight">{readiness.score}%</span>
              </div>
            </div>
          </div>

          <div className="neon-svg-wrapper">
            <svg viewBox="0 0 800 180" className="neon-svg" preserveAspectRatio="none">
              <defs>
                {calculatedSeries.map((series) => (
                  <filter key={`glow-${series.id}`} id={`glow-${series.id}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="35" x2="760" y2="35" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" />
              <line x1="40" y1="70" x2="760" y2="70" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" />
              <line x1="40" y1="105" x2="760" y2="105" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" />
              <line x1="40" y1="140" x2="760" y2="140" stroke="rgba(255, 255, 255, 0.12)" />

              {/* Y-Axis Labels */}
              <text x="32" y="38" fill="#64748B" fontSize="10" textAnchor="end" fontWeight="600">100%</text>
              <text x="32" y="73" fill="#64748B" fontSize="10" textAnchor="end" fontWeight="600">75%</text>
              <text x="32" y="108" fill="#64748B" fontSize="10" textAnchor="end" fontWeight="600">50%</text>
              <text x="32" y="143" fill="#64748B" fontSize="10" textAnchor="end" fontWeight="600">0%</text>

              {/* Multi-colored Line Paths & Node Points */}
              {calculatedSeries.map((series) => (
                <g key={series.id} className="module-series-group">
                  <path 
                    d={series.linePath} 
                    fill="none" 
                    stroke={series.color} 
                    strokeWidth="2.8" 
                    filter={`url(#glow-${series.id})`} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    opacity="0.9"
                  />
                  {series.coords.map((pt, idx) => (
                    <circle 
                      key={idx} 
                      cx={pt.x} 
                      cy={pt.y} 
                      r="4.2" 
                      fill={series.color} 
                      stroke="#0F172A" 
                      strokeWidth="1.8" 
                      filter={`url(#glow-${series.id})`} 
                    />
                  ))}
                </g>
              ))}

              {/* X-Axis Day Labels */}
              {chartDays.map((dayLabel, idx) => {
                const x = 55 + idx * ((760 - 55) / (chartDays.length - 1));
                return (
                  <text key={idx} x={x} y="162" fill="#94A3B8" fontSize="11" fontWeight="600" textAnchor="middle">
                    {dayLabel}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="formula-tooltip-bar">
          <FaInfoCircle />
          <span>Dynamic Score Formula:</span>
          <span className="formula-tag">ATS (20%)</span>
          <span className="formula-tag">Resume (15%)</span>
          <span className="formula-tag">Coding (20%)</span>
          <span className="formula-tag">AI Interview (25%)</span>
          <span className="formula-tag">Company Prep (10%)</span>
          <span className="formula-tag">Consistency (10%)</span>
        </div>
      </div>

      {/* 2. TRACKED ACTIVITY & PERFORMANCE METRICS (5 METRIC CARDS) */}
      <div className="metrics-grid-6">
        {/* Box 1: AI Resume Builder */}
        <div className="metric-card-interactive" onClick={() => navigate("/resume-builder")}>
          <div className="metric-header">
            <span>AI Resume Builder</span>
            <FaChevronRight className="card-arrow" />
          </div>
          <div className="metric-val">{metrics.resumeCompletion}%</div>
          <div className="metric-sub"><FaCheckCircle /> {resumeProgress.sections ? Object.values(resumeProgress.sections).filter(Boolean).length : 0}/7 Sections • {metrics.resumeTimeSpent || "0m spent"}</div>
        </div>

        {/* Box 2: Coding Practice */}
        <div className="metric-card-interactive" onClick={() => navigate("/coding-practice")}>
          <div className="metric-header">
            <span>Coding Practice</span>
            <FaChevronRight className="card-arrow" />
          </div>
          <div className="metric-val">{metrics.codingAccuracy}%</div>
          <div className="metric-sub"><FaCode /> {metrics.problemsSolved || 0}/{metrics.totalProblems || 120} Solved • {metrics.codingTimeSpent || "0m spent"}</div>
        </div>

        {/* Box 3: Company Preparation */}
        <div className="metric-card-interactive" onClick={() => navigate("/company-prep")}>
          <div className="metric-header">
            <span>Company Preparation</span>
            <FaChevronRight className="card-arrow" />
          </div>
          <div className="metric-val">
            {metrics.jobMatchFit !== undefined && metrics.jobMatchFit !== null ? `${metrics.jobMatchFit}%` : "0%"}
          </div>
          <div className="metric-sub"><FaBriefcase /> {metrics.targetRoleName || "Target Role"} • {metrics.companyTimeSpent || "0m spent"}</div>
        </div>

        {/* Box 4: AI Interview Preparation */}
        <div className="metric-card-interactive" onClick={() => onPracticeNow ? onPracticeNow() : navigate("/dashboard/history")}>
          <div className="metric-header">
            <span>AI Interview Preparation</span>
            <FaChevronRight className="card-arrow" />
          </div>
          <div className="metric-val">{metrics.interviewScore}%</div>
          <div className="metric-sub"><FaMicrophone /> {interviewPerf.totalInterviews || 0} Sessions • {metrics.interviewTimeSpent || "0m spent"}</div>
        </div>

        {/* Box 5: ATS Score */}
        <div className="metric-card-interactive" onClick={() => navigate("/ats-score")}>
          <div className="metric-header">
            <span>ATS Score</span>
            <FaChevronRight className="card-arrow" />
          </div>
          <div className="metric-val">{metrics.atsScore}%</div>
          <div className="metric-sub"><FaFileAlt /> Latest ATS Scan • {metrics.atsTimeSpent || "0m spent"}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
