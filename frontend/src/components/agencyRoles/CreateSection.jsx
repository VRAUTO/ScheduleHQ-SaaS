import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './index.css';

const CreateSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('complete_role')
            .eq('id', session.user.id)
            .single();

          if (!error && userData?.complete_role === true) {
            // User has already completed role selection, redirect to dashboard
            navigate('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setCheckingRole(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  const handleJoinAgency = async () => {
    setLoading(true);
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Update user's complete_role to true
        await supabase
          .from('users')
          .update({ complete_role: true })
          .eq('id', session.user.id);
      }

      // Force a page reload to refresh the auth state
      // This ensures the app recognizes the user's complete_role is now true
      window.location.href = '/user-dashboard';
    } catch (err) {
      console.error('Error joining as freelancer:', err);
    } finally {
      setLoading(false);
    }
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

  // Show loading while checking role status
  if (checkingRole) {
    return (
      <div className="agency-container">
        <div className="agency-card agency-card-center">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="agency-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Checking your account...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="agency-logout-text" style={{ color: 'black' }}>Logout</span>
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
            disabled={loading}
            className="agency-choice-button agency-choice-button-outline"
          >
            {loading ? 'Joining...' : '👥 Join as a Freelancer'}
          </button>
        </div>

        <div className="agency-info-box">
          <h3 className="agency-info-title">
            Not sure which option to choose?
          </h3>
          <p className="agency-info-text">
            <strong>Create an Agency</strong> if you want to manage a team's calendars.<br />
            <strong>Join as a Freelancer</strong> if you want to manage your own calendar independently.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateSection;








// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../../lib/supabase';
// import './index.css';

// const CreateSection = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [checkingRole, setCheckingRole] = useState(true);

//   useEffect(() => {
//     const checkUserRole = async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession();

//         if (session?.user) {
//           const { data: userData, error } = await supabase
//             .from('users')
//             .select('complete_role')
//             .eq('id', session.user.id)
//             .single();

//           if (!error && userData?.complete_role === true) {
//             // User has already completed role selection, redirect to dashboard
//             navigate('/dashboard');
//             return;
//           }
//         }
//       } catch (error) {
//         console.error('Error checking user role:', error);
//       } finally {
//         setCheckingRole(false);
//       }
//     };

//     checkUserRole();
//   }, [navigate]);

//   const handleJoinAgency = () => {
//     navigate('/join-agency');
//   };

//   const handleCreateAgency = () => {
//     navigate('/create-agency');
//   };

//   const handleLogout = async () => {
//     setLoading(true);
//     try {
//       const { error } = await supabase.auth.signOut();
//       if (error) {
//         console.error('Error logging out:', error);
//       } else {
//         // Redirect to home page after logout
//         window.location.href = '/';
//       }
//     } catch (err) {
//       console.error('Logout error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Show loading while checking role status
//   if (checkingRole) {
//     return (
//       <div className="agency-container">
//         <div className="agency-card agency-card-center">
//           <div style={{ textAlign: 'center', padding: '2rem' }}>
//             <div className="agency-spinner" style={{ margin: '0 auto 1rem' }}></div>
//             <p>Checking your account...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="agency-container">
//       {/* Logout Button - Top Right */}
//       <button
//         onClick={handleLogout}
//         disabled={loading}
//         className="agency-logout-button"
//         title="Sign out of your account"
//       >
//         {loading ? (
//           <span className="agency-logout-loading">
//             <span className="agency-spinner"></span>
//           </span>
//         ) : (
//           <>
//             <span className="agency-logout-icon">🚪</span>
//             <span className="agency-logout-text" style={{ color: 'black' }}>Logout</span>
//           </>
//         )}
//       </button>

//       <div className="agency-card agency-card-center">
//         <div className="agency-header">
//           <h1 className="agency-title">
//             📅 Welcome to Calendar Pro
//           </h1>
//           <p className="agency-subtitle">
//             Choose how you'd like to get started
//           </p>
//         </div>

//         <div className="agency-choice-container">
//           <button
//             onClick={handleCreateAgency}
//             className="agency-choice-button agency-choice-button-primary"
//           >
//             🏢 Create an Agency
//           </button>

//           <button
//             onClick={handleJoinAgency}
//             className="agency-choice-button agency-choice-button-outline"
//           >
//             👥 Join as a Freelancer
//           </button>
//         </div>

//         <div className="agency-info-box">
//           <h3 className="agency-info-title">
//             Not sure which option to choose?
//           </h3>
//           <p className="agency-info-text">
//             <strong>Create an Agency</strong> if you want to manage a team's calendars.<br />
//             <strong>Join an Agency</strong> if you were invited by a team administrator.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateSection;