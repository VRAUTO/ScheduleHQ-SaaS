import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthCallback from './components/auth/AuthCallback';
import Dashboard from './components/dashboards/Dashboard.jsx';
import CreateSection from './components/agencyRoles/CreateSection.jsx';
import CreatingOrg from './components/agencyRoles/CreatingOrg.jsx';
import JoinAgency from './components/agencyRoles/JoinAgency.jsx';
import Auth from './components/auth/AuthProvider.jsx';
import UserDashboard from './components/dashboards/UserDashboard.jsx';
import Calendar from './components/calendarUI/Calendar.jsx';

// Auth Guard for profileComplete only
function RequireProfile({ isAuthenticated, profileComplete, children }) {
  const ok = isAuthenticated && profileComplete;
  return ok ? children : <Navigate to="/" replace />;
}

// Auth Guard for completeRole too
function RequireFullAuth({ isAuthenticated, profileComplete, completeRole, children }) {
  const ok = isAuthenticated && profileComplete && completeRole;
  return ok ? children : <Navigate to="/" replace />;
}

// Root logic
function RootRedirect({ isAuthenticated, profileComplete, completeRole, isFreelancer }) {
  // Avoid redirecting while auth is still loading
  if (isAuthenticated === null || profileComplete === null || completeRole === null) {
    return <div>Setting up your account...</div>; // Optional: spinner
  }

  if (isAuthenticated && profileComplete && completeRole) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAuthenticated && profileComplete && !completeRole) {
    return <Navigate to="/create-section" replace />;
  }

  if (isAuthenticated) {
    return <Navigate to="/auth/callback" replace />;
  }

  return <Auth />;
}


export default function AppRoutes({ authStatus }) {
  const { isAuthenticated, profileComplete, completeRole, isFreelancer } = authStatus;

  const DashboardComponent =
    isFreelancer === 'owner' ? <Dashboard /> : <UserDashboard />;

  return (
    <Routes>
      {/* Root route */}
      <Route
        path="/"
        element={
          <RootRedirect
            isAuthenticated={isAuthenticated}
            profileComplete={profileComplete}
            completeRole={completeRole}
            isFreelancer={isFreelancer}
          />
        }
      />

      {/* Public Auth Callback */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected: Needs isAuthenticated + profileComplete */}
      <Route
        path="/create-section"
        element={
          <RequireProfile isAuthenticated={isAuthenticated} profileComplete={profileComplete}>
            <CreateSection />
          </RequireProfile>
        }
      />
      <Route
        path="/join-agency"
        element={
          <RequireProfile isAuthenticated={isAuthenticated} profileComplete={profileComplete}>
            <JoinAgency />
          </RequireProfile>
        }
      />
      <Route
        path="/create-agency"
        element={
          <RequireProfile isAuthenticated={isAuthenticated} profileComplete={profileComplete}>
            <CreatingOrg />
          </RequireProfile>
        }
      />

      {/* Protected: Needs full auth (incl. completeRole) */}
      <Route
        path="/dashboard"
        element={
          <RequireFullAuth
            isAuthenticated={isAuthenticated}
            profileComplete={profileComplete}
            completeRole={completeRole}
          >
            {DashboardComponent}
          </RequireFullAuth>
        }
      />
      <Route
        path="/calendar"
        element={
          <RequireFullAuth
            isAuthenticated={isAuthenticated}
            profileComplete={profileComplete}
            completeRole={completeRole}
          >
            <Calendar />
          </RequireFullAuth>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


































// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import AuthCallback from './components/auth/AuthCallback';
// import Dashboard from './components/dashboards/Dashboard.jsx';
// import CreateSection from './components/agencyRoles/CreateSection.jsx';
// import CreatingOrg from './components/agencyRoles/CreatingOrg.jsx';
// import JoinAgency from './components/agencyRoles/JoinAgency.jsx';
// import Auth from './components/auth/AuthProvider.jsx';
// import UserDashboard from './components/dashboards/UserDashboard.jsx';
// import Calendar from './components/Calendar.jsx';

// // Reusable auth guard
// function RequireAuth({ isAuthenticated, children }) {
//   return isAuthenticated ? children : <Navigate to="/" replace />;
// }

// // Wrapper to determine the initial route
// function RootRedirect({ isAuthenticated, profileComplete, completeRole, isFreelancer }) {
//   if (isAuthenticated && profileComplete && completeRole) {
//     // if (isFreelancer === 'owner') {
//     //   return <Navigate to="/dashboard" replace />;
//     // }
//     //   if (isFreelancer === 'freelancer') {
//     //     return <Navigate to="/User-dashboard" replace />;
//     //   }
//     // }
//     // return <Navigate to="/dashboard" replace />;
//   }
//   if (isAuthenticated && profileComplete && !completeRole) {
//     return <Navigate to="/create-section" replace />;
//   }

//   if (isAuthenticated) {
//     return <Navigate to="/auth/callback" replace />;
//   }

//   return <Auth />;
// }

// export default function AppRoutes({ authStatus }) {
//   const { isAuthenticated, profileComplete, completeRole, isFreelancer } = authStatus;

//   // Choose the correct dashboard component based on role
//   const DashboardComponent =
//     isFreelancer === 'owner' ? <Dashboard /> : <UserDashboard />;

//   return (
//     <Routes>
//       {/* Root Route Decision */}
//       <Route
//         path="/"
//         element={
//           <RootRedirect
//             isAuthenticated={isAuthenticated}
//             profileComplete={profileComplete}
//             completeRole={completeRole}
//             isFreelancer={isFreelancer}
//           />
//         }
//       />

//       {/* Public Routes */}
//       <Route path="/auth/callback" element={<AuthCallback />} />
//       <Route path="/create-section" element={<CreateSection />} />
//       <Route path="/join-agency" element={<JoinAgency />} />
//       <Route path="/create-agency" element={<CreatingOrg />} />
//       {/* <Route path="/User-dashboard" element={<UserDashboard />} /> */}
//       {/* <Route path="/calendar" element={<Calendar />} /> */}

//       {/* Protected Dashboard Route */}
//       <Route
//         path="/dashboard"
//         element={
//           <RequireAuth isAuthenticated={isAuthenticated}>
//             {DashboardComponent}
//           </RequireAuth>
//         }
//       />

//       {/* Protected Calendar Route */}
//       <Route
//         path="/calendar"
//         element={
//           <RequireAuth isAuthenticated={isAuthenticated}>
//             <Calendar />
//           </RequireAuth>
//         }
//       />

//       {/* Catch-all fallback */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }






