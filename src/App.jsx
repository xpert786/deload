import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import ClientRoutes from './ClientDashboard/ClientRoutes';
import CoachRoutes from './CoachDashboard/CoachRoutes';
import AdminRoutes from './AdminDashboard/AdminRoutes';
import Register from './ClientDashboard/Pages/Register';
import ClientRegister from './ClientDashboard/Pages/ClientRegister';
import CoachRegister from './CoachDashboard/Pages/CoachRegister';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

const App = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/clientregister" element={<ClientRegister />} />
      <Route path="/coachregister" element={<CoachRegister />} />
      
      {/* Redirect root to appropriate dashboard or login */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            (() => {
              const userRole = user?.role?.toLowerCase();
              if (userRole === 'client') {
                return <Navigate to="/client/dashboard" replace />;
              } else if (userRole === 'coach') {
                return <Navigate to="/coach/dashboard" replace />;
              } else if (userRole === 'admin') {
                return <Navigate to="/admin/dashboard" replace />;
              } else {
                return <Navigate to="/login" replace />;
              }
            })()
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Protected Routes */}
      <Route path="/client/*" element={<ClientRoutes />} />
      <Route path="/coach/*" element={<CoachRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;