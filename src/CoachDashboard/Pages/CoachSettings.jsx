import React from 'react';
import { useAuth } from '../../context/AuthContext';

const CoachSettings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">
          Settings
        </h1>
        <p className="text-[#4D6080] font-[Inter] mt-2">
          Manage your account settings
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#4D6080] mb-2">Name</label>
            <input
              type="text"
              defaultValue={user?.name}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4D6080] mb-2">Email</label>
            <input
              type="email"
              defaultValue={user?.email}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4D6080] mb-2">Phone</label>
            <input
              type="tel"
              defaultValue={user?.phone}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
            />
          </div>
          <button className="bg-[#003F8F] text-white px-6 py-2 rounded-lg hover:bg-[#002A5F] transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachSettings;

