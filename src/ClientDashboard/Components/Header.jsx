import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DloadLogo from "../../assets/DloadLogo.png";
import { BellIcon, SearchIcon } from './icons';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const Header = ({ isSidebarOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState(null);

  // Fetch client profile picture
  useEffect(() => {
    // Reset profile image when user changes
    setProfileImage(null);
    
    // Clear old generic localStorage entry
    localStorage.removeItem('clientProfilePhoto');
    
    const fetchProfilePicture = async () => {
      if (!user?.id) {
        // Clear profile image if no user
        setProfileImage(null);
        return;
      }

      try {
        // Get authentication token
        let token = null;
        const storedUser = localStorage.getItem('user');
        
        if (user) {
          token = user.token || user.access_token || user.authToken || user.accessToken || user.access;
        }

        if (!token && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            token = userData.token || userData.access_token || userData.authToken || userData.accessToken || userData.access;
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }

        if (!token) {
          token = localStorage.getItem('token') || 
                  localStorage.getItem('access_token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('accessToken') ||
                  localStorage.getItem('access');
        }

        const isValidToken = token &&
          typeof token === 'string' &&
          token.trim().length > 0 &&
          token.trim() !== 'null' &&
          token.trim() !== 'undefined' &&
          token.trim() !== '' &&
          !token.startsWith('{') &&
          !token.startsWith('[');

        if (!isValidToken) {
          setProfileImage(null);
          if (user?.id) {
            localStorage.removeItem(`clientProfilePhoto_${user.id}`);
          }
          return;
        }

        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        const apiUrl = baseUrl.includes('/api')
          ? `${baseUrl}/client/profile/`
          : `${baseUrl}/api/client/profile/`;

        const headers = {
          'Content-Type': 'application/json',
        };

        const cleanToken = token.trim().replace(/^["']|["']$/g, '');
        headers['Authorization'] = `Bearer ${cleanToken}`;

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
          setProfileImage(null);
          localStorage.removeItem('clientProfilePhoto');
          return;
        }

        if (response.ok && result.data) {
          if (result.data.profile_photo_url) {
            let imageUrl = result.data.profile_photo_url;
            
            // If URL is relative, construct full URL
            if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
              const cleanUrl = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
              const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
              const domainUrl = baseUrl.replace(/\/api$/, '').replace(/\/deload\/api$/, '').replace(/\/deload$/, '');
              imageUrl = `${domainUrl}/${cleanUrl}`;
            }
            
            imageUrl = imageUrl.trim();
            
            // Validate image URL before setting
            if (imageUrl && 
                imageUrl.trim() !== '' && 
                imageUrl !== 'null' && 
                imageUrl !== 'undefined' &&
                !imageUrl.includes('ProfileLogo') &&
                !imageUrl.includes('clientprofile')) {
              setProfileImage(imageUrl);
              // Store in localStorage with user ID to prevent cross-user issues
              localStorage.setItem(`clientProfilePhoto_${user.id}`, imageUrl);
            } else {
              setProfileImage(null);
              localStorage.removeItem(`clientProfilePhoto_${user.id}`);
            }
          } else {
            // No profile photo URL in response
            setProfileImage(null);
            localStorage.removeItem(`clientProfilePhoto_${user.id}`);
          }
        } else {
          // API call failed or no data
          setProfileImage(null);
          localStorage.removeItem(`clientProfilePhoto_${user.id}`);
        }
      } catch (err) {
        console.error('Error fetching profile picture:', err);
        setProfileImage(null);
        localStorage.removeItem(`clientProfilePhoto_${user?.id}`);
      }
    };

    fetchProfilePicture();
    
    // Listen for profile picture updates from Settings page
    const handleProfileUpdate = (event) => {
      if (event.detail && event.detail.profilePhotoUrl && event.detail.userId === user?.id) {
        setProfileImage(event.detail.profilePhotoUrl);
      }
    };
    
    window.addEventListener('profilePictureUpdated', handleProfileUpdate);
    
    // Listen for storage changes (when profile is updated in another tab/window)
    const handleStorageChange = (e) => {
      if (e.key === `clientProfilePhoto_${user?.id}`) {
        if (e.newValue && 
            e.newValue.trim() !== '' && 
            e.newValue !== 'null' && 
            e.newValue !== 'undefined' &&
            !e.newValue.includes('ProfileLogo') &&
            !e.newValue.includes('clientprofile')) {
          setProfileImage(e.newValue);
        } else {
          setProfileImage(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('profilePictureUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  return (
    <div className='flex justify-between bg-[#FFFFFF]  h-[70px] min-h-[70px]'>
      {/* Left Section - Logo Area */}
      <div className={`h-full flex items-center justify-center relative transition-all duration-300 ${isSidebarOpen ? 'w-[260px] lg:w-[260px]' : 'w-0 lg:w-[80px]'
        } overflow-hidden`}>
        {/* Toggle Button - Desktop (in logo area) */}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            )}
          </svg>
        </button>
        {isSidebarOpen && (
          <img src={DloadLogo} className='w-[50px] h-[50px] lg:block' alt="Dload Logo" />
        )}
      </div>

      {/* Right Section - Search, Toggle (Mobile), Bell, Profile */}
      <div className='flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-end gap-2 lg:gap-5 pr-3 sm:pr-[20px] h-full'>
        {/* Mobile: Toggle Button - Above Search */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-5 h-5 text-[#003F8F]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isSidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Mobile: Search, Bell, Profile in a row - Desktop: All items in a row */}
        <div className='flex items-center justify-center gap-2 sm:gap-3 lg:gap-5'>
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search here..."
              className="w-40 sm:w-48 lg:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-[10px] sm:mb-0"
            />

          </div>

          {/* Bell Icon */}
          <div className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer mb-[10px] sm:mb-0">
            <BellIcon />
          </div>

          {/* Profile Image */}
          <div className="w-10 h-10 rounded-full overflow-hidden mb-[10px] sm:mb-0 border border-gray-200 flex items-center justify-center">
            {(() => {
              const profilePhoto = profileImage || user?.photo || user?.profile_photo || user?.profile_photo_url;
              const userName = user?.name || user?.fullname || 'U';
              const getInitials = (name) => {
                if (!name || name === 'U') return 'U';
                const parts = name.trim().split(' ');
                if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
                return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
              };
              
              // Check if profilePhoto is valid (not null, not empty, not default placeholder)
              const isValidPhoto = profilePhoto && 
                                   profilePhoto.trim() !== '' && 
                                   profilePhoto !== 'null' && 
                                   profilePhoto !== 'undefined' &&
                                   !profilePhoto.includes('ProfileLogo') &&
                                   !profilePhoto.includes('clientprofile');
              
              if (isValidPhoto) {
                return (
                  <>
                    <img
                      src={profilePhoto}
                      alt={userName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                        // Clear invalid image from state
                        setProfileImage(null);
                        if (user?.id) {
                          localStorage.removeItem(`clientProfilePhoto_${user.id}`);
                        }
                      }}
                    />
                    <span className="text-[#003F8F] text-sm font-semibold hidden">
                      {getInitials(userName)}
                    </span>
                  </>
                );
              }
              return (
                <span className="text-[#003F8F] text-sm font-semibold">
                  {getInitials(userName)}
                </span>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;