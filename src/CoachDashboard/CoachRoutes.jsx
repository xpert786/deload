import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import CoachLayout from './Components/CoachLayout';
import CoachDashboard from './Pages/CoachDashboard';
import MyClients from './Pages/MyClients';
import WorkoutPlans from './Pages/WorkoutPlans';
import Messages from './Pages/Messages';
import CoachSettings from './Pages/CoachSettings';
import ClientProgress from './Pages/ClientProgress';
import Sessions from './Pages/Sessions';
import ClientWorkoutPlans from './Pages/ClientWorkoutPlans';
import ClientDashboard from './Pages/ClientDashboard';
import AIProgram from './Pages/AI-Progress/AIProgram';

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
        <Route path="dashboard/client-progress" element={<ClientProgress />} />
        <Route path="dashboard/sessions" element={<Sessions />} />
        <Route path="clients" element={<MyClients />} />
        <Route path="clients/:id/dashboard" element={<ClientDashboard />} />
        <Route path="clients/:id/workout-plans" element={<ClientWorkoutPlans />} />
        <Route path="workout-plans" element={<WorkoutPlans />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:clientId" element={<Messages />} />
        <Route path="ai-program" element={<AIProgram />} />
        <Route path="settings" element={<CoachSettings />} />
      </Route>
    </Routes>
  );
}

