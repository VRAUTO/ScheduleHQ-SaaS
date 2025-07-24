import { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './appRoutes';
// import { supabase } from './supabaseClient';
import { supabase } from './lib/supabase'

function App() {
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    profileComplete: false,
    completeRole: false,
    isFreelancer: null
  });
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async (session) => {
    if (session?.user) {
      const userId = session.user.id;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('profile_complete, complete_role')
        .eq('id', userId)
        .single();

      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user details:', userError.message);
      }

      if (memberError && memberError.code !== 'PGRST116') {
        console.error('Error fetching organization member:', memberError.message);
      }

      const isFreelancer = memberData ? 'owner' : 'freelancer';

      setAuthStatus({
        isAuthenticated: true,
        profileComplete: userData?.profile_complete ?? false,
        completeRole: userData?.complete_role ?? false,
        isFreelancer
      });
    } else {
      setAuthStatus({
        isAuthenticated: false,
        profileComplete: false,
        completeRole: false,
        isFreelancer: null
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
//   const [authStatus, setAuthStatus] = useState({
//     isAuthenticated: false,
//     profileComplete: false,
//     completeRole: false
//   });
//   const [loading, setLoading] = useState(true);

//   const fetchUserDetails = async (session) => {
//     if (session?.user) {
//       const { data, error } = await supabase
//         .from('users') // Adjust table name if needed
//         .select('profile_complete, complete_role')
//         .eq('id', session.user.id)
//         .single();

//       if (error) {
//         console.error('Error fetching user details:', error.message);
//       } else {
//         setAuthStatus({
//           isAuthenticated: true,
//           profileComplete: data?.profile_complete ?? false,
//           completeRole: data?.complete_role ?? false
//         });
//       }
//     } else {
//       setAuthStatus({
//         isAuthenticated: false,
//         profileComplete: false,
//         completeRole: false
//       });
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     const init = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
//       await fetchUserDetails(session);
//     };

//     init();

//     const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
//       fetchUserDetails(session);
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
//       <AppRoutes authStatus={authStatus} />
//     </Router>
//   );
// }

// export default App;

























