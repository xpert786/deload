import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  AddNewClient,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  AvgSession,
  ClientIcon,
  DoumbleIcon,
  PendingIcon,
  PercentageTodayIcon,
  TodayMessageIcon,
  WeeklyGoalIcon,
  MessageIconn,
  AiWorkout,
} from "../../ClientDashboard/Components/icons";

import ManImage from "../../assets/dashboard.png";

// API URLs
const API_BASE_URL = 'http://168.231.121.7/deload/api/comprehensive-dashboard/';
const SESSIONS_API_URL = 'http://168.231.121.7/deload/api/sessions/';
const CLIENT_PROGRESS_API_URL = 'http://168.231.121.7/deload/api/coach/client-progress';

const notifications = {
  today: [
    { title: "Mike Ross - Great Finish!", time: "11m ago", icon: <TodayMessageIcon /> },
    { title: "John Doe - 50% Progress", time: "2 hrs ago", icon: <PercentageTodayIcon /> },
  ],
  yesterday: [
    { title: "7:00 AM – John Doe: Upper Body Strength", time: "Yesterday", icon: <AvgSession /> },
    { title: "10:00 AM – Sarah Lee: Cardio & Core", time: "Yesterday", icon: <AvgSession /> },
  ],
};

const quickActions = [
  { name: "Add New Client", icon: <AddNewClient /> },
  { name: "AI Workout", icon: <AiWorkout /> },
  { name: "Messages", icon: <MessageIconn /> },
];

const CoachDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // API data state
  const [dashboardData, setDashboardData] = useState(null);
  const [sessionsData, setSessionsData] = useState(null);
  const [clientProgressData, setClientProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calendar state management
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    return today;
  }); // Default to today
  const [weekOffset, setWeekOffset] = useState(0); // For week navigation

  // Sync selected date with API data when it loads
  useEffect(() => {
    if (sessionsData?.selected_date) {
      const apiSelectedDate = new Date(sessionsData.selected_date);
      apiSelectedDate.setHours(0, 0, 0, 0);
      setSelectedDate(apiSelectedDate);
    }
  }, [sessionsData]);

  // Selected session (for row highlight on click)
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(null);

  // Selected target tab for Client Progress (weekly / monthly)
  const [selectedTarget, setSelectedTarget] = useState("weekly");

  // Fetch comprehensive dashboard data
  const fetchDashboardData = useCallback(async () => {
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

      // Use hardcoded API URL
      const apiUrl = API_BASE_URL;

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
  }, [user]);

  // Fetch sessions data
  const fetchSessionsData = useCallback(async () => {
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

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      const response = await fetch(SESSIONS_API_URL, {
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
        console.error('Failed to parse sessions response:', parseError);
        return;
      }

      if (response.ok && result.data) {
        setSessionsData(result.data);
        
        // Sync selected date if API provides one
        if (result.data.selected_date) {
          const apiSelectedDate = new Date(result.data.selected_date);
          apiSelectedDate.setHours(0, 0, 0, 0);
          setSelectedDate(apiSelectedDate);
        }
      } else {
        console.error('Failed to fetch sessions data:', result);
      }
    } catch (err) {
      console.error('Fetch sessions error:', err);
    }
  }, [user]);

  // Fetch client progress data
  const fetchClientProgressData = useCallback(async () => {
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

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      const response = await fetch(CLIENT_PROGRESS_API_URL, {
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
        console.error('Failed to parse client progress response:', parseError);
        return;
      }

      if (response.ok) {
        // Set data even if it's an empty array
        if (result.data && Array.isArray(result.data)) {
          setClientProgressData(result.data);
        } else {
          // If data is not an array or doesn't exist, set empty array
          setClientProgressData([]);
        }
      } else {
        console.error('Failed to fetch client progress data:', result);
        setClientProgressData([]);
      }
    } catch (err) {
      console.error('Fetch client progress error:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
    fetchSessionsData();
    fetchClientProgressData();
  }, [fetchDashboardData, fetchSessionsData, fetchClientProgressData]);

  // Get quick stats from API or use defaults
  const quickStats = useMemo(() => {
    if (dashboardData?.quick_start) {
      return [
        { label: "Clients", value: dashboardData.quick_start.clients || 0, icon: <ClientIcon /> },
        { label: "Completed Today", value: dashboardData.quick_start.completed_today || 0, icon: <DoumbleIcon /> },
        { label: "Pending Check-ins", value: dashboardData.quick_start.pending_check_ins || 0, icon: <PendingIcon /> },
      ];
    }
    // Default values
    return [
      { label: "Clients", value: 0, icon: <ClientIcon /> },
      { label: "Completed Today", value: 0, icon: <DoumbleIcon /> },
      { label: "Pending Check-ins", value: 0, icon: <PendingIcon /> },
    ];
  }, [dashboardData]);

  // Get sessions from API filtered by selected date
  const sessions = useMemo(() => {
    if (sessionsData?.sessions && sessionsData.sessions.length > 0) {
      // Filter sessions by selected date
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      
      const filteredSessions = sessionsData.sessions.filter(session => {
        if (session.date) {
          const sessionDate = new Date(session.date);
          const sessionDateStr = sessionDate.toISOString().split('T')[0];
          return sessionDateStr === selectedDateStr;
        }
        return false;
      });

      return filteredSessions.map((session) => ({
        name: session.client_name || session.name || session.client?.name || 'Unknown',
        time: session.time || session.start_time || session.scheduled_time || '',
        duration: session.duration || session.duration_minutes ? `${session.duration_minutes} min` : '0 min',
        status: session.status || session.status_display || 'Pending',
        id: session.id
      }));
    }
    
    // Also check if there are clients_on_day for the selected date
    if (sessionsData?.clients_on_day && sessionsData.clients_on_day.length > 0) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      const dayClients = sessionsData.clients_on_day.find(day => {
        if (day.date) {
          const dayDate = new Date(day.date);
          return dayDate.toISOString().split('T')[0] === selectedDateStr;
        }
        return false;
      });

      if (dayClients && dayClients.clients && dayClients.clients.length > 0) {
        return dayClients.clients.map((client, index) => ({
          name: client.name || client.client_name || 'Unknown',
          time: client.time || client.start_time || '',
          duration: client.duration || '0 min',
          status: client.status || 'Pending',
          id: client.id || index
        }));
      }
    }
    
    // Return empty array if no sessions
    return [];
  }, [sessionsData, selectedDate]);

  // Get client progress from API
  const clientProgress = useMemo(() => {
    if (clientProgressData && Array.isArray(clientProgressData) && clientProgressData.length > 0) {
      return clientProgressData.map((client) => {
        // Handle different possible API response structures
        const progress = selectedTarget === 'weekly' 
          ? client.weekly_progress || client.progress?.weekly || client.weekly_percentage
          : client.monthly_progress || client.progress?.monthly || client.monthly_percentage;
        
        // Extract percentage value
        let percentage = 0;
        if (typeof progress === 'number') {
          percentage = progress;
        } else if (progress?.percentage) {
          percentage = progress.percentage;
        } else if (progress?.percent) {
          percentage = progress.percent;
        }
        
        return {
          name: client.client_name || client.name || client.client?.name || 'Unknown',
          percent: percentage,
          id: client.id || client.client_id || client.client?.id
        };
      });
    }
    // Default empty array
    return [];
  }, [clientProgressData, selectedTarget]);

  // Generate week dates based on weekOffset - use API data if available
  const weekDates = useMemo(() => {
    // If API provides calendar_dates, use them (first 7 for current week)
    if (sessionsData?.calendar_dates && sessionsData.calendar_dates.length > 0) {
      const startIndex = weekOffset * 7;
      const endIndex = startIndex + 7;
      const weekDatesFromAPI = sessionsData.calendar_dates.slice(startIndex, endIndex);
      
      if (weekDatesFromAPI.length === 7) {
        return weekDatesFromAPI.map(dateData => {
          const date = new Date(dateData.date);
          date.setHours(0, 0, 0, 0);
          return date;
        });
      }
    }
    
    // Fallback to calculated dates
    const dates = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    
    // Calculate the start of the current week (Monday)
    // getDay() returns 0 (Sunday) to 6 (Saturday)
    const day = startOfWeek.getDay();
    // Calculate days to subtract to get to Monday (day 1)
    // Sunday (0) -> subtract 6, Monday (1) -> subtract 0, Tuesday (2) -> subtract 1, etc.
    const daysToSubtract = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
    
    // Reset time to start of day for consistency
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Add week offset (7 days per week)
    startOfWeek.setDate(startOfWeek.getDate() + (weekOffset * 7));
    
    // Generate 7 days starting from Monday
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      date.setHours(0, 0, 0, 0); // Reset time for consistency
      dates.push(date);
    }
    
    return dates;
  }, [weekOffset, sessionsData]);

  // Format date to "Mon 21" format - use API data if available
  const formatDate = (date, apiDateData = null) => {
    if (apiDateData) {
      const dateStr = date.toISOString().split('T')[0];
      const isSelected = isDateSelected(date);
      const hasSessions = (apiDateData.total_clients > 0) || (apiDateData.clients && apiDateData.clients.length > 0);
      
      return {
        dayName: apiDateData.day_name || 'Mon',
        dayNumber: apiDateData.day_number || date.getDate(),
        fullDate: date,
        isSelected: isSelected,
        isToday: false, // Can be calculated if needed
        hasSessions: hasSessions,
        sessionCount: apiDateData.total_clients || (apiDateData.clients ? apiDateData.clients.length : 0)
      };
    }
    
    // Try to find date in API calendar_dates
    if (sessionsData?.calendar_dates) {
      const dateStr = date.toISOString().split('T')[0];
      const apiDateData = sessionsData.calendar_dates.find(d => {
        if (d.date) {
          const dDate = new Date(d.date);
          return dDate.toISOString().split('T')[0] === dateStr;
        }
        return false;
      });
      
      if (apiDateData) {
        const isSelected = isDateSelected(date);
        const hasSessions = (apiDateData.total_clients > 0) || (apiDateData.clients && apiDateData.clients.length > 0);
        
        return {
          dayName: apiDateData.day_name || 'Mon',
          dayNumber: apiDateData.day_number || date.getDate(),
          fullDate: date,
          isSelected: isSelected,
          isToday: false,
          hasSessions: hasSessions,
          sessionCount: apiDateData.total_clients || (apiDateData.clients ? apiDateData.clients.length : 0)
        };
      }
    }
    
    // Fallback to calculated format
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[date.getDay()];
    const dayNumber = date.getDate();
    return { dayName, dayNumber, fullDate: date, isSelected: false, isToday: false, hasSessions: false, sessionCount: 0 };
  };

  // Handle date selection
  const handleDateClick = (date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    setSelectedDate(normalizedDate);
    // Sessions will automatically filter based on selectedDate via useMemo
    console.log('Selected date:', normalizedDate.toISOString().split('T')[0]);
  };

  // Handle week navigation
  const handlePreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };

  // Check if a date is selected
  const isDateSelected = (date) => {
    // Normalize both dates to start of day for accurate comparison
    const date1 = new Date(date);
    date1.setHours(0, 0, 0, 0);
    const date2 = new Date(selectedDate);
    date2.setHours(0, 0, 0, 0);
    return date1.getTime() === date2.getTime();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7] flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#003F8F] mb-4"></div>
          <p className="text-gray-600 font-[Inter]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state (but still show UI with default data)
  if (error) {
    console.error('Dashboard error:', error);
  }

  return (
    <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7] text-[#003F8F] overflow-x-hidden">

    

            {/* Hero */}
            <div className="rounded-lg p-6 text-white relative" style={{ background: 'linear-gradient(to right, #003F8F, #0DC7F5)' }}>
    <div className="relative flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-medium font-[Poppins] mb-2">
          Hello, {user?.name?.split(' ')[0] || 'John'}!
        </h1>
        <p className="text-sm font-[Inter] mb-4">
          You're on a 7-day streak! Ready to crush today's workout?
        </p>
      </div>

      {/* Image shown only on larger screens and moved above parent */}
      <div className="hidden sm:flex sm:absolute sm:right-0 sm:-top-15 sm:items-end mt-3 mb-6">
        <img
          src={ManImage}
          alt="Fitness"
          className="h-full w-auto object-cover opacity-90"
          style={{ maxHeight: '150px' }}
        />
      </div>
    </div>

    {/* Background image only on mobile */}
    <div
      className="absolute inset-0 bg-cover bg-no-repeat bg-bottom sm:hidden opacity-30"
      style={{ backgroundImage: `url(${ManImage})` }}
    ></div>
  </div>

      {/* QUICK START */}
      <div>
        <p className="text-sm font-semibold mb-3">Quick Start</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickStats.map((item, idx) => (
            <div
              key={item.label}
              className={`rounded-2xl px-5 py-4 !border border-[#4D60804D] flex flex-col justify-between
              ${idx === 2 ? "bg-[#4C5B7F] text-white" : "bg-white text-[#003F8F]"}
              `}
            >
              <div className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                {item.icon}
              </div>

              <p className="text-2xl font-semibold mt-3">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6">


        {/* LEFT SIDE */}
        <div className="space-y-6">

          {/* CLIENT LIST */}
          <div className="bg-white rounded-2xl p-6 space-y-6">
            <p className="text-2xl font-semibold text-[#003F8F]">Clients List</p>

            <div className="flex flex-wrap justify-between gap-4">

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-4xl font-medium text-gray-500">
                    {dashboardData?.clients_list?.total_clients || 0}
                  </p>
                  {dashboardData?.clients_list?.vs_last_month !== undefined && (
                    <span className="flex items-center gap-2 text-xs">
                      {/* Blue Rounded Chip */}
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#1E63C7] bg-[#E8F5EC] text-[#1E63C7] font-semibold">
                        <span className="w-4 h-4 flex items-center justify-center">
                          <ArrowUpIcon className="w-3 h-3 text-[#1E63C7]" />
                        </span>
                        {dashboardData.clients_list.vs_last_month.toFixed(0)}%
                      </span>

                      {/* Text outside */}
                      <span className="text-gray-500">vs Last Month</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full sm:max-w-sm ">
                {[
                  { 
                    title: "Male", 
                    value: dashboardData?.clients_list?.gender_breakdown?.male?.count || 0, 
                    percent: `${dashboardData?.clients_list?.gender_breakdown?.male?.percentage?.toFixed(0) || 0}%` 
                  }, 
                  { 
                    title: "Female", 
                    value: dashboardData?.clients_list?.gender_breakdown?.female?.count || 0, 
                    percent: `${dashboardData?.clients_list?.gender_breakdown?.female?.percentage?.toFixed(0) || 0}%` 
                  }
                ].map((item) => (
                  <div key={item.title} className="rounded-xl !border border-[#4D60804D] p-3 ">
                    <p className="text-sm text-gray-500">{item.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-2xl font-medium text-gray-500">{item.value}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-[#333333]">{item.percent}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LEVEL PROGRESS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { 
                  label: "Beginner", 
                  value: dashboardData?.clients_list?.level_breakdown?.beginner?.count || 0, 
                  percent: dashboardData?.clients_list?.level_breakdown?.beginner?.percentage || 0, 
                  color: "bg-[#0B53BD]" 
                },
                { 
                  label: "Intermediate", 
                  value: dashboardData?.clients_list?.level_breakdown?.intermediate?.count || 0, 
                  percent: dashboardData?.clients_list?.level_breakdown?.intermediate?.percentage || 0, 
                  color: "bg-[#4A5C84]" 
                },
                { 
                  label: "Advanced", 
                  value: dashboardData?.clients_list?.level_breakdown?.advanced?.count || 0, 
                  percent: dashboardData?.clients_list?.level_breakdown?.advanced?.percentage || 0, 
                  color: "bg-[#E3C8B0]" 
                },
              ].map((level) => (
                <div key={level.label} className="rounded-xl !border border-[#4D60804D] p-4 ">
                  <p className="text-lg font-medium text-[#4D6080]">{level.value}</p>
                  <p className="text-sm text-[#4D6080]">{level.label}</p>

                  <div className="mt-4">
                    <p className="text-xs font-semibold text-[#333333]">{level.percent.toFixed(1)}%</p>
                    <div className="h-4 bg-[#EEF2FB] rounded-[6px] overflow-hidden">
                      <div className={`${level.color} h-full`} style={{ width: `${level.percent}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SESSIONS */}
          <div className="bg-white rounded-2xl p-6 space-y-5">

            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">Sessions</p>

                {/* SEARCH */}
                <div className="relative mt-4">
                  <input
                    className="w-full !border border-[#4D60804D] rounded-xl pl-10 pr-4 py-2 text-sm text-[#4D6080CC]"
                    placeholder="Search client here..."
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4D6080CC]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 12.65z"
                    />
                  </svg>
                </div>
              </div>

              <button
                onClick={() => navigate("/coach/dashboard/sessions")}
                className="px-5 py-2 bg-[#003F8F] text-white rounded-lg text-sm h-10 flex items-center justify-center cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* DATE SELECTOR */}
            <div className="flex items-center gap-3 text-xs">

              <button 
                onClick={handlePreviousWeek}
                className="flex items-center justify-center bg-[#F5F6FA] w-8 h-10 rounded-lg border border-[#D7DCE5] hover:bg-[#E6E7EB] transition cursor-pointer"
                aria-label="Previous week"
              >
                <ArrowLeftIcon />
              </button>

              <div className="flex gap-4 overflow-x-auto no-scrollbar px-2">
                {weekDates.map((date, index) => {
                  // Get API date data if available from sessions API
                  let apiDateData = null;
                  if (sessionsData?.calendar_dates) {
                    const startIndex = weekOffset * 7;
                    const apiIndex = startIndex + index;
                    if (sessionsData.calendar_dates[apiIndex]) {
                      apiDateData = sessionsData.calendar_dates[apiIndex];
                    }
                  }
                  
                  const { dayName, dayNumber, isSelected: apiIsSelected, hasSessions, sessionCount } = formatDate(date, apiDateData);
                  const isSelected = apiIsSelected !== undefined ? apiIsSelected : isDateSelected(date);

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateClick(date)}
                      className={`
            min-w-[60px] rounded-xl border overflow-hidden text-center transition cursor-pointer
            ${isSelected ? "border-[#3F547D]" : "border-[#D7DCE5] hover:border-[#3F547D]/50"}
          `}
                      aria-label={`Select ${dayName} ${dayNumber}`}
                    >
                      {/* TOP HALF */}
                      <div
                        className={`
              py-2 
              ${isSelected ? "bg-[#3F547D] text-white" : "bg-[#E6E7EB] text-[#3F547D]"}
            `}
                      >
                        <span className="text-sm font-medium">{dayName}</span>
                      </div>

                      {/* BOTTOM HALF — FIXED WHITE FOR SELECTED */}
                      <div className="bg-white py-2 relative">
                        <span className={`text-sm font-semibold ${isSelected ? "text-black" : "text-black"}`}>
                          {dayNumber}
                        </span>
                        {hasSessions && sessionCount > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-[#003F8F] rounded-full"></span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={handleNextWeek}
                className="flex items-center justify-center bg-[#F5F6FA] w-8 h-10 rounded-lg border border-[#D7DCE5] hover:bg-[#E6E7EB] transition cursor-pointer"
                aria-label="Next week"
              >
                <ArrowRightIcon />
              </button>

            </div>




            {/* SESSION LIST */}
            <div className="space-y-3">
              {sessions.length > 0 ? (
                sessions.map((session, index) => {
                  const isPending = session.status === "Pending" || session.status === "pending";
                  const isSelectedRow = selectedSessionIndex === index;

                  return (
                    <div
                      key={`${session.name}-${index}`}
                      onClick={() => setSelectedSessionIndex(index)}
                      className={`
          rounded-xl border px-4 py-4 flex flex-col sm:flex-row 
          items-start sm:items-center justify-between gap-4 cursor-pointer transition

          ${
            isSelectedRow
              ? "bg-[#FFF4EC] border-[#F5C6A5]"   
              : "bg-white border-[#D5DFEE] hover:border-[#003F8F66]" 
          }
        `}
                    >
                      {/* LEFT Section */}
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full 
            border border-[#003F8F] text-[#003F8F] font-semibold">
                          {index + 1}
                        </span>

                        <p className="font-semibold text-[#003F8F]">{session.name}</p>
                      </div>

                      {/* MIDDLE Duration */}
                      <div className="text-right">
                        <span className="text-sm text-[#1E1E1E]">{session.duration}</span>
                        <p className="text-xs text-gray-500">Duration</p>
                      </div>

                      {/* RIGHT Status */}
                      <span
                        className={`
            text-sm font-semibold
            ${isPending ? "text-[#F3701E]" : "text-[#003F8F]"}
          `}
                      >
                        {session.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No sessions scheduled for selected date
                </div>
              )}
            </div>

          </div>

          {/* CLIENT PROGRESS */}
          <div className="bg-white rounded-2xl p-6 space-y-5">

            <p className="text-xl font-semibold">Client Progress</p>

            <div className="flex flex-wrap gap-3 ">
              <div className="flex !border border-[#4D60804D] rounded-lg p-2 gap-2">
                <button
                  onClick={() => setSelectedTarget("weekly")}
                  className={`
                    px-4 py-2 rounded-lg text-sm cursor-pointer
                    ${
                      selectedTarget === "weekly"
                        ? "bg-[#003F8F] text-white"
                        : "bg-transparent text-[#003F8F]"
                    }
                  `}
                >
                  Weekly Target
                </button>
                <button
                  onClick={() => setSelectedTarget("monthly")}
                  className={`
                    px-4 py-2 rounded-lg text-sm cursor-pointer
                    ${
                      selectedTarget === "monthly"
                        ? "bg-[#003F8F] text-white"
                        : "bg-transparent text-[#003F8F]"
                    }
                  `}
                >
                  Monthly Target
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {clientProgress.length > 0 ? (
                clientProgress.slice(0, 3).map((client) => (
                  <div
                    key={client.id || client.name}
                    className="rounded-xl !border border-[#4D60804D] p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-[#003F8F]">{client.name}</p>
                        <span className="text-xs px-3 py-1 rounded-full bg-[#003F8F] text-white">
                          On Track
                        </span>
                      </div>

                      <p className="text-gray-500 font-semibold mt-3">
                        {client.percent.toFixed(0)}%
                      </p>
                    </div>

                    <div className="h-2 bg-[#E4EAF5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF7A00]"
                        style={{ width: `${client.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No client progress data available
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/coach/dashboard/client-progress")}
              className="px-4 py-2 !border border-[#4D60804D] rounded-xl flex items-center gap-2 text-[#003F8F] text-sm cursor-pointer"
            >
              See All <ArrowRightIcon />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* TRAINING SESSION */}
          <div className="bg-white rounded-2xl p-6 space-y-6">
            <p className="text-lg font-semibold">Number of Training Session</p>

            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32">
                <span className="absolute -top-2 -right-2 text-[10px] bg-white !border border-[#00000026] px-2 py-1 rounded-full shadow">
                  70%
                </span>

                <div className="absolute inset-0 rounded-full !border-[12px] !border-[#E6EDFF]" />
                <div className="absolute inset-0 rounded-full !border-[12px] !border-[#1F66D0] border-t-transparent border-l-transparent rotate-[200deg]" />

                <div className="absolute inset-[18px] bg-white rounded-full flex flex-col items-center justify-center">
                  <p className="text-xs text-gray-500 font-semibold">Total</p>
                  <p className="text-3xl font-bold text-[#003F8F]">16</p>
                </div>
              </div>

              <span className="flex items-center gap-2 text-xs text-[#4B5B79] font-medium">

                {/* BLUE BADGE */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F5EC] border border-[#A7C5FF] text-[#003F8F] font-semibold">

                  {/* SMALL ICON CIRCLE */}
                  <span className="w-4 h-4 flex items-center justify-center text-[10px] text-[#003F8F] border border-[#A7C5FF] rounded-full">
                    ↗
                  </span>

                  25%
                </span>

                vs Last Week
              </span>

            </div>

            <div className="space-y-3 text-sm">
              {[
                { label: "Weekly Session Goals", value: "20", icon: <WeeklyGoalIcon /> },
                { label: "Avg Session Per Client", value: "3", icon: <AvgSession /> },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="!border border-[#4D60804D] px-4 py-3 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 flex items-center justify-center !border rounded-xl shrink-0">
                      {stat.icon}
                    </span>

                    {/* Text wrap control */}
                    <span className="text-[#003F8F] text-[13px] font-medium"> {stat.label} </span>
                  </div>

                  {/* Right value */}
                  <span className="font-semibold text-[#003F8F] shrink-0 whitespace-nowrap">
                    {stat.value}
                    <span className="text-xs text-[#003F8F] ml-1">Sessions</span>
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* NOTIFICATIONS */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <div className="flex justify-between">
              <p className="text-xl font-semibold">Notifications</p>
              <button className="px-4 py-2 bg-[#003F8F] text-white rounded-xl text-sm cursor-pointer">
                View All
              </button>
            </div>

            <div className="space-y-4 text-sm">

              <p className="text-xs font-semibold">Today</p>
              {notifications.today.map((note) => (
                <div key={note.title} className="flex justify-between !border border-[#4D60804D] px-4 py-3 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 !border rounded-xl flex items-center justify-center">
                      {note.icon}
                    </span>
                    <span className="font-semibold">{note.title}</span>
                  </div>
                  <span className="text-xs whitespace-nowrap">{note.time}</span>
                </div>
              ))}

              <p className="text-xs font-semibold pt-2">Yesterday</p>
              {notifications.yesterday.map((note) => (
                <div key={note.title} className="flex justify-between !border border-[#4D60804D] px-4 py-3 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 !border rounded-xl flex items-center justify-center">
                      {note.icon}
                    </span>
                    <span className="font-semibold">{note.title}</span>
                  </div>
                  <span className="text-xs whitespace-nowrap">{note.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <p className="text-xl font-semibold">Quick Actions</p>

            <div className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  className="w-full flex items-center gap-3 !border border-[#4D60804D] px-4 py-3 rounded-xl hover:bg-[#F5F8FF]"
                >
                  <span className="w-6 h-6 !border rounded-xl flex items-center justify-center">
                    {action.icon}
                  </span>
                  {action.name}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CoachDashboard;
