import React, { useState, useRef } from 'react';
import { Download, RotateCcw, Home, Award, BookOpen } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import './ResultsReview.css';

const ResultsReview = ({ quizData, userAnswers, score, onRetake, onStartOver }) => {
  const [showReview, setShowReview] = useState(false);
  const contentRef = useRef(null);
  
  const generatePDF = () => {
    const element = contentRef.current;
    
    const opt = {
      margin:       1,
      filename:     `Quiz_Results_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const isPassed = score >= 80;

  return (
    <div className="results-review-container">
      <div className="glass-panel card summary-card animate-float">
        <div className="score-circle">
          <Award size={60} className={isPassed ? "text-success" : "text-primary"} />
          <h1 className="score-text">{score}%</h1>
        </div>
        
        <h2 className="result-message">
          {isPassed ? "Outstanding! You rocked this quiz! 🎉" : "Good effort! Practice makes perfect! 💪"}
        </h2>
        
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={generatePDF}>
            <Download size={20} /> Download PDF
          </button>
          {!showReview && (
            <button className="btn btn-secondary" onClick={() => setShowReview(true)}>
              <BookOpen size={20} /> Review Quiz
            </button>
          )}
          <button className="btn btn-outline" onClick={onRetake}>
            <RotateCcw size={20} /> Retake Quiz
          </button>
          <button className="btn btn-outline" onClick={onStartOver}>
            <Home size={20} /> Start Over
          </button>
        </div>
      </div>

      {/* Hidden printable content for PDF generation */}
      <div style={{ display: 'none' }}>
        <div ref={contentRef} className="pdf-content">
          <div className="pdf-header">
            <h2>{quizData.title || "AI Kids Quiz"}</h2>
            <div className="pdf-meta">
              <p>Name: ______________________</p>
              <p>Date: ______________________</p>
              <p>Score: {score}%</p>
            </div>
          </div>
          
          <div className="pdf-questions">
            {quizData.questions.map((q, i) => (
              <div key={i} className="pdf-question-block">
                <h3>Q{i+1}: {q.question}</h3>
                
                {q.options && q.options.length > 0 ? (
                  <ul className="pdf-options">
                    {q.options.map((opt, optIdx) => (
                      <li key={optIdx}>
                        [ {userAnswers[i]?.selected === opt ? 'X' : ' '} ] {opt}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="pdf-text-answer">
                    <p><strong>Your Answer:</strong> {userAnswers[i]?.selected || 'No answer provided'}</p>
                  </div>
                )}
                
                <div className="pdf-explanation">
                  <p><strong>Correct Answer:</strong> {q.correct_answer || 'N/A'}</p>
                  <p><em>Explanation:</em> {q.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showReview && (
        <div className="review-section">
          <h3 className="section-title">Review Your Answers</h3>
          
          {quizData.questions.map((q, i) => {
            const isCorrect = userAnswers[i]?.isCorrect;
            
            return (
              <div key={i} className={`glass-panel review-card ${isCorrect ? 'border-success' : 'border-error'}`}>
                <div className="review-header">
                  <span className="q-num">Question {i + 1}</span>
                  <span className={`status-badge ${isCorrect ? 'success' : 'error'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                
                <h4 className="q-text">{q.question}</h4>
                
                <div className="answer-comparison">
                  <div className="ans-box yours">
                    <span className="label">You answered:</span>
                    <p>{userAnswers[i]?.selected || "Skipped"}</p>
                  </div>
                  {!isCorrect && q.correct_answer && (
                    <div className="ans-box correct">
                      <span className="label">Correct answer:</span>
                      <p>{q.correct_answer}</p>
                    </div>
                  )}
                </div>
                
                <div className="explanation-box">
                  <strong>Why?</strong>
                  <p>{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResultsReview;
