import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import './LoadingScreen.css';

const STEPS = [
  "Uploading your files securely...",
  "Analyzing the documents...",
  "Extracting text & formatting...",
  "Brainstorming awesome questions...",
  "Putting the final touches on your quiz..."
];

const LoadingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15); // Start with 15 seconds

  useEffect(() => {
    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // If we hit 0 but backend isn't done, hold at "Almost there..."
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  return (
    <div className="glass-panel card loading-screen">
      <div className="spinner-container animate-pulse">
        <Loader2 size={80} className="spinner-icon" />
      </div>
      
      <h2 className="loading-title">Making Magic Happen! ✨</h2>
      
      <div className="step-container">
        <p className="current-step animate-float">{STEPS[currentStep]}</p>
        
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="timer">
        {timeLeft > 0 ? (
          <p>Estimated time remaining: <strong>{timeLeft} seconds</strong></p>
        ) : (
          <p><strong>Almost there, hang tight...</strong></p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
