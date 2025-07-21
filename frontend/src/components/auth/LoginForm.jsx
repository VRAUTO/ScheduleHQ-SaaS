import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import './index.css';
import { URLS } from '../../services/ApiServices';

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
      const response = await fetch(URLS.sign_in, {
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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            📅 Welcome Back
          </h1>
          <p className="auth-subtitle">
            Sign in to your Calendar Pro account
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="auth-form-group">
            <label className="auth-label">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
              placeholder="Enter your email"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button-primary"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          or
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="auth-button-google"
        >
          🔍 Continue with Google
        </button>

        <p className="auth-footer-text">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="auth-button-link"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
