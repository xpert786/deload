import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

// Use API URL from .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const ClientSettings = () => {
  const { user } = useAuth();
  const [units, setUnits] = useState('kg');
  const [profileImage, setProfileImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientData, setClientData] = useState({
    fullname: '',
    email: '',
    phone_number: '',
    city: '',
    profile_photo_url: null
  });

  // Profile update state
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone_number: '',
    city: '',
    short_bio: ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Fetch client profile data
  useEffect(() => {
    const fetchClientProfile = async () => {
      setLoading(true);
      setError(null);

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
          ? `${baseUrl}/client/profile/`
          : `${baseUrl}/api/client/profile/`;

        // Prepare headers
        const headers = {
          'Content-Type': 'application/json',
        };

        if (isValidToken) {
          headers['Authorization'] = `Bearer ${token.trim()}`;
        }

        console.log('Fetching client profile from:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: headers,
          credentials: 'include',
        });

        let result;
        try {
          const responseText = await response.text();
          console.log('API Response text:', responseText);
          if (responseText) {
            result = JSON.parse(responseText);
          } else {
            result = {};
          }
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          throw new Error('Failed to parse server response');
        }

        if (response.ok && result.data) {
          // Map API response to clientData
          const profileData = {
            fullname: result.data.fullname || '',
            email: result.data.email || '',
            phone_number: result.data.phone_number || '',
            city: result.data.city || '',
            profile_photo_url: result.data.profile_photo_url || null
          };
          setClientData(profileData);
          
          // Set form data for editing
          setFormData({
            fullname: result.data.fullname || '',
            email: result.data.email || '',
            phone_number: result.data.phone_number || '',
            city: result.data.city || '',
            short_bio: result.data.short_bio || ''
          });

          // Set profile image if available
          if (result.data.profile_photo_url) {
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
            
            console.log('Profile photo URL from API:', result.data.profile_photo_url);
            console.log('Final image URL to use:', imageUrl);
            
            // Set the image URL
            setProfileImage(imageUrl);
          } else {
            console.log('No profile photo URL in response');
            setProfileImage(null);
          }
        } else {
          const errorMessage = result.message || 'Failed to fetch client profile';
          setError(errorMessage);
          console.error('Failed to fetch client profile:', result);
        }
      } catch (err) {
        console.error('Error fetching client profile:', err);
        setError(err.message || 'Failed to fetch client profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClientProfile();
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the file for upload
      setSelectedImageFile(file);
      
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (updateError) {
      setUpdateError(null);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    setUpdatingProfile(true);
    setUpdateError(null);
    setUpdateSuccess(false);

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
        ? `${baseUrl}/client/profile/update/`
        : `${baseUrl}/api/client/profile/update/`;

      // Prepare headers
      const headers = {};

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      let requestBody;
      
      // If image is selected, use FormData for multipart/form-data
      if (selectedImageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('profile_photo', selectedImageFile);
        formDataToSend.append('fullname', formData.fullname);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone_number', formData.phone_number);
        formDataToSend.append('city', formData.city);
        if (formData.short_bio) {
          formDataToSend.append('short_bio', formData.short_bio);
        }
        
        requestBody = formDataToSend;
        // Don't set Content-Type header when using FormData, browser will set it with boundary
      } else {
        // No image, use JSON
        headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
          phone_number: formData.phone_number,
          city: formData.city,
          short_bio: formData.short_bio || ''
        });
      }

      console.log('Update Profile API URL:', apiUrl);
      console.log('Update Profile - Image selected:', !!selectedImageFile);
      console.log('Update Profile Request Body:', selectedImageFile ? 'FormData' : requestBody);

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: headers,
        credentials: 'include',
        body: requestBody,
      });

      let result;
      try {
        const responseText = await response.text();
        console.log('Update Profile API Response text:', responseText);
        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = {};
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Failed to parse server response');
      }

      if (response.ok && result.data) {
        // Success - update clientData with response
        setClientData({
          fullname: result.data.fullname || '',
          email: result.data.email || '',
          phone_number: result.data.phone_number || '',
          city: result.data.city || '',
          profile_photo_url: result.data.profile_photo_url || null
        });
        
        // Update form data
        setFormData({
          fullname: result.data.fullname || '',
          email: result.data.email || '',
          phone_number: result.data.phone_number || '',
          city: result.data.city || '',
          short_bio: result.data.short_bio || ''
        });

        // Update profile image if URL changed or new image was uploaded
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
          setProfileImage(imageUrl);
          
          // Dispatch custom event to notify Header component about profile update
          window.dispatchEvent(new CustomEvent('profilePictureUpdated', {
            detail: { profilePhotoUrl: imageUrl }
          }));
          
          // Also store in localStorage for persistence
          localStorage.setItem('clientProfilePhoto', imageUrl);
        }

        // Clear selected image file after successful upload
        setSelectedImageFile(null);

        setUpdateSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      } else {
        // Handle errors
        const errorMessage = result.message || result.error || 'Failed to update profile';
        setUpdateError(errorMessage);
        console.error('Failed to update profile:', result);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setUpdateError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Handle password form input change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (passwordError) {
      setPasswordError(null);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordError('All password fields are required');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (passwordData.current_password === passwordData.new_password) {
      setPasswordError('New password must be different from your current password');
      return;
    }

    setUpdatingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);

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
        ? `${baseUrl}/change-password/`
        : `${baseUrl}/api/change-password/`;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      // Prepare request body
      const requestBody = {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      };

      console.log('Change Password API URL:', apiUrl);
      console.log('Change Password Request Body:', requestBody);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      let result;
      try {
        const responseText = await response.text();
        console.log('Change password API Response text:', responseText);
        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = {};
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Failed to parse server response');
      }

      if (response.ok) {
        // Success
        setPasswordSuccess(true);
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        
        // Close modal and hide success message after 2 seconds
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess(false);
        }, 2000);
      } else {
        // Handle errors
        const errorMessage = result.message || result.error || 'Failed to update password';
        setPasswordError(errorMessage);
        console.error('Failed to update password:', result);
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6 px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 bg-[#F3F7FF] flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#003F8F] mb-4"></div>
          <p className="text-gray-600 font-[Inter]">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6 px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 bg-[#F3F7FF]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 font-[Poppins] mb-2">Error</h2>
          <p className="text-red-700 font-[Inter] mb-4">{error}</p>
        </div>
      </div>
    );
  }

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
                  onError={(e) => {
                    console.error('Failed to load profile image:', profileImage);
                    console.error('Image error event:', e);
                    e.target.onerror = null;
                    // Don't clear the image URL, just log the error
                    // The placeholder will show if image fails
                  }}
                  onLoad={() => {
                    console.log('Profile image loaded successfully:', profileImage);
                  }}
                  style={{ display: 'block' }}
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
              name="fullname"
              value={formData.fullname}
              onChange={handleFormChange}
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
              name="email"
              value={formData.email}
              onChange={handleFormChange}
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

      {/* Password Section */}
      <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
        <h2 className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-2">
          Password
        </h2>
        <p className="text-sm text-gray-600 font-[Inter] mb-4">
          Change your password regularly to keep your account secure
        </p>
        <button 
          onClick={() => setShowPasswordModal(true)}
          className="bg-[#003F8F] text-white px-6 py-2 rounded-lg hover:bg-[#002A5F] transition-colors font-medium font-[Inter] cursor-pointer"
        >
          Change Password
        </button>
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

      {/* Update Settings Button */}
      <div className="flex justify-start">
        <div className="w-full">
          {/* Success Message */}
          {updateSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              Profile updated successfully!
            </div>
          )}

          {/* Error Message */}
          {updateError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {updateError}
            </div>
          )}

          <button 
            onClick={handleUpdateProfile}
            disabled={updatingProfile}
            className="bg-[#003F8F] text-white px-6 py-2 rounded-lg hover:bg-[#002A5F] transition-colors font-medium font-[Inter] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updatingProfile ? 'Updating...' : 'Update Settings'}
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative max-w-lg w-full my-auto max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordError(null);
                setPasswordSuccess(false);
                setPasswordData({
                  current_password: '',
                  new_password: '',
                  confirm_password: ''
                });
              }}
              disabled={updatingPassword}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" rx="10" fill="#4D6080" fillOpacity="0.8" />
                <path d="M13.3888 7.49593C13.4485 7.43831 13.4962 7.36936 13.529 7.29313C13.5618 7.21689 13.579 7.13489 13.5798 7.0519C13.5806 6.96891 13.5648 6.88661 13.5334 6.80978C13.502 6.73296 13.4556 6.66315 13.397 6.60444C13.3383 6.54573 13.2686 6.49929 13.1918 6.46783C13.115 6.43637 13.0327 6.42051 12.9497 6.4212C12.8667 6.42188 12.7847 6.43908 12.7084 6.4718C12.6322 6.50452 12.5632 6.5521 12.5055 6.61177L10.0005 9.11593L7.49632 6.61177C7.4391 6.55036 7.3701 6.50111 7.29343 6.46695C7.21677 6.43279 7.13401 6.41442 7.05009 6.41294C6.96617 6.41146 6.88281 6.4269 6.80499 6.45833C6.72716 6.48976 6.65647 6.53655 6.59712 6.5959C6.53777 6.65525 6.49098 6.72594 6.45955 6.80377C6.42812 6.88159 6.41268 6.96495 6.41416 7.04887C6.41564 7.13279 6.43401 7.21555 6.46817 7.29221C6.50233 7.36888 6.55158 7.43788 6.61299 7.4951L9.11549 10.0001L6.61132 12.5043C6.50092 12.6227 6.44082 12.7795 6.44367 12.9414C6.44653 13.1033 6.51212 13.2578 6.62663 13.3723C6.74115 13.4868 6.89563 13.5524 7.05755 13.5552C7.21947 13.5581 7.37617 13.498 7.49465 13.3876L10.0005 10.8834L12.5047 13.3884C12.6231 13.4988 12.7798 13.5589 12.9418 13.5561C13.1037 13.5532 13.2582 13.4876 13.3727 13.3731C13.4872 13.2586 13.5528 13.1041 13.5556 12.9422C13.5585 12.7803 13.4984 12.6236 13.388 12.5051L10.8855 10.0001L13.3888 7.49593Z" fill="white" />
              </svg>
            </button>

            {/* Title and Subtitle */}
            <h2 className="text-xl font-bold text-[#2D2F33] mb-2">
              Change Password
            </h2>
            <p className="text-sm text-gray-600 font-[Inter] mb-6">
              Update your password to keep your account secure
            </p>

            {/* Error Message */}
            {passwordError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {passwordError}
              </div>
            )}

            {/* Success Message */}
            {passwordSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                Password updated successfully!
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-[#2D2F33] mb-2">Current Password</label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-[#003F8F]"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-[#2D2F33] mb-2">New password</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-[#003F8F]"
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-semibold text-[#2D2F33] mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-[#003F8F]"
                />
              </div>

              {/* Password Requirements */}
              <div className="mt-4">
                <p className="text-sm font-regular text-[#535B69] mb-2">Password requirements:</p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>At least 8 characters long</li>
                  <li>Different from your current password</li>
                  <li>Passwords must match</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError(null);
                    setPasswordSuccess(false);
                    setPasswordData({
                      current_password: '',
                      new_password: '',
                      confirm_password: ''
                    });
                  }}
                  disabled={updatingPassword}
                  className="px-4 py-2 bg-white border border-[#003F8F] text-[#003F8F] rounded-lg text-sm font-semibold hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-5 py-2 bg-[#003F8F] text-white text-sm font-semibold rounded-lg hover:bg-[#002A6A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingPassword ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSettings;

