import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          // User is authenticated, check if profile is complete
          const user = data.session.user;

          // Check if user exists in our users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (userError && userError.code !== 'PGRST116') {
            console.error('Error checking user:', userError);
            setError('Failed to check user profile');
            setLoading(false);
            return;
          }

          if (!userData) {
            // Create user profile
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || user.email,
                profile_picture: user.user_metadata?.avatar_url,
                profile_complete: false,
                created_at: new Date().toISOString()
              });

            if (insertError) {
              console.error('Error creating user:', insertError);
            }

            // Redirect to complete profile
            window.location.href = '/complete-profile';
          } else if (!userData.profile_complete) {
            // Profile exists but not complete
            window.location.href = '/complete-profile';
          } else {
            // Profile is complete, go to dashboard
            window.location.href = '/dashboard';
          }
        } else {
          // No session, redirect to signup
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Authentication failed');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, []);

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2>Completing authentication...</h2>
          <p style={{ opacity: 0.8, marginTop: '10px' }}>Please wait a moment</p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <h2>Authentication Failed</h2>
          <p style={{ opacity: 0.8, marginTop: '10px', marginBottom: '30px' }}>{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
          >
            Back to Sign Up
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
