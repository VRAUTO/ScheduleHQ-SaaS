import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import '../auth/index.css';
import { URLS } from '../../services/ApiServices';
import { useLocation, useNavigate } from "react-router-dom";

const inviteBySignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const email = queryParams.get("email");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signUpDetails, setSignUpDetails] = useState({
    email: email || '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const validateForm = () => {
    const { email, password, confirmPassword, name } = signUpDetails;

    // Simple email regex pattern
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Strong password criteria: at least 6 characters, 1 lowercase, 1 uppercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!email || !password || !confirmPassword || !name) {
      setError('All fields are required');
      return false;
    }

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!passwordRegex.test(password)) {
      setError(
        'Password must be at least 6 characters and include uppercase, lowercase, and a number'
      );
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
        const response = await fetch(URLS.sign_up, {
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
        // Handle successful signup
        const { user: newuser, error: signupError } = supabase
          .from('users')
          .insert({
            "profile_complete": true,
            "complete_role": true
          })
          .single();

        if (signupError) {
          setError('Error creating user');
          return;
        }
        navigate(`/join?token=${token}&email=${encodeURIComponent(newuser.invited_email)}`);
        return;
        // setSuccess(true);
      } catch (err) {
        console.error('Signup error:', err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetDetails = (field, value) => {
    setSignUpDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
              {email}
            </label>
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
      </div>
    </div>
  );
};

export default inviteBySignup;
