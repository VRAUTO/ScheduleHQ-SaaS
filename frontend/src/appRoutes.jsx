import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthCallback from './components/auth/AuthCallback';
// import Auth from './components/Auth';
import Dashboard from './components/Dashboard.jsx';
import CreateAgency from './components/agencyRoles/CreateAgency.jsx';
import JoinAgency from './components/agencyRoles/JoinAgency.jsx';
import Auth from './components/auth/AuthProvider.jsx';

// Reusable auth guard
function RequireAuth({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

export default function AppRoutes({ isAuthenticated }) {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/join-agency" element={<JoinAgency />} />
      <Route path="/create-agency" element={<CreateAgency />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <Dashboard />
          </RequireAuth>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}