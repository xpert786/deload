import React from 'react';
import { useAuth } from '../../context/AuthContext';

const CoachDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-[#003F8F] font-[BasisGrotesquePro] mb-2">
          Welcome back, {user?.name || 'Coach'}!
        </h1>
        <p className="text-[#4D6080] font-[Inter]">
          Manage your clients and workout plans from here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#003F8F] mb-2 font-[BasisGrotesquePro]">
            Active Clients
          </h3>
          <p className="text-3xl font-bold text-[#4D6080]">12</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#003F8F] mb-2 font-[BasisGrotesquePro]">
            Workout Plans
          </h3>
          <p className="text-3xl font-bold text-[#4D6080]">8</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#003F8F] mb-2 font-[BasisGrotesquePro]">
            Messages
          </h3>
          <p className="text-3xl font-bold text-[#4D6080]">5</p>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;

