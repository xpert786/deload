import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubscriptionInfo from './SubscriptionInfo';

// Use API URL from .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const UserDetails = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);

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

    // Toggle states
    const [twoFactorAuth, setTwoFactorAuth] = useState(true);
    const [loginNotifications, setLoginNotifications] = useState(true);
    const [accountActivity, setAccountActivity] = useState(true);
    const [securityAlerts, setSecurityAlerts] = useState(true);
    const [platformUpdates, setPlatformUpdates] = useState(true);
    const [newUserRegistrations, setNewUserRegistrations] = useState(true);
    const [paymentIssues, setPaymentIssues] = useState(true);
    const [systemAlerts, setSystemAlerts] = useState(true);

    // User data from API
    const [userData, setUserData] = useState({
        id: userId || 'C101',
        name: '',
        status: 'Active',
        email: '',
        phone: '',
        address: '',
        joinDate: '',
        activeCoach: '24',
        passwordLastChanged: '30 days ago',
        activeSessions: '2',
        profilePicture: null
    });

    // Full API data for editing
    const [apiData, setApiData] = useState(null);

    // Edit form data
    const [editFormData, setEditFormData] = useState({
        fullname: '',
        email: '',
        phone_number: '',
        address: '',
        joined_date: ''
    });

    // Fetch coach data from API
    useEffect(() => {
        const fetchCoachData = async () => {
            if (!userId) {
                setError('User ID is missing');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Get authentication token
                let token = null;
                const storedUser = localStorage.getItem('user');
                
                if (storedUser) {
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
                    ? `${baseUrl}/coaches_info/${userId}/`
                    : `${baseUrl}/api/coaches_info/${userId}/`;

                // Prepare headers
                const headers = {
                    'Content-Type': 'application/json',
                };

                if (isValidToken) {
                    headers['Authorization'] = `Bearer ${token.trim()}`;
                }

                console.log('Fetching coach data from:', apiUrl);

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
                    // Store full API data
                    setApiData(result.data);
                    
                    // Map API response to userData structure
                    setUserData({
                        id: userId,
                        name: result.data.fullname || '',
                        status: result.data.is_active ? 'Active' : 'Inactive',
                        email: result.data.email || '',
                        phone: result.data.phone_number || '',
                        address: result.data.address || '',
                        joinDate: result.data.joined_date || '',
                        activeCoach: '24',
                        passwordLastChanged: '30 days ago',
                        activeSessions: '2',
                        profilePicture: null
                    });

                    // Initialize edit form data
                    setEditFormData({
                        fullname: result.data.fullname || '',
                        email: result.data.email || '',
                        phone_number: result.data.phone_number || '',
                        address: result.data.address || '',
                        joined_date: result.data.joined_date || ''
                    });
                } else {
                    const errorMessage = result.message || 'Failed to fetch coach data';
                    setError(errorMessage);
                    console.error('Failed to fetch coach data:', result);
                }
            } catch (err) {
                console.error('Error fetching coach data:', err);
                setError(err.message || 'Failed to fetch coach data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchCoachData();
    }, [userId]);

    const handleToggle = (setting) => {
        switch (setting) {
            case 'twoFactor':
                setTwoFactorAuth(!twoFactorAuth);
                break;
            case 'loginNotifications':
                setLoginNotifications(!loginNotifications);
                break;
            case 'accountActivity':
                setAccountActivity(!accountActivity);
                break;
            case 'securityAlerts':
                setSecurityAlerts(!securityAlerts);
                break;
            case 'platformUpdates':
                setPlatformUpdates(!platformUpdates);
                break;
            case 'newUserRegistrations':
                setNewUserRegistrations(!newUserRegistrations);
                break;
            case 'paymentIssues':
                setPaymentIssues(!paymentIssues);
                break;
            case 'systemAlerts':
                setSystemAlerts(!systemAlerts);
                break;
            default:
                break;
        }
    };

    // Handle edit form input change
    const handleEditFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setEditFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setEditFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle name change in header
    const handleNameChange = (e) => {
        setEditFormData(prev => ({
            ...prev,
            fullname: e.target.value
        }));
    };

    // Handle edit form submission
    const handleUpdateCoach = async (e) => {
        if (e) {
            e.preventDefault();
        }
        setUpdating(true);
        setUpdateError(null);
        setUpdateSuccess(false);

        try {
            // Get authentication token
            let token = null;
            const storedUser = localStorage.getItem('user');
            
            if (storedUser) {
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
                ? `${baseUrl}/update-coaches/${userId}/`
                : `${baseUrl}/api/update-coaches/${userId}/`;

            // Prepare headers
            const headers = {
                'Content-Type': 'application/json',
            };

            if (isValidToken) {
                headers['Authorization'] = `Bearer ${token.trim()}`;
            }

            // Prepare request body
            const requestBody = {
                fullname: editFormData.fullname,
                email: editFormData.email,
                phone_number: editFormData.phone_number,
                address: editFormData.address,
                joined_date: editFormData.joined_date
            };

            console.log('Updating coach data:', apiUrl);
            console.log('Request body:', requestBody);

            const response = await fetch(apiUrl, {
                method: 'PATCH',
                headers: headers,
                credentials: 'include',
                body: JSON.stringify(requestBody),
            });

            let result;
            try {
                const responseText = await response.text();
                console.log('Update API Response text:', responseText);
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
                // Update local state with new data
                setApiData(result.data);
                setUserData({
                    id: userId,
                    name: result.data.fullname || '',
                    status: result.data.is_active ? 'Active' : 'Inactive',
                    email: result.data.email || '',
                    phone: result.data.phone_number || '',
                    address: result.data.address || '',
                    joinDate: result.data.joined_date || '',
                    activeCoach: '24',
                    passwordLastChanged: '30 days ago',
                    activeSessions: '2',
                    profilePicture: null
                });
                
                setUpdateSuccess(true);
                setIsEditMode(false);
                
                // Hide success message after 3 seconds
                setTimeout(() => {
                    setUpdateSuccess(false);
                }, 3000);
            } else {
                const errorMessage = result.message || 'Failed to update coach data';
                setUpdateError(errorMessage);
                console.error('Failed to update coach data:', result);
            }
        } catch (err) {
            console.error('Error updating coach data:', err);
            setUpdateError(err.message || 'Failed to update coach data. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    // Toggle edit mode
    const handleToggleEditMode = () => {
        if (!isEditMode) {
            // Entering edit mode - initialize form data
            if (apiData) {
                setEditFormData({
                    fullname: apiData.fullname || '',
                    email: apiData.email || '',
                    phone_number: apiData.phone_number || '',
                    address: apiData.address || '',
                        joined_date: apiData.joined_date || ''
                });
            }
        }
        setIsEditMode(!isEditMode);
        setUpdateError(null);
        setUpdateSuccess(false);
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setIsEditMode(false);
        setUpdateError(null);
        // Reset form data to original
        if (apiData) {
            setEditFormData({
                fullname: apiData.fullname || '',
                email: apiData.email || '',
                phone_number: apiData.phone_number || '',
                address: apiData.address || '',
                joined_date: apiData.joined_date || ''
            });
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
            
            if (storedUser) {
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

    // Handle delete user
    const handleDeleteUser = async () => {
        if (!userId) {
            setDeleteError('User ID is missing');
            return;
        }

        setDeleting(true);
        setDeleteError(null);

        try {
            // Get authentication token
            let token = null;
            const storedUser = localStorage.getItem('user');
            
            if (storedUser) {
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
                ? `${baseUrl}/delete/${userId}/`
                : `${baseUrl}/api/delete/${userId}/`;

            // Prepare headers
            const headers = {
                'Content-Type': 'application/json',
            };

            if (isValidToken) {
                headers['Authorization'] = `Bearer ${token.trim()}`;
            }

            console.log('Deleting coach:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: headers,
                credentials: 'include',
            });

            let result;
            try {
                const responseText = await response.text();
                console.log('Delete API Response text:', responseText);
                if (responseText) {
                    result = JSON.parse(responseText);
                } else {
                    result = {};
                }
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                throw new Error('Failed to parse server response');
            }

            if (response.ok && result.message) {
                // Success - show success popup
                console.log('Coach deleted successfully:', result);
                setDeleteSuccess(true);
                setShowDeleteConfirm(false);
                setDeleteError(null);
                
                // Navigate after 2 seconds
                setTimeout(() => {
                    navigate('/admin/clients');
                }, 2000);
            } else {
                const errorMessage = result.message || 'Failed to delete coach';
                setDeleteError(errorMessage);
                console.error('Failed to delete coach:', result);
            }
        } catch (err) {
            console.error('Error deleting coach:', err);
            setDeleteError(err.message || 'Failed to delete coach. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7] flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#003F8F] mb-4"></div>
                    <p className="text-gray-600 font-[Inter]">Loading coach data...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7]">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-red-800 font-[BasisGrotesquePro] mb-2">Error</h2>
                    <p className="text-red-700 font-[Inter] mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/admin/clients')}
                        className="px-4 py-2 bg-[#003F8F] text-white rounded-lg text-sm font-semibold hover:bg-[#002F6F] transition cursor-pointer"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7]">
            {/* Profile Header */}
            <div className="bg-white rounded-lg p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Profile Picture */}
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer">
                        {userData.profilePicture ? (
                            <img
                                src={userData.profilePicture}
                                alt={userData.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="30" cy="30" r="30" fill="%23E5E7EB" /%3E%3Cpath d="M30 20C33.3137 20 36 22.6863 36 26C36 29.3137 33.3137 32 30 32C26.6863 32 24 29.3137 24 26C24 22.6863 26.6863 20 30 20Z" fill="%239CA3AF" /%3E%3Cpath d="M20 42C20 36.4772 24.4772 32 30 32C35.5228 32 40 36.4772 40 42V44H20V42Z" fill="%239CA3AF" /%3E%3C/svg%3E';
                                }}
                            />
                        ) : (
                            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="30" cy="30" r="30" fill="#E5E7EB" />
                                <path d="M30 20C33.3137 20 36 22.6863 36 26C36 29.3137 33.3137 32 30 32C26.6863 32 24 29.3137 24 26C24 22.6863 26.6863 20 30 20Z" fill="#9CA3AF" />
                                <path d="M20 42C20 36.4772 24.4772 32 30 32C35.5228 32 40 36.4772 40 42V44H20V42Z" fill="#9CA3AF" />
                            </svg>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            {isEditMode ? (
                                <input
                                    type="text"
                                    value={editFormData.fullname}
                                    onChange={handleNameChange}
                                    className="text-2xl sm:text-3xl font-bold text-[#003F8F] font-[BasisGrotesquePro] border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
                                />
                            ) : (
                                <h1 className="text-2xl sm:text-3xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">
                                    {userData.name}
                                </h1>
                            )}
                            <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${userData.status === 'Active' ? 'bg-[#10B981]' : 'bg-gray-500'}`}>
                                {userData.status}
                            </span>
                        </div>
                        {isEditMode ? (
                            <input
                                type="email"
                                name="email"
                                value={editFormData.email}
                                onChange={handleEditFormChange}
                                className="text-sm sm:text-base text-gray-600 font-[Inter] mt-2 border border-gray-300 rounded px-2 py-1 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
                            />
                        ) : (
                            <p className="text-sm sm:text-base text-gray-600 font-[Inter] mt-2">
                                {userData.email}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button 
                            onClick={handleToggleEditMode}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-[#003F8F] hover:bg-gray-50 transition flex items-center gap-2 cursor-pointer"
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.3562 4.05611L13.944 5.64386M13.377 2.65736L9.08175 6.95261C8.85916 7.17375 8.70768 7.45632 8.64675 7.76411L8.25 9.75011L10.236 9.35261C10.5435 9.29111 10.8255 9.14036 11.0475 8.91836L15.3427 4.62311C15.4718 4.49404 15.5742 4.34081 15.6441 4.17217C15.7139 4.00353 15.7499 3.82278 15.7499 3.64024C15.7499 3.4577 15.7139 3.27695 15.6441 3.10831C15.5742 2.93967 15.4718 2.78644 15.3427 2.65736C15.2137 2.52829 15.0604 2.4259 14.8918 2.35605C14.7232 2.2862 14.5424 2.25024 14.3599 2.25024C14.1773 2.25024 13.9966 2.2862 13.8279 2.35605C13.6593 2.4259 13.5061 2.52829 13.377 2.65736Z" stroke="#003F8F" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14.25 11.25V13.5C14.25 13.8978 14.092 14.2794 13.8107 14.5607C13.5294 14.842 13.1478 15 12.75 15H4.5C4.10218 15 3.72064 14.842 3.43934 14.5607C3.15804 14.2794 3 13.8978 3 13.5V5.25C3 4.85218 3.15804 4.47064 3.43934 4.18934C3.72064 3.90804 4.10218 3.75 4.5 3.75H6.75" stroke="#003F8F" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>

                            {isEditMode ? 'Cancel' : 'Edit'}
                        </button>
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-red-600 hover:bg-gray-50 transition flex items-center gap-2 cursor-pointer"
                        >
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_713_17382)">
                                    <path d="M11.7534 2.56226H0.591797" stroke="#E53E3E" strokeLinecap="round" />
                                    <path d="M2.56055 2.56052H2.63277C2.897 2.55376 3.15304 2.46743 3.36741 2.3128C3.58178 2.15817 3.7445 1.94245 3.83427 1.69385L3.8566 1.62622L3.92029 1.43516C3.97478 1.27168 4.00236 1.19026 4.03847 1.12067C4.10952 0.984359 4.21149 0.866572 4.3362 0.776732C4.46093 0.686894 4.60496 0.627497 4.75675 0.603296C4.83357 0.59082 4.91959 0.59082 5.0916 0.59082H7.2517C7.42373 0.59082 7.50973 0.59082 7.58655 0.603296C7.73835 0.627497 7.88237 0.686894 8.0071 0.776732C8.13183 0.866572 8.23379 0.984359 8.30483 1.12067C8.34095 1.19026 8.36852 1.27168 8.42302 1.43516L8.4867 1.62622C8.56991 1.90282 8.74199 2.14426 8.97629 2.31317C9.2106 2.48207 9.49405 2.56901 9.78277 2.56052" stroke="#E53E3E" />
                                    <path d="M1.68555 4.20093L1.98756 8.73123C2.10377 10.4738 2.16155 11.345 2.72948 11.8761C3.29807 12.408 4.1713 12.408 5.91777 12.408H6.42595C8.17307 12.408 9.0463 12.4074 9.61424 11.8761C10.1822 11.345 10.2406 10.4738 10.3568 8.73123L10.6582 4.20093" stroke="#E53E3E" strokeLinecap="round" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_713_17382">
                                        <rect width="13" height="13" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>

                            Delete User
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border border-gray-300 rounded-lg p-1 inline-flex">
                <button
                    onClick={() => setActiveTab('personal')}
                    className={`px-6 py-3 rounded-lg text-sm font-semibold transition cursor-pointer ${activeTab === 'personal'
                        ? 'bg-[#003F8F] text-white'
                        : 'bg-transparent text-[#003F8F] hover:bg-gray-50'
                        }`}
                >
                    Personal Info
                </button>
                <button
                    onClick={() => setActiveTab('subscription')}
                    className={`px-6 py-3 rounded-lg text-sm font-semibold transition cursor-pointer ${activeTab === 'subscription'
                        ? 'bg-[#003F8F] text-white'
                        : 'bg-transparent text-[#003F8F] hover:bg-gray-50'
                        }`}
                >
                    Subscription Info
                </button>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                {/* Personal Information Section */}
                {activeTab === 'personal' && (
                    <>
                        <div className="bg-white rounded-lg p-6">
                            <h2 className="text-xl font-bold text-[#003F8F] font-[BasisGrotesquePro] mb-6">
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Column 1: Email, Join Date */}
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-sm font-semibold text-[#003F8F] font-[Inter] mb-1">Email</p>
                                        {isEditMode ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={editFormData.email}
                                                onChange={handleEditFormChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 font-[Inter] focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-800 font-[Inter]">{userData.email}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#003F8F] font-[Inter] mb-1">Join Date</p>
                                        {isEditMode ? (
                                            <input
                                                type="text"
                                                name="joined_date"
                                                value={editFormData.joined_date}
                                                onChange={handleEditFormChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 font-[Inter] focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-800 font-[Inter]">{userData.joinDate}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Column 2: Phone */}
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-sm font-semibold text-[#003F8F] font-[Inter] mb-1">Phone</p>
                                        {isEditMode ? (
                                            <input
                                                type="text"
                                                name="phone_number"
                                                value={editFormData.phone_number}
                                                onChange={handleEditFormChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 font-[Inter] focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-800 font-[Inter]">{userData.phone}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Column 3: Address */}
                                <div>
                                    <p className="text-sm font-semibold text-[#003F8F] font-[Inter] mb-1">Address</p>
                                    {isEditMode ? (
                                        <input
                                            type="text"
                                            name="address"
                                            value={editFormData.address}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 font-[Inter] focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-800 font-[Inter]">{userData.address}</p>
                                    )}
                                </div>
                            </div>

                            {/* Error Message */}
                            {updateError && (
                                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {updateError}
                                </div>
                            )}
                        </div>

                        {/* Security Settings Section */}
                        <div className="bg-white rounded-lg p-6">
                            <h2 className="text-xl font-bold text-[#003F8F] font-[BasisGrotesquePro] mb-6">
                                Security Settings
                            </h2>
                            <div className="space-y-6">
                                {/* Two-Factor Authentication */}
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-[#003F8F] font-[Inter] mb-1">
                                            Two-Factor Authentication
                                        </p>
                                        <p className="text-sm text-gray-600 font-[Inter]">
                                            Add an extra layer of security to your account
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleToggle('twoFactor')}
                                        className={`relative w-12 h-6 rounded-full transition cursor-pointer ${twoFactorAuth ? 'bg-orange-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${twoFactorAuth ? 'translate-x-6' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Login Notifications */}
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-[#003F8F] font-[Inter] mb-1">
                                            Login Notifications
                                        </p>
                                        <p className="text-sm text-gray-600 font-[Inter]">
                                            Get notified when someone logs into your account
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleToggle('loginNotifications')}
                                        className={`relative w-12 h-6 rounded-full transition cursor-pointer ${loginNotifications ? 'bg-orange-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${loginNotifications ? 'translate-x-6' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Password */}
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-[#003F8F] font-[Inter] mb-1">Password</p>
                                        <p className="text-sm text-gray-600 font-[Inter]">
                                            Last changed {userData.passwordLastChanged}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setShowPasswordModal(true)}
                                        className="px-4 py-2 cursor-pointer !border border-[#4D6080CC] text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                                    >
                                        Change Password
                                    </button>
                                </div>

                                {/* Active Sessions */}
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-[#003F8F] font-[Inter] mb-1">Active Sessions</p>
                                        <p className="text-sm text-gray-600 font-[Inter]">
                                            {userData.activeSessions} devices currently active
                                        </p>
                                    </div>
                                    <button className="px-4 py-2 cursor-pointer !border border-[#4D6080CC] text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
                                        Manage Session
                                    </button>
                                </div>
                            </div>
                        </div>


                    </>
                )}

                {/* Subscription Info Tab */}
                {activeTab === 'subscription' && (
                    <SubscriptionInfo />
                )}
            </div>

            {/* Bottom Action Buttons - Only show for Personal Info tab */}
            {activeTab === 'personal' && (
                <div className="bg-white rounded-lg p-6">
                    <div className="flex justify-end gap-3">
                        {isEditMode ? (
                            <>
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={updating}
                                    className="px-6 py-2 bg-white text-[#003F8F] !border border-[#003F8F] rounded-lg text-sm font-semibold hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateCoach}
                                    disabled={updating}
                                    className="px-6 py-2 bg-[#003F8F] text-white rounded-lg text-sm font-semibold hover:bg-[#002F6F] transition cursor-pointer disabled:opacity-50"
                                >
                                    {updating ? 'Saving...' : 'Save changes'}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => navigate('/admin/clients')}
                                className="px-6 py-2 bg-white text-[#003F8F] !border border-[#003F8F] rounded-lg text-sm font-semibold hover:bg-gray-50 transition cursor-pointer"
                            >
                                Back
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Success Message */}
            {updateSuccess && (
                <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm z-50 shadow-lg">
                    Coach updated successfully!
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative max-w-md w-full">
                        <h3 className="text-lg font-bold text-[#003F8F] mb-4">Confirm Delete</h3>
                        <p className="text-gray-700 mb-6">
                            Are you delete successfully
                        </p>
                        
                        {/* Error Message */}
                        {deleteError && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteError(null);
                                }}
                                disabled={deleting}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Success Popup */}
            {deleteSuccess && (
                <div className="fixed inset-0 bg-black/60 bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative max-w-md w-full text-center">
                        <div className="mb-4">
                            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#003F8F] mb-2">Delete successfully</h3>
                    </div>
                </div>
            )}

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
                                    className="px-4 py-2 bg-white !border border-[#E5E7EB] text-[#535B69] rounded-lg text-sm font-semibold hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

export default UserDetails;

