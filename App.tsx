import React, { useState, useEffect } from 'react';
import { MainInterface } from './components/MainInterface';
import { OnboardingFlow } from './components/OnboardingFlow';

export default function App() {
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem('snapgenius_onboarding_complete') === 'true';
  });
  
  const [showUI, setShowUI] = useState(false);

  useEffect(() => {
     // Small hack to ensure styles load before we flicker
     setShowUI(true);
  }, []);

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
    localStorage.setItem('snapgenius_onboarding_complete', 'true');
  };

  if (!showUI) return null;

  return (
    <>
      {!isOnboarded ? (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      ) : (
        <div className="animate-fade-in">
           <MainInterface />
        </div>
      )}
    </>
  );
}