import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './index.css';

const JoinAgency = () => {
  const navigate = useNavigate();
  const [invitationToken, setInvitationToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinAgency = async (e) => {
    e.preventDefault();
    if (!invitationToken.trim()) {
      setError('Please enter an invitation token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setError('You must be logged in to join an organization');
        return;
      }

      // Accept the invitation using the token
      const { data, error: joinError } = await supabase.rpc('accept_invitation', {
        invitation_token: invitationToken.trim()
      });

      if (joinError) {
        throw joinError;
      }

      // Update user's complete_role to true
      await supabase
        .from('users')
        .update({ complete_role: true })
        .eq('id', session.user.id);

      alert('Successfully joined the organization!');

      // Redirect to dashboard (will show member dashboard)
      navigate('/dashboard');

    } catch (err) {
      console.error('Error joining agency:', err);
      if (err.message.includes('Invalid or expired')) {
        setError('Invalid or expired invitation token. Please check the token and try again.');
      } else if (err.message.includes('different email')) {
        setError('This invitation is for a different email address. Please log in with the correct account.');
      } else if (err.message.includes('already a member')) {
        setError('You are already a member of this organization.');
      } else {
        setError('Failed to join organization: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/create-section');
  };

  return (
    <div className="agency-container">
      <div className="agency-card agency-card-small">
        <div className="agency-header">
          <h1 className="agency-title agency-title-small">
            👥 Join an Organization
          </h1>
          <p className="agency-subtitle agency-subtitle-small">
            Enter the invitation token provided by the organization owner
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
              Invitation Token
            </label>
            <input
              type="text"
              value={invitationToken}
              onChange={(e) => setInvitationToken(e.target.value)}
              placeholder="Enter invitation token"
              className="agency-input"
            />
            <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
              This token was provided to you by the organization owner
            </small>
          </div>

          <button
            type="submit"
            disabled={loading || !invitationToken.trim()}
            className={`agency-button-primary ${loading ? 'agency-loading' : ''}`}
          >
            {loading ? 'Joining Organization...' : 'Join Organization'}
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















// import React, { useState } from "react";
// import { supabase } from '../../lib/supabase';
// import './index.css';

// const JoinAgency = () => {
//   const [agencyCode, setAgencyCode] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleJoinAgency = async (e) => {
//     e.preventDefault();
//     if (!agencyCode.trim()) {
//       setError('Please enter an agency code');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       // Here you would implement the logic to join an agency
//       // For now, we'll just simulate the process
//       await new Promise(resolve => setTimeout(resolve, 1000));

//       // TODO: Implement actual agency joining logic
//       console.log('Joining agency with code:', agencyCode);

//       // Redirect to dashboard after successful join
//       window.location.href = '/dashboard';
//     } catch (err) {
//       setError('Failed to join agency. Please check your code and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBack = () => {
//     window.history.back();
//   };

//   return (
//     <div className="agency-container">
//       <div className="agency-card agency-card-small">
//         <div className="agency-header">
//           <h1 className="agency-title agency-title-small">
//             👥 Join an Agency
//           </h1>
//           <p className="agency-subtitle agency-subtitle-small">
//             Enter the agency code provided by your administrator
//           </p>
//         </div>

//         {error && (
//           <div className="agency-error">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleJoinAgency} className="agency-form">
//           <div className="agency-form-group-large">
//             <label className="agency-label">
//               Agency Code
//             </label>
//             <input
//               type="text"
//               value={agencyCode}
//               onChange={(e) => setAgencyCode(e.target.value)}
//               placeholder="Enter agency invitation code"
//               className="agency-input agency-input-uppercase"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading || !agencyCode.trim()}
//             className={`agency-button-primary ${loading ? 'agency-loading' : ''}`}
//           >
//             {loading ? 'Joining Agency...' : 'Join Agency'}
//           </button>
//         </form>

//         <button
//           onClick={handleBack}
//           className="agency-button-secondary"
//         >
//           Back
//         </button>

//         <div className="agency-info-box agency-info-box-small">
//           <p className="agency-info-text agency-info-text-center">
//             💡 Don't have an agency code? Contact your agency administrator or create your own agency.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JoinAgency;