import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DloadLogo from "../../assets/DloadLogo.png";
import { BellIcon, SearchIcon } from '../../ClientDashboard/Components/icons';
import ProfileLogo from "../../assets/ProfileLogo.png";
import AddNewClientModal from './AddNewClientModal';
import NotificationsModal from './NotificationsModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CoachHeader = ({ isSidebarOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // Fetch coach profile image
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!user) return;

      try {
        // Get authentication token
        let token = null;
        const storedUser = localStorage.getItem('user');
        
        if (user) {
          token = user.token || user.access_token || user.authToken || user.accessToken;
        }

        if (!token && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            token = userData.token || userData.access_token || userData.authToken || userData.accessToken;
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }

        if (!token) {
          token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');
        }

        const isValidToken = token &&
          typeof token === 'string' &&
          token.trim().length > 0 &&
          token.trim() !== 'null' &&
          token.trim() !== 'undefined' &&
          token.trim() !== '';

        // Ensure API_BASE_URL doesn't have trailing slash
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        // Check if baseUrl already includes /api, if not add it
        const apiUrl = baseUrl.includes('/api') 
          ? `${baseUrl}/coach/profile/`
          : `${baseUrl}/api/coach/profile/`;

        // Prepare headers
        const headers = {
          'Content-Type': 'application/json',
        };

        if (isValidToken) {
          headers['Authorization'] = `Bearer ${token.trim()}`;
        }

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: headers,
          credentials: 'include',
        });

        let result;
        try {
          const responseText = await response.text();
          if (responseText) {
            result = JSON.parse(responseText);
          } else {
            result = {};
          }
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          return;
        }

        if (response.ok && result.data && result.data.profile_photo_url) {
          let imageUrl = result.data.profile_photo_url;
          
          // If URL is relative, construct full URL
          if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            // Remove leading slash if present
            const cleanUrl = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
            // Construct full URL using API base URL
            const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
            // Remove /api or /deload/api if present to get base domain
            const domainUrl = baseUrl.replace(/\/api$/, '').replace(/\/deload\/api$/, '').replace(/\/deload$/, '');
            imageUrl = `${domainUrl}/${cleanUrl}`;
          }
          
          // Ensure URL is properly formatted
          imageUrl = imageUrl.trim();
          setProfileImage(imageUrl);
        }
      } catch (err) {
        console.error('Error fetching coach profile image:', err);
        // Don't set error state, just use default image
      }
    };

    fetchProfileImage();
  }, [user]);

  // Listen for profile image updates from settings page
  useEffect(() => {
    const handleProfileImageUpdate = (event) => {
      if (event.detail && event.detail.imageUrl) {
        // Update profile image with the new URL from settings
        setProfileImage(event.detail.imageUrl);
      }
    };

    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
    };
  }, []);

  return (
    <>
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
  ${isSidebarOpen 
    ? 'ml-[28px] sm:ml-[36px]' 
    : 'ml-[28px] sm:ml-[36px] lg:ml-[36px]'}
  w-auto max-w-[240px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[360px]`}
      >

        {/* Icon Positioned Inside Input */}
        <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
          <SearchIcon />
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Search here..."
          className="w-[240px] sm:w-[280px] md:w-[320px] lg:w-[360px] pl-10 pr-4 py-2 border border-gray-300 rounded-lg
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
          <span className="whitespace-nowrap cursor-pointer">Add New Client</span>
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

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(!showNotifications);
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer focus:outline-none"
          >
            <BellIcon />
          </button>

          {/* Notifications Modal */}
          <NotificationsModal 
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)} 
          />
        </div>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden">
          <img
            src={profileImage || ProfileLogo}
            alt={user?.name || user?.fullname || "Profile"}
            className="w-full h-full object-cover"
            key={profileImage || 'default'} // Force re-render when image changes
            onError={(e) => {
              // Fallback to default image if profile image fails to load
              if (e.target.src !== ProfileLogo && !e.target.src.includes(ProfileLogo)) {
                e.target.src = ProfileLogo;
              }
            }}
          />
        </div>
      </div>

      {/* Add New Client Modal */}
      <AddNewClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
      />
    </div>
    </>
  );
};

export default CoachHeader;

