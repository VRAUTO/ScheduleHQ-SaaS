import React, { useState } from "react";
import { supabase } from '../lib/supabase';

const JoinAgency = () => {
  const [agencyCode, setAgencyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinAgency = async (e) => {
    e.preventDefault();
    if (!agencyCode.trim()) {
      setError('Please enter an agency code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Here you would implement the logic to join an agency
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Implement actual agency joining logic
      console.log('Joining agency with code:', agencyCode);

      // Redirect to dashboard after successful join
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Failed to join agency. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
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
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
            👥 Join an Agency
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            margin: '0'
          }}>
            Enter the agency code provided by your administrator
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleJoinAgency}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '6px'
            }}>
              Agency Code
            </label>
            <input
              type="text"
              value={agencyCode}
              onChange={(e) => setAgencyCode(e.target.value)}
              placeholder="Enter agency invitation code"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                textTransform: 'uppercase'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !agencyCode.trim()}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: (loading || !agencyCode.trim()) ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (loading || !agencyCode.trim()) ? 'not-allowed' : 'pointer',
              marginBottom: '12px'
            }}
          >
            {loading ? 'Joining Agency...' : 'Join Agency'}
          </button>
        </form>

        <button
          onClick={handleBack}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: 'white',
            color: '#667eea',
            border: '2px solid #667eea',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Back
        </button>

        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '0',
            textAlign: 'center'
          }}>
            💡 Don't have an agency code? Contact your agency administrator or create your own agency.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinAgency;