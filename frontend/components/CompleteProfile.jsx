import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CompleteProfile = () => {
  // Add global CSS reset for full viewport coverage
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html, body {
        height: 100%;
        overflow-x: hidden;
      }
      #root {
        height: 100%;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    timezone: 'UTC',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated and load existing profile
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found, redirecting to home');
        window.history.replaceState({}, '', '/');
        window.location.reload();
        return;
      }
      console.log('session.user', session.user);
      
      setUser(session.user);

      // Try to load existing profile data
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setFormData({
          name: profile.name || '',
          phone: profile.phone || '',
          company: profile.company || '',
          timezone: profile.timezone || 'UTC',
          bio: profile.bio || ''
        });
      } else {
        // Check localStorage for pending name
        const pendingName = localStorage.getItem('pendingUserName');
        if (pendingName) {
          setFormData(prev => ({ ...prev, name: pendingName }));
          localStorage.removeItem('pendingUserName'); // Clean up
        }
      }
    };

    checkUser();
  }, []); const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      // name: formData.name,
      // Update user profile in Supabase
      const { data, error } = await supabase
        .from('users')
        .update({
          phone: formData.phone,
          company: formData.company,
          timezone: formData.timezone,
          bio: formData.bio,
          profile_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        // .select()
        // .single();

      if (error) {
        console.error('Error updating profile:', error);
        setError('Failed to update profile. Please try again.');
        return;
      }

      console.log('Profile updated successfully:', data);
      // Redirect to dashboard
      window.history.replaceState({}, '', '/dashboard');
      window.location.reload();
    } catch (err) {
      console.error('Profile completion error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      overflow: 'auto'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '15%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite reverse'
      }}></div>

      {/* Navigation */}
      <nav style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '28px' }}>📅</span>
          Calendar Pro
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '14px'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}>2</div>
          <span>Profile Setup</span>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        padding: '0 40px',
        gap: '60px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Left Side - Progress & Info */}
        <div style={{
          flex: 1,
          color: 'white',
          paddingTop: '80px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            🎯 Step 2 of 2
          </div>

          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            lineHeight: '1.1',
            margin: '0 0 24px 0',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Complete Your<br />
            <span style={{ color: '#a78bfa' }}>Professional Profile</span>
          </h1>

          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: 'rgba(255,255,255,0.9)',
            margin: '0 0 40px 0',
            maxWidth: '480px'
          }}>
            Help us personalize your calendar experience and connect you with the right integrations.
          </p>

          {/* Progress Steps */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>✓</div>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                Google OAuth Connected
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>2</div>
              <span style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                Profile Information
              </span>
            </div>
          </div>

          {/* Benefits */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              color: 'white'
            }}>
              🚀 What's Next?
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <li style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                • Set up your booking availability
              </li>
              <li style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                • Create your first booking page
              </li>
              <li style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                • Connect payment processing
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side - Form */}
        <div style={{
          flex: '0 0 480px',
          paddingTop: '80px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#1e293b',
                margin: '0 0 8px 0'
              }}>
                Profile Details
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: '16px',
                margin: '0'
              }}>
                This information helps us provide a better experience
              </p>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '16px 20px',
                borderRadius: '12px',
                marginBottom: '24px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  📞 Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  required
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    backgroundColor: '#fafafa'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#fafafa';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  🏢 Company/Organization
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your company or organization"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    backgroundColor: '#fafafa'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#fafafa';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  🌍 Timezone
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    backgroundColor: '#fafafa'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#fafafa';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="America/New_York">Eastern Time (GMT-5)</option>
                  <option value="America/Chicago">Central Time (GMT-6)</option>
                  <option value="America/Denver">Mountain Time (GMT-7)</option>
                  <option value="America/Los_Angeles">Pacific Time (GMT-8)</option>
                  <option value="Europe/London">London (GMT+0)</option>
                  <option value="Europe/Paris">Paris (GMT+1)</option>
                  <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  💭 Bio (Optional)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us a bit about yourself and your business..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    backgroundColor: '#fafafa',
                    resize: 'vertical',
                    minHeight: '100px',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#fafafa';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#3b82f6';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Setting up your profile...
                  </>
                ) : (
                  <>
                    🚀 Complete Setup & Continue
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CompleteProfile;
