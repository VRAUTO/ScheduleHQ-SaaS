import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import './index.css';

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
    <div className="agency-container">
      <div className="agency-card">
        <div className="agency-header">
          <h1 className="agency-title">
            🏢 Create Your Agency
          </h1>
          <p className="agency-subtitle agency-subtitle-small">
            Set up your agency to manage team calendars
          </p>
        </div>

        {error && (
          <div className="agency-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="agency-form">
          <div className="agency-form-group">
            <label className="agency-label">
              Agency Name *
            </label>
            <input
              type="text"
              value={formData.agencyName}
              onChange={(e) => handleInputChange('agencyName', e.target.value)}
              required
              className="agency-input"
              placeholder="Enter your agency name"
            />
          </div>

          <div className="agency-form-group">
            <label className="agency-label">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="agency-input agency-textarea"
              placeholder="Describe your agency (optional)"
            />
          </div>

          <div className="agency-form-group">
            <label className="agency-label">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="agency-input"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="agency-form-group-last">
            <label className="agency-label">
              Industry
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className="agency-input agency-select"
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
            className={`agency-button-primary ${loading ? 'agency-loading' : ''}`}
          >
            {loading ? 'Creating Agency...' : 'Create Agency'}
          </button>
        </form>

        <button
          onClick={handleBack}
          className="agency-button-secondary"
        >
          Back
        </button>

        <div className="agency-info-box agency-info-box-small">
          <p className="agency-info-text agency-info-text-center">
            💡 After creating your agency, you'll be able to invite team members and manage their calendars.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAgency;
