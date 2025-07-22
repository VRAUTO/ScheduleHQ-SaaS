import React, { useState } from "react";
import { supabase } from '../../lib/supabase';
import './index.css';

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
    <div className="agency-container">
      <div className="agency-card agency-card-small">
        <div className="agency-header">
          <h1 className="agency-title agency-title-small">
            👥 Join an Agency
          </h1>
          <p className="agency-subtitle agency-subtitle-small">
            Enter the agency code provided by your administrator
          </p>
        </div>

        {error && (
          <div className="agency-error">
            {error}
          </div>
        )}

        <form onSubmit={handleJoinAgency} className="agency-form">
          <div className="agency-form-group-large">
            <label className="agency-label">
              Agency Code
            </label>
            <input
              type="text"
              value={agencyCode}
              onChange={(e) => setAgencyCode(e.target.value)}
              placeholder="Enter agency invitation code"
              className="agency-input agency-input-uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !agencyCode.trim()}
            className={`agency-button-primary ${loading ? 'agency-loading' : ''}`}
          >
            {loading ? 'Joining Agency...' : 'Join Agency'}
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
            💡 Don't have an agency code? Contact your agency administrator or create your own agency.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinAgency;