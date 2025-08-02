import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const OrganizationMemberDashboard = () => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] = useState([]);

  useEffect(() => {
    fetchUserAndOrganization();
  }, []);

  const fetchUserAndOrganization = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      // Get user's organization membership
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select(`
          role,
          organizations (
            id,
            name,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .eq('role', 'member')
        .single();

      if (membershipError) {
        console.error('Error fetching membership:', membershipError);
        return;
      }

      if (membership) {
        setOrganization(membership.organizations);
        fetchAvailability(user.id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_availability')
        .select('date, start_time, end_time')
        .eq('user_id', userId)
        .eq('is_available', true)
        .order('date', { ascending: true });

      if (error) throw error;
      setAvailabilityData(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const leaveOrganization = async () => {
    if (!confirm('Are you sure you want to leave this organization?')) return;

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('user_id', user.id)
        .eq('org_id', organization.id);

      if (error) throw error;

      alert('You have left the organization successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error leaving organization:', error);
      alert('Error leaving organization');
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

  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const memberFeatures = [
    {
      icon: '📅',
      title: 'Set Availability',
      description: 'Manage your calendar and availability',
      color: '#3b82f6',
      onClick: () => window.location.href = '/calendar'
    },
    {
      icon: '👤',
      title: 'Edit Profile',
      description: 'Update your personal information',
      color: '#10b981',
      onClick: () => window.location.href = '/profile'
    },
    {
      icon: '💬',
      title: 'Messages',
      description: 'Communicate with team members',
      color: '#8b5cf6',
      onClick: () => window.location.href = '/messages'
    }
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
          <h2>Loading Dashboard...</h2>
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

  if (!organization) {
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
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }}>No Organization Found</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>You are not a member of any organization.</p>
        </div>
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
        top: '60%',
        right: '10%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite reverse'
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '15%',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 12s ease-in-out infinite'
      }}></div>

      {/* Header */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '40px 5% 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '800',
            color: 'white',
            margin: '0 0 10px',
            textShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            👥 Member Dashboard
          </h1>
          <p style={{
            fontSize: '1.3rem',
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
            fontWeight: '300'
          }}>
            Welcome to {organization.name}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button
            onClick={leaveOrganization}
            style={{
              background: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(220, 38, 38, 0.9)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.9)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Leave Organization
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.2)',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.25)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.15)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '40px 5% 60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '30px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>

        {/* Organization Info Card */}
        <div style={cardStyle}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🏢 Organization Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#6b7280',
                margin: '0 0 5px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Organization Name</p>
              <p style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>{organization.name}</p>
            </div>
            <div>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#6b7280',
                margin: '0 0 5px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Your Role</p>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 16px',
                backgroundColor: '#d1fae5',
                color: '#065f46',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                ✅ Member
              </span>
            </div>
            <div>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#6b7280',
                margin: '0 0 5px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Joined</p>
              <p style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>{new Date(organization.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Availability Card */}
        <div style={cardStyle}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ⏰ Your Availability
          </h3>
          {availabilityData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {availabilityData.slice(0, 5).map((slot, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div>
                    <p style={{
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: 0,
                      fontSize: '1rem'
                    }}>
                      {new Date(slot.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>
                </div>
              ))}
              {availabilityData.length > 5 && (
                <p style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  textAlign: 'center',
                  margin: '10px 0 0',
                  fontStyle: 'italic'
                }}>
                  And {availabilityData.length - 5} more slots...
                </p>
              )}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📅</div>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>
                No availability data found. Set your availability in the calendar.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div style={{
          ...cardStyle,
          gridColumn: availabilityData.length > 0 ? 'span 1' : '1 / -1'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ⚡ Quick Actions
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {memberFeatures.map((feature, index) => (
              <button
                key={index}
                onClick={feature.onClick}
                style={{
                  background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}dd 100%)`,
                  color: 'white',
                  border: 'none',
                  padding: '24px 20px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
                  {feature.icon}
                </div>
                <h4 style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  margin: '0 0 8px',
                  color: 'white'
                }}>
                  {feature.title}
                </h4>
                <p style={{
                  fontSize: '0.9rem',
                  margin: 0,
                  opacity: 0.9,
                  lineHeight: '1.4'
                }}>
                  {feature.description}
                </p>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Floating Animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-30px) rotate(2deg); }
            66% { transform: translateY(-15px) rotate(-1deg); }
          }
          
          @media (max-width: 768px) {
            h1 { font-size: 2rem !important; }
            .grid { grid-template-columns: 1fr !important; }
          }
        `}
      </style>
    </div>
  );
};

export default OrganizationMemberDashboard;
