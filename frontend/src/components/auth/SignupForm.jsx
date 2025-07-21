import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import './index.css';

const Signup = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(URLS.sign_up, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        return;
      }
      setSuccess(true);
    } catch (err) {
      console.error('Signup error:', err);
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

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card-center">
          <div className="auth-success-icon">✅</div>
          <h2 className="auth-success-title">
            Check Your Email
          </h2>
          <p className="auth-success-text">
            We've sent a confirmation link to <strong>{email}</strong>.
            Please check your email and click the link to activate your account.
          </p>
          <button
            onClick={onSwitchToLogin}
            className="auth-button-secondary"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            📅 Create Account
          </h1>
          <p className="auth-subtitle">
            Join Calendar Pro today
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="auth-form-group">
            <label className="auth-label">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="auth-input"
              placeholder="Enter your full name"
            />
          </div>

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
              minLength={6}
              className="auth-input"
              placeholder="Create a password (min. 6 characters)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button-primary"
          >
            {loading ? 'Creating account...' : 'Create Account'}
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
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="auth-button-link"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
