'use client';

import { useAuth } from './AuthProvider';
import AuthPage from './AuthPage';
import SetupWizard from './SetupWizard';
import Dashboard from './Dashboard';

export default function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">♜</div>
          <p className="text-dark-400">Loading Rook...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Check if user has connected required services
  const hasRequiredConnections = user?.apiKeys?.openrouter && user?.render?.connected;

  if (!hasRequiredConnections) {
    return <SetupWizard />;
  }

  return <Dashboard />;
}
