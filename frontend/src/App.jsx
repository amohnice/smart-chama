import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import MemberDashboard from './pages/member/Dashboard';
import AdminFinance from './pages/admin/Finance';
import MemberFinance from './pages/member/Finance';
import AdminMembers from './pages/admin/Members';
import AdminMeetings from './pages/admin/Meetings';
import MemberMeetings from './pages/member/Meetings';
import AdminSettings from './pages/admin/Settings';
import MemberProfile from './pages/member/Profile';
import AdminLayout from './layouts/AdminLayout';
import MemberLayout from './layouts/MemberLayout';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/admin/Profile';

const PrivateRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return roles?.includes('admin') ? <AdminLayout>{children}</AdminLayout> : <MemberLayout>{children}</MemberLayout>;
};

const App = () => {
  const { user, isAuthenticated } = useAuth();

  // Determine the default route based on user role
  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    return user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard';
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getDefaultRoute()} replace />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={getDefaultRoute()} replace />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute roles={['admin']}>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="finance" element={<AdminFinance />} />
              <Route path="finance/transactions" element={<AdminFinance />} />
              <Route path="finance/loans" element={<AdminFinance />} />
              <Route path="finance/reports" element={<AdminFinance />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="meetings" element={<AdminMeetings />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PrivateRoute>
        }
      />

      {/* Member Routes */}
      <Route
        path="/member/*"
        element={
          <PrivateRoute roles={['member']}>
            <Routes>
              <Route path="dashboard" element={<MemberDashboard />} />
              <Route path="finance" element={<MemberFinance />} />
              <Route path="meetings" element={<MemberMeetings />} />
              <Route path="profile" element={<MemberProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PrivateRoute>
        }
      />

      {/* Default Routes */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      <Route path="/dashboard" element={<Navigate to={getDefaultRoute()} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
