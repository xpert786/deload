import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DloadLogo from "../../assets/DloadLogo.png";
import { BellIcon, SearchIcon } from '../../ClientDashboard/Components/icons';
import ProfileLogo from "../../assets/ProfileLogo.png";

const CoachHeader = ({ isSidebarOpen, toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <div className='flex justify-between bg-[#FFFFFF] shadow-sm h-[70px] min-h-[70px]'>
      {/* Left Section */}
      <div className={`h-full flex items-center justify-center relative transition-all duration-300 ${
        isSidebarOpen ? 'w-[260px] lg:w-[260px]' : 'w-0 lg:w-[80px]'
      } overflow-hidden`}>
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
        {isSidebarOpen && <img src={DloadLogo} className='w-[50px] h-[50px]' alt="Dload Logo" />}
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

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search here..."
            className="w-32 sm:w-40 lg:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div className="w-9 h-9 sm:w-10 sm:h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer">
          <BellIcon />
        </div>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden">
          <img
            src={ProfileLogo}
            alt={user?.name || "Profile"}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default CoachHeader;

