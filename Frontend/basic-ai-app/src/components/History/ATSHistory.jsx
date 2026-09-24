import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaCheckCircle, FaPlus, FaRedo, FaTrash } from "react-icons/fa";
import "./History.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const ATSHistory = () => {
  const { token, authFetch } = useAuth();
  const navigate = useNavigate();
  const [atsHistory, setAtsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchATSHistory = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE_URL}/history/ats`);
      if (res.ok) {
        const data = await res.json();
        setAtsHistory(Array.isArray(data) ? data : []);
      } else {
        const res2 = await authFetch(`${API_BASE_URL}/ats/history`);
        if (res2.ok) {
          const data2 = await res2.json();
          setAtsHistory(Array.isArray(data2) ? data2 : []);
        } else {
          setAtsHistory([]);
        }
      }
    } catch (err) {
      console.warn("Error fetching ATS history:", err);
      setAtsHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchATSHistory();
    else fetchATSHistory();
  }, [token]);

  const handleDeleteAtsItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ATS scan entry?")) return;
    try {
      await authFetch(`${API_BASE_URL}/history/ats/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error deleting ATS scan:", err);
    } finally {
      setAtsHistory((prev) => prev.filter((a) => (a.id || a._id) !== id));
    }
  };

  const handleClearAllAtsHistory = async () => {
    if (!window.confirm("Are you sure you want to clear ALL ATS scan history records?")) return;
    try {
      await authFetch(`${API_BASE_URL}/history/ats`, { method: "DELETE" });
    } catch (err) {
      console.error("Error clearing ATS history:", err);
    } finally {
      setAtsHistory([]);
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

  const filtered = atsHistory.filter((a) =>
    (a.job_title || a.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="history-page-container">
      <div className="history-filter-bar">
        <input
          type="text"
          placeholder="Search ATS scans by job title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="history-search-input"
          style={{ width: "320px" }}
        />
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {atsHistory.length > 0 && (
            <button
              className="history-cta-btn clear-btn-red"
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                borderColor: "#f87171"
              }}
              onClick={handleClearAllAtsHistory}
            >
              <FaTrash /> Clear History
            </button>
          )}
          <button className="history-cta-btn" onClick={() => navigate("/ats-score")}>
            <FaPlus /> Analyze New Resume
          </button>
        </div>
      </div>

      {loading ? (
        <div className="history-empty-state">Loading ATS scan history...</div>
      ) : filtered.length === 0 ? (
        <div className="history-empty-state">
          <h3>No ATS Scan History Found</h3>
          <p>You haven't run any ATS resume scans yet. Click 'Analyze New Resume' to test your resume match score!</p>
        </div>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-data-table">
            <thead>
              <tr>
                <th className="text-center" style={{ width: "70px" }}>Sr No.</th>
                <th>Target Job Title</th>
                <th className="text-center">Matched Keywords</th>
                <th>Missing Skills</th>
                <th className="text-center">ATS Score</th>
                <th>Scan Date</th>
                <th className="text-center" style={{ width: "160px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, index) => {
                const aId = item.id || item._id;
                const score = item.score || item.ats_score || 0;
                return (
                  <tr key={aId || index}>
                    <td className="text-center" style={{ color: "#A5B4FC", fontWeight: "600" }}>
                      {index + 1}
                    </td>
                    <td style={{ fontWeight: "600" }}>
                      <FaCheckCircle style={{ color: "#38BDF8", marginRight: "8px", verticalAlign: "middle" }} />
                      {item.job_title || "General Software Engineer"}
                    </td>
                    <td className="text-center" style={{ color: "#38BDF8", fontWeight: "600" }}>
                      {item.matched_keywords_count || 25} Keywords
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#EF4444" }}>
                      {item.missing_skills?.length > 0 ? item.missing_skills.join(", ") : "None"}
                    </td>
                    <td className="text-center">
                      <span className={`history-score-badge ${score >= 85 ? "badge-high" : score >= 70 ? "badge-mid" : "badge-low"}`}>
                        {score}%
                      </span>
                    </td>
                    <td style={{ color: "#94A3B8" }}>
                      {formatDate(item.created_at || item.scanned_at)}
                    </td>
                    <td className="text-center">
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <button className="history-action-btn" onClick={() => navigate("/ats-score")}>
                          <FaRedo /> Re-Scan
                        </button>
                        <button
                          className="history-action-btn"
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            borderColor: "rgba(239, 68, 68, 0.4)",
                            color: "#f87171"
                          }}
                          onClick={() => handleDeleteAtsItem(aId)}
                          title="Delete ATS Scan"
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

export default ATSHistory;
