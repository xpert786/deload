import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from './Components/AdminLayout';
import AdminDashboard from './Pages/AdminDashboard';
import AllClients from './Pages/AllClients';
import AllCoaches from './Pages/AllCoaches';
import SystemSettings from './Pages/SystemSettings';
import Reports from './Pages/Reports';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="clients" element={<AllClients />} />
        <Route path="coaches" element={<AllCoaches />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>
    </Routes>
  );
}

