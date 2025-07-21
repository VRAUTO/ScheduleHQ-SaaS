import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AuthCallback from './components/AuthCallback';
import CreateSection from './components/Roles/CreateSection';
import JoinAgency from './components/JoinAgency';
import CreateAgency from './components/CreateAgency';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simple routing based on current path
  const currentPath = window.location.pathname;

  useEffect(() => {
    // Simple auth check
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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

  // Handle OAuth callback
  if (currentPath === '/auth/callback') {
    return <AuthCallback />;
  }

  // Handle join agency route
  if (currentPath === '/join-agency') {
    return <JoinAgency />;
  }

  // Handle create agency route
  if (currentPath === '/create-agency') {
    return <CreateAgency />;
  }

  // Handle dashboard route
  if (currentPath === '/dashboard') {
    return <Dashboard />;
  }

  // Show CreateSection if authenticated, otherwise show auth page
  if (isAuthenticated) {
    return <Dashboard />;
  } else {
    return <Auth />;
  }
}

export default App;
