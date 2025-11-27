import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const CoachSettings = () => {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
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
    <div className="space-y-6 p-4 sm:p-6 bg-[#F7F7F7]">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-[#003F8F] font-[Poppins]">
          Settings
        </h1>
      </div>

      {/* Account Settings Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-[#003F8F] font-[Poppins] mb-6">
          Account Settings
        </h2>
        
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-1 border-[#4D60801A]">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-base text-gray-500 font-[Inter]">No Image</span>
              )}
            </div>
            <button
              onClick={() => document.getElementById('profile-upload').click()}
              className="px-4 py-2 border-1 border-[#003F8F] text-[#003F8F] bg-[#4D60801A]  rounded-lg font-semibold text-sm "
            >
              Choose Picture
            </button>
            <input
              type="file"
              id="profile-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#003F8F] mb-2 font-[Inter]">
                Name
              </label>
              <input
                type="text"
                defaultValue={user?.name}
                placeholder="Enter name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] text-sm font-[Inter] placeholder:text-[#4D6080CC]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#003F8F] mb-2 font-[Inter]">
                Email
              </label>
              <input
                type="email"
                defaultValue={user?.email}
                placeholder="Enter you email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] text-sm font-[Inter] placeholder:text-[#4D6080CC]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#003F8F] mb-2 font-[Inter]">
                Phone number
              </label>
              <input
                type="tel"
                defaultValue={user?.phone}
                placeholder="Enter phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] text-sm font-[Inter] placeholder:text-[#4D6080CC]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#003F8F] mb-2 font-[Inter]">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] text-sm font-[Inter] placeholder:text-[#4D6080CC]"
              />
            </div>

            <button className="bg-[#003F8F] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition">
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* Notifications & Communication Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-[#003F8F] font-[Poppins] mb-6">
          Notifications & Communication
        </h2>
        
        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#003F8F] font-[Inter]">
                Email Notifications
              </span>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-12 h-6 rounded-full transition relative flex-shrink-0 focus:outline-none border-0 ${emailNotifications ? 'bg-[#F3701E]' : 'bg-gray-300'}`}
                aria-label="Toggle Email Notifications"
                style={{ appearance: 'none', WebkitAppearance: 'none' }}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 shadow-sm ${emailNotifications ? 'transform translate-x-6' : 'transform translate-x-1'}`}></div>
              </button>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#003F8F] font-[Inter]">
                Push Notifications
              </span>
              <button
                type="button"
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`w-12 h-6 rounded-full transition relative flex-shrink-0 focus:outline-none border-0 ${pushNotifications ? 'bg-[#003F8F]' : 'bg-gray-300'}`}
                aria-label="Toggle Push Notifications"
                style={{ appearance: 'none', WebkitAppearance: 'none' }}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 shadow-sm ${pushNotifications ? 'transform translate-x-6' : 'transform translate-x-1'}`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Privacy Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-[#003F8F] font-[Poppins] mb-6">
          Security & Privacy
        </h2>
        
        <div className="space-y-4">
          {/* Two-Factor Authentication */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#003F8F] font-[Inter]">
                Two-Factor Authentication (2FA)
              </span>
              <button
                type="button"
                onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                className={`w-12 h-6 rounded-full transition relative flex-shrink-0 focus:outline-none border-0 ${twoFactorAuth ? 'bg-[#003F8F]' : 'bg-gray-300'}`}
                aria-label="Toggle Two-Factor Authentication"
                style={{ appearance: 'none', WebkitAppearance: 'none' }}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 shadow-sm ${twoFactorAuth ? 'transform translate-x-6' : 'transform translate-x-1'}`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center gap-4">
        <button className="bg-[#003F8F] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition">
          Update Settings
        </button>
        <button className="bg-[#E53E3E] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-red-700 transition">
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default CoachSettings;
