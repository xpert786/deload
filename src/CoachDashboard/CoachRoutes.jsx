import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import CoachLayout from './Components/CoachLayout';
import CoachDashboard from './Pages/CoachDashboard';
import MyClients from './Pages/MyClients';
import WorkoutPlans from './Pages/WorkoutPlans';
import Messages from './Pages/Messages';
import CoachSettings from './Pages/CoachSettings';

export default function CoachRoutes() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <ProtectedRoute allowedRoles={['coach']}>
            <CoachLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CoachDashboard />} />
        <Route path="dashboard" element={<CoachDashboard />} />
        <Route path="clients" element={<MyClients />} />
        <Route path="workout-plans" element={<WorkoutPlans />} />
        <Route path="messages" element={<Messages />} />
        <Route path="settings" element={<CoachSettings />} />
      </Route>
    </Routes>
  );
}

