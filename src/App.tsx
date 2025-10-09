import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { Dashboard } from './components/dashboard/Dashboard';

function AppContent() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('selectedMember') !== null;
  });

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
  };

  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <AppContent />
      </PreferencesProvider>
    </ThemeProvider>
  );
}

export default App;
