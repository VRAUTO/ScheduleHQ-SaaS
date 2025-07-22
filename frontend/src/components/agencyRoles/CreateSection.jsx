import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './index.css';

const CreateSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleJoinAgency = () => {
    navigate('/join-agency');
  };

  const handleCreateAgency = () => {
    navigate('/create-agency');
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error);
      } else {
        // Redirect to home page after logout
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agency-container">
      {/* Logout Button - Top Right */}
      <button
        onClick={handleLogout}
        disabled={loading}
        className="agency-logout-button"
        title="Sign out of your account"
      >
        {loading ? (
          <span className="agency-logout-loading">
            <span className="agency-spinner"></span>
          </span>
        ) : (
          <>
            <span className="agency-logout-icon">🚪</span>
            <span className="agency-logout-text">Logout</span>
          </>
        )}
      </button>

      <div className="agency-card agency-card-center">
        <div className="agency-header">
          <h1 className="agency-title">
            📅 Welcome to Calendar Pro
          </h1>
          <p className="agency-subtitle">
            Choose how you'd like to get started
          </p>
        </div>

        <div className="agency-choice-container">
          <button
            onClick={handleCreateAgency}
            className="agency-choice-button agency-choice-button-primary"
          >
            🏢 Create an Agency
          </button>

          <button
            onClick={handleJoinAgency}
            className="agency-choice-button agency-choice-button-outline"
          >
            👥 Join an Agency
          </button>
        </div>

        <div className="agency-info-box">
          <h3 className="agency-info-title">
            Not sure which option to choose?
          </h3>
          <p className="agency-info-text">
            <strong>Create an Agency</strong> if you want to manage a team's calendars.<br />
            <strong>Join an Agency</strong> if you were invited by a team administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateSection;