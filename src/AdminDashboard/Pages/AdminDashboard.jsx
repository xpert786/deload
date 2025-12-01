import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { ClientIcon, WorkOutPlan, ActivesIcon, MonthlyIcon } from '../../ClientDashboard/Components/icons';

// Use API URL from .env file only
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllCoaches, setShowAllCoaches] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
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
        const apiUrl = `${baseUrl}/overview/`;

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
          console.error('Failed to parse dashboard response:', parseError);
          setError('Failed to parse server response. Please try again.');
          setLoading(false);
          return;
        }

        if (response.ok && result.data) {
          setDashboardData(result.data);
        } else {
          console.error('Failed to fetch dashboard data:', result);
          setError(result.message || 'Failed to fetch dashboard data. Please try again.');
        }
      } catch (err) {
        console.error('Fetch dashboard error:', err);
        setError('Network error: Unable to fetch dashboard data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // User Growth Data (Static - not in API)
  const userGrowthData = [
    { month: 'Jan', newClients: 600, other: 50 },
    { month: 'Feb', newClients: 700, other: 70 },
    { month: 'Mar', newClients: 800, other: 80 },
    { month: 'Apr', newClients: 900, other: 90 },
    { month: 'May', newClients: 1000, other: 100 },
    { month: 'Jun', newClients: 1150, other: 120 }
  ];

  // Revenue Data (Static - not in API)
  const revenueData = [
    { month: 'Jan', revenue: 6500 },
    { month: 'Feb', revenue: 7800 },
    { month: 'Mar', revenue: 8500 },
    { month: 'Apr', revenue: 9500 },
    { month: 'May', revenue: 9800 },
    { month: 'Jun', revenue: 10500 }
  ];

  // Map API data to UI format
  const recentCoaches = dashboardData?.recent?.recent_register_coaches?.map((coach) => ({
    id: coach.id,
    name: coach.fullname,
    time: coach.joined_ago || 'N/A',
    status: 'Active' // Default status, API doesn't provide status
  })) || [];

  // Helper function to get name only (exclude email)
  const getNameOnly = (activity) => {
    // Check if fullname exists and is not an email
    if (activity.fullname && typeof activity.fullname === 'string' && !activity.fullname.includes('@')) {
      return activity.fullname;
    }
    // Check if username exists and is not an email
    if (activity.username && typeof activity.username === 'string' && !activity.username.includes('@')) {
      return activity.username;
    }
    // If fullname is an email, extract name from it
    if (activity.fullname && typeof activity.fullname === 'string' && activity.fullname.includes('@')) {
      const nameFromEmail = activity.fullname.split('@')[0];
      return nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    }
    // If username is an email, extract name from it
    if (activity.username && typeof activity.username === 'string' && activity.username.includes('@')) {
      const nameFromEmail = activity.username.split('@')[0];
      return nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    }
    // If email field exists, extract name from it
    if (activity.email && typeof activity.email === 'string' && activity.email.includes('@')) {
      const nameFromEmail = activity.email.split('@')[0];
      return nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    }
    // If no valid name found, return 'User'
    return 'User';
  };

  // Map recent activity from API
  const recentActivity = dashboardData?.recent?.recent_activity?.map((activity) => ({
    type: activity.role === 'coach' ? 'New User Registration' : 'New User Registration',
    description: `${getNameOnly(activity)} signed up as a ${activity.role}`,
    time: activity.joined_ago || 'N/A',
    icon: activity.role === 'coach' ? '👤' : '💰'
  })) || [];

  const getStatusBadge = (status) => {
    const styles = {
      Active: 'bg-[#10B981] text-white',
      Inactive: 'bg-[#8C8C8C] text-white',
      Pending: 'bg-[#FEBC2F] text-white'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.Inactive}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7]">
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7]">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7]">
      {/* Title */}
      <h1 className="text-2xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">
        Dashboard Overview
      </h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#4D6080CC] font-[Inter]">Total Users</h3>
            <div className="flex items-center justify-center">
              <ClientIcon />
            </div>
          </div>
          <p className="text-xl font-bold text-[#003F8F] font-[Inter]">
            {dashboardData?.counts?.total_users?.toLocaleString() || '0'}
          </p>
        </div>

        {/* Active Coaches */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#4D6080CC] font-[Inter]">Active Coaches</h3>
            <div className=" flex items-center justify-center">
              <div className="text-[#003F8F]">
                <WorkOutPlan />
              </div>
            </div>
          </div>
          <p className="text-xl font-bold text-[#003F8F] font-[Inter]">
            {dashboardData?.active?.active_coaches || dashboardData?.counts?.total_coaches || '0'}
          </p>
        </div>

        {/* Active Clients */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#4D6080CC] font-[Inter]">Active Clients</h3>
            <div className=" flex items-center justify-center">
              <div className="text-[#003F8F]">
                <ActivesIcon />
              </div>
            </div>
          </div>
          <p className="text-xl font-bold text-[#003F8F] font-[Inter]">
            {dashboardData?.active?.active_clients || dashboardData?.counts?.total_clients || '0'}
          </p>
        </div>

        {/* Monthly Revenue (Static - not in API) */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#4D6080CC] font-[Inter]">Monthly Revenue</h3>
            <div className=" flex items-center justify-center">
              <MonthlyIcon />

            </div>
          </div>
          <p className="text-xl font-bold text-[#003F8F] font-[Inter]">$12,480</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#003F8F] mb-4 font-[BasisGrotesquePro]">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                domain={[0, 1200]}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="newClients"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="other"
                stroke="#FB923C"
                strokeWidth={2}
                dot={{ fill: '#FB923C', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Overview Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#003F8F] mb-4 font-[BasisGrotesquePro]">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                domain={[0, 12000]}
              />
              <Tooltip />
              <Bar dataKey="revenue" fill="#FB923C" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Recent Coach Registrations */}
         <div className="bg-white rounded-lg shadow-sm p-6">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold text-[#003F8F] font-[BasisGrotesquePro]">Recent Coach Registrations</h3>
             {recentCoaches.length > 0 && (
               <button 
                 onClick={() => setShowAllCoaches(!showAllCoaches)}
                 className="px-4 py-2 bg-[#003F8F] text-white rounded-lg text-sm font-semibold hover:bg-[#002F6F] transition cursor-pointer"
               >
                 View All
               </button>
             )}
           </div>
          <div className="space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4 px-2 sm:px-4 py-3 border-b border-gray-200">
              <div className="text-xs sm:text-sm font-semibold text-gray-600 font-[Inter] min-w-0">Coach Name</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 font-[Inter] min-w-0">Registration Date</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 font-[Inter] min-w-0 ml-3">Clients</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 font-[Inter] min-w-0">Status</div>
             
            </div>

             {/* Table Rows */}
             {recentCoaches.length === 0 ? (
               <div className="text-center py-4 text-gray-500 text-sm">No recent coach registrations</div>
             ) : (
               (showAllCoaches ? recentCoaches : recentCoaches.slice(0, 4)).map((coach) => (
                <div key={coach.id} className="bg-white border border-gray-200 rounded-lg p-2 sm:p-4  transition">
                  <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4 items-center">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-[#003F8F] font-[Inter] truncate">{coach.id}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-[#003F8F] font-[Inter] truncate">{coach.name}</p>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-[#003F8F] font-[Inter] min-w-0 truncate">{coach.time}</div>
                    <div className="min-w-0">{getStatusBadge(coach.status)}</div>
                   
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

         {/* Recent Activity */}
         <div className="bg-white rounded-lg p-6">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold text-[#003F8F] font-[BasisGrotesquePro]">Recent Activity</h3>
             {recentActivity.length > 0 && (
               <button 
                 onClick={() => setShowAllActivity(!showAllActivity)}
                 className="px-4 py-2 bg-[#003F8F] text-white rounded-lg text-sm font-semibold hover:bg-[#002F6F] transition cursor-pointer"
               >
                 View All
               </button>
             )}
           </div>
           <div className="space-y-3">
             {recentActivity.length === 0 ? (
               <div className="text-center py-4 text-gray-500 text-sm">No recent activity</div>
             ) : (
               (showAllActivity ? recentActivity : recentActivity.slice(0, 4)).map((activity, index) => (
              <div key={index} className="bg-white !border border-[#4D60804D] rounded-lg p-4 transition">
                <div className="flex items-start gap-3">
                  <div className=" flex items-center justify-center flex-shrink-0">
                    {activity.type === 'New User Registration' ? (
                      <svg width="18" height="18" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.41602 1.16675C5.64247 1.16675 4.9006 1.47404 4.35362 2.02102C3.80664 2.568 3.49935 3.30987 3.49935 4.08342C3.49935 4.85696 3.80664 5.59883 4.35362 6.14581C4.9006 6.69279 5.64247 7.00008 6.41602 7.00008C7.18956 7.00008 7.93143 6.69279 8.47841 6.14581C9.02539 5.59883 9.33268 4.85696 9.33268 4.08342C9.33268 3.30987 9.02539 2.568 8.47841 2.02102C7.93143 1.47404 7.18956 1.16675 6.41602 1.16675ZM4.66602 4.08342C4.66602 3.8536 4.71128 3.62604 4.79923 3.41372C4.88717 3.2014 5.01608 3.00848 5.17858 2.84598C5.34108 2.68348 5.534 2.55457 5.74632 2.46663C5.95864 2.37868 6.1862 2.33341 6.41602 2.33341C6.64583 2.33341 6.87339 2.37868 7.08571 2.46663C7.29803 2.55457 7.49095 2.68348 7.65345 2.84598C7.81596 3.00848 7.94486 3.2014 8.03281 3.41372C8.12075 3.62604 8.16602 3.8536 8.16602 4.08342C8.16602 4.54754 7.98164 4.99266 7.65345 5.32085C7.32526 5.64904 6.88015 5.83342 6.41602 5.83342C5.95189 5.83342 5.50677 5.64904 5.17858 5.32085C4.85039 4.99266 4.66602 4.54754 4.66602 4.08342ZM2.33268 10.7917C2.33268 10.6867 2.38518 10.5065 2.5736 10.2673C2.75793 10.034 3.0426 9.78433 3.42002 9.5545C4.17427 9.09367 5.23593 8.75008 6.41602 8.75008C6.63496 8.75008 6.84982 8.76155 7.0606 8.7845C7.21454 8.80082 7.36865 8.75532 7.48904 8.65801C7.60943 8.56071 7.68624 8.41956 7.70256 8.26562C7.71888 8.11169 7.67338 7.95757 7.57607 7.83718C7.47877 7.71679 7.33762 7.63999 7.18368 7.62367C6.92864 7.59728 6.67242 7.58385 6.41602 7.58342C5.01893 7.58342 3.74727 7.98825 2.81218 8.55875C2.34552 8.84342 1.94652 9.17941 1.65835 9.54458C1.37485 9.90275 1.16602 10.3327 1.16602 10.7917C1.16602 11.2847 1.40577 11.6732 1.7511 11.9502C2.07777 12.2127 2.50885 12.3866 2.96677 12.5079C3.88727 12.7512 5.11577 12.8334 6.41602 12.8334L6.8156 12.8305C6.8922 12.8295 6.96785 12.8134 7.03823 12.7831C7.10861 12.7528 7.17234 12.709 7.22577 12.6541C7.27921 12.5992 7.32131 12.5343 7.34967 12.4631C7.37803 12.392 7.39209 12.3159 7.39106 12.2393C7.39002 12.1627 7.37391 12.087 7.34364 12.0167C7.31337 11.9463 7.26953 11.8826 7.21463 11.8291C7.15974 11.7757 7.09485 11.7336 7.02368 11.7052C6.95251 11.6769 6.87645 11.6628 6.79985 11.6638L6.41602 11.6667C5.13852 11.6667 4.03427 11.5833 3.26602 11.3797C2.87927 11.2777 2.62668 11.1569 2.48143 11.0402C2.35427 10.9382 2.33268 10.8629 2.33268 10.7917ZM10.4993 8.16675C10.6541 8.16675 10.8024 8.22821 10.9118 8.3376C11.0212 8.447 11.0827 8.59537 11.0827 8.75008V9.91675H12.2493C12.4041 9.91675 12.5524 9.97821 12.6618 10.0876C12.7712 10.197 12.8327 10.3454 12.8327 10.5001C12.8327 10.6548 12.7712 10.8032 12.6618 10.9126C12.5524 11.022 12.4041 11.0834 12.2493 11.0834H11.0827V12.2501C11.0827 12.4048 11.0212 12.5532 10.9118 12.6626C10.8024 12.772 10.6541 12.8334 10.4993 12.8334C10.3446 12.8334 10.1963 12.772 10.0869 12.6626C9.97747 12.5532 9.91602 12.4048 9.91602 12.2501V11.0834H8.74935C8.59464 11.0834 8.44627 11.022 8.33687 10.9126C8.22747 10.8032 8.16602 10.6548 8.16602 10.5001C8.16602 10.3454 8.22747 10.197 8.33687 10.0876C8.44627 9.97821 8.59464 9.91675 8.74935 9.91675H9.91602V8.75008C9.91602 8.59537 9.97747 8.447 10.0869 8.3376C10.1963 8.22821 10.3446 8.16675 10.4993 8.16675Z" fill="#035ED2" />
                      </svg>

                    ) : (
                      <svg width="18" height="18" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.99935 12.8334C10.221 12.8334 12.8327 10.2217 12.8327 7.00008C12.8327 3.77842 10.221 1.16675 6.99935 1.16675C3.77769 1.16675 1.16602 3.77842 1.16602 7.00008C1.16602 10.2217 3.77769 12.8334 6.99935 12.8334Z" stroke="#035ED2" />
                        <path d="M7 3.5V10.5M8.75 5.54167C8.75 4.73667 7.96658 4.08333 7 4.08333C6.03342 4.08333 5.25 4.73667 5.25 5.54167C5.25 6.34667 6.03342 7 7 7C7.96658 7 8.75 7.65333 8.75 8.45833C8.75 9.26333 7.96658 9.91667 7 9.91667C6.03342 9.91667 5.25 9.26333 5.25 8.45833" stroke="#035ED2" stroke-linecap="round" />
                      </svg>

                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#003F8F] font-[Inter]">{activity.type}</p>
                    <p className="text-xs text-[#4D6080CC]font-[Inter] mt-1">{activity.description}</p>
                    <p className="text-xs text-[#4D6080CC] font-[Inter] mt-1">• {activity.time}</p>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
