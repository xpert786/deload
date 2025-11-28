import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from './Components/AdminLayout';
import AdminDashboard from './Pages/AdminDashboard';
import UserManagement from './Pages/UsertMangements/Usermangements';
import UserDetails from './Pages/UsertMangements/UserDetails';
import AllCoaches from './Pages/AllCoaches';
import BillingSubscriptions from './Pages/BillingSubscriptions';


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
        <Route path="clients" element={<UserManagement />} />
        <Route path="clients/:userId" element={<UserDetails />} />
        <Route path="coaches" element={<AllCoaches />} />
        <Route path="billing" element={<BillingSubscriptions />} />
      </Route>
    </Routes>
  );
}

