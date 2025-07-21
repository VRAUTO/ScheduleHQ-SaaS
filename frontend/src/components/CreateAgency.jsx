import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const CreateAgency = () => {
  const [formData, setFormData] = useState({
    agencyName: '',
    description: '',
    website: '',
    industry: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agencyName.trim()) {
      setError('Agency name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('You must be logged in to create an agency');
        return;
      }

      // Here you would implement the logic to create an agency
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Implement actual agency creation logic
      console.log('Creating agency:', formData);

      // Redirect to dashboard after successful creation
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Failed to create agency. Please try again.');
      console.error('Create agency error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        maxWidth: '500px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
            🏢 Create Your Agency
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            margin: '0'
          }}>
            Set up your agency to manage team calendars
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '6px'
            }}>
              Agency Name *
            </label>
            <input
              type="text"
              value={formData.agencyName}
              onChange={(e) => handleInputChange('agencyName', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your agency name"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '6px'
            }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              placeholder="Describe your agency (optional)"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '6px'
            }}>
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '6px'
            }}>
              Industry
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="">Select your industry</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Marketing">Marketing</option>
              <option value="Consulting">Consulting</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Legal">Legal</option>
              <option value="Non-Profit">Non-Profit</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.agencyName.trim()}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: (loading || !formData.agencyName.trim()) ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (loading || !formData.agencyName.trim()) ? 'not-allowed' : 'pointer',
              marginBottom: '12px'
            }}
          >
            {loading ? 'Creating Agency...' : 'Create Agency'}
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
            💡 After creating your agency, you'll be able to invite team members and manage their calendars.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAgency;
