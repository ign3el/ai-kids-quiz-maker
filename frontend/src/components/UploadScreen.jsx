import React, { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, FileType, X } from 'lucide-react';
import './UploadScreen.css';

const API_URL = "http://localhost:8000/api";

const UploadScreen = ({ onStartLoading, onQuizGenerated, onCancelLoading }) => {
  const [files, setFiles] = useState([]);
  const [grade, setGrade] = useState('Grade 3');
  const [questionCount, setQuestionCount] = useState(5);
  const [questionType, setQuestionType] = useState('Mix');
  const [error, setError] = useState('');
  const [showCacheModal, setShowCacheModal] = useState(false);
  const [cachedQuizData, setCachedQuizData] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      addFiles(newFiles);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      addFiles(newFiles);
    }
  };

  const addFiles = (newFiles) => {
    // Check 10MB limit per file
    const validFiles = newFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} exceeds 10MB limit.`);
        return false;
      }
      return true;
    });
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e, forceRegenerate = false) => {
    if (e) e.preventDefault();
    if (files.length === 0) {
      setError("Please upload at least one document.");
      return;
    }

    setError('');
    onStartLoading();
    setShowCacheModal(false);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('grade', grade);
    formData.append('question_count', questionCount);
    formData.append('question_type', questionType);
    if (forceRegenerate) {
        formData.append('force_regenerate', 'true');
    }

    try {
      const response = await axios.post(`${API_URL}/generate_quiz`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.status === 'success') {
        if (response.data.source === 'cache' && !forceRegenerate) {
            setCachedQuizData(response.data.data);
            setShowCacheModal(true);
            onCancelLoading(); // Return to upload screen from loading
        } else {
            onQuizGenerated(response.data.data);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "An error occurred during generation.");
      onQuizGenerated({ error: err.response?.data?.detail || "An error occurred" });
    }
  };

  return (
    <div className="glass-panel card upload-screen">
      <h2 className="section-title">Let's build your Quiz! 🚀</h2>
      
      {error && <div className="error-banner">{error}</div>}

      <div 
        className="dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <UploadCloud size={64} className="upload-icon animate-float" />
        <h3>Drag & Drop your worksheets here</h3>
        <p>Supports .pdf, .docx, .pptx (Max 10MB each)</p>
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          style={{display: 'none'}} 
          onChange={handleFileInput}
          accept=".pdf,.docx,.pptx"
        />
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, idx) => (
            <div key={idx} className="file-item">
              <FileType size={20} className="text-secondary" />
              <span className="file-name">{file.name}</span>
              <button className="remove-btn" onClick={() => removeFile(idx)}>
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">CBSE Grade Level</label>
            <select className="input-field" value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option>Grade 1</option>
              <option>Grade 2</option>
              <option>Grade 3</option>
              <option>Grade 4</option>
              <option>Grade 5</option>
              <option>Grade 6</option>
              <option>Grade 7</option>
              <option>Grade 8</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Question Type</label>
            <select className="input-field" value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
              <option value="Mix">Mix (Mimic document)</option>
              <option value="MCQ">Multiple Choice Only</option>
              <option value="True/False">True / False</option>
              <option value="Short Answer">Short Answer</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Number of Questions: {questionCount}</label>
            <input 
              type="range" 
              min="3" 
              max="20" 
              value={questionCount} 
              onChange={(e) => setQuestionCount(e.target.value)}
              className="slider"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary generate-btn" disabled={files.length === 0}>
          ✨ Generate Magic Quiz
        </button>
      </form>

      {/* Cache Collision Modal */}
      {showCacheModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel card animate-float">
            <h3 style={{marginBottom: "1rem"}}>Duplicate Document Found!</h3>
            <p style={{marginBottom: "1.5rem", color: "var(--text-muted)"}}>
              We found a quiz you already generated for this exact document in the last 24 hours.
            </p>
            <div className="modal-actions" style={{display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap"}}>
              <button 
                className="btn btn-secondary" 
                onClick={() => onQuizGenerated(cachedQuizData)}
              >
                Load Previous Quiz
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handleSubmit(null, true)}
              >
                Generate New Quiz
              </button>
            </div>
            <button 
              className="btn btn-outline" 
              style={{marginTop: "1rem", width: "100%"}}
              onClick={() => setShowCacheModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadScreen;
