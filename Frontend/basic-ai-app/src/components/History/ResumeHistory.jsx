import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaFileAlt, FaPlus, FaEdit, FaTrash, FaMagic, FaFileUpload, FaChartLine } from "react-icons/fa";
import "./History.css";
import "./ResumeHistory.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const ResumeHistory = () => {
  const { token, authFetch } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchResumes = async () => {
    try {
      setLoading(true);
      let res = await authFetch(`${API_BASE_URL}/history/resumes`);
      if (!res.ok) {
        res = await authFetch(`${API_BASE_URL}/resumes/history`);
      }
      if (res.ok) {
        const data = await res.json();
        setResumes(Array.isArray(data) ? data : []);
      } else {
        setResumes([]);
      }
    } catch (err) {
      console.warn("Error fetching resume history:", err);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchResumes();
    else fetchResumes();
  }, [token]);

  const handleDeleteResume = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume history record?")) return;
    try {
      let res = await authFetch(`${API_BASE_URL}/history/resumes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        await authFetch(`${API_BASE_URL}/resume/${id}`, { method: "DELETE" });
      }
    } catch (err) {
      console.error("Error deleting resume:", err);
    } finally {
      setResumes((prev) => prev.filter((r) => r.id !== id && r._id !== id));
    }
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm("Are you sure you want to remove ALL resume builder history? This action cannot be undone.")) return;
    try {
      await authFetch(`${API_BASE_URL}/history/resumes`, { method: "DELETE" });
    } catch (err) {
      console.error("Error clearing history:", err);
    } finally {
      setResumes([]);
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

  const filtered = resumes.filter(
    (r) =>
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.template?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic Statistics
  const totalResumes = resumes.length;
  const avgATS = totalResumes
    ? Math.round(resumes.reduce((acc, curr) => acc + (curr.ats_score || curr.completion_score || 80), 0) / totalResumes)
    : 0;

  return (
    <div className="history-page-container" style={{ gap: "1.5rem" }}>
      {/* 1. TOP FILTER & ACTIONS BAR */}
      <div className="history-filter-bar">
        <input
          type="text"
          placeholder="Search resumes by title or template..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="history-search-input"
          style={{ width: "320px" }}
        />
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {resumes.length > 0 && (
            <button
              className="history-cta-btn clear-btn-red"
              onClick={handleClearAllHistory}
            >
              <FaTrash /> Clear All History
            </button>
          )}
          <button className="history-cta-btn" onClick={() => navigate("/resume-builder")}>
            <FaPlus /> Create New Resume
          </button>
        </div>
      </div>

      {/* 2. RESUMES HISTORY TABLE */}

      {/* 3. RESUMES HISTORY TABLE */}
      {loading ? (
        <div className="history-empty-state">Loading your resume drafts...</div>
      ) : filtered.length === 0 ? (
        <div className="history-empty-state">
          <h3>No Resume History Found</h3>
          <p>You haven't saved any resume versions yet. Click 'Create New Resume' to start fresh!</p>
        </div>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-data-table">
            <thead>
              <tr>
                <th className="text-center" style={{ width: "70px" }}>Sr No.</th>
                <th>Resume Title</th>
                <th>Template</th>
                <th className="text-center">ATS Score</th>
                <th className="text-center">Sections Complete</th>
                <th>Last Updated</th>
                <th className="text-center" style={{ width: "160px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, index) => {
                const rId = item.id || item._id;
                const score = item.ats_score || item.completion_score || 0;
                return (
                  <tr key={rId || index}>
                    <td className="text-center" style={{ color: "#A5B4FC", fontWeight: "600" }}>
                      {index + 1}
                    </td>
                    <td style={{ fontWeight: "600" }}>
                      <FaFileAlt style={{ color: "#7F77DD", marginRight: "8px", verticalAlign: "middle" }} />
                      {item.title || "Untitled Resume"}
                    </td>
                    <td style={{ color: "#CBD5E1" }}>
                      {item.template || "London"}
                    </td>
                    <td className="text-center">
                      <span className={`history-score-badge ${score >= 80 ? "badge-high" : "badge-mid"}`}>
                        {score}%
                      </span>
                    </td>
                    <td className="text-center" style={{ color: "#A5B4FC", fontWeight: "600" }}>
                      {item.sections_complete || (item.sections ? `${item.sections.length}/7` : "6/7")}
                    </td>
                    <td style={{ color: "#94A3B8" }}>
                      {formatDate(item.updated_at || item.created_at)}
                    </td>
                    <td className="text-center">
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <button
                          className="history-action-btn"
                          onClick={() => navigate(`/resume-builder?id=${rId}&edit=true`)}
                          title="Edit Resume"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          className="history-action-btn"
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            borderColor: "rgba(239, 68, 68, 0.4)",
                            color: "#f87171"
                          }}
                          onClick={() => handleDeleteResume(rId)}
                          title="Delete Resume"
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

export default ResumeHistory;
