import React, { useState } from "react";
import "./ResumeUpload.css";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    setUploading(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="resume-upload-container">
      <div
        className={`dropzone ${isDragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="fileInput"
          accept=".pdf,.docx,.doc"
          onChange={handleFileChange}
          hidden
        />

        {!file && (
          <label htmlFor="fileInput" className="dropzone-label">
            <div className="upload-icon">📁</div>
            <h3>Drag & Drop your resume here</h3>
            <span>or click to browse (PDF, DOCX up to 5MB)</span>
          </label>
        )}

        {file && (
          <div className="file-info-container">
            <div className="file-icon">📄</div>
            <div className="file-details">
              <h4>{file.name}</h4>
              <p>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            {uploading ? (
              <div className="upload-progress-wrapper">
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <span>{progress}% Uploading...</span>
              </div>
            ) : (
              <div className="upload-success">
                <span className="success-badge">✓ Ready for analysis</span>
                <button className="analyze-btn">Start ATS Scan</button>
              </div>
            )}
          </div>
        )}
      </div>

      {file && !uploading && (
        <button className="reset-btn" onClick={() => setFile(null)}>
          Upload a different file
        </button>
      )}
    </div>
  );
};

export default ResumeUpload;
