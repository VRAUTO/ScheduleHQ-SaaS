import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteToken, setInviteToken] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);

        // Fetch user profile data
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };


  // join agency function

  const joinAgency = async () => {
    if (!inviteToken.trim()) {
      alert('Please enter an invitation token');
      return;
    }

    setJoinLoading(true);

    try {
      const { data, error } = await supabase.rpc('accept_invitation', {
        invitation_token: inviteToken.trim()
      });

      if (error) throw error;

      alert('Successfully joined the organization!');
      setInviteToken('');
      setShowJoinModal(false);
      window.location.reload(); // Refresh to show org member dashboard
    } catch (error) {
      console.error('Error joining agency:', error);
      alert('Error joining agency: ' + error.message);
    } finally {
      setJoinLoading(false);
    }
  };

  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const userFeatures = [
    {
      icon: '📅',
      title: 'My Calendar',
      description: 'View and manage your personal schedule',
      color: '#3b82f6',
      action: 'View Calendar',
      onClick: () => window.location.href = '/calendar'
    },
    {
      icon: '🏢',
      title: 'Join Agency',
      description: 'Join an organization with your invitation link',
      color: '#10b981',
      action: 'Join Now',
      onClick: () => setShowJoinModal(true)
    },
    {
      icon: '🔗',
      title: 'Booking Link',
      description: 'Share your booking link with clients',
      color: '#f59e0b',
      action: 'Copy Link'
    },
    {
      icon: '⏰',
      title: 'Availability',
      description: 'Set your working hours and availability',
      color: '#8b5cf6',
      action: 'Set Hours'
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'View your booking statistics',
      color: '#06b6d4',
      action: 'View Stats'
    },
    {
      icon: '⚙️',
      title: 'Profile Settings',
      description: 'Update your profile and preferences',
      color: '#ef4444',
      action: 'Edit Profile'
    }
  ];

  const quickActions = [
    { icon: '➕', title: 'Create New Service', color: '#10b981' },
    { icon: '📤', title: 'Share Booking Link', color: '#3b82f6' },
    { icon: '📋', title: 'View Today\'s Schedule', color: '#f59e0b' },
    { icon: '💬', title: 'Client Messages', color: '#8b5cf6' }
  ];

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
          <h2>Loading Your Dashboard...</h2>
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
        top: '10%',
        left: '5%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '10%',
        width: '180px',
        height: '180px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite reverse'
      }}></div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInFromLeft {
            from { opacity: 0; transform: translateX(-50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .feature-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
          }
          .feature-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25);
          }
          .quick-action {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .quick-action:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
          }
          .welcome-section {
            animation: fadeInUp 0.8s ease-out;
          }
          .header-section {
            animation: slideInFromLeft 0.8s ease-out;
          }
          .grid-item {
            animation: fadeInUp 0.8s ease-out;
          }
          .grid-item:nth-child(1) { animation-delay: 0.1s; }
          .grid-item:nth-child(2) { animation-delay: 0.2s; }
          .grid-item:nth-child(3) { animation-delay: 0.3s; }
          .grid-item:nth-child(4) { animation-delay: 0.4s; }
          .grid-item:nth-child(5) { animation-delay: 0.5s; }
          .grid-item:nth-child(6) { animation-delay: 0.6s; }
        `}
      </style>

      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '40px 20px',
        minHeight: '100vh'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div className="header-section" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h1 style={{
                fontSize: '38px',
                fontWeight: '800',
                color: 'white',
                margin: '0 0 8px 0',
                textShadow: '0 4px 8px rgba(0,0,0,0.2)',
                letterSpacing: '-0.5px'
              }}>
                👋 Welcome Back!
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '18px',
                margin: '0',
                fontWeight: '300'
              }}>
                Manage your freelance calendar and bookings
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '16px 32px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.25)';
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.15)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              🚪 Logout
            </button>
          </div>

          {/* Welcome Card */}
          <div className="welcome-section" style={{
            ...cardStyle,
            marginBottom: '40px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white',
                fontWeight: '700',
                flexShrink: 0
              }}>
                {userProfile?.first_name?.charAt(0) || user?.email?.charAt(0) || '👤'}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: '0 0 8px 0'
                }}>
                  {userProfile?.first_name && userProfile?.last_name
                    ? `${userProfile.first_name} ${userProfile.last_name}`
                    : user?.user_metadata?.full_name || user?.email || 'User'
                  }
                </h2>
                <p style={{
                  color: '#64748b',
                  fontSize: '16px',
                  margin: '0 0 16px 0'
                }}>
                  Freelancer • {user?.email}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    padding: '6px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    ✅ Active
                  </span>
                  <span style={{
                    padding: '6px 16px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    📅 Available Today
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            ...cardStyle,
            marginBottom: '40px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 24px 0'
            }}>
              ⚡ Quick Actions
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className="quick-action"
                  style={{
                    padding: '20px',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: action.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: 'white'
                  }}>
                    {action.icon}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      {action.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Overview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px',
            marginBottom: '40px'
          }}>
            {/* Today's Stats */}
            <div style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 24px 0'
              }}>
                📊 Today's Overview
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Bookings Today</span>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Available Hours</span>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>8h</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Upcoming</span>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>0</span>
                </div>
              </div>
            </div>

            {/* Booking Link */}
            <div style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 16px 0'
              }}>
                🔗 Your Booking Link
              </h3>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                margin: '0 0 16px 0'
              }}>
                Share this link with clients to let them book appointments
              </p>
              <div style={{
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '16px'
              }}>
                <code style={{
                  fontSize: '12px',
                  color: '#475569',
                  wordBreak: 'break-all'
                }}>
                  https://calendarpro.com/{user?.id || 'your-username'}
                </code>
              </div>
              <button style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                📋 Copy Link
              </button>
            </div>
          </div>

          {/* Main Features Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            marginBottom: '40px'
          }}>
            {userFeatures.map((feature, index) => (
              <div
                key={index}
                className="feature-card grid-item"
                style={{
                  ...cardStyle,
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  fontSize: '48px',
                  marginBottom: '20px',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: '0 0 12px 0'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: '#64748b',
                  fontSize: '16px',
                  margin: '0 0 24px 0',
                  lineHeight: '1.5'
                }}>
                  {feature.description}
                </p>
                <button
                  onClick={feature.onClick}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: feature.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                  {feature.action}
                </button>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 24px 0'
            }}>
              📋 Recent Activity
            </h3>
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>No Recent Activity</h4>
              <p style={{ margin: '0', fontSize: '14px' }}>
                Your booking activity will appear here once you start receiving appointments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Join Agency Modal */}
      {showJoinModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 20px 0',
              textAlign: 'center'
            }}>
              🏢 Join Agency
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '16px',
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}>
              Enter the invitation token you received to join an organization
            </p>
            <input
              type="text"
              placeholder="Enter invitation token"
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                fontSize: '16px',
                marginBottom: '24px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowJoinModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={joinAgency}
                disabled={joinLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: joinLoading ? 'not-allowed' : 'pointer',
                  opacity: joinLoading ? 0.7 : 1
                }}
              >
                {joinLoading ? 'Joining...' : 'Join Agency'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;