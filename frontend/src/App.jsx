import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { supabase } from './lib/supabase';
import AppRoutes from './appRoutes';

function App() {
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    profileComplete: null,
    completeRole: null
  });
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async (session) => {
    if (session?.user) {
      const { data, error } = await supabase
        .from('users') // Adjust table name if needed
        .select('profile_complete, complete_role')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user details:', error.message);
      } else {
        setAuthStatus({
          isAuthenticated: true,
          profileComplete: data?.profile_complete ?? null,
          completeRole: data?.complete_role ?? null
        });
      }
    } else {
      setAuthStatus({
        isAuthenticated: false,
        profileComplete: null,
        completeRole: null
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await fetchUserDetails(session);
    };

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserDetails(session);
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

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
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes authStatus={authStatus} />
    </Router>
  );
}

export default App;





























// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router } from 'react-router-dom';
// import { supabase } from './lib/supabase';
// import AppRoutes from './appRoutes';

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [profileComplete, setProfileComplete] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();

//       setIsAuthenticated(!!session);

//       if (session?.user) {
//         const { data, error } = await supabase
//           .from('users') // or 'users', depending on your table name
//           .select('profile_complete')
//           .eq('id', session.user.id)
//           .single();

//         if (error) {
//           console.error('Error fetching profile:', error.message);
//         } else {
//           setProfileComplete(data?.profile_complete);
//         }
//       }

//       setLoading(false);
//     };

//     fetchUserDetails();

//     const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
//       setIsAuthenticated(!!session);

//       if (session?.user) {
//         supabase
//           .from('users') // adjust table name if needed
//           .select('profile_complete')
//           .eq('id', session.user.id)
//           .single()
//           .then(({ data, error }) => {
//             if (!error) setProfileComplete(data?.profile_complete);
//           });
//       }

//       setLoading(false);
//     });

//     return () => {
//       subscription?.unsubscribe?.();
//     };
//   }, []);

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
//           Loading...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <Router>
//       <AppRoutes
//         isAuthenticated={isAuthenticated}
//         profileComplete={profileComplete}
//       />
//     </Router>
//   );
// }

// export default App;