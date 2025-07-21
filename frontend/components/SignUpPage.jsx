import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import './SignUpPage.css';

const SignUpPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        setError('Name is required for signup');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login with email/password
        console.log('Attempting login with:', formData.email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error('Login error:', error);
          throw error;
        }

        console.log('Login successful:', data);

        // Check if user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('profile_complete')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          // If profile doesn't exist, redirect to complete profile
          window.history.replaceState({}, '', '/complete-profile');
          window.location.reload();
          return;
        }

        if (profile?.profile_complete) {
          window.history.replaceState({}, '', '/dashboard');
          window.location.reload();
        } else {
          window.history.replaceState({}, '', '/complete-profile');
          window.location.reload();
        }
      } else {
        // Sign up with email/password
        console.log('Attempting signup with:', formData.email, 'Name:', formData.name);
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              full_name: formData.name // Try both fields
            }
          }
        });

        if (error) {
          console.error('Signup error:', error);
          throw error;
        }

        console.log('Signup successful:', data);

        if (data.user) {
          // Check if email confirmation is required
          if (!data.user.email_confirmed_at && !data.session) {
            setError('Please check your email and click the confirmation link to complete your signup.');
            setLoading(false);
            return;
          }

          // Create user profile - try multiple times if needed
          let profileCreated = false;
          let attempts = 0;
          const maxAttempts = 3;

          while (!profileCreated && attempts < maxAttempts) {
            attempts++;
            console.log(`Attempting to create profile (attempt ${attempts})...`);

            try {
              // First, check if profile already exists
              const { data: existingProfile } = await supabase
                .from('users')
                .select('id')
                .eq('id', data.user.id)
                .single();

              if (existingProfile) {
                console.log('Profile already exists, updating name...');
                const { error: updateError } = await supabase
                  .from('users')
                  .update({
                    name: formData.name,
                    profile_complete: false
                  })
                  .eq('id', data.user.id);

                if (updateError) {
                  console.error('Profile update error:', updateError);
                } else {
                  console.log('Profile updated successfully');
                  profileCreated = true;
                }
              } else {
                console.log('Creating new profile...');
                const { error: profileError } = await supabase
                  .from('users')
                  .insert([
                    {
                      id: data.user.id,
                      email: data.user.email,
                      name: formData.name,
                      profile_complete: false,
                      created_at: new Date().toISOString(),
                    }
                  ]);

                if (profileError) {
                  console.error('Profile creation error:', profileError);
                  if (profileError.code === '23505') {
                    // Duplicate key error, profile might have been created by trigger
                    console.log('Profile seems to exist, trying update...');
                    continue;
                  }
                } else {
                  console.log('Profile created successfully');
                  profileCreated = true;
                }
              }
            } catch (err) {
              console.error(`Profile operation error (attempt ${attempts}):`, err);
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
              }
            }
          }

          if (!profileCreated) {
            console.warn('Could not create/update profile, but continuing...');
          }

          // Store name in localStorage as backup
          localStorage.setItem('pendingUserName', formData.name);

          // If user is immediately logged in (email confirmation disabled)
          if (data.session) {
            window.history.replaceState({}, '', '/complete-profile');
            window.location.reload();
          } else {
            setError('Please check your email and click the confirmation link to complete your signup.');
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      let errorMessage = 'Authentication failed';

      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link.';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        setError('Google authentication failed');
      }
    } catch (error) {
      console.error('OAuth error:', error);
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* Animated Background Elements */}
      <div className="bg-element-1"></div>
      <div className="bg-element-2"></div>

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-logo">
          <span className="nav-logo-icon">📅</span>
          Calendar Pro
        </div>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <button className="nav-contact-btn">Contact</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Side - Content */}
        <div className="content-section">
          <div className="content-badge">
            🚀 The Future of Scheduling
          </div>

          <h1 className="content-title">
            Professional Calendar<br />
            <span className="content-title-accent">Booking Made Simple</span>
          </h1>

          <p className="content-description">
            Transform your scheduling workflow with our powerful calendar booking platform.
            Perfect for agencies, freelancers, and teams.
          </p>

          {/* Feature List */}
          <div className="features-list">
            {[
              '✨ Google Calendar & Zoom Integration',
              '🔗 Embeddable Booking Widgets',
              '💳 Stripe Payment Processing',
              '👥 Multi-user Team Management'
            ].map((feature, index) => (
              <div key={index} className="feature-item">
                <span className="feature-dot"></span>
                {feature}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="stats-container">
            {[
              { number: '10K+', label: 'Active Users' },
              { number: '50K+', label: 'Bookings Made' },
              { number: '99.9%', label: 'Uptime' }
            ].map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="form-section">
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">
                {isLogin ? 'Welcome Back' : 'Get Started Today'}
              </h2>
              <p className="form-subtitle">
                {isLogin
                  ? 'Sign in to access your dashboard'
                  : 'Join thousands of professionals already using Calendar Pro'
                }
              </p>
            </div>

            {/* Toggle Login/Signup */}
            <div className="toggle-container">
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                  setFormData({ email: '', password: '', confirmPassword: '', name: '' });
                }}
                className={`toggle-btn ${!isLogin ? 'active' : ''}`}
              >
                Sign Up
              </button>
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                  setFormData({ email: '', password: '', confirmPassword: '', name: '' });
                }}
                className={`toggle-btn ${isLogin ? 'active' : ''}`}
              >
                Sign In
              </button>
            </div>

            {/* Google Auth Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="google-auth-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="divider-container">
              <div className="divider-line"></div>
              <span className="divider-text">or</span>
              <div className="divider-line"></div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth}>
              {!isLogin && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required={!isLogin}
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  className="form-input"
                />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required={!isLogin}
                    className="form-input"
                  />
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? (
                  <div className="loading-container">
                    <div className="spinner" />
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="form-footer">
              <p className="footer-text">
                By signing up, you agree to our{' '}
                <a href="#" className="footer-link">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="footer-link">Privacy Policy</a>
              </p>

              <div className="benefits-container">
                <div className="benefit-item">
                  <span>✓</span> Free 14-day trial
                </div>
                <div className="benefit-item">
                  <span>✓</span> No credit card required
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;