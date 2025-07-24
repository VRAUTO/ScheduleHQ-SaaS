import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { URLS } from '../../services/ApiServices';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    bio: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('AuthCallback mounted');
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Get the current session after OAuth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        navigate('/');
        return;
      }

      if (session?.user) {
        setUser(session.user);

        // Check profile status using backend API
        const response = await fetch(URLS.profile_status, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();

          if (!data.needsProfileCompletion) {
            // Profile is complete, redirect to create-section
            console.log('Profile complete, redirecting to create-section');
            navigate('/create-section');
            return;
          }

          // Profile needs completion, show form
          // Pre-fill form with user data
          setFormData({
            name: session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] || '',
            phone: '',
            company: '',
            bio: ''
          });
          setShowForm(true);
          setLoading(false);
        } else {
          console.error('Error checking profile status');
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Get current session to get the access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('No active session. Please sign in again.');
        return;
      }

      const response = await fetch(URLS.complete_profile, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          name: formData.name,
          phone: formData.phone,
          company: formData.company,
          bio: formData.bio,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save profile. Please try again.');
        return;
      }

      // Success - force page reload to refresh auth state
      window.location.href = '/create-section';
    } catch (err) {
      console.error('Profile completion error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>
          Setting up your account...
        </div>
      </div>
    );
  }

  if (showForm) {
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
              🎉 Welcome to Calendar Pro!
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: '16px',
              margin: '0'
            }}>
              Complete your profile to get started
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
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your full name"
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
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your phone number"
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
                Company/Organization
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your company name"
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
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Enter a brief bio about yourself"
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: 'white',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !formData.name.trim()}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: (submitting || !formData.name.trim()) ? '#9ca3af' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (submitting || !formData.name.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Creating Profile...' : 'Complete Setup'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: '12px',
            margin: '20px 0 0 0'
          }}>
            * Required fields
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ color: 'white', fontSize: '18px' }}>
        Redirecting to dashboard...
      </div>
    </div>
  );
};

export default AuthCallback;















// import React, { useEffect, useState } from 'react';
// import { supabase } from '../../lib/supabase';
// import { URLS } from '../../services/ApiServices';
// import { useNavigate } from 'react-router-dom';

// const AuthCallback = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [formData, setFormData] = useState({
//     name: '',
//     phone: '',
//     company: '',
//     bio: ''
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     console.log('AuthCallback mounted');
//     handleAuthCallback();
//   }, []);

//   const handleAuthCallback = async () => {
//     try {
//       // Get the current session after OAuth
//       const { data: { session }, error: sessionError } = await supabase.auth.getSession();

//       if (sessionError) {
//         console.error('Session error:', sessionError);
//         navigate('/');
//         return;
//       }

//       if (session?.user) {
//         setUser(session.user);

//         // Check profile status using backend API
//         const response = await fetch(URLS.profile_status, {
//           headers: {
//             'Authorization': `Bearer ${session.access_token}`
//           }
//         });

//         if (response.ok) {
//           const data = await response.json();

//           if (!data.needsProfileCompletion) {
//             // Profile is complete, redirect to dashboard
//             console.log('Profile complete, redirecting to dashboard');
//             // navigate('/dashboard');
//             navigate('/create-section'); // Temporary redirect to home for testing
//             return;
//           }

//           // Profile needs completion, show form
//           // Pre-fill form with user data
//           setFormData({
//             name: session.user.user_metadata?.full_name ||
//               session.user.user_metadata?.name ||
//               session.user.email?.split('@')[0] || '',
//             phone: '',
//             company: '',
//             bio: ''
//           });
//           setShowForm(true);
//           setLoading(false);
//         } else {
//           console.error('Error checking profile status');
//           navigate('/');
//         }
//       } else {
//         navigate('/');
//       }
//     } catch (error) {
//       console.error('Auth callback error:', error);
//       navigate('/');
//     }
//   };




//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setError('');

//     try {
//       // Get current session to get the access token
//       const { data: { session } } = await supabase.auth.getSession();
//       if (!session) {
//         setError('No active session. Please sign in again.');
//         return;
//       }

//       const response = await fetch(URLS.complete_profile, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${session.access_token}`
//         },
//         body: JSON.stringify({
//           userId: user.id,
//           name: formData.name,
//           phone: formData.phone,
//           company: formData.company,
//           bio: formData.bio,
//         })
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setError(data.error || 'Failed to save profile. Please try again.');
//         return;
//       }

//       // Success - redirect to dashboard
//       navigate('/create-section'); // Temporary redirect to home for testing
//     } catch (err) {
//       console.error('Profile completion error:', err);
//       setError('Network error. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   if (loading) {
//     return (
//       <div style={{
//         minHeight: '100vh',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//         fontFamily: 'system-ui, -apple-system, sans-serif'
//       }}>
//         <div style={{ color: 'white', fontSize: '18px' }}>
//           Setting up your account...
//         </div>
//       </div>
//     );
//   }

//   if (showForm) {
//     return (
//       <div style={{
//         minHeight: '100vh',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//         fontFamily: 'system-ui, -apple-system, sans-serif',
//         padding: '20px'
//       }}>
//         <div style={{
//           backgroundColor: 'white',
//           borderRadius: '20px',
//           padding: '40px',
//           boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
//           width: '100%',
//           maxWidth: '500px'
//         }}>
//           <div style={{ textAlign: 'center', marginBottom: '30px' }}>
//             <h1 style={{
//               fontSize: '32px',
//               fontWeight: '800',
//               color: '#1e293b',
//               margin: '0 0 8px 0'
//             }}>
//               🎉 Welcome to Calendar Pro!
//             </h1>
//             <p style={{
//               color: '#64748b',
//               fontSize: '16px',
//               margin: '0'
//             }}>
//               Complete your profile to get started
//             </p>
//           </div>

//           {error && (
//             <div style={{
//               backgroundColor: '#fee2e2',
//               color: '#dc2626',
//               padding: '12px',
//               borderRadius: '8px',
//               marginBottom: '20px',
//               fontSize: '14px'
//             }}>
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit}>
//             <div style={{ marginBottom: '20px' }}>
//               <label style={{
//                 display: 'block',
//                 color: '#374151',
//                 fontSize: '14px',
//                 fontWeight: '600',
//                 marginBottom: '6px'
//               }}>
//                 Full Name *
//               </label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => handleInputChange('name', e.target.value)}
//                 required
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   border: '2px solid #e5e7eb',
//                   borderRadius: '8px',
//                   fontSize: '16px',
//                   boxSizing: 'border-box'
//                 }}
//                 placeholder="Enter your full name"
//               />
//             </div>

//             <div style={{ marginBottom: '20px' }}>
//               <label style={{
//                 display: 'block',
//                 color: '#374151',
//                 fontSize: '14px',
//                 fontWeight: '600',
//                 marginBottom: '6px'
//               }}>
//                 Phone Number
//               </label>
//               <input
//                 type="tel"
//                 value={formData.phone}
//                 onChange={(e) => handleInputChange('phone', e.target.value)}
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   border: '2px solid #e5e7eb',
//                   borderRadius: '8px',
//                   fontSize: '16px',
//                   boxSizing: 'border-box'
//                 }}
//                 placeholder="Enter your phone number"
//               />
//             </div>

//             <div style={{ marginBottom: '20px' }}>
//               <label style={{
//                 display: 'block',
//                 color: '#374151',
//                 fontSize: '14px',
//                 fontWeight: '600',
//                 marginBottom: '6px'
//               }}>
//                 Company/Organization
//               </label>
//               <input
//                 type="text"
//                 value={formData.company}
//                 onChange={(e) => handleInputChange('company', e.target.value)}
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   border: '2px solid #e5e7eb',
//                   borderRadius: '8px',
//                   fontSize: '16px',
//                   boxSizing: 'border-box'
//                 }}
//                 placeholder="Enter your company name"
//               />
//             </div>

//             <div style={{ marginBottom: '30px' }}>
//               <label style={{
//                 display: 'block',
//                 color: '#374151',
//                 fontSize: '14px',
//                 fontWeight: '600',
//                 marginBottom: '6px'
//               }}>
//                 bio
//               </label>
//               <textarea
//                 value={formData.bio}
//                 onChange={(e) => handleInputChange('bio', e.target.value)}
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   border: '2px solid #e5e7eb',
//                   borderRadius: '8px',
//                   fontSize: '16px',
//                   boxSizing: 'border-box',
//                   backgroundColor: 'white'
//                 }}
//               >
//                 <input placeholder='Enter a brief bio about yourself' type='text' value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} />
//               </textarea>
//             </div>

//             <button
//               type="submit"
//               disabled={submitting || !formData.name.trim()}
//               style={{
//                 width: '100%',
//                 padding: '14px',
//                 backgroundColor: (submitting || !formData.name.trim()) ? '#9ca3af' : '#667eea',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '8px',
//                 fontSize: '16px',
//                 fontWeight: '600',
//                 cursor: (submitting || !formData.name.trim()) ? 'not-allowed' : 'pointer'
//               }}
//             >
//               {submitting ? 'Creating Profile...' : 'Complete Setup'}
//             </button>
//           </form>

//           <p style={{
//             textAlign: 'center',
//             color: '#64748b',
//             fontSize: '12px',
//             margin: '20px 0 0 0'
//           }}>
//             * Required fields
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{
//       minHeight: '100vh',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       fontFamily: 'system-ui, -apple-system, sans-serif'
//     }}>
//       <div style={{ color: 'white', fontSize: '18px' }}>
//         Redirecting to dashboard...
//       </div>
//     </div>
//   );
// };

// export default AuthCallback;
