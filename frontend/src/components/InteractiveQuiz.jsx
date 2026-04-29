import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import './InteractiveQuiz.css';

const InteractiveQuiz = ({ quizData, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionIndex: { selected, isCorrect } }

  const questions = quizData.questions || [];
  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return <div className="card">Loading questions...</div>;
  }

  const handleOptionSelect = (option) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(option);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setUserAnswers(prev => ({
      ...prev,
      [currentIndex]: {
        selected: selectedAnswer,
        isCorrect: isCorrect
      }
    }));

    setIsAnswerChecked(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      // Calculate percentage score
      const finalScore = Math.round((score / questions.length) * 100);
      onComplete(finalScore, userAnswers);
    }
  };

  // If question type is not MCQ (no options provided), we render a text area
  const isTextAnswer = !currentQuestion.options || currentQuestion.options.length === 0;

  return (
    <div className="glass-panel card interactive-quiz">
      <div className="quiz-header">
        <h3 className="quiz-title">{quizData.title || "Your Quiz"}</h3>
        <div className="progress-indicator">
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      {currentQuestion.context && (
        <div className="context-box animate-float">
          <span className="context-label">Background Context</span>
          {currentQuestion.context}
        </div>
      )}

      <div className="question-container animate-float">
        <h2 className="question-text">{currentQuestion.question}</h2>
      </div>

      <div className="options-container">
        {isTextAnswer ? (
          <div className="text-answer-box">
            <textarea 
              className="input-field answer-textarea"
              placeholder="Type your answer here..."
              value={selectedAnswer || ''}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              disabled={isAnswerChecked}
            ></textarea>
            {isAnswerChecked && (
              <div className="feedback-box info">
                <p><strong>Answer recorded!</strong> We will review this at the end.</p>
              </div>
            )}
          </div>
        ) : (
          currentQuestion.options.map((option, idx) => {
            let className = "option-btn";
            if (selectedAnswer === option) className += " selected";
            
            if (isAnswerChecked && selectedAnswer === option) {
              if (option === currentQuestion.correct_answer) {
                className += " correct";
              } else {
                className += " wrong";
              }
            }

            return (
              <button 
                key={idx} 
                className={className}
                onClick={() => handleOptionSelect(option)}
                disabled={isAnswerChecked}
              >
                {option}
                {isAnswerChecked && selectedAnswer === option && option === currentQuestion.correct_answer && <CheckCircle2 size={20} className="icon-right" />}
                {isAnswerChecked && selectedAnswer === option && option !== currentQuestion.correct_answer && <XCircle size={20} className="icon-wrong" />}
              </button>
            );
          })
        )}
      </div>

      {isAnswerChecked && currentQuestion.options?.length > 0 && (
        <div className={`feedback-box ${userAnswers[currentIndex]?.isCorrect ? 'success' : 'error'} animate-pulse`}>
          <h4>{userAnswers[currentIndex]?.isCorrect ? 'Great Job! 🌟' : 'Not quite! 🤔'}</h4>
        </div>
      )}

      <div className="action-footer">
        {!isAnswerChecked ? (
          <button 
            className="btn btn-primary check-btn" 
            onClick={checkAnswer}
            disabled={!selectedAnswer}
          >
            Check Answer
          </button>
        ) : (
          <button 
            className="btn btn-secondary next-btn" 
            onClick={handleNext}
          >
            {currentIndex === questions.length - 1 ? 'See Results!' : 'Next Question'} <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default InteractiveQuiz;
