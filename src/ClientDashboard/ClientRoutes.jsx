import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import ClientLayout from './Components/ClientLayout';
import ClientDashboard from './Pages/ClientDashboard';
import LogWorkout from './Pages/LogWorkout';
import WorkoutPlans from './Pages/WorkoutPlans';
import Reminders from './Pages/Reminders';
import Chat from './Pages/Chat';
import ClientSettings from './Pages/ClientSettings';
import Strength from './Pages/Strength';

export default function ClientRoutes() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientDashboard />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="log-workout" element={<LogWorkout />} />
        <Route path="workout-plans" element={<WorkoutPlans />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="chat" element={<Chat />} />
        <Route path="settings" element={<ClientSettings />} />
        <Route path="dashboard/strength" element={<Strength />} />
      </Route>
    </Routes>
  );
}
