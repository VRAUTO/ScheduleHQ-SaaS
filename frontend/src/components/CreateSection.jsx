import React from 'react';

const CreateSection = () => {
  const handleJoinAgency = () => {
    window.location.href = '/join-agency';
  };

  const handleCreateAgency = () => {
    window.location.href = '/create-agency';
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
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#1e293b',
            margin: '0 0 12px 0'
          }}>
            📅 Welcome to Calendar Pro
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '18px',
            margin: '0'
          }}>
            Choose how you'd like to get started
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <button
            onClick={handleCreateAgency}
            style={{
              width: '100%',
              padding: '16px 24px',
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
              justifyContent: 'center',
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
            🏢 Create an Agency
          </button>

          <button
            onClick={handleJoinAgency}
            style={{
              width: '100%',
              padding: '16px 24px',
              backgroundColor: 'white',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            👥 Join an Agency
          </button>
        </div>

        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            Not sure which option to choose?
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '0'
          }}>
            <strong>Create an Agency</strong> if you want to manage a team's calendars.<br />
            <strong>Join an Agency</strong> if you were invited by a team administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateSection;