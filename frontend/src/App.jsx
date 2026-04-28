import React, { useState } from 'react';
import './App.css';
import UploadScreen from './components/UploadScreen';
import LoadingScreen from './components/LoadingScreen';
import InteractiveQuiz from './components/InteractiveQuiz';
import ResultsReview from './components/ResultsReview';

function App() {
  const [currentView, setCurrentView] = useState('upload'); // upload, loading, quiz, results
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);

  const handleQuizGenerated = (data) => {
    setQuizData(data);
    setCurrentView('quiz');
  };

  const handleQuizComplete = (finalScore, answers) => {
    setScore(finalScore);
    setUserAnswers(answers);
    setCurrentView('results');
  };

  const resetApp = () => {
    setQuizData(null);
    setUserAnswers({});
    setScore(0);
    setCurrentView('upload');
  };

  return (
    <div className="app-container">
      <header className="header animate-float">
        <h1>AI Kids Quiz Maker</h1>
        <p>Turn any worksheet into a fun, interactive game!</p>
      </header>

      <main className="main-content">
        <div style={{ display: currentView === 'upload' ? 'block' : 'none' }}>
          <UploadScreen 
            onStartLoading={() => setCurrentView('loading')}
            onQuizGenerated={handleQuizGenerated} 
            onCancelLoading={() => setCurrentView('upload')}
          />
        </div>
        
        {currentView === 'loading' && (
          <LoadingScreen />
        )}
        
        {currentView === 'quiz' && quizData && (
          <InteractiveQuiz 
            quizData={quizData} 
            onComplete={handleQuizComplete} 
          />
        )}
        
        {currentView === 'results' && quizData && (
          <ResultsReview 
            quizData={quizData}
            userAnswers={userAnswers}
            score={score}
            onRetake={() => setCurrentView('quiz')}
            onStartOver={resetApp}
          />
        )}
      </main>
    </div>
  );
}

export default App;
