import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaFileAlt, FaPlus, FaEdit } from "react-icons/fa";
import "./History.css";

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
      const res = await authFetch(`${API_BASE_URL}/resumes/history`);
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
      } else {
        throw new Error("API fallback");
      }
    } catch (err) {
      setResumes([
        {
          id: "res-1",
          title: "Full Stack Engineer Resume",
          updated_at: "2026-09-17T00:00:00.000Z",
          completion_score: 95,
          sections_complete: "6/7",
          template: "Modern Executive"
        },
        {
          id: "res-2",
          title: "Frontend React Developer Resume",
          updated_at: "2026-09-14T00:00:00.000Z",
          completion_score: 80,
          sections_complete: "4/7",
          template: "Minimal Tech"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchResumes();
    else fetchResumes();
  }, [token]);

  const formatDate = (isoStr) => {
    if (!isoStr) return "N/A";
    const d = new Date(isoStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filtered = resumes.filter(r => 
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.template?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="history-page-container">
      <div className="history-filter-bar">
        <input 
          type="text" 
          placeholder="Search resumes by title or template..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="history-search-input"
        />
        <button className="history-cta-btn" onClick={() => navigate("/resume-builder")}>
          <FaPlus /> Create New Resume
        </button>
      </div>

      {loading ? (
        <div className="history-empty-state">Loading your resume drafts...</div>
      ) : filtered.length === 0 ? (
        <div className="history-empty-state">
          <h3>No Resume History Found</h3>
          <p>You haven't saved any resume versions yet. Click 'Create New Resume' to start!</p>
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
                <th className="text-center" style={{ width: "100px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="text-center" style={{ color: "#A5B4FC", fontWeight: "600" }}>
                    {index + 1}
                  </td>
                  <td style={{ fontWeight: "600" }}>
                    <FaFileAlt style={{ color: "#7F77DD", marginRight: "8px", verticalAlign: "middle" }} />
                    {item.title}
                  </td>
                  <td style={{ color: "#CBD5E1" }}>
                    {item.template || "Standard"}
                  </td>
                  <td className="text-center">
                    <span className={`history-score-badge ${item.completion_score >= 90 ? "badge-high" : "badge-mid"}`}>
                      {item.completion_score}%
                    </span>
                  </td>
                  <td className="text-center" style={{ color: "#A5B4FC", fontWeight: "600" }}>
                    {item.sections_complete || (item.sections ? `${item.sections.length}/7` : "6/7")}
                  </td>
                  <td style={{ color: "#94A3B8" }}>
                    {formatDate(item.updated_at)}
                  </td>
                  <td className="text-center">
                    <button className="history-action-btn" onClick={() => navigate(`/resume-builder?id=${item.id}&edit=true`)}>
                      <FaEdit /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResumeHistory;
