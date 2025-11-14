import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-[#003F8F] font-[BasisGrotesquePro] mb-2">
          Welcome back, {user?.name || 'Admin'}!
        </h1>
        <p className="text-[#4D6080] font-[Inter]">
          Manage the entire platform from here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#003F8F] mb-2 font-[BasisGrotesquePro]">
            Total Clients
          </h3>
          <p className="text-3xl font-bold text-[#4D6080]">156</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#003F8F] mb-2 font-[BasisGrotesquePro]">
            Total Coaches
          </h3>
          <p className="text-3xl font-bold text-[#4D6080]">24</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#003F8F] mb-2 font-[BasisGrotesquePro]">
            Active Sessions
          </h3>
          <p className="text-3xl font-bold text-[#4D6080]">89</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#003F8F] mb-2 font-[BasisGrotesquePro]">
            Revenue
          </h3>
          <p className="text-3xl font-bold text-[#4D6080]">$12.5K</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

