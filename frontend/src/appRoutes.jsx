import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthCallback from './components/auth/AuthCallback';
import Dashboard from './components/dashboards/Dashboard.jsx';
import CreateSection from './components/agencyRoles/CreateSection.jsx';
import CreatingOrg from './components/agencyRoles/CreatingOrg.jsx';
import JoinAgency from './components/agencyRoles/JoinAgency.jsx';
import Auth from './components/auth/AuthProvider.jsx';
import UserDashboard from './components/dashboards/UserDashboard.jsx';
import OrganizationMemberDashboard from './components/OrganizationMemberDashboard.jsx';
import Calendar from './components/calendarUI/Calendar.jsx';
import Invite from './components/invidedBy/invite.jsx';

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
function RootRedirect({ isAuthenticated, profileComplete, completeRole, userRole }) {
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

  if (isAuthenticated && !profileComplete) {
    return <Navigate to="/auth/callback" replace />;
  }

  return <Auth />;
}


export default function AppRoutes({ authStatus }) {
  const { isAuthenticated, profileComplete, completeRole, userRole } = authStatus;

  // Determine which dashboard to show based on user role
  let DashboardComponent;
  if (userRole === 'owner') {
    DashboardComponent = <Dashboard />;
  } else if (userRole === 'member') {
    DashboardComponent = <OrganizationMemberDashboard />;
  } else {
    DashboardComponent = <UserDashboard />;
  }

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
            userRole={userRole}
          />
        }
      />

      {/* Public Auth Callback */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/join?token=:token" element={<Invite />} />

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






