import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DloadLogo from "../../assets/DloadLogo.png";
import { BellIcon, SearchIcon, TodayMessageIcon, PercentageTodayIcon, AvgSession } from '../../ClientDashboard/Components/icons';
import ProfileLogo from "../../assets/ProfileLogo.png";
import AddNewClientModal from './AddNewClientModal';

const CoachHeader = ({ isSidebarOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const notifications = {
    today: [
      { title: 'Mike Ross - Great! I Finish His Work Out.', time: '1 Hrs Ago', icon: <TodayMessageIcon /> },
      { title: 'John Doe - 50% Progress', time: '2 Hrs Ago', icon: <PercentageTodayIcon /> }
    ],
    yesterday: [
      { title: '7:00 AM - John Doe: Send You A Message', time: 'Yesterday', icon: <AvgSession /> },
      { title: '10:00 AM - Sarah Lee: Started Cardio & Core Session', time: 'Yesterday', icon: <AvgSession /> }
    ]
  };

  return (
    <div className='flex justify-between bg-[#FFFFFF] shadow-sm h-[70px] min-h-[70px]'>
      {/* Left Section Wrapper */}
      <div className="flex items-center gap-4">

        {/* Sidebar Section */}
        <div
          className={`h-full flex items-center justify-center relative transition-all duration-300 overflow-hidden
    ${isSidebarOpen ? 'w-[260px] lg:w-[260px]' : 'w-0 lg:w-[80px]'}`}
        >
          {/* Toggle Button - Desktop */}
          <button
            onClick={toggleSidebar}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 transition-colors hidden lg:flex"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-5 h-5 text-[#003F8F]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>

          {isSidebarOpen && (
            <img src={DloadLogo} className="w-[50px] h-[50px] ml-10" alt="Dload Logo" />
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div
        className={`relative transition-all duration-300 flex items-center
  ${isSidebarOpen ? 'ml-4' : 'ml-2 lg:ml-20'}
  w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg`}
      >

        {/* Icon Positioned Inside Input */}
        <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
          <SearchIcon />
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Search here..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500
    focus:border-transparent text-sm"
        />
      </div>


      {/* Right Section */}
      <div className='flex-1 flex items-center justify-end gap-2 sm:gap-5 pr-3 sm:pr-[20px] h-full'>
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 text-[#003F8F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>



        {/* Add New Client Button */}
        <button
          onClick={() => setShowAddClientModal(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition-all duration-200 border border-[#003F8F] relative"
          style={{
            boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.3), 0 0 8px rgba(59, 130, 246, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <path
              d="M8 3V13M3 8H13"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="whitespace-nowrap">Add New Client</span>
        </button>

        {/* Mobile Add Button - Icon Only */}
        <button
          onClick={() => setShowAddClientModal(true)}
          className="sm:hidden w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer bg-[#003F8F] border-[#003F8F]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 3V13M3 8H13"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          className="relative"
          onMouseEnter={() => setShowNotifications(true)}
          onMouseLeave={() => setShowNotifications(false)}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer">
            <BellIcon />
          </div>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-[380px] sm:w-[420px] bg-white rounded-2xl shadow-xl border border-[#E5EDFF] z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#E5EDFF]">
                <h3 className="text-2xl font-bold text-[#003F8F] font-[Poppins]">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-semibold w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[500px] overflow-y-auto">
                {/* Today Section */}
                <div className="p-4">
                  <p className="text-xs font-semibold text-[#0A3D91] mb-3">Today</p>
                  <div className="space-y-3">
                    {notifications.today.map((note, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-4 py-3 border border-[#E5EDFF] rounded-xl bg-white shadow-sm gap-4 hover:bg-[#F5F8FF] transition"
                      >
                        <div className="flex items-center gap-3 text-[#0A3D91] flex-1 min-w-0">
                          <span className="w-7 h-7 rounded-xl border border-[#E5EDFF] flex items-center justify-center text-[13px] flex-shrink-0">
                            {note.icon}
                          </span>
                          <span className="font-semibold text-sm truncate">{note.title}</span>
                        </div>
                        <span className="text-xs text-[#0A3D91] whitespace-nowrap flex-shrink-0">{note.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Yesterday Section */}
                <div className="p-4 pt-2 border-t border-[#E5EDFF]">
                  <p className="text-xs font-semibold text-[#0A3D91] mb-3">Yesterday</p>
                  <div className="space-y-3">
                    {notifications.yesterday.map((note, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-4 py-3 border border-[#E5EDFF] rounded-xl bg-white shadow-sm gap-4 hover:bg-[#F5F8FF] transition"
                      >
                        <div className="flex items-center gap-3 text-[#0A3D91] flex-1 min-w-0">
                          <span className="w-7 h-7 rounded-xl border border-[#E5EDFF] flex items-center justify-center text-[13px] flex-shrink-0">
                            {note.icon}
                          </span>
                          <span className="font-semibold text-sm truncate">{note.title}</span>
                        </div>
                        <span className="text-xs text-[#0A3D91] whitespace-nowrap flex-shrink-0">{note.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden">
          <img
            src={ProfileLogo}
            alt={user?.name || "Profile"}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Add New Client Modal */}
      <AddNewClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
      />
    </div>
  );
};

export default CoachHeader;

