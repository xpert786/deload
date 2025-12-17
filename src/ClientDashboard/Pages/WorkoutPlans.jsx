import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const getStatusStyle = (status) => {
  if (status === 'complete') return 'bg-[#003F8F] text-white';
  if (status === 'incomplete') return 'bg-[#FB923C] text-white';
  return 'bg-[#E0ECFF] text-[#003F8F]';
};

const WorkoutPlans = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('Monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
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

    if (period === 'weekly' || period === 'Weekly') {
      // Process weekly view - get last 7 days
      const weeklyDays = calendarDays.slice(-7).map(day => ({
        day: day.day_number || (day.date_display ? parseInt(day.date_display) : 0) || 0,
        dayLabel: day.day_name || (day.date_display ? day.date_display.substring(0, 2) : '') || '',
        status: day.status === 'complete' ? 'complete' :
          day.status === 'incomplete' ? 'incomplete' :
            day.status === 'pending' ? 'pending' : 'pending'
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
          day: day.day_number || (day.date_display ? parseInt(day.date_display) : 0) || 0,
          status: day.status === 'complete' ? 'complete' :
            day.status === 'incomplete' ? 'incomplete' :
              day.status === 'pending' ? 'pending' : 'pending',
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
          setError('No authentication token found. Please log in again.');
          setLoading(false);
          return;
        }

        // Determine period based on view mode
        const period = viewMode === 'Weekly' ? 'weekly' : 'monthly';

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

        // Clean token
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
          throw new Error('Failed to parse server response');
        }

        if (response.ok && result.data) {
          setDashboardData(result.data);

          // Process calendar days from API
          if (result.data.progress_overview?.calendar_days) {
            processCalendarDays(result.data.progress_overview.calendar_days, period);
          }
        } else {
          if (response.status === 401 || response.status === 403) {
            if (result.detail && (result.detail.includes('token') || result.code === 'token_not_valid')) {
              localStorage.removeItem('token');
              localStorage.removeItem('access_token');
              localStorage.removeItem('authToken');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('access');
              setError('Your session has expired. Please log in again.');
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
  }, [user, viewMode]);

  // Get month name from current month
  const getMonthName = () => {
    if (dashboardData?.progress_overview?.current_month) {
      return dashboardData.progress_overview.current_month;
    }
    return currentMonth.toLocaleString('default', { month: 'long' });
  };

  // Get data from API or use defaults
  const todayWorkout = dashboardData?.today_workout || {};
  const userProfile = dashboardData?.user_profile || {};
  const progressOverview = dashboardData?.progress_overview || {};
  const thisMonthSummary = dashboardData?.this_month_summary || {};
  const workoutsHistory = dashboardData?.workouts_history || {};


  // Show error state
  if (error) {
    return (
      <div className="space-y-6 px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 bg-[#F7F7F7]">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 bg-[#F7F7F7]">
      {/* Header */}
      <div className="flex flex-col lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-2xl sm:text-3xl font-medium text-[#003F8F] font-[Poppins]">
            Your Workout Plan
          </p>
          <p className="text-gray-600 font-[Inter]">Drill down into any session for details.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.25 12.25L9.74167 9.74167M11.0833 6.41667C11.0833 8.99399 8.99399 11.0833 6.41667 11.0833C3.83934 11.0833 1.75 8.99399 1.75 6.41667C1.75 3.83934 3.83934 1.75 6.41667 1.75C8.99399 1.75 11.0833 3.83934 11.0833 6.41667Z" stroke="#4D6080" strokeOpacity="0.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <input
            placeholder="Search workout..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] text-sm text-gray-600 font-[Inter]"
          />
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {/* Today's workout */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <p className="text-xl font-medium text-[#003F8F] font-[Poppins]">Today’s Workout</p>
              </div>
              <div className="text-sm font-[Inter] text-gray-600">
                <p className="text-sm font-bold text-[#003F8F] font-[Inter]">Upper Body Power</p>
                You have 5 exercises today • 45 minutes
              </div>
            </div>
            {todayWorkout.is_rest_day ? (
              <div className="text-center py-8">
                <p className="text-lg font-medium text-[#003F8F] font-[Inter] mb-2">Rest Day</p>
                <p className="text-sm text-gray-600 font-[Inter]">Take time to recover and come back stronger tomorrow!</p>
              </div>
            ) : todayWorkout.exercises && todayWorkout.exercises.length > 0 ? (
              <>
                <div className="space-y-4">
                  {todayWorkout.exercises.map((exercise, idx) => (
                    <div key={exercise.id || idx} className="flex items-start gap-4 rounded-xl border border-[#E4E9F2] p-4 bg-white hover transition-shadow">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#003F8F] text-[#003F8F] font-semibold">
                        {exercise.order || idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-[#003F8F] font-semibold font-[Inter]">{exercise.exercise_name}</p>
                        <p className="text-sm text-gray-500 font-[Inter] mt-1">
                          Sets: {exercise.sets} • Reps: {exercise.reps_display || exercise.reps} • Rest Time: {exercise.rest_time_display || `${exercise.rest_time_seconds}s`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/client/log-workout"
                  className="mt-6 sm:w-auto flex items-center justify-center gap-2 border border-[#003F8F] text-[#003F8F] px-5 py-3 rounded-lg font-semibold font-[Inter] hover:bg-[#003F8F] hover:text-white transition-colors"
                  style={{ width: "100%" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.25 2V13.5L12.75 7.75L3.25 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                  Start Workout
                </Link>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600 font-[Inter]">No workout scheduled for today</p>
              </div>
            )}
          </div>

          {/* Workout History */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100">
            <div className="mb-4">
              <p className="text-xl font-medium text-[#003F8F] font-[Poppins]">
                {workoutsHistory.title || 'Workout History'}
              </p>
              <p className="text-sm text-gray-500 font-[Inter]">
                {workoutsHistory.subtitle || 'Your workout history and performance'}
              </p>
            </div>
            {workoutsHistory.workouts && workoutsHistory.workouts.length > 0 ? (
              <div className="space-y-4">
                {workoutsHistory.workouts.slice(0, 4).map((item, idx) => {
                  const isCompleted = item.status === 'completed' || item.status_display === 'Completed';
                  return (
                    <div key={item.id || idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-[#E4E9F2] p-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full border border-[#003F8F] text-[#003F8F] font-semibold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-[#003F8F] font-[Inter]">{item.workout_name}</p>
                          <p className="text-sm text-gray-500 font-[Inter]">{item.date_display || item.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-[Inter]">
                        {/* Duration Block - only show if completed */}
                        {isCompleted && item.duration_display && (
                          <div className="flex flex-col">
                            <span className="text-[#003F8F]">{item.duration_display}</span>
                            <p className="text-gray-600">Duration</p>
                          </div>
                        )}

                        {/* Status */}
                        <span
                          className={`font-medium ${isCompleted ? "text-[#003F8F]" : "text-[#FB923C]"
                            }`}
                        >
                          {item.status_display || item.status}
                        </span>
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
        </div>

        {/* Right column cards */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-[#003F8F] font-[Inter]">Weight</p>
                <p className="text-xl font-bold text-[#003F8F] font-[Poppins]">
                  {userProfile.weight_display || (userProfile.weight_kg ? `${userProfile.weight_kg}kg` : '—')}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#003F8F] font-[Inter]">Height</p>
                <p className="text-2xl font-bold text-[#003F8F] font-[Poppins]">
                  {userProfile.height_display || (userProfile.height_feet ? `${userProfile.height_feet}ft` : '—')}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#003F8F] font-[Inter]">Age</p>
                <p className="text-2xl font-bold text-[#003F8F] font-[Poppins]">
                  {userProfile.age_display || (userProfile.age ? `${userProfile.age}yrs` : '—')}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 md:p-6 border border-gray-100">
            <div className="mb-4">
              <p className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-3">Progress Overview</p>
              <div className="flex items-center border border-gray-200 rounded-lg p-1 text-sm font-[Inter] bg-white w-fit">
                <button
                  onClick={() => setViewMode('Monthly')}
                  className={`px-4 py-1.5 rounded-lg transition-colors ${viewMode === 'Monthly'
                      ? 'bg-[#003F8F] text-white'
                      : 'bg-white text-[#003F8F]'
                    }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setViewMode('Weekly')}
                  className={`px-4 py-1.5 rounded-lg transition-colors ${viewMode === 'Weekly'
                      ? 'bg-[#003F8F] text-white'
                      : 'bg-white text-[#003F8F]'
                    }`}
                >
                  Weekly
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3 text-[#003F8F] font-semibold font-[Inter] text-sm sm:text-base">
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm sm:text-base">
                {getMonthName()}
                {progressOverview.current_year && ` ${progressOverview.current_year}`}
              </span>
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            {viewMode === 'Monthly' ? (
              <>
                <div className="grid grid-cols-7 text-center text-xs text-gray-500 font-semibold font-[Inter] mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2 text-sm font-[Inter]">
                  {calendarDaysState.length > 0 ? (
                    calendarDaysState.map((day, idx) => (
                      <div
                        key={`${day.fullDate || day.day}-${idx}`}
                        className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs sm:text-sm ${getStatusStyle(day.status)} ${day.isToday ? 'ring-2 ring-[#003F8F] ring-offset-1' : ''}`}
                        style={{ minHeight: '36px' }}
                        title={day.fullDate || day.day}
                      >
                        <span className="font-semibold">{day.day}</span>
                      </div>
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
                <div className="grid grid-cols-7 text-center text-xs text-gray-500 font-semibold font-[Inter] mb-2">
                  {weeklyDaysState.length > 0 ? (
                    weeklyDaysState.map((day) => (
                      <span key={`${day.dayLabel}-header`}>{day.dayLabel}</span>
                    ))
                  ) : (
                    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <span key={day}>{day}</span>
                    ))
                  )}
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2 text-sm font-[Inter]">
                  {weeklyDaysState.length > 0 ? (
                    weeklyDaysState.map((day, idx) => (
                      <div
                        key={`${day.dayLabel}-${day.day}-${idx}`}
                        className={`aspect-square flex flex-col items-center justify-center rounded-lg ${getStatusStyle(day.status)}`}
                        style={{ minHeight: '36px' }}
                      >
                        <span className="text-xs font-semibold">{day.dayLabel}</span>
                        <span className="text-xs sm:text-sm font-semibold">{day.day}</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-7 text-center py-4 text-gray-500 text-sm">
                      No weekly data available
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 text-xs text-gray-500 font-[Inter]">
              {progressOverview.legend && progressOverview.legend.length > 0 ? (
                progressOverview.legend.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span
                      className={`w-3 h-3 rounded-full ${item.color === 'blue' ? 'bg-[#003F8F]' :
                          item.color === 'orange' ? 'bg-[#FB923C]' :
                            item.color === 'grey' || item.color === 'gray' ? 'bg-[#E0ECFF]' :
                              'bg-gray-200'
                        }`}
                    ></span>
                    <span>{item.label}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-[#003F8F]"></span>
                    <span>Complete</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-[#FB923C]"></span>
                    <span>Incomplete</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-[#E0ECFF]"></span>
                    <span>Pending</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* This Month / Week */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100">
            <p className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-4">
              {thisMonthSummary.title || (viewMode === 'Monthly' ? 'This Month' : 'This Week')}
            </p>
            <div className="space-y-4 text-sm sm:text-base text-gray-600 font-[Inter]">
              <div className="flex items-center justify-between">
                <span>Workouts Completed</span>
                <span className="text-xl font-medium text-[#003F8F]">
                  {thisMonthSummary.workouts_completed ||
                    (thisMonthSummary.workouts_completed_count !== undefined && thisMonthSummary.workouts_total_count !== undefined
                      ? `${thisMonthSummary.workouts_completed_count}/${thisMonthSummary.workouts_total_count}`
                      : '0/0')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total time</span>
                <span className="text-xl font-medium text-[#003F8F]">
                  {thisMonthSummary.total_time ||
                    (thisMonthSummary.total_time_hours !== undefined
                      ? `${thisMonthSummary.total_time_hours} hrs`
                      : '0 hrs')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Streak</span>
                <span className="text-xl font-medium text-[#003F8F]">
                  {thisMonthSummary.streak ||
                    (thisMonthSummary.streak_days !== undefined
                      ? `${thisMonthSummary.streak_days} days`
                      : '0 days')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlans;

