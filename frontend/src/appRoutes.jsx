import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthCallback from './components/auth/AuthCallback';
import Dashboard from './components/Dashboard.jsx';
import CreateSection from './components/agencyRoles/CreateSection.jsx';
import CreatingOrg from './components/agencyRoles/CreatingOrg.jsx';
import JoinAgency from './components/agencyRoles/JoinAgency.jsx';
import Auth from './components/auth/AuthProvider.jsx';

// Reusable auth guard
function RequireAuth({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

export default function AppRoutes({ authStatus }) {
  const { isAuthenticated, profileComplete, completeRole } = authStatus;

  const determineRootRoute = () => {
    if (isAuthenticated && profileComplete && completeRole) {
      return <Navigate to="/dashboard" replace />;
    }

    if (isAuthenticated && profileComplete) {
      return <Navigate to="/create-section" replace />;
    }

    if (isAuthenticated) {
      return <Navigate to="/auth/callback" replace />;
    }

    return <Auth />;
  };

  return (
    <Routes>
      {/* Root Route Decision */}
      <Route path="/" element={determineRootRoute()} />

      {/* Public Routes */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/create-section" element={<CreateSection />} />
      <Route path="/join-agency" element={<JoinAgency />} />
      <Route path="/create-agency" element={<CreatingOrg />} />

      {/* Protected Dashboard */}
      {/* <Route
        path="/dashboard"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <Dashboard />
          </RequireAuth>
        }
      /> */}

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}











// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import AuthCallback from './components/auth/AuthCallback';
// // import Auth from './components/Auth';
// import Dashboard from './components/Dashboard.jsx';
// import CreateSection from './components/agencyRoles/CreateSection.jsx';
// import CreatingOrg from './components/agencyRoles/CreatingOrg.jsx';
// import JoinAgency from './components/agencyRoles/JoinAgency.jsx';
// import Auth from './components/auth/AuthProvider.jsx';

// // Reusable auth guard
// function RequireAuth({ isAuthenticated, children }) {
//   return isAuthenticated ? children : <Navigate to="/" replace />;
// }

// export default function AppRoutes({ authStatus }) {
//   const { isAuthenticated, profileComplete, completeRole } = authStatus;
//   return (
//     <Routes>
//       {/* Public Routes */}
//       <Route path="/" element={isAuthenticated && profileComplete ? <Navigate to="/dashboard" /> : <Auth />} />
//       <Route path="/auth/callback" element={<AuthCallback />} />
//       <Route path="/create-section" element={<CreateSection />} />
//       <Route path="/join-agency" element={<JoinAgency />} />
//       <Route path="/create-agency" element={<CreatingOrg />} />

//       {/* Protected Routes */}
//       <Route
//         path="/dashboard"
//         element={
//           <RequireAuth isAuthenticated={isAuthenticated}>
//             <Dashboard />
//           </RequireAuth>
//         }
//       />

//       {/* Catch-all fallback */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }