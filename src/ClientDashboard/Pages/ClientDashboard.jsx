import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Chat, DashboardMessageCoach, DashboardStartWorkout, DashboardViewProgress, DashboardWorkoutHistory } from '../Components/icons';
import ManImage from '../../assets/dashboard.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const ClientDashboard = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('Monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // State for calendar days
  const [calendarDaysState, setCalendarDaysState] = useState([]);
  const [weeklyDaysState, setWeeklyDaysState] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Process calendar days from API response
  const processCalendarDays = (calendarDays, period) => {
    if (!calendarDays || calendarDays.length === 0) {
      setCalendarDaysState([]);
      setWeeklyDaysState([]);
      return;
    }

    if (period === 'Weekly') {
      // Process weekly view - get last 7 days
      const weeklyDays = calendarDays.slice(-7).map(day => ({
        dayLabel: day.day_name || (day.date_display ? day.date_display.substring(0, 2) : '') || '',
        date: day.day_number || (day.date_display ? parseInt(day.date_display) : 0) || 0,
        status: day.status === 'complete' ? 'complete' :
          day.status === 'incomplete' ? 'incomplete' :
            day.status === 'pending' ? 'pending' : null
      }));
      setWeeklyDaysState(weeklyDays);
    } else {
      // Process monthly view
      const processedDays = calendarDays.map(day => {
        const dateObj = new Date(day.date);
        const today = new Date();
        const isToday = day.is_today ||
          (dateObj.getDate() === today.getDate() &&
            dateObj.getMonth() === today.getMonth() &&
            dateObj.getFullYear() === today.getFullYear());

        return {
          date: day.day_number || (day.date_display ? parseInt(day.date_display) : 0) || 0,
          status: day.status === 'complete' ? 'complete' :
            day.status === 'incomplete' ? 'incomplete' :
              day.status === 'pending' ? 'pending' : null,
          isPrevMonth: false,
          isNextMonth: false,
          isToday: isToday,
          fullDate: day.date
        };
      });

      setCalendarDaysState(processedDays);

      // Set current month from API data
      if (calendarDays.length > 0) {
        const firstDay = new Date(calendarDays[0].date);
        if (!isNaN(firstDay.getTime())) {
          setCurrentMonth(new Date(firstDay.getFullYear(), firstDay.getMonth(), 1));
        }
      }
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get authentication token - match login.jsx logic
        let token = null;
        const storedUser = localStorage.getItem('user');

        // Priority 1: Check user object from context
        if (user) {
          token = user.token || user.access_token || user.authToken || user.accessToken || user.access;
        }

        // Priority 2: Check stored user in localStorage
        if (!token && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            token = userData.token || userData.access_token || userData.authToken || userData.accessToken || userData.access;
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }

        // Priority 3: Check direct localStorage tokens (as stored by login.jsx)
        if (!token) {
          token = localStorage.getItem('token') ||
            localStorage.getItem('access_token') ||
            localStorage.getItem('authToken') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('access');
        }

        // Validate token format
        const isValidToken = token &&
          typeof token === 'string' &&
          token.trim().length > 0 &&
          token.trim() !== 'null' &&
          token.trim() !== 'undefined' &&
          token.trim() !== '' &&
          !token.startsWith('{') &&
          !token.startsWith('[');

        // Debug logging
        if (!isValidToken) {
          console.warn('No valid token found:', {
            user: user ? 'exists' : 'null',
            storedUser: storedUser ? 'exists' : 'null',
            directToken: localStorage.getItem('token') ? 'exists' : 'null',
            allTokens: {
              token: localStorage.getItem('token'),
              access_token: localStorage.getItem('access_token'),
              authToken: localStorage.getItem('authToken')
            }
          });
          setError('No authentication token found. Please log in again.');
          setLoading(false);
          return;
        }

        console.log('Token found, length:', token.length, 'First 20 chars:', token.substring(0, 20) + '...');

        // Determine period based on selected tab
        const period = selectedTab === 'Weekly' ? 'weekly' : 'monthly';

        // Ensure API_BASE_URL doesn't have trailing slash
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        // Check if baseUrl already includes /api, if not add it
        const apiUrl = baseUrl.includes('/api')
          ? `${baseUrl}/client-workplan/?period=${period}`
          : `${baseUrl}/api/client-workplan/?period=${period}`;

        // Prepare headers
        const headers = {
          'Content-Type': 'application/json',
        };

        // Clean token - remove any extra whitespace or quotes
        const cleanToken = token.trim().replace(/^["']|["']$/g, '');
        headers['Authorization'] = `Bearer ${cleanToken}`;
        console.log('Sending request to:', apiUrl);
        console.log('With Authorization header (first 30 chars):', cleanToken.substring(0, 30) + '...');

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
          throw new Error('Failed to parse server response');
        }

        if (response.ok && result.data) {
          setDashboardData(result.data);

          // Process calendar days from API
          if (result.data.progress_overview?.calendar_days) {
            processCalendarDays(result.data.progress_overview.calendar_days, selectedTab);
          }
        } else {
          // Handle token errors specifically
          if (response.status === 401 || response.status === 403) {
            console.error('Authentication error:', {
              status: response.status,
              result: result,
              tokenSent: !!headers['Authorization']
            });

            if (result.detail && (result.detail.includes('token') || result.code === 'token_not_valid')) {
              console.error('Token validation error:', result);
              // Clear invalid tokens
              localStorage.removeItem('token');
              localStorage.removeItem('access_token');
              localStorage.removeItem('authToken');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('access');
              // Clear user but keep it for now to show error
              // localStorage.removeItem('user');
              setError('Your session has expired. Please log in again.');
            } else if (result.detail && result.detail.includes('credentials')) {
              setError('Authentication failed. Please log in again.');
            } else {
              setError(result.message || result.detail || 'Authentication failed. Please log in again.');
            }
          } else {
            const errorMessage = result.message || result.detail || result.errors?.detail || 'Failed to fetch dashboard data';
            setError(errorMessage);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError(err.message || 'Failed to load dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, selectedTab]);

  const getStatusColor = (status, isPrevMonth, isNextMonth) => {
    if (isPrevMonth || isNextMonth) return 'text-gray-400 bg-transparent';
    if (status === 'complete') return 'bg-[#003F8F] text-white';
    if (status === 'incomplete') return 'bg-orange-500 text-white';
    if (status === 'pending') return 'bg-gray-200 text-gray-600';
    return 'bg-transparent text-gray-800';
  };

  // Get month name from current month
  const getMonthName = () => {
    if (dashboardData?.progress_overview?.current_month) {
      return dashboardData.progress_overview.current_month;
    }
    return currentMonth.toLocaleString('default', { month: 'long' });
  };


  // Show error state
  if (error) {
    return (
      <div className="space-y-6 px-4 sm:px-5 lg:px-6 xl:px-8 py-3 sm:py-5 md:py-6 bg-[#F7F7F7]">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Get data from API or use defaults
  const todayWorkout = dashboardData?.today_workout || {};
  const userProfile = dashboardData?.user_profile || {};
  const progressOverview = dashboardData?.progress_overview || {};
  const thisMonthSummary = dashboardData?.this_month_summary || {};
  const workoutsHistory = dashboardData?.workouts_history || {};

  // Get streak from this_month_summary or default
  const streak = thisMonthSummary.streak_days || thisMonthSummary.streak || 0;

  return (
    <div className="space-y-6 px-4 sm:px-5 lg:px-6 xl:px-8 py-3 sm:py-5 md:py-6 bg-[#F7F7F7]">
      {/* Welcome Banner */}
      <div className="rounded-lg p-6 text-white relative" style={{ background: 'linear-gradient(to right, #003F8F, #0DC7F5)' }}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-medium font-[Poppins] mb-2">
              Welcome back, {user?.name?.split(' ')[0] || user?.fullname?.split(' ')[0] || 'John'}!
            </h1>
            <p className="text-sm font-[Inter] mb-4">
              {streak > 0
                ? `You're on a ${streak}-day streak! Ready to crush today's workout?`
                : "Ready to crush today's workout?"
              }
            </p>
            <Link
              to="/client/chat"
              className="inline-flex items-center gap-2 border border-gray-300 text-[#ffffff] px-4 py-2 rounded-lg font-[14px] font-[Inter]"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3.34125 12L0 14.625V0.75C0 0.551088 0.0790176 0.360322 0.21967 0.21967C0.360322 0.0790176 0.551088 0 0.75 0H14.25C14.4489 0 14.6397 0.0790176 14.7803 0.21967C14.921 0.360322 15 0.551088 15 0.75V11.25C15 11.4489 14.921 11.6397 14.7803 11.7803C14.6397 11.921 14.4489 12 14.25 12H3.34125ZM2.82225 10.5H13.5V1.5H1.5V11.5387L2.82225 10.5ZM6.75 5.25H8.25V6.75H6.75V5.25ZM3.75 5.25H5.25V6.75H3.75V5.25ZM9.75 5.25H11.25V6.75H9.75V5.25Z"
                  fill="white"
                />
              </svg>
              Message Coach
            </Link>
          </div>
        </div>

        {/* Background image only on mobile */}
        <div className="hidden sm:flex sm:absolute sm:right-0 sm:-top-15 sm:items-end mt-6 mb-6">
          <img
            src={ManImage}
            alt="Fitness"
            className="h-full w-auto object-cover opacity-90"
            style={{ maxHeight: '185px' }}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Today's Workout */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Workout */}
          <div className="bg-white rounded-lg p-3 sm:p-5 md:p-6">
            <div className="mb-4 flex items-start justify-between">
              {/* Left side */}
              <h2 className="text-xl font-medium text-[#003F8F] font-[Poppins]">
                {todayWorkout.title || "Today's Workout"}
              </h2>

              {/* Right side */}
              <div className="flex flex-col items-end">
                <p className="text-lg font-semibold text-gray-700 px-4 py-2" style={{ color: '#003F8F' }}>
                  {todayWorkout.workout_name || 'No Workout'}
                </p>
                <p className="text-sm text-gray-600 font-[Inter]">
                  {todayWorkout.summary || 'No workout scheduled'}
                </p>
              </div>
            </div>

            {todayWorkout.is_rest_day ? (
              <div className="text-center py-8">
                <p className="text-lg font-medium text-[#003F8F] font-[Inter] mb-2">Rest Day</p>
                <p className="text-sm text-gray-600 font-[Inter]">Take time to recover and come back stronger tomorrow!</p>
              </div>
            ) : todayWorkout.exercises && todayWorkout.exercises.length > 0 ? (
              <>
                <div className="space-y-3 mb-4">
                  {todayWorkout.exercises.slice(0, 3).map((exercise, idx) => (
                    <div
                      key={exercise.id || idx}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 flex items-center justify-center rounded-full border border-[#003F8F] text-[#003F8F] font-semibold">{idx + 1}.</span>
                        <div>
                          <p className="font-semibold text-gray-800 font-[Inter]" style={{ color: '#003F8F' }}>{exercise.exercise_name}</p>
                          <p className="text-sm text-gray-600 font-[Inter]">
                            {exercise.sets} sets x {exercise.reps_display || exercise.reps} reps
                            {exercise.rest_time_display && ` • Rest: ${exercise.rest_time_display}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {todayWorkout.exercises.length > 3 && (
                    <p className="text-sm text-gray-600 font-[Inter] text-center">
                      +{todayWorkout.exercises.length - 3} more exercises
                    </p>
                  )}
                </div>
                <Link
                  to="/client/log-workout"
                  className="w-full text-gray-600 border border-gray-300 py-3 rounded-lg font-medium font-[Inter] transition-colors flex items-center justify-center gap-2 hover:bg-gray-50"
                  style={{ color: '#003F8F' }}
                >
                  <DashboardStartWorkout />
                  Start Workout
                </Link>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600 font-[Inter]">No workout scheduled for today</p>
              </div>
            )}
          </div>

          {/* Recent Workouts */}
          <div className="bg-white rounded-lg p-3 sm:p-5 md:p-6">
            <h2 className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-1">
              Recent Workouts
            </h2>
            <p className="text-sm text-gray-600 font-[Inter] mb-4">
              Your workout history and performance
            </p>
            {workoutsHistory.workouts && workoutsHistory.workouts.length > 0 ? (
              <div className="space-y-3">
                {workoutsHistory.workouts.map((workout, idx) => {
                  const isCompleted = workout.status === 'completed' || workout.status_display === 'Completed';
                  const isIncomplete = workout.status === 'incomplete' || workout.status_display === 'Incomplete';

                  return (
                    <div key={workout.id || idx} className="bg-white rounded-lg p-4  !border border-[#4D60804D]">
                      <div className="flex items-center justify-between gap-4">
                        {/* Left: Numbered icon + Workout name + Date */}
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white border-2 border-[#003F8F] text-[#003F8F] font-semibold text-sm flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <p className="font-semibold text-[#003F8F] font-[Inter] text-base mb-1">{workout.workout_name}</p>
                            <p className="text-sm text-gray-600 font-[Inter]">{workout.date_display || workout.date}</p>
                          </div>
                        </div>

                        {/* Right: Duration + Status */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          {/* Duration - only show if completed */}
                          {isCompleted && workout.duration_display && (
                            <div className="text-right">
                              <p className="text-sm font-semibold text-[#003F8F] font-[Inter]">{workout.duration_display}</p>
                              <p className="text-xs text-gray-500 font-[Inter]">Duration</p>
                            </div>
                          )}

                          {/* Status */}
                          <span
                            className={`text-sm font-medium font-[Inter] ${isCompleted
                              ? 'text-[#003F8F]'
                              : isIncomplete
                                ? 'text-orange-500'
                                : 'text-gray-500'
                              }`}
                          >
                            {workout.status_display || workout.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600 font-[Inter]">No workout history available</p>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg p-3 sm:p-5 md:p-6">
            <h2 className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-4">Notifications</h2>
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500 font-[Inter]">No notifications</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="bg-white rounded-lg p-3 sm:p-5 md:p-6">
            <p className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-4">Progress Overview</p>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex !border border-[#4D60804D] rounded-lg p-1 gap-2">
                <button
                  onClick={() => setSelectedTab('Monthly')}
                  className={`px-4 py-2 rounded-lg text-sm cursor-pointer font-medium font-[Inter] transition-colors ${selectedTab === 'Monthly'
                    ? 'bg-[#003F8F] text-white'
                    : 'text-[#003F8F]'
                    }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedTab('Weekly')}
                  className={`px-4 py-2 rounded-lg text-sm cursor-pointer font-medium font-[Inter] transition-colors ${selectedTab === 'Weekly'
                    ? 'bg-[#003F8F] text-white'
                    : 'text-[#003F8F]'
                    }`}
                >
                  Weekly
                </button>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center justify-between w-full">
                  {/* Left button */}
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Center month */}
                  <h3 className="font-semibold text-[#003F8F] font-[Inter] text-center text-sm sm:text-base">
                    {getMonthName()}
                    {progressOverview.current_year && ` ${progressOverview.current_year}`}
                  </h3>

                  {/* Right button */}
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              {selectedTab === 'Monthly' ? (
                <>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-gray-600 font-[Inter] py-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2 text-xs font-[Inter]">
                    {calendarDaysState.length > 0 ? (
                      calendarDaysState.map((day, idx) => (
                        <button
                          key={idx}
                          disabled={day.isPrevMonth || day.isNextMonth}
                          className={`
                          aspect-square flex items-center justify-center rounded cursor-pointer
                          transition-colors hover:opacity-80 text-xs sm:text-sm
                          ${getStatusColor(day.status, day.isPrevMonth, day.isNextMonth)}
                          ${day.isPrevMonth || day.isNextMonth ? 'cursor-default' : ''}
                            ${day.isToday ? 'ring-2 ring-[#003F8F] ring-offset-1' : ''}
                        `}
                          style={{ minHeight: '36px' }}
                          title={day.fullDate || day.date}
                        >
                          <span className="font-semibold">{day.date}</span>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-7 text-center py-4 text-gray-500 text-sm">
                        No calendar data available
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weeklyDaysState.length > 0 ? (
                      weeklyDaysState.map((day) => (
                        <div key={`${day.dayLabel}-header`} className="text-center text-xs font-medium text-gray-600 font-[Inter] py-1">
                          {day.dayLabel}
                        </div>
                      ))
                    ) : (
                      ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-gray-600 font-[Inter] py-1">
                          {day}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2 text-xs font-[Inter]">
                    {weeklyDaysState.length > 0 ? (
                      weeklyDaysState.map((day, idx) => (
                        <button
                          key={`${day.dayLabel}-${day.date}-${idx}`}
                          className={`
                          aspect-square flex flex-col items-center justify-center rounded cursor-pointer
                          transition-colors hover:opacity-80
                          ${getStatusColor(day.status, false, false)}
                        `}
                          style={{ minHeight: '36px' }}
                        >
                          <span className="text-xs font-semibold">{day.date}</span>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-7 text-center py-4 text-gray-500 text-sm">
                        No weekly data available
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-[Inter]">
              {progressOverview.legend && progressOverview.legend.length > 0 ? (
                progressOverview.legend.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div
                      className={`w-3 h-3 rounded ${item.color === 'blue' ? 'bg-[#003F8F]' :
                        item.color === 'orange' ? 'bg-orange-500' :
                          item.color === 'grey' || item.color === 'gray' ? 'bg-gray-200' :
                            'bg-gray-200'
                        }`}
                    ></div>
                    <span className="text-[#003F8F]">{item.label}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-[#003F8F] rounded"></div>
                    <span className="text-[#003F8F]">Complete</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span className="text-[#003F8F]">Incomplete</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <span className="text-[#003F8F]">Pending</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-lg p-3 sm:p-5 md:p-6">
            <h2 className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-4">
              {thisMonthSummary.title || (selectedTab === 'Weekly' ? 'This Week' : 'This Month')}
            </h2>
            <div className="space-y-3">
              <div className='flex items-center justify-between'>
                <p className="text-sm text-gray-600 font-[Inter]">Workouts Completed</p>
                <p className="text-xl font-medium text-[#003F8F] font-[Inter]">
                  {thisMonthSummary.workouts_completed ||
                    (thisMonthSummary.workouts_completed_count !== undefined && thisMonthSummary.workouts_total_count !== undefined
                      ? `${thisMonthSummary.workouts_completed_count}/${thisMonthSummary.workouts_total_count}`
                      : '0/0')}
                </p>
              </div>
              <div className='flex items-center justify-between'>
                <p className="text-sm text-gray-600 font-[Inter]">Total time</p>
                <p className="text-xl font-medium text-[#003F8F] font-[Inter]">
                  {thisMonthSummary.total_time ||
                    (thisMonthSummary.total_time_hours !== undefined
                      ? `${thisMonthSummary.total_time_hours} hrs`
                      : '0 hrs')}
                </p>
              </div>
              <div className='flex items-center justify-between'>
                <p className="text-sm text-gray-600 font-[Inter]">Streak</p>
                <p className="text-xl font-medium text-[#003F8F] font-[Inter]">
                  {thisMonthSummary.streak ||
                    (thisMonthSummary.streak_days !== undefined
                      ? `${thisMonthSummary.streak_days} days`
                      : '0 days')}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-3 sm:p-5 md:p-6">
            <h2 className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/client/dashboard/strength"
                className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <DashboardViewProgress />
                <span className="font-medium text-[#003F8F] font-[Inter]">View Progress</span>
              </Link>
              <button className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <DashboardWorkoutHistory />
                <span className="font-medium text-[#003F8F] font-[Inter]">Recent Workouts</span>
              </button>
              <Link
                to="/client/chat"
                className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <DashboardMessageCoach />
                <span className="font-medium text-[#003F8F] font-[Inter]">Message Coach</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
