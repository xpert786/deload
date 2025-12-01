import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ClientSettings = () => {
  const { user } = useAuth();
  const [units, setUnits] = useState('kg');
  const [profileImage, setProfileImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 bg-[#F3F7FF]">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-medium text-[#003F8F] font-[Poppins]">
          Settings
        </h2>
      </div>

      {/* Profile Settings Section */}
      <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
        <h2 className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-4 sm:mb-6">
          Profile Settings
        </h2>

        <div className="space-y-4 sm:space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-[#60A5FA]"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-[#60A5FA] flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400 text-xs sm:text-sm font-[Inter]">No Image</span>
                </div>
              )}
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <span className="inline-block  bg-[#4D60801A] px-4 py-2 border-2 border-[#60A5FA] text-[#003F8F] rounded-lg font-medium font-[Inter] hover:bg-[#60A5FA]/10 transition-colors">
                Choose Picture
              </span>
            </label>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-[#003F8F] mb-2 font-[Inter]">
              Name
            </label>
            <input
              type="text"
              defaultValue={user?.name || ''}
              placeholder="Enter name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-[#003F8F] text-sm sm:text-base font-[Inter]"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-[#003F8F] mb-2 font-[Inter]">
              Email
            </label>
            <input
              type="email"
              defaultValue={user?.email || ''}
              placeholder="Enter you email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-[#003F8F] text-sm sm:text-base font-[Inter]"
            />
          </div>

          {/* Strength Dropdown */}
          <div>
            <label className="block text-sm font-medium text-[#003F8F] mb-2 font-[Inter]">
              Strength
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-[#003F8F] appearance-none bg-white text-sm sm:text-base font-[Inter] cursor-pointer"
              >
                <option value="strength">Strength</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
        <h2 className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-4 sm:mb-6">
          Account Settings
        </h2>

        <div className="space-y-4 sm:space-y-6">
          {/* New Password Input */}
          <div>
            <label className="block text-sm font-medium text-[#003F8F] mb-2 font-[Inter]">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-[#003F8F] text-sm sm:text-base font-[Inter]"
            />
          </div>

          {/* Update Password Button */}
          <button className="w-full sm:w-auto bg-[#003F8F] text-white px-6 py-2 rounded-lg hover:bg-[#002A5F] transition-colors font-medium font-[Inter]">
            Update Password
          </button>
        </div>
      </div>

      {/* App Preferences Section */}
      <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
        <h2 className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-4 sm:mb-6">
          App Preferences
        </h2>

        <div className="flex items-center justify-between">
          {/* Left: Label */}
          <label className="text-sm font-medium text-[#003F8F] font-[Inter]">
            Units
          </label>

          {/* Right: Radio buttons */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="units"
                value="kg"
                checked={units === 'kg'}
                onChange={(e) => setUnits(e.target.value)}
                className="w-5 h-5 accent-[#FB923C] cursor-pointer"
                style={{ accentColor: '#FB923C' }}
              />
              <span className="text-sm sm:text-base text-[#003F8F] font-[Inter]">Kg</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="units"
                value="lbs"
                checked={units === 'lbs'}
                onChange={(e) => setUnits(e.target.value)}
                className="w-5 h-5 accent-[#FB923C] cursor-pointer"
                style={{ accentColor: '#FB923C' }}
              />
              <span className="text-sm sm:text-base text-[#003F8F] font-[Inter]">lbs</span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientSettings;

