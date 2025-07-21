import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import './index.css';

const Signup = ({ onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [signUpDetails, setSignUpDetails] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const validateForm = () => {
    const { email, password, confirmPassword, name } = signUpDetails;
    if (!email || !password || !confirmPassword || !name) {
      setError('All fields are required');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('http://localhost:5000/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(signUpDetails)
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

  const handleSetDetails = (field, value) => {
    setSignUpDetails(prev => ({
      ...prev,
      [field]: value
    }));
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
              value={signUpDetails.name}
              onChange={(e) => handleSetDetails('name', e.target.value)}
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
              value={signUpDetails.email}
              onChange={(e) => handleSetDetails('email', e.target.value)}
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
              value={signUpDetails.password}
              onChange={(e) => handleSetDetails('password', e.target.value)}
              required
              minLength={6}
              className="auth-input"
              placeholder="Create a password (min. 6 characters)"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">
              Confirm Password
            </label>
            <input
              type="password"
              value={signUpDetails.confirmPassword}
              onChange={(e) => handleSetDetails('confirmPassword', e.target.value)}
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
