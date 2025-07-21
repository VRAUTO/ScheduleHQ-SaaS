import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import AuthCallback from './components/auth/AuthCallback';
import Dashboard from './components/Dashboard';
import AuthProvider from './components/auth/AuthProvider';
import CreateSection from './components/agencyRoles/CreateSection';
import JoinAgency from './components/agencyRoles/JoinAgency';
import CreateAgency from './components/agencyRoles/CreateAgency';

function RequireAuth({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };

    checkAuth();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/join-agency" element={<JoinAgency />} />
        <Route path="/create-agency" element={<CreateAgency />} />
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <AuthProvider />} />
        {/* Authenticated routes */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth isAuthenticated={isAuthenticated}>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;