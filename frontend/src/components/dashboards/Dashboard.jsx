import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [organization, setOrganization] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    getUser();
    fetchOrganization();

    // Auto-refresh team members every 30 seconds if organization exists
    const interval = setInterval(() => {
      if (organization?.id) {
        fetchTeamMembers(organization.id);
      }
    }, 30000);

    // Refresh when page gains focus (user returns to tab)
    const handleFocus = () => {
      if (organization?.id) {
        fetchTeamMembers(organization.id);
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [organization?.id]);

  const getUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
    setLoading(false);
  };

  const fetchOrganization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('created_by', user.id);

      if (error) {
        console.error('Error fetching organization:', error);
        return;
      }

      // Set organization if one exists, otherwise leave as null
      if (orgs && orgs.length > 0) {
        setOrganization(orgs[0]);
        fetchTeamMembers(orgs[0].id); // Fetch team members when organization is found
      } else {
        setOrganization(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTeamMembers = async (orgId) => {
    setMembersLoading(true);
    try {
      const { data: members, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          role,
          created_at,
          users!organization_members_user_id_fkey (
            id,
            email,
            name,
            created_at
          )
        `)
        .eq('org_id', orgId)
        .eq('role', 'member')
        .order('created_at', { ascending: false });
      console.log('members:', members); // Debugging line

      if (error) {
        console.error('Error fetching team members:', error);
        return;
      }

      setTeamMembers(members || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setMembersLoading(false);
    }
  };

  const viewMemberCalendar = (memberId, memberEmail) => {
    // Navigate to regular calendar with member information in URL params
    // This allows the calendar to show the member's availability
    window.location.href = `/calendar?memberId=${memberId}&memberEmail=${encodeURIComponent(memberEmail)}&view=member`;
  };

  const refreshTeamMembers = () => {
    if (organization?.id) {
      fetchTeamMembers(organization.id);
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    if (!organization) {
      alert('No organization found');
      return;
    }

    setInviteLoading(true);

    try {
      const { data, error } = await supabase.rpc('create_invitation', {
        p_email: inviteEmail.trim(),
        p_organization_id: organization.id
      });

      if (error) throw error;

      alert(`Invitation created for ${inviteEmail}! Share this link: ${window.location.origin}/join?token=${data}`);
      setInviteEmail('');
      setShowInviteModal(false);

      // Refresh team members list after successful invitation
      refreshTeamMembers();
    } catch (error) {
      console.error('Error creating invitation:', error);
      alert('Error creating invitation: ' + error.message);
    } finally {
      setInviteLoading(false);
    }
  };




  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }; const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const featureCards = [
    {
      icon: '📅',
      title: 'My Calendar',
      description: 'View and manage your appointments',
      color: '#3b82f6',
      onClick: () => window.location.href = '/calendar'
    },
    {
      icon: '👥',
      title: 'Team Members',
      description: 'Manage your team and their calendars',
      color: '#10b981',
      onClick: () => setShowInviteModal(true)
    },
    {
      icon: '⚙️',
      title: 'Settings',
      description: 'Configure your availability and preferences',
      color: '#f59e0b'
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'View booking statistics and insights',
      color: '#8b5cf6'
    },
    {
      icon: '💳',
      title: 'Billing',
      description: 'Manage payments and subscriptions',
      color: '#ef4444'
    },
    {
      icon: '🔗',
      title: 'Integrations',
      description: 'Connect with Google, Zoom, and more',
      color: '#06b6d4'
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
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '20%',
        width: '120px',
        height: '120px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 12s ease-in-out infinite'
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
            transform: translateY(-12px) scale(1.03);
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
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
            marginBottom: '50px',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h1 style={{
                fontSize: '42px',
                fontWeight: '800',
                color: 'white',
                margin: '0 0 8px 0',
                textShadow: '0 4px 8px rgba(0,0,0,0.2)',
                letterSpacing: '-0.5px'
              }}>
                📅 Calendar Pro
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '20px',
                margin: '0',
                fontWeight: '300'
              }}>
                Your complete booking solution
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
            marginBottom: '50px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 16px 0'
            }}>
              🎉 Welcome, {user?.user_metadata?.full_name || user?.email || 'User'}!
            </h2>
            <p style={{
              color: '#64748b',
              fontSize: '18px',
              margin: '0 0 32px 0',
              lineHeight: '1.6',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Manage your calendar, team, and bookings all in one place. Get started by exploring the features below.
            </p>
            <div style={{
              display: 'inline-flex',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => window.location.href = '/calendar'}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                📅 View Calendar
              </button>
              <button style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                ⚙️ Settings
              </button>
            </div>
          </div>

          {/* Feature Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            marginBottom: '50px'
          }}>
            {featureCards.map((card, index) => (
              <div
                key={index}
                className="feature-card grid-item"
                style={{
                  ...cardStyle,
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                onClick={card.onClick}
              >
                <div style={{
                  fontSize: '48px',
                  marginBottom: '20px',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }}>
                  {card.icon}
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: '0 0 12px 0'
                }}>
                  {card.title}
                </h3>
                <p style={{
                  color: '#64748b',
                  fontSize: '16px',
                  margin: '0 0 24px 0',
                  lineHeight: '1.5'
                }}>
                  {card.description}
                </p>
                <div style={{
                  width: '60px',
                  height: '4px',
                  backgroundColor: card.color,
                  borderRadius: '2px',
                  margin: '0 auto'
                }}></div>
              </div>
            ))}
          </div>

          {/* Team Members Section - Only show if organization exists */}
          {organization && (
            <div style={{
              ...cardStyle,
              marginBottom: '50px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px'
              }}>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: '0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  👥 Team Members
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#64748b',
                    background: '#f1f5f9',
                    padding: '4px 12px',
                    borderRadius: '20px'
                  }}>
                    {teamMembers.length} members
                  </span>
                </h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                    onClick={refreshTeamMembers}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      color: '#64748b',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.color = '#374151';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.color = '#64748b';
                    }}
                  >
                    🔄 Refresh
                  </button>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#5a67d8';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#667eea';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    ➕ Invite Member
                  </button>
                </div>
              </div>

              {membersLoading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '60px 0',
                  color: '#64748b'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #e2e8f0',
                    borderTop: '3px solid #667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '16px'
                  }}></div>
                  Loading team members...
                </div>
              ) : teamMembers.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 0',
                  color: '#64748b'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '24px' }}>👤</div>
                  <h4 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '0 0 12px'
                  }}>
                    No team members yet
                  </h4>
                  <p style={{
                    fontSize: '16px',
                    margin: '0 0 24px',
                    maxWidth: '400px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    lineHeight: '1.5'
                  }}>
                    Start building your team by sending invitations to freelancers you'd like to work with.
                  </p>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    style={{
                      padding: '12px 32px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Send First Invitation
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '24px'
                }}>
                  {teamMembers.map((member, index) => (
                    <div
                      key={member.id}
                      style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                        e.currentTarget.style.borderColor = '#667eea';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '20px'
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '20px',
                          fontWeight: '700',
                          marginRight: '16px'
                        }}>
                          {member.users?.name ?
                            member.users.name.charAt(0).toUpperCase() :
                            member.users?.email?.charAt(0).toUpperCase() || '?'
                          }
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1e293b',
                            margin: '0 0 4px'
                          }}>
                            {member.users?.name || 'No name provided'}
                          </h4>
                          <p style={{
                            fontSize: '14px',
                            color: '#64748b',
                            margin: 0
                          }}>
                            {member.users?.email}
                          </p>
                        </div>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#10b981',
                          background: '#d1fae5',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          textTransform: 'capitalize'
                        }}>
                          {member.role}
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <p style={{
                            fontSize: '12px',
                            color: '#64748b',
                            margin: '0 0 4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Joined
                          </p>
                          <p style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            margin: 0
                          }}>
                            {new Date(member.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{
                            fontSize: '12px',
                            color: '#64748b',
                            margin: '0 0 4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Member Since
                          </p>
                          <p style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            margin: 0
                          }}>
                            {new Date(member.users?.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        gap: '12px'
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            viewMemberCalendar(member.users?.id, member.users?.email);
                          }}
                          style={{
                            flex: 1,
                            padding: '10px 16px',
                            backgroundColor: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#5a67d8';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#667eea';
                          }}
                        >
                          📅 View Calendar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${member.users?.email}`;
                          }}
                          style={{
                            padding: '10px 16px',
                            backgroundColor: 'transparent',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#f8fafc';
                            e.target.style.borderColor = '#cbd5e1';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.borderColor = '#e2e8f0';
                          }}
                        >
                          ✉️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats Section */}
          <div style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
          }}>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 32px 0',
              textAlign: 'center'
            }}>
              � Quick Stats
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '30px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#3b82f6', marginBottom: '8px' }}>0</div>
                <div style={{ color: '#64748b', fontSize: '16px' }}>Total Bookings</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#10b981', marginBottom: '8px' }}>0</div>
                <div style={{ color: '#64748b', fontSize: '16px' }}>This Month</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#f59e0b', marginBottom: '8px' }}>0</div>
                <div style={{ color: '#64748b', fontSize: '16px' }}>Team Members</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#8b5cf6', marginBottom: '8px' }}>$0</div>
                <div style={{ color: '#64748b', fontSize: '16px' }}>Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
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
              📧 Send Team Invitation
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '16px',
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}>
              Invite a freelancer to join your organization
            </p>
            <input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
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
                onClick={() => setShowInviteModal(false)}
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
                onClick={sendInvitation}
                disabled={inviteLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: inviteLoading ? 'not-allowed' : 'pointer',
                  opacity: inviteLoading ? 0.7 : 1
                }}
              >
                {inviteLoading ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
