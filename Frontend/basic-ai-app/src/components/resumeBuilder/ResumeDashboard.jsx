import React, { useState } from "react";
import "./ResumeDashboard.css";

const ResumeDashboard = ({
  resumes = [],
  onOpenWorkspace,
  onCreateNewBlank,
  onOpenAIGenerator,
  onOpenUploadModal,
  onDuplicateResume,
  onDeleteResume,
  onRenameResume,
  onShareResume
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");

  const filteredResumes = resumes.filter((r) => {
    const titleMatch = (r.title || r.filename || "Untitled Resume")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const roleMatch = (r.parsed_content?.personal?.role || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    if (selectedFilter === "high-ats") return (r.ats_score || 0) >= 85 && (titleMatch || roleMatch);
    if (selectedFilter === "london") return (r.selected_template === "london") && (titleMatch || roleMatch);
    if (selectedFilter === "harvard") return (r.selected_template === "harvard") && (titleMatch || roleMatch);
    return titleMatch || roleMatch;
  });

  const handleStartRename = (r) => {
    setRenamingId(r.id);
    setRenameTitle(r.title || r.filename || "Untitled Resume");
    setActiveMenuId(null);
  };

  const handleSaveRename = (rId) => {
    if (renameTitle.trim() && onRenameResume) {
      onRenameResume(rId, renameTitle.trim());
    }
    setRenamingId(null);
  };

  const avgATS = resumes.length
    ? Math.round(resumes.reduce((acc, curr) => acc + (curr.ats_score || 80), 0) / resumes.length)
    : 0;

  return (
    <div className="resume-dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header-section">
        <div className="dashboard-title-box">
          <h1>Resume Dashboard</h1>
          <p>Create, manage, and AI-enhance your professional resumes in one place.</p>
        </div>

        <div className="dashboard-header-actions">
          <button className="btn-ai-generate" onClick={onOpenAIGenerator}>
            <span>✨</span> Generate with AI
          </button>
          <button className="btn-upload-resume" onClick={onOpenUploadModal}>
            <span>📤</span> Upload PDF / DOCX
          </button>
          <button className="btn-create-blank" onClick={onCreateNewBlank}>
            <span>➕</span> New Blank Resume
          </button>
        </div>
      </div>

      {/* Analytics Overview Bar */}
      <div className="stats-overview-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper purple">📄</div>
          <div className="stat-info">
            <h3>{resumes.length}</h3>
            <p>Total Resumes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">🎯</div>
          <div className="stat-info">
            <h3>{avgATS}%</h3>
            <p>Avg ATS Match Score</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper blue">🎨</div>
          <div className="stat-info">
            <h3>5</h3>
            <p>Modern Templates</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper pink">⚡</div>
          <div className="stat-info">
            <h3>100%</h3>
            <p>AI Enhancement Ready</p>
          </div>
        </div>
      </div>

      {/* Search & Control Filter Bar */}
      <div className="dashboard-controls-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by resume title or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <select
            className="filter-select"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Templates & Scores</option>
            <option value="high-ats">High ATS (85%+)</option>
            <option value="london">London Template</option>
            <option value="harvard">Harvard Template</option>
          </select>

          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              ⊞
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Resumes Content Section */}
      {filteredResumes.length === 0 ? (
        <div className="empty-resumes-state">
          <div className="empty-icon">📑</div>
          <h3>No Resumes Found</h3>
          <p>
            {searchQuery
              ? `No resume matched "${searchQuery}". Try a different term or clear filters.`
              : "Get started by generating an AI resume or uploading your existing PDF/DOCX file."}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button className="btn-ai-generate" onClick={onOpenAIGenerator}>
              ✨ Generate with AI
            </button>
            <button className="btn-create-blank" onClick={onCreateNewBlank}>
              📄 Start Blank Resume
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="resumes-grid">
          {filteredResumes.map((r) => {
            const rTitle = r.title || r.filename || "Untitled Resume";
            const rRole = r.parsed_content?.personal?.role || "Software Professional";
            const rScore = r.ats_score || 85;
            const rTemplate = r.selected_template || "london";
            const isRenaming = renamingId === r.id;

            return (
              <div className="resume-card" key={r.id}>
                <div className="card-top-bar">
                  <span className="template-badge">{rTemplate}</span>
                  <div className="card-actions-menu">
                    <button
                      className="menu-trigger-btn"
                      onClick={() => setActiveMenuId(activeMenuId === r.id ? null : r.id)}
                    >
                      ⋮
                    </button>
                    {activeMenuId === r.id && (
                      <div className="dropdown-menu">
                        <button onClick={() => onOpenWorkspace(r)}>
                          <span>✏️</span> Edit
                        </button>
                        <button onClick={() => handleStartRename(r)}>
                          <span>🏷️</span> Rename
                        </button>
                        <button onClick={() => { setActiveMenuId(null); onDuplicateResume(r.id); }}>
                          <span>📋</span> Duplicate
                        </button>
                        <button onClick={() => { setActiveMenuId(null); onShareResume(r.id); }}>
                          <span>🔗</span> Share Link
                        </button>
                        <button
                          className="delete"
                          onClick={() => { setActiveMenuId(null); onDeleteResume(r.id); }}
                        >
                          <span>🗑️</span> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-main-info">
                  {isRenaming ? (
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <input
                        type="text"
                        value={renameTitle}
                        onChange={(e) => setRenameTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveRename(r.id)}
                        autoFocus
                        style={{
                          background: "#0f172a",
                          border: "1px solid #a855f7",
                          color: "#fff",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "6px",
                          width: "100%"
                        }}
                      />
                      <button
                        onClick={() => handleSaveRename(r.id)}
                        style={{ background: "#a855f7", border: "none", color: "#fff", borderRadius: "6px", padding: "0.2rem 0.6rem", cursor: "pointer" }}
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <h3>{rTitle}</h3>
                  )}
                  <p>{rRole}</p>
                  <div className="ats-score-pill">
                    <span>🎯 ATS Match Score:</span>
                    <strong>{rScore}%</strong>
                  </div>
                </div>

                <div className="card-footer">
                  <span className="last-edited">
                    Updated {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : "Just now"}
                  </span>
                  <button className="btn-open-workspace" onClick={() => onOpenWorkspace(r)}>
                    Edit Resume ➔
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="resumes-list">
          {filteredResumes.map((r) => {
            const rTitle = r.title || r.filename || "Untitled Resume";
            const rRole = r.parsed_content?.personal?.role || "Software Professional";
            const rScore = r.ats_score || 85;

            return (
              <div className="resume-list-item" key={r.id}>
                <div className="list-item-left">
                  <div className="file-type-icon">📄</div>
                  <div className="list-item-meta">
                    <h4>{rTitle}</h4>
                    <p>{rRole} • Template: {r.selected_template || "London"}</p>
                  </div>
                </div>

                <div className="list-item-right">
                  <div className="ats-score-pill">
                    <span>Score:</span>
                    <strong>{rScore}%</strong>
                  </div>
                  <button className="btn-open-workspace" onClick={() => onOpenWorkspace(r)}>
                    Edit
                  </button>
                  <button
                    className="menu-trigger-btn"
                    onClick={() => onDuplicateResume(r.id)}
                    title="Duplicate"
                  >
                    📋
                  </button>
                  <button
                    className="menu-trigger-btn"
                    onClick={() => onDeleteResume(r.id)}
                    title="Delete"
                    style={{ color: "#f87171" }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResumeDashboard;
