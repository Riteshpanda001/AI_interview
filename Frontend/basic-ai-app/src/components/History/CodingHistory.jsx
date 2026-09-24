import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  FaCode, 
  FaPlus, 
  FaPlay, 
  FaFire, 
  FaTrophy, 
  FaCalendarAlt, 
  FaTrash, 
  FaAward, 
  FaFileAlt,
  FaClipboardList
} from "react-icons/fa";
import { TOP_100_DSA_PROBLEMS } from "../../data/dsaSheetData";
import "./History.css";
import "./CodingHistory.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const CodingHistory = () => {
  const { token, authFetch } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("year"); // "year" | "month"
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState("all");

  const fetchCodingData = async () => {
    try {
      setLoading(true);
      const [resSubs, resStats] = await Promise.all([
        authFetch(`${API_BASE_URL}/coding/history`),
        authFetch(`${API_BASE_URL}/coding/statistics`)
      ]);

      if (resSubs.ok) {
        const dataSubs = await resSubs.json();
        setSubmissions(Array.isArray(dataSubs) ? dataSubs : []);
      } else {
        setSubmissions([]);
      }

      if (resStats.ok) {
        const dataStats = await resStats.json();
        setStats(dataStats);
      }
    } catch (err) {
      console.warn("Error fetching coding history data:", err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCodingData();
    else fetchCodingData();
  }, [token]);

  const handleDeleteSubmission = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission record?")) return;
    try {
      await authFetch(`${API_BASE_URL}/coding/history/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmissions((prev) => prev.filter((s) => (s.id || s._id) !== id));
    }
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm("Are you sure you want to clear ALL coding practice submissions?")) return;
    try {
      await authFetch(`${API_BASE_URL}/coding/history`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmissions([]);
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "N/A";
    const d = new Date(isoStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Safe Stats & Counts Calculation
  const easySolved = stats?.easy_solved ?? submissions.filter(s => s.difficulty === "Easy" && (s.status || "").toLowerCase() === "accepted").length;
  const mediumSolved = stats?.medium_solved ?? submissions.filter(s => s.difficulty === "Medium" && (s.status || "").toLowerCase() === "accepted").length;
  const hardSolved = stats?.hard_solved ?? submissions.filter(s => s.difficulty === "Hard" && (s.status || "").toLowerCase() === "accepted").length;
  const totalSolved = stats?.problems_solved ?? (easySolved + mediumSolved + hardSolved);

  const codingScore = stats?.coding_score ?? (totalSolved * 10 + easySolved * 5 + mediumSolved * 15 + hardSolved * 25);
  const currentStreak = stats?.current_streak ?? 0;
  const longestStreak = stats?.longest_streak ?? (submissions.length ? 1 : 0);
  const potdSolvedCount = stats?.potd_solved ?? 0;
  const instituteRank = stats?.rank ? `#${stats.rank}` : "—";
  const articlesCount = stats?.articles_count ?? 0;

  // Donut SVG Calculations
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const calcOffset = (val, maxVal) => {
    if (!maxVal || maxVal === 0) return circumference;
    const pct = val / maxVal;
    return circumference - pct * circumference;
  };

  // Heatmap Data (12 Months representation)
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Filtered Submissions for Table
  const filteredSubmissions = submissions.filter(
    (s) =>
      (s.problem_title || s.problem_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered Problem Breakdown List from User Submissions
  const breakdownList = submissions.filter((s) => {
    if (selectedDifficultyFilter === "all") return true;
    return (s.difficulty || "").toLowerCase() === selectedDifficultyFilter.toLowerCase();
  });

  return (
    <div className="history-page-container">
      {/* 1. TOP ACTION BAR */}
      <div className="history-filter-bar">
        <input
          type="text"
          placeholder="Search problems by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="history-search-input"
          style={{ width: "320px" }}
        />
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {submissions.length > 0 && (
            <button className="history-cta-btn clear-btn-red" onClick={handleClearAllHistory}>
              <FaTrash /> Clear History
            </button>
          )}
          <button className="history-cta-btn" onClick={() => navigate("/coding-practice")}>
            <FaPlus /> Start Coding Practice
          </button>
        </div>
      </div>

      {/* 2. TOP ANALYTICS GRID (3 PANELS - Matching Image 1) */}
      <div className="coding-analytics-grid">
        {/* Panel 1: Problems Overview Donut */}
        <div className="coding-card">
          <div className="coding-card-title" style={{ textAlign: "center", marginBottom: "0.5rem" }}>Problems Overview</div>
          <div className="problems-overview-box">
            <div className="donut-chart-container">
              <svg className="donut-svg" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={radius} fill="none" stroke="#1E293B" strokeWidth="14" />
                {totalSolved > 0 && (
                  <>
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="14"
                      strokeDasharray={circumference}
                      strokeDashoffset={calcOffset(hardSolved, totalSolved)}
                      strokeLinecap="round"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="14"
                      strokeDasharray={circumference}
                      strokeDashoffset={calcOffset(mediumSolved, totalSolved)}
                      strokeLinecap="round"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="14"
                      strokeDasharray={circumference}
                      strokeDashoffset={calcOffset(easySolved, totalSolved)}
                      strokeLinecap="round"
                    />
                  </>
                )}
              </svg>
              <div className="donut-center-text">
                <div className="big-num">{totalSolved}</div>
                <div className="sub-lbl">Problems Solved</div>
              </div>
            </div>

            <div className="breakdown-legend">
              <div className="legend-item">
                <div className="legend-item-left">
                  <span className="legend-dot dot-easy" />
                  <span>Easy</span>
                </div>
                <strong>({easySolved})</strong>
              </div>
              <div className="legend-item">
                <div className="legend-item-left">
                  <span className="legend-dot dot-medium" />
                  <span>Medium</span>
                </div>
                <strong>({mediumSolved})</strong>
              </div>
              <div className="legend-item">
                <div className="legend-item-left">
                  <span className="legend-dot dot-hard" />
                  <span>Hard</span>
                </div>
                <strong>({hardSolved})</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Metrics & Coding Score Cards */}
        <div className="coding-card">
          <div className="metrics-rows-container">
            <div className="metric-row-item" style={{ background: "rgba(34, 197, 94, 0.08)", borderColor: "rgba(34, 197, 94, 0.2)" }}>
              <div className="metric-row-left">
                <div className="metric-icon-box" style={{ background: "#22C55E22", color: "#22C55E" }}>
                  <FaCode />
                </div>
                <span>Coding Score</span>
              </div>
              <div className="metric-row-val" style={{ color: "#22C55E" }}>{codingScore}</div>
            </div>

            <div className="metric-row-item">
              <div className="metric-row-left">
                <div className="metric-icon-box" style={{ background: "#38BDF822", color: "#38BDF8" }}>
                  <FaCode />
                </div>
                <span>Problems Solved</span>
              </div>
              <div className="metric-row-val">{totalSolved} &gt;</div>
            </div>

            <div className="metric-row-item">
              <div className="metric-row-left">
                <div className="metric-icon-box" style={{ background: "#A855F722", color: "#A855F7" }}>
                  <FaAward />
                </div>
                <span>Institute Rank</span>
              </div>
              <div className="metric-row-val">{instituteRank}</div>
            </div>

            <div className="metric-row-item">
              <div className="metric-row-left">
                <div className="metric-icon-box" style={{ background: "#F59E0B22", color: "#F59E0B" }}>
                  <FaFileAlt />
                </div>
                <span>Articles Published</span>
              </div>
              <div className="metric-row-val">{articlesCount}</div>
            </div>
          </div>
        </div>

        {/* Panel 3: POTD & Streak Status */}
        <div className="coding-card">
          <div className="streak-panel-box">
            <div className="potd-badge-banner">
              <FaFire /> {currentStreak} Day POTD Streak
            </div>

            <div className="streak-cards-subgrid">
              <div className="streak-stat-mini-card">
                <div className="header-lbl">
                  <FaCalendarAlt style={{ color: "#F59E0B" }} /> Longest Streak:
                </div>
                <div className="stat-value">{longestStreak} Days</div>
              </div>

              <div className="streak-stat-mini-card">
                <div className="header-lbl">
                  <FaTrophy style={{ color: "#F59E0B" }} /> POTDs Solved:
                </div>
                <div className="stat-value">{potdSolvedCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUBMISSIONS HEATMAP / MONTHLY LINE CHART */}
      <div className="heatmap-card">
        <div className="heatmap-header-row" style={{ alignItems: "flex-start" }}>
          {viewMode === "year" ? (
            <div className="heatmap-title-text">
              {submissions.length} Submissions in Year 2026
            </div>
          ) : (
            <div style={{ flex: 1, textAlign: "center" }}>
              <div className="monthly-chart-title">
                Monthly Problem Solved: ({
                  submissions.filter((s) => {
                    const dateStr = s.created_at || s.submitted_at;
                    if (!dateStr) return false;
                    return new Date(dateStr).getMonth() === selectedMonth;
                  }).length
                })
              </div>
            </div>
          )}

          <div className="heatmap-header-right" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.6rem" }}>
            <div className="heatmap-toggle-btns">
              <button 
                className={`toggle-btn ${viewMode === "year" ? "active" : ""}`}
                onClick={() => setViewMode("year")}
              >
                Year
              </button>
              <button 
                className={`toggle-btn ${viewMode === "month" ? "active" : ""}`}
                onClick={() => setViewMode("month")}
              >
                Month
              </button>
            </div>

            {viewMode === "month" && (
              <select 
                className="month-select-dropdown"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {months.map((mName, mIdx) => (
                  <option key={mIdx} value={mIdx}>{mName}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="heatmap-grid-scroll">
          {viewMode === "year" ? (
            <div className="heatmap-months-flex">
              {months.map((mName, mIdx) => {
                const monthSubmissions = submissions.filter((s) => {
                  const dateStr = s.created_at || s.submitted_at;
                  if (!dateStr) return false;
                  return new Date(dateStr).getMonth() === mIdx;
                });

                return (
                  <div key={mIdx} className="heatmap-month-column">
                    <div className="heatmap-month-label">{mName.substring(0, 3)}</div>
                    <div className="heatmap-squares-matrix">
                      {Array.from({ length: 16 }).map((_, sqIdx) => {
                        let levelClass = "heatmap-level-0";
                        let countText = 0;

                        if (monthSubmissions.length > 0 && sqIdx < Math.min(16, monthSubmissions.length)) {
                          countText = monthSubmissions.length;
                          levelClass = countText > 5 ? "heatmap-level-3" : countText > 2 ? "heatmap-level-2" : "heatmap-level-1";
                        }

                        return (
                          <div
                            key={sqIdx}
                            className={`heatmap-square ${levelClass}`}
                            title={`${mName}: ${countText} submission${countText === 1 ? "" : "s"}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="monthly-chart-box" style={{ width: "100%", padding: "0.5rem 0" }}>
              {(() => {
                const daysInMonth = new Date(2026, selectedMonth + 1, 0).getDate();
                const monthSubmissions = submissions.filter((s) => {
                  const dateStr = s.created_at || s.submitted_at;
                  if (!dateStr) return false;
                  return new Date(dateStr).getMonth() === selectedMonth;
                });

                // Calculate daily counts for days 1..daysInMonth
                const dailyData = Array.from({ length: daysInMonth }).map((_, dIdx) => {
                  const dayNum = dIdx + 1;
                  const count = monthSubmissions.filter((s) => {
                    const dateStr = s.created_at || s.submitted_at;
                    return dateStr && new Date(dateStr).getDate() === dayNum;
                  }).length;
                  return { day: dayNum, count };
                });

                const maxY = Math.max(6, ...dailyData.map(d => d.count));
                const chartLeft = 45;
                const chartRight = 770;
                const chartTop = 35;
                const chartBottom = 170;
                const chartWidth = chartRight - chartLeft;
                const chartHeight = chartBottom - chartTop;

                const points = dailyData.map((dObj) => {
                  const x = chartLeft + ((dObj.day - 1) / (daysInMonth - 1)) * chartWidth;
                  const y = chartBottom - (dObj.count / maxY) * chartHeight;
                  return { ...dObj, x, y };
                });

                const pathString = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
                const areaString = `${pathString} L ${chartRight} ${chartBottom} L ${chartLeft} ${chartBottom} Z`;

                const yLabels = [6, 4, 2, 0];
                const xTickDays = [1, 5, 9, 13, 17, 21, 25, 29].filter(d => d <= daysInMonth);

                return (
                  <svg className="monthly-area-svg" viewBox="0 0 800 215" style={{ width: "100%", height: "215px" }}>
                    <defs>
                      <linearGradient id="orangeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F97316" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Y Gridlines & Y Axis Labels */}
                    {yLabels.map((yVal) => {
                      const yPos = chartBottom - (yVal / maxY) * chartHeight;
                      return (
                        <g key={yVal}>
                          <line
                            x1={chartLeft}
                            y1={yPos}
                            x2={chartRight}
                            y2={yPos}
                            stroke="rgba(255, 255, 255, 0.08)"
                            strokeDasharray={yVal === 0 ? "none" : "3 3"}
                          />
                          <text x={chartLeft - 12} y={yPos + 4} fill="#94A3B8" fontSize="11" textAnchor="end">
                            {yVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* X Axis Labels */}
                    {xTickDays.map((dayNum) => {
                      const xPos = chartLeft + ((dayNum - 1) / (daysInMonth - 1)) * chartWidth;
                      const formattedDay = String(dayNum).padStart(2, "0");
                      return (
                        <text key={dayNum} x={xPos} y={chartBottom + 22} fill="#94A3B8" fontSize="11" textAnchor="middle">
                          {formattedDay}
                        </text>
                      );
                    })}

                    {/* Gradient Fill Area */}
                    <path d={areaString} fill="url(#orangeAreaGrad)" />

                    {/* Orange Line */}
                    <path d={pathString} fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Data Point Circles */}
                    {points.map((p) => (
                      <circle
                        key={p.day}
                        cx={p.x.toFixed(1)}
                        cy={p.y.toFixed(1)}
                        r="4"
                        fill="#12131A"
                        stroke="#F97316"
                        strokeWidth="2.2"
                        style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                      >
                        <title>{`${months[selectedMonth]} ${p.day}: ${p.count} problem${p.count === 1 ? "" : "s"} solved`}</title>
                      </circle>
                    ))}
                  </svg>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* 4. PROBLEMS BREAKDOWN COMPONENT */}
      <div className="problems-breakdown-card">
        <div className="breakdown-header-row">
          <div className="breakdown-header-left">
            <div className="breakdown-icon-badge">
              <FaClipboardList />
            </div>
            <div className="breakdown-header-info">
              <h3>Problems Breakdown</h3>
              <p>• {submissions.length} Total Problems Solved</p>
            </div>
          </div>

          <select
            className="breakdown-select-dropdown"
            value={selectedDifficultyFilter}
            onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
          >
            <option value="all">All Submissions</option>
            <option value="easy">Easy ({easySolved})</option>
            <option value="medium">Medium ({mediumSolved})</option>
            <option value="hard">Hard ({hardSolved})</option>
          </select>
        </div>

        <div className="breakdown-list-container">
          {breakdownList.length === 0 ? (
            <div className="history-empty-state" style={{ padding: "1.5rem", color: "#94A3B8", textAlign: "center" }}>
              No practice problems solved yet for this filter.
            </div>
          ) : (
            breakdownList.slice(0, 15).map((s, idx) => (
              <div key={s.id || s._id || idx} className="breakdown-problem-item">
                <div className="breakdown-problem-left">
                  <span className="problem-title-text">{s.problem_title || s.problem_name || "Coding Problem"}</span>
                  <span className={`difficulty-pill-badge ${s.difficulty || "Easy"}`}>{s.difficulty || "Easy"}</span>
                </div>
                <button
                  className="history-action-btn"
                  onClick={() => navigate("/coding-practice")}
                >
                  <FaPlay /> Solve
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. SUBMISSIONS TABLE */}
      {loading ? (
        <div className="history-empty-state">Loading your coding submissions...</div>
      ) : filteredSubmissions.length > 0 && (
        <div className="history-table-wrapper">
          <table className="history-data-table">
            <thead>
              <tr>
                <th className="text-center" style={{ width: "70px" }}>Sr No.</th>
                <th>Problem Title</th>
                <th>Category</th>
                <th className="text-center">Difficulty</th>
                <th className="text-center">Status</th>
                <th className="text-center">Runtime</th>
                <th>Submitted Date</th>
                <th className="text-center" style={{ width: "140px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((item, index) => {
                const sId = item.id || item._id;
                const pTitle = item.problem_title || item.problem_name || "Untitled Problem";
                const pDiff = item.difficulty || "Medium";
                const pStatus = item.status || "Accepted";

                return (
                  <tr key={sId || index}>
                    <td className="text-center" style={{ color: "#A5B4FC", fontWeight: "600" }}>
                      {index + 1}
                    </td>
                    <td style={{ fontWeight: "600" }}>
                      <FaCode style={{ color: "#22C55E", marginRight: "8px", verticalAlign: "middle" }} />
                      {pTitle}
                    </td>
                    <td style={{ color: "#CBD5E1" }}>
                      {item.category || "Algorithms"}
                    </td>
                    <td
                      className="text-center"
                      style={{
                        fontWeight: "600",
                        color: pDiff === "Easy" ? "#22C55E" : pDiff === "Medium" ? "#FBBF24" : "#EF4444"
                      }}
                    >
                      {pDiff}
                    </td>
                    <td className="text-center">
                      <span className={`history-score-badge ${pStatus.toLowerCase() === "accepted" ? "badge-high" : "badge-low"}`}>
                        {pStatus}
                      </span>
                    </td>
                    <td className="text-center" style={{ color: "#A5B4FC" }}>
                      {item.runtime || "45ms"}
                    </td>
                    <td style={{ color: "#94A3B8" }}>
                      {formatDate(item.created_at || item.submitted_at)}
                    </td>
                    <td className="text-center">
                      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                        <button className="history-action-btn" onClick={() => navigate("/coding-practice")}>
                          <FaPlay /> Solve
                        </button>
                        <button
                          className="history-action-btn"
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            borderColor: "rgba(239, 68, 68, 0.4)",
                            color: "#f87171"
                          }}
                          onClick={() => handleDeleteSubmission(sId)}
                          title="Delete Submission"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CodingHistory;
