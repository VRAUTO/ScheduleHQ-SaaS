import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const Login = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Store the session in Supabase client
      if (data.session) {
        await supabase.auth.setSession(data.session);
      }

      // Check if user needs to complete profile
      if (data.needsProfileCompletion) {
        // Redirect to profile completion
        window.location.href = '/auth/callback';
        return;
      }

      // Success - the auth state change will handle the redirect
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Failed to sign in with Google');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
            📅 Welcome Back
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            margin: '0'
          }}>
            Sign in to your Calendar Pro account
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '6px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          margin: '20px 0',
          color: '#9ca3af',
          fontSize: '14px'
        }}>
          or
        </div>

        <button
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: 'white',
            color: '#374151',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}
        >
          🔍 Continue with Google
        </button>

        <p style={{
          textAlign: 'center',
          color: '#64748b',
          fontSize: '14px',
          margin: '0'
        }}>
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
