import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import SignUpPage from './components/SignUpPage';
import Dashboard from './components/Dashboard';
import CompleteProfile from './components/CompleteProfile';
import AuthCallback from './components/AuthCallback';
import TestSupabase from './components/TestSupabase';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  // Simple routing based on current path
  const currentPath = window.location.pathname;

  useEffect(() => {
    // Check authentication status with Supabase
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Current session:', session);

        if (session?.user) {
          setIsAuthenticated(true);
          setUser(session.user);

          // Check if user has completed profile
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('profile_complete')
              .eq('id', session.user.id)
              .single();

            setProfileComplete(profile?.profile_complete || false);
            console.log('Profile complete:', profile?.profile_complete);
          } catch (profileError) {
            console.error('Error checking profile:', profileError);
            setProfileComplete(false);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setProfileComplete(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
        setProfileComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);

      if (session?.user) {
        setIsAuthenticated(true);
        setUser(session.user);

        // Check profile completion
        try {
          const { data: profile } = await supabase
            .from('users')
            .select('profile_complete')
            .eq('id', session.user.id)
            .single();

          setProfileComplete(profile?.profile_complete || false);
        } catch (error) {
          console.error('Error checking profile after auth change:', error);
          setProfileComplete(false);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setProfileComplete(false);
      }

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
        <div style={{
          color: 'white',
          fontSize: '18px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>📅</div>
          <div>Loading Calendar Pro...</div>
        </div>
      </div>
    );
  }

  // Handle routing
  if (currentPath === '/auth/callback') {
    return <AuthCallback />;
  }

  if (currentPath === '/test') {
    return <TestSupabase />;
  }

  // If not authenticated, show signup page (except for specific routes)
  if (!isAuthenticated) {
    if (currentPath === '/dashboard' || currentPath === '/complete-profile') {
      // Redirect to home if trying to access protected routes
      window.history.replaceState({}, '', '/');
      return <SignUpPage />;
    }
    return <SignUpPage />;
  }

  // User is authenticated
  if (isAuthenticated && user) {
    // If user hasn't completed profile, show complete profile page
    if (!profileComplete) {
      if (currentPath !== '/complete-profile') {
        window.history.replaceState({}, '', '/complete-profile');
      }
      return <CompleteProfile />;
    }

    // If user has completed profile, show dashboard
    if (currentPath === '/complete-profile') {
      window.history.replaceState({}, '', '/dashboard');
      return <Dashboard />;
    }

    if (currentPath === '/dashboard' || currentPath === '/') {
      return <Dashboard />;
    }
  }

  // Default fallback
  return <SignUpPage />;
}

export default App;
