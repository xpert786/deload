import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubscriptionInfo from './SubscriptionInfo';

const UserDetails = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [activeTab, setActiveTab] = useState('personal');

    // Toggle states
    const [twoFactorAuth, setTwoFactorAuth] = useState(true);
    const [loginNotifications, setLoginNotifications] = useState(true);
    const [accountActivity, setAccountActivity] = useState(true);
    const [securityAlerts, setSecurityAlerts] = useState(true);
    const [platformUpdates, setPlatformUpdates] = useState(true);
    const [newUserRegistrations, setNewUserRegistrations] = useState(true);
    const [paymentIssues, setPaymentIssues] = useState(true);
    const [systemAlerts, setSystemAlerts] = useState(true);

    // Sample user data - in real app, fetch based on userId
    const userData = {
        id: userId || 'C101',
        name: 'John Doe',
        status: 'Active',
        gender: 'Male',
        age: '20',
        level: 'Beginner',
        email: 'john.doe@email.com',
        phone: '+01 (555) 123-4567',
        address: '789 New York, USA',
        joinDate: 'June 12, 2023',
        activeCoach: '24',
        passwordLastChanged: '30 days ago',
        activeSessions: '2',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces'
    };

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
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">
                                {userData.name}
                            </h1>
                            <span className="px-3 py-1 bg-[#10B981] rounded-full text-white text-xs font-semibold rounded">
                                {userData.status}
                            </span>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 font-[Inter] mt-2">
                            {userData.gender} • {userData.age} yo • {userData.level}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-[#003F8F] hover:bg-gray-50 transition flex items-center gap-2 cursor-pointer">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.3562 4.05611L13.944 5.64386M13.377 2.65736L9.08175 6.95261C8.85916 7.17375 8.70768 7.45632 8.64675 7.76411L8.25 9.75011L10.236 9.35261C10.5435 9.29111 10.8255 9.14036 11.0475 8.91836L15.3427 4.62311C15.4718 4.49404 15.5742 4.34081 15.6441 4.17217C15.7139 4.00353 15.7499 3.82278 15.7499 3.64024C15.7499 3.4577 15.7139 3.27695 15.6441 3.10831C15.5742 2.93967 15.4718 2.78644 15.3427 2.65736C15.2137 2.52829 15.0604 2.4259 14.8918 2.35605C14.7232 2.2862 14.5424 2.25024 14.3599 2.25024C14.1773 2.25024 13.9966 2.2862 13.8279 2.35605C13.6593 2.4259 13.5061 2.52829 13.377 2.65736Z" stroke="#003F8F" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M14.25 11.25V13.5C14.25 13.8978 14.092 14.2794 13.8107 14.5607C13.5294 14.842 13.1478 15 12.75 15H4.5C4.10218 15 3.72064 14.842 3.43934 14.5607C3.15804 14.2794 3 13.8978 3 13.5V5.25C3 4.85218 3.15804 4.47064 3.43934 4.18934C3.72064 3.90804 4.10218 3.75 4.5 3.75H6.75" stroke="#003F8F" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>

                            Edit
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-red-600 hover:bg-gray-50 transition flex items-center gap-2 cursor-pointer">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_713_17382)">
                                    <path d="M11.7534 2.56226H0.591797" stroke="#E53E3E" stroke-linecap="round" />
                                    <path d="M2.56055 2.56052H2.63277C2.897 2.55376 3.15304 2.46743 3.36741 2.3128C3.58178 2.15817 3.7445 1.94245 3.83427 1.69385L3.8566 1.62622L3.92029 1.43516C3.97478 1.27168 4.00236 1.19026 4.03847 1.12067C4.10952 0.984359 4.21149 0.866572 4.3362 0.776732C4.46093 0.686894 4.60496 0.627497 4.75675 0.603296C4.83357 0.59082 4.91959 0.59082 5.0916 0.59082H7.2517C7.42373 0.59082 7.50973 0.59082 7.58655 0.603296C7.73835 0.627497 7.88237 0.686894 8.0071 0.776732C8.13183 0.866572 8.23379 0.984359 8.30483 1.12067C8.34095 1.19026 8.36852 1.27168 8.42302 1.43516L8.4867 1.62622C8.56991 1.90282 8.74199 2.14426 8.97629 2.31317C9.2106 2.48207 9.49405 2.56901 9.78277 2.56052" stroke="#E53E3E" />
                                    <path d="M1.68555 4.20093L1.98756 8.73123C2.10377 10.4738 2.16155 11.345 2.72948 11.8761C3.29807 12.408 4.1713 12.408 5.91777 12.408H6.42595C8.17307 12.408 9.0463 12.4074 9.61424 11.8761C10.1822 11.345 10.2406 10.4738 10.3568 8.73123L10.6582 4.20093" stroke="#E53E3E" stroke-linecap="round" />
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
                                        <p className="text-sm text-gray-800 font-[Inter]">{userData.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#003F8F] font-[Inter] mb-1">Join Date</p>
                                        <p className="text-sm text-gray-800 font-[Inter]">{userData.joinDate}</p>
                                    </div>
                                </div>

                                {/* Column 2: Phone, Active Coach */}
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-sm font-semibold text-[#003F8F] font-[Inter] mb-1">Phone</p>
                                        <p className="text-sm text-gray-800 font-[Inter]">{userData.phone}</p>
                                    </div>
                                    
                                </div>

                                {/* Column 3: Address */}
                                <div>
                                    <p className="text-sm font-semibold text-[#003F8F] font-[Inter] mb-1">Address</p>
                                    <p className="text-sm text-gray-800 font-[Inter]">{userData.address}</p>
                                </div>
                            </div>
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
                                    <button className="px-4 py-2 cursor-pointer !border border-[#4D6080CC] text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
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
                        <button
                            onClick={() => navigate('/admin/clients')}
                            className="px-6 py-2 bg-white text-[#003F8F] !border border-[#003F8F] rounded-lg text-sm font-semibold hover:bg-gray-50 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button className="px-6 py-2 bg-[#003F8F] text-white rounded-lg text-sm font-semibold hover:bg-[#002F6F] transition cursor-pointer">
                            Save changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetails;

