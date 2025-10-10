import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { Dashboard } from './components/dashboard/Dashboard';

function AppContent() {
  const { user, isLoading, login } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [switchEmail, setSwitchEmail] = useState<string | null>(null);

  useEffect(() => {
    const handleAccountSwitch = (event: CustomEvent) => {
      setSwitchEmail(event.detail.email);
    };

    window.addEventListener('switchAccount', handleAccountSwitch as EventListener);
    return () => {
      window.removeEventListener('switchAccount', handleAccountSwitch as EventListener);
    };
  }, []);

  useEffect(() => {
    if (switchEmail && !user) {
      login(switchEmail, 'password123').catch(console.error);
      setSwitchEmail(null);
    }
  }, [switchEmail, user, login]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-500"></div>
      </div>
    );
  }

  if (!user) {
    if (showSignup) {
      return <SignupPage onSwitchToLogin={() => setShowSignup(false)} />;
    }
    return <LoginPage onSwitchToSignup={() => setShowSignup(true)} />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PreferencesProvider>
          <AppContent />
        </PreferencesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
