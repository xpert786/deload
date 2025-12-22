import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    console.error('VITE_API_BASE_URL is not defined in .env file');
}

const WorkOut = ({ clientId }) => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState('Week');
    // Initialize with current date; API will return the correct week range
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [openExerciseIndex, setOpenExerciseIndex] = useState(0); // Track which exercise dropdown is open
    const [selectedDay, setSelectedDay] = useState('Mon'); // Day selector for workout view
    const [activeIndex, setActiveIndex] = useState(null); // For pie chart hover effect

    // API-driven workout calendar state
    const [calendarData, setCalendarData] = useState(null);
    const [calendarError, setCalendarError] = useState('');
    const [calendarLoading, setCalendarLoading] = useState(true);

    // Get auth token (same pattern as other pages)
    const getAuthToken = useCallback(() => {
        let token = null;
        const storedUser = localStorage.getItem('user');

        if (user) {
            token = user.token || user.access_token || user.authToken || user.accessToken;
        }
        if (!token && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                token = userData.token || userData.access_token || userData.authToken || userData.accessToken;
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
        if (!token) {
            token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');
        }
        const isValidToken = token && typeof token === 'string' && token.trim() && token !== 'null' && token !== 'undefined';
        return isValidToken ? token.trim() : null;
    }, [user]);

    const fetchCalendar = useCallback(async () => {
        if (!clientId) return;
        setCalendarLoading(true);
        setCalendarError('');
        try {
            const token = getAuthToken();
            if (!token) {
                setCalendarError('Authentication token not found. Please login again.');
                setCalendarLoading(false);
                return;
            }

            const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
            const url = baseUrl.includes('/api')
                ? `${baseUrl}/clients/${clientId}/workout-calendar/?period=weekly`
                : `${baseUrl}/api/clients/${clientId}/workout-calendar/?period=weekly`;

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };

            const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
            let result;
            try {
                const text = await res.read ? await res.text() : await res.text();
                result = text ? JSON.parse(text) : {};
            } catch (err) {
                console.error('Failed to parse workout calendar response:', err);
                throw new Error('Failed to parse server response');
            }

            if (!res.ok) {
                throw new Error(result.message || 'Failed to fetch workout calendar');
            }

            if (result && result.data) {
                setCalendarData(result.data);
                const week = result.data.weekly_schedule || [];
                const today = week.find(d => d.is_today) || week[0];
                if (today) {
                    setSelectedDay(today.day_abbrev);
                }
            } else {
                setCalendarData(null);
            }
        } catch (err) {
            console.error('Error fetching workout calendar:', err);
            setCalendarError(err.message || 'Failed to load workout calendar');
        } finally {
            setCalendarLoading(false);
        }
    }, [clientId, getAuthToken]);

    useEffect(() => {
        fetchCalendar();
    }, [fetchCalendar]);


    const defaultDayTabs = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayTabs = useMemo(
        () => (calendarData?.weekly_schedule?.map(d => d.day_abbrev) || defaultDayTabs),
        [calendarData]
    );


    const formatDate = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const formatDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateForPopup = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const handleExerciseClick = (date, exercise) => {
        setSelectedDate(date);
        setSelectedExercise(exercise);
        setIsPopupOpen(true);
        setOpenExerciseIndex(0);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setSelectedDate(null);
        setSelectedExercise(null);
    };

    const toggleExerciseDropdown = (index) => {
        setOpenExerciseIndex(index === openExerciseIndex ? -1 : index);
    };

    const getWeekDates = (date) => {
        const week = [];
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day;
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0); // Reset time to avoid timezone issues

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);
            week.push(currentDay);
        }
        return week;
    };

    const getMonthDates = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const dates = [];

        // Add previous month's trailing days
        const prevMonth = new Date(year, month, 0);
        const prevMonthDays = prevMonth.getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            dates.push(new Date(year, month - 1, prevMonthDays - i));
        }

        // Add current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            dates.push(new Date(year, month, i));
        }

        // Add next month's leading days to complete the grid
        const remainingDays = 42 - dates.length; // 6 weeks * 7 days
        for (let i = 1; i <= remainingDays; i++) {
            dates.push(new Date(year, month + 1, i));
        }

        return dates;
    };

    const navigateDate = (direction) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'Week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };


    // Calculate pie chart path
    // Effective workout data from API only - no fallback
    const dayWorkoutData = useMemo(() => {
        if (!calendarData || !calendarData.weekly_schedule) return {};

        const map = {};
        calendarData.weekly_schedule.forEach((day) => {
            const key = day.day_abbrev;
            // Skip rest days - they will be handled separately
            if (day.is_rest_day || day.rest_day) {
                return;
            }
            // Skip if no sessions
            if (!day.sessions || day.sessions.length === 0) {
                return;
            }
            const groups = day.sessions.map((session) => ({
                group: session.session_name || '',
                status: session.status_display,
                exercises: (session.exercises || []).map((ex) => ({
                    label: ex.exercise_label,
                    name: ex.exercise_name,
                    sets: ex.sets,
                    reps: ex.reps,
                    instruction: ex.instructions,
                    videoLink: '',
                    status: ex.status_display,
                    notes: ex.notes || '',
                })),
            }));

            map[key] = {
                workoutName: day.sessions[0]?.workout_plan_title || 'Workout',
                exercises: groups,
            };
        });

        return map;
    }, [calendarData]);

    // Map of rest days from API
    const restDaysMap = useMemo(() => {
        if (!calendarData || !calendarData.weekly_schedule) return {};

        const map = {};
        calendarData.weekly_schedule.forEach((day) => {
            if (day.is_rest_day || day.rest_day) {
                map[day.day_abbrev] = {
                    title: day.rest_day?.title || 'Rest Day',
                    description: day.rest_day?.description || 'Rest & Recovery',
                    details: day.rest_day?.details || 'Active recovery or complete rest day',
                };
            }
        });
        return map;
    }, [calendarData]);

    // Check if selected day is a rest day
    const isSelectedDayRestDay = useMemo(() => {
        return restDaysMap[selectedDay] !== undefined;
    }, [restDaysMap, selectedDay]);

    // Get selected day's date from weekly_schedule
    const selectedDayDate = useMemo(() => {
        if (!calendarData || !calendarData.weekly_schedule) return null;
        const dayData = calendarData.weekly_schedule.find(d => d.day_abbrev === selectedDay);
        return dayData?.date || null;
    }, [calendarData, selectedDay]);

    // Extract exercise notes from weekly_schedule - filtered by selected day
    const exerciseNotes = useMemo(() => {
        if (!calendarData || !calendarData.weekly_schedule || !selectedDayDate) return [];

        const notes = [];
        // Find the selected day in weekly_schedule
        const selectedDayData = calendarData.weekly_schedule.find(d => d.day_abbrev === selectedDay);

        if (selectedDayData && selectedDayData.sessions && selectedDayData.sessions.length > 0) {
            selectedDayData.sessions.forEach((session) => {
                if (session.exercises && session.exercises.length > 0) {
                    session.exercises.forEach((ex) => {
                        if (ex.notes && ex.notes.trim() !== '') {
                            notes.push({
                                id: `exercise-${ex.id}`,
                                note: ex.notes,
                                exercise_name: ex.exercise_name,
                                exercise_label: ex.exercise_label,
                                date: selectedDayData.date,
                                created_at: ex.updated_at || ex.created_at || selectedDayData.date,
                                type: 'exercise'
                            });
                        }
                    });
                }
            });
        }
        return notes;
    }, [calendarData, selectedDay, selectedDayDate]);

    // DO NOT use regular notes from calendarData.notes.data - those are for Overview tab only
    // Workout Calendar should only show exercise-specific notes
    const filteredRegularNotes = useMemo(() => {
        // Return empty array - do not show regular notes in Workout Calendar
        // Regular notes come from /client/notes/ API and should only show in Overview tab
        return [];
    }, []);

    // Only show exercise notes in Workout Calendar - no regular notes
    const allNotes = useMemo(() => {
        // Only use exercise notes, not regular notes
        // Regular notes from /client/notes/ API should only appear in Overview tab
        return exerciseNotes.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });
    }, [exerciseNotes]);

    const progressPhotos = useMemo(() => {
        if (!calendarData || !calendarData.progress_photos || !calendarData.progress_photos.data) {
            return [];
        }
        return calendarData.progress_photos.data.map((p) => ({
            image: p.photo_url,
            date: new Date(p.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }),
        }));
    }, [calendarData]);

    const { completed, missed, total, completedPercent, missedPercent } = useMemo(() => {
        if (!calendarData || !calendarData.completion_rate) {
            return {
                completed: 0,
                missed: 0,
                total: 0,
                completedPercent: 0,
                missedPercent: 0,
            };
        }
        const stats = calendarData.completion_rate;
        const totalVal = stats.total || (stats.completed || 0) + (stats.not_completed || 0);
        const comp = stats.completed || 0;
        const miss = stats.not_completed || 0;
        return {
            completed: comp,
            missed: miss,
            total: totalVal,
            completedPercent: totalVal ? (comp / totalVal) * 100 : 0,
            missedPercent: totalVal ? (miss / totalVal) * 100 : 0,
        };
    }, [calendarData]);

    // Pie chart data for Recharts
    const pieChartData = useMemo(() => {
        // Ensure we always have data, even if values are 0
        const data = [
            { name: 'Completed', value: completed || 0, color: '#003F8F' },
            { name: 'Missed', value: missed || 0, color: '#FB923C' }
        ];
        // If total is 0, show a placeholder (100% empty)
        if (total === 0) {
            return [
                { name: 'No Data', value: 1, color: '#E5E7EB' }
            ];
        }
        return data;
    }, [completed, missed, total]);

    // Custom tooltip for pie chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                    <p className="text-sm font-semibold" style={{ color: payload[0].payload.color }}>
                        {payload[0].name}
                    </p>
                    <p className="text-sm text-gray-600">
                        Value: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 p-2 sm:p-2 bg-[#F7F7F7] text-[#003F8F]">
            {/* Interactive Workout Calendar Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-[#003F8F] font-[Poppins]">
                    Interactive Workout Calendar
                </h2>

                {calendarData && (
                    <div className="flex flex-col items-end text-right space-y-1">
                        <span className="text-xs uppercase tracking-wide text-gray-500 font-[Inter]">
                            {calendarData.period === 'weekly' ? 'Week' : 'Period'}
                        </span>
                        <span className="text-sm font-semibold text-[#003F8F] font-[Poppins]">
                            {calendarData.week_display}
                        </span>
                        <span className="text-xs text-gray-500">
                            Total Hours: {calendarData.progress?.total_hours ?? 0}
                        </span>
                    </div>
                )}
            </div>

            {/* Error & loading states */}
            {calendarError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {calendarError}
                </div>
            )}

            {/* Day-by-Day Workout View */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-300" style={{ borderRadius: '12px' }}>
                {/* Day Tabs - Full Width */}
                <div className="flex items-center w-full border-b border-gray-200">
                    {dayTabs.map((day, index) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`flex-1 px-4 py-3 font-semibold text-sm transition relative ${index > 0 ? 'border-l border-gray-200' : ''
                                } ${selectedDay === day
                                    ? 'bg-[#003F8F] text-white'
                                    : 'bg-white text-[#003F8F] hover:bg-gray-50'
                                }`}
                            style={{
                                borderRadius: selectedDay === day && index === 0 ? '0.75rem 0 0 0' :
                                    selectedDay === day && index === dayTabs.length - 1 ? '0 0.75rem 0 0' :
                                        '0'
                            }}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                {/* Workout Content */}
                <div className="p-6 space-y-6">

                    {/* Rest Day Screen - Show for any day that is a rest day */}
                    {isSelectedDayRestDay && !calendarLoading && (
                        <div className="space-y-6">
                            {/* Rest Day Heading - Top Left */}
                            <h3 className="text-2xl font-bold text-[#003F8F] font-[Poppins] text-left">
                                {restDaysMap[selectedDay]?.title || 'Rest Day'}
                            </h3>

                            {/* Bordered Box with Centered Content */}
                            <div className="bg-white border border-gray-300 rounded-xl p-6">
                                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                                    {/* Bed Icon */}
                                    <div className="flex items-center justify-center">
                                        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.119 40.0795V17.5795C7.119 17.2092 7.04605 16.8424 6.90432 16.5003C6.76259 16.1581 6.55485 15.8472 6.29297 15.5853C6.03108 15.3234 5.72018 15.1157 5.37802 14.974C5.03585 14.8322 4.66912 14.7593 4.29876 14.7593C3.9284 14.7593 3.56166 14.8322 3.2195 14.974C2.87733 15.1157 2.56643 15.3234 2.30455 15.5853C2.04266 15.8472 1.83492 16.1581 1.69319 16.5003C1.55146 16.8424 1.47852 17.2092 1.47852 17.5795V54.4205C1.47852 54.7908 1.55146 55.1576 1.69319 55.4997C1.83492 55.8419 2.04266 56.1528 2.30455 56.4147C2.56643 56.6766 2.87733 56.8843 3.2195 57.026C3.56166 57.1678 3.9284 57.2407 4.29876 57.2407C4.66912 57.2407 5.03585 57.1678 5.37802 57.026C5.72018 56.8843 6.03108 56.6766 6.29297 56.4147C6.55485 56.1528 6.76259 55.8419 6.90432 55.4997C7.04605 55.1576 7.119 54.7908 7.119 54.4205V49.1357L64.8817 49.0017V54.2837C64.8817 54.6539 64.9547 55.0206 65.0964 55.3627C65.238 55.7047 65.4457 56.0156 65.7076 56.2774C65.9694 56.5392 66.2802 56.7469 66.6223 56.8886C66.9643 57.0303 67.331 57.1032 67.7012 57.1032C68.0715 57.1032 68.4381 57.0303 68.7802 56.8886C69.1223 56.7469 69.4331 56.5392 69.6949 56.2774C69.9568 56.0156 70.1645 55.7047 70.3061 55.3627C70.4478 55.0206 70.5208 54.6539 70.5208 54.2837V39.9456L7.119 40.0795Z" fill="#4D6080" fillOpacity="0.3" />
                                            <path d="M70.5212 37.6646H27.6523V27.0431C27.6523 25.5635 28.24 24.1444 29.2862 23.098C30.3323 22.0516 31.7512 21.4635 33.2309 21.4631H59.256C62.2437 21.4631 65.1091 22.65 67.2217 24.7626C69.3343 26.8752 70.5212 29.7406 70.5212 32.7283V37.6646Z" fill="#4D6080" fillOpacity="0.3" />
                                            <path d="M17.6171 36.4493C21.4193 36.4493 24.5017 33.367 24.5017 29.5647C24.5017 25.7624 21.4193 22.6801 17.6171 22.6801C13.8148 22.6801 10.7324 25.7624 10.7324 29.5647C10.7324 33.367 13.8148 36.4493 17.6171 36.4493Z" fill="#4D6080" fillOpacity="0.3" />
                                        </svg>
                                    </div>

                                    {/* Rest & Recovery Text */}
                                    <div className="flex flex-col items-center space-y-1">
                                        <h4 className="text-xl font-bold text-[#003F8F] font-[Poppins]">
                                            {restDaysMap[selectedDay]?.description || 'Rest & Recovery'}
                                        </h4>

                                        {/* Description Text */}
                                        <p className="text-sm text-[#003F8F] font-regular text-center">
                                            {restDaysMap[selectedDay]?.details || 'Active recovery or complete rest day'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Workout Content for Selected Day - Only show if API data exists */}
                    {!isSelectedDayRestDay && dayWorkoutData[selectedDay] && !calendarLoading && Object.keys(dayWorkoutData).length > 0 && (
                        <>
                            {/* Workout Name */}
                            <h3 className="text-2xl font-bold text-[#003F8F] font-[Poppins]">
                                {dayWorkoutData[selectedDay].workoutName}
                            </h3>

                            {/* Workout Cards */}
                            <div className="space-y-4">
                                {dayWorkoutData[selectedDay].exercises.map((group, groupIndex) => {
                                    // Check if exercises have individual statuses
                                    const hasIndividualStatuses = group.exercises.some(ex => ex.status);
                                    const isGrouped = group.exercises.length > 1;

                                    // If exercises have individual statuses, render each as separate card
                                    // Otherwise, if grouped, render as one card with group status
                                    if (hasIndividualStatuses) {
                                        // Render each exercise as separate card with its own status colors
                                        return group.exercises.map((exercise, exIndex) => (
                                            <div
                                                key={`${groupIndex}-${exIndex}`}
                                                className={`rounded-xl p-6 border relative ${exercise.status === 'Completed' ? 'bg-[#25CD251A]' : exercise.status === 'Skipped' ? 'bg-[#E53E3E1A]' : 'bg-white'
                                                    }`}
                                                style={{
                                                    borderRadius: '12px',
                                                    borderColor: exercise.status === 'Completed' ? '#25CD25' : exercise.status === 'Skipped' ? '#E53E3E' : '#d1d5db',
                                                    borderWidth: '1px'
                                                }}
                                            >
                                                {/* Status Badge - Top Right Corner */}
                                                {exercise.status && (
                                                    <div className="absolute top-6 right-6 flex flex-col items-center gap-1">
                                                        {exercise.status === 'Completed' ? (
                                                            <>
                                                                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <g clipPath={`url(#clip0_1300_205_ex_${groupIndex}_${exIndex})`}>
                                                                        <path d="M18 0C8.05894 0 0 8.05894 0 18C0 27.9416 8.05894 36 18 36C27.9416 36 36 27.9416 36 18C36 8.05894 27.9416 0 18 0ZM18 33.7854C9.31556 33.7854 2.25 26.6844 2.25 17.9999C2.25 9.31549 9.31556 2.24993 18 2.24993C26.6844 2.24993 33.75 9.31553 33.75 17.9999C33.75 26.6843 26.6844 33.7854 18 33.7854ZM25.1837 11.4137L14.6227 22.041L9.86678 17.2851C9.42746 16.8458 8.71534 16.8458 8.27547 17.2851C7.83615 17.7244 7.83615 18.4365 8.27547 18.8758L13.8437 24.4446C14.283 24.8833 14.9951 24.8833 15.435 24.4446C15.4856 24.3939 15.5289 24.3388 15.5683 24.2814L26.7756 13.005C27.2143 12.5657 27.2143 11.8535 26.7756 11.4137C26.3357 10.9744 25.6236 10.9744 25.1837 11.4137Z" fill="#25CD25" />
                                                                    </g>
                                                                    <defs>
                                                                        <clipPath id={`clip0_1300_205_ex_${groupIndex}_${exIndex}`}>
                                                                            <rect width="36" height="36" fill="white" />
                                                                        </clipPath>
                                                                    </defs>
                                                                </svg>
                                                                <span className="text-xs font-semibold" style={{ color: '#25CD25' }}>{exercise.status}</span>
                                                            </>
                                                        ) : exercise.status === 'Skipped' ? (
                                                            <>
                                                                <div className="w-9 h-9 flex items-center justify-center">
                                                                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M25.9197 11.67C26.1185 11.4568 26.2266 11.1747 26.2215 10.8832C26.2164 10.5918 26.0983 10.3137 25.8922 10.1076C25.6861 9.90146 25.408 9.78339 25.1165 9.77825C24.8251 9.77311 24.543 9.88129 24.3297 10.08L10.0797 24.33C9.96921 24.433 9.88056 24.5572 9.81907 24.6952C9.75758 24.8332 9.72452 24.9822 9.72185 25.1332C9.71919 25.2843 9.74698 25.4343 9.80356 25.5744C9.86014 25.7145 9.94436 25.8417 10.0512 25.9486C10.158 26.0554 10.2853 26.1396 10.4253 26.1962C10.5654 26.2528 10.7155 26.2806 10.8665 26.2779C11.0176 26.2752 11.1666 26.2422 11.3045 26.1807C11.4425 26.1192 11.5667 26.0305 11.6697 25.92L25.9197 11.67Z" fill="#E53E3E" />
                                                                        <path d="M18 1.5C27.1125 1.5 34.5 8.8875 34.5 18C34.5 27.1125 27.1125 34.5 18 34.5C8.8875 34.5 1.5 27.1125 1.5 18C1.5 8.8875 8.8875 1.5 18 1.5ZM3.75 18C3.75 21.7793 5.25133 25.4039 7.92373 28.0763C10.5961 30.7487 14.2207 32.25 18 32.25C21.7793 32.25 25.4039 30.7487 28.0763 28.0763C30.7487 25.4039 32.25 21.7793 32.25 18C32.25 14.2207 30.7487 10.5961 28.0763 7.92373C25.4039 5.25133 21.7793 3.75 18 3.75C14.2207 3.75 10.5961 5.25133 7.92373 7.92373C5.25133 10.5961 3.75 14.2207 3.75 18Z" fill="#E53E3E" />
                                                                    </svg>
                                                                </div>
                                                                <span className="text-xs font-semibold" style={{ color: '#E53E3E' }}>{exercise.status}</span>
                                                            </>
                                                        ) : null}
                                                    </div>
                                                )}

                                                {/* Exercise Content */}
                                                <div className="pr-20">
                                                    <h4 className="text-lg font-bold text-[#003F8F] font-[Poppins] mb-2">
                                                        {exercise.label}. {exercise.name}
                                                    </h4>
                                                    <div className="text-sm text-[#003F8F] font-medium mb-2">
                                                        {exercise.sets} x {exercise.reps}
                                                    </div>
                                                    <p className="text-sm text-[#003F8F] font-[Inter] mb-2">
                                                        {exercise.instruction}
                                                    </p>
                                                    {exercise.videoLink && (
                                                        <a href="#" className="inline-flex items-center gap-1.5 bg-blue-100 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-blue-200 transition" style={{ color: '#003F8F' }}>
                                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M7.5 5L9.7765 3.862C9.85271 3.82392 9.93739 3.80594 10.0225 3.80977C10.1076 3.81361 10.1903 3.83912 10.2628 3.8839C10.3353 3.92868 10.3951 3.99124 10.4366 4.06564C10.4781 4.14003 10.5 4.2238 10.5 4.309V7.691C10.5 7.7762 10.4781 7.85997 10.4366 7.93436C10.3951 8.00876 10.3353 8.07132 10.2628 8.1161C10.1903 8.16088 10.1076 8.18639 10.0225 8.19023C9.93739 8.19406 9.85271 8.17608 9.7765 8.138L7.5 7V5ZM1.5 4C1.5 3.73478 1.60536 3.48043 1.79289 3.29289C1.98043 3.10536 2.23478 3 2.5 3H6.5C6.76522 3 7.01957 3.10536 7.20711 3.29289C7.39464 3.48043 7.5 3.73478 7.5 4V8C7.5 8.26522 7.39464 8.51957 7.20711 8.70711C7.01957 8.89464 6.76522 9 6.5 9H2.5C2.23478 9 1.98043 8.89464 1.79289 8.70711C1.60536 8.51957 1.5 8.26522 1.5 8V4Z" stroke="#003F8F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <span>{exercise.videoLink}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ));
                                    } else if (isGrouped) {
                                        // Render as one card for superset when no individual statuses
                                        const cardStatus = group.status;
                                        return (
                                            <div
                                                key={groupIndex}
                                                className={`rounded-xl p-6 border relative ${cardStatus === 'Completed' ? 'bg-[#25CD251A]' : cardStatus === 'Skipped' ? 'bg-[#E53E3E1A]' : 'bg-white'
                                                    }`}
                                                style={{
                                                    borderRadius: '12px',
                                                    borderColor: cardStatus === 'Completed' ? '#25CD25' : cardStatus === 'Skipped' ? '#E53E3E' : '#d1d5db',
                                                    borderWidth: '1px'
                                                }}
                                            >
                                                {/* Blue vertical line for superset (only for A group) - inside card, after border */}
                                                {group.group === 'A' && (
                                                    <div
                                                        className="absolute bg-[#003F8F]"
                                                        style={{
                                                            left: '20px', // After border (1px border)
                                                            top: '12px',
                                                            bottom: '12px',
                                                            width: '4px',
                                                            borderRadius: '2px'
                                                        }}
                                                    ></div>
                                                )}

                                                {/* Group Status Badge - Top Right Corner */}
                                                {group.status && (
                                                    <div className="absolute top-6 right-6 flex flex-col items-center gap-1">
                                                        {group.status === 'Completed' ? (
                                                            <>
                                                                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <g clipPath={`url(#clip0_1300_205_group_${groupIndex})`}>
                                                                        <path d="M18 0C8.05894 0 0 8.05894 0 18C0 27.9416 8.05894 36 18 36C27.9416 36 36 27.9416 36 18C36 8.05894 27.9416 0 18 0ZM18 33.7854C9.31556 33.7854 2.25 26.6844 2.25 17.9999C2.25 9.31549 9.31556 2.24993 18 2.24993C26.6844 2.24993 33.75 9.31553 33.75 17.9999C33.75 26.6843 26.6844 33.7854 18 33.7854ZM25.1837 11.4137L14.6227 22.041L9.86678 17.2851C9.42746 16.8458 8.71534 16.8458 8.27547 17.2851C7.83615 17.7244 7.83615 18.4365 8.27547 18.8758L13.8437 24.4446C14.283 24.8833 14.9951 24.8833 15.435 24.4446C15.4856 24.3939 15.5289 24.3388 15.5683 24.2814L26.7756 13.005C27.2143 12.5657 27.2143 11.8535 26.7756 11.4137C26.3357 10.9744 25.6236 10.9744 25.1837 11.4137Z" fill="#25CD25" />
                                                                    </g>
                                                                    <defs>
                                                                        <clipPath id={`clip0_1300_205_group_${groupIndex}`}>
                                                                            <rect width="36" height="36" fill="white" />
                                                                        </clipPath>
                                                                    </defs>
                                                                </svg>
                                                                <span className="text-xs font-semibold" style={{ color: '#25CD25' }}>{group.status}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-9 h-9 flex items-center justify-center">
                                                                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M25.9197 11.67C26.1185 11.4568 26.2266 11.1747 26.2215 10.8832C26.2164 10.5918 26.0983 10.3137 25.8922 10.1076C25.6861 9.90146 25.408 9.78339 25.1165 9.77825C24.8251 9.77311 24.543 9.88129 24.3297 10.08L10.0797 24.33C9.96921 24.433 9.88056 24.5572 9.81907 24.6952C9.75758 24.8332 9.72452 24.9822 9.72185 25.1332C9.71919 25.2843 9.74698 25.4343 9.80356 25.5744C9.86014 25.7145 9.94436 25.8417 10.0512 25.9486C10.158 26.0554 10.2853 26.1396 10.4253 26.1962C10.5654 26.2528 10.7155 26.2806 10.8665 26.2779C11.0176 26.2752 11.1666 26.2422 11.3045 26.1807C11.4425 26.1192 11.5667 26.0305 11.6697 25.92L25.9197 11.67Z" fill="#E53E3E" />
                                                                        <path d="M18 1.5C27.1125 1.5 34.5 8.8875 34.5 18C34.5 27.1125 27.1125 34.5 18 34.5C8.8875 34.5 1.5 27.1125 1.5 18C1.5 8.8875 8.8875 1.5 18 1.5ZM3.75 18C3.75 21.7793 5.25133 25.4039 7.92373 28.0763C10.5961 30.7487 14.2207 32.25 18 32.25C21.7793 32.25 25.4039 30.7487 28.0763 28.0763C30.7487 25.4039 32.25 21.7793 32.25 18C32.25 14.2207 30.7487 10.5961 28.0763 7.92373C25.4039 5.25133 21.7793 3.75 18 3.75C14.2207 3.75 10.5961 5.25133 7.92373 7.92373C5.25133 10.5961 3.75 14.2207 3.75 18Z" fill="#E53E3E" />
                                                                    </svg>
                                                                </div>
                                                                <span className="text-xs font-semibold" style={{ color: '#E53E3E' }}>{group.status}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Exercises */}
                                                <div className={`space-y-4 pr-20 ${group.group === 'A' ? 'pl-4' : ''}`}>
                                                    {group.exercises.map((exercise, exIndex) => (
                                                        <div key={exIndex} className={`relative ${exIndex < group.exercises.length - 1 ? 'border-b border-gray-300 pb-4' : ''}`}>
                                                            <div className="pr-16">
                                                                <h4 className="text-lg font-bold text-[#003F8F] font-[Poppins] mb-2">
                                                                    {exercise.label}. {exercise.name}
                                                                </h4>
                                                                <div className="text-sm text-[#003F8F] font-medium mb-2">
                                                                    {exercise.sets} x {exercise.reps}
                                                                </div>
                                                                <p className="text-sm text-[#003F8F] font-[Inter] mb-2">
                                                                    {exercise.instruction}
                                                                </p>
                                                                {exercise.videoLink && (
                                                                    <a href="#" className="inline-flex items-center gap-1.5 bg-blue-100 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-blue-200 transition" style={{ color: '#003F8F' }}>
                                                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M7.5 5L9.7765 3.862C9.85271 3.82392 9.93739 3.80594 10.0225 3.80977C10.1076 3.81361 10.1903 3.83912 10.2628 3.8839C10.3353 3.92868 10.3951 3.99124 10.4366 4.06564C10.4781 4.14003 10.5 4.2238 10.5 4.309V7.691C10.5 7.7762 10.4781 7.85997 10.4366 7.93436C10.3951 8.00876 10.3353 8.07132 10.2628 8.1161C10.1903 8.16088 10.1076 8.18639 10.0225 8.19023C9.93739 8.19406 9.85271 8.17608 9.7765 8.138L7.5 7V5ZM1.5 4C1.5 3.73478 1.60536 3.48043 1.79289 3.29289C1.98043 3.10536 2.23478 3 2.5 3H6.5C6.76522 3 7.01957 3.10536 7.20711 3.29289C7.39464 3.48043 7.5 3.73478 7.5 4V8C7.5 8.26522 7.39464 8.51957 7.20711 8.70711C7.01957 8.89464 6.76522 9 6.5 9H2.5C2.23478 9 1.98043 8.89464 1.79289 8.70711C1.60536 8.51957 1.5 8.26522 1.5 8V4Z" stroke="#003F8F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                                        </svg>
                                                                        <span>{exercise.videoLink}</span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        // Render each exercise as separate card
                                        return group.exercises.map((exercise, exIndex) => (
                                            <div
                                                key={`${groupIndex}-${exIndex}`}
                                                className={`rounded-xl p-6 border relative ${exercise.status === 'Completed' ? 'bg-[#25CD251A]' : exercise.status === 'Skipped' ? 'bg-[#E53E3E1A]' : 'bg-white'
                                                    }`}
                                                style={{
                                                    borderRadius: '12px',
                                                    borderColor: exercise.status === 'Completed' ? '#25CD25' : exercise.status === 'Skipped' ? '#E53E3E' : '#d1d5db',
                                                    borderWidth: '1px'
                                                }}
                                            >
                                                {/* Status Badge - Only show if exercise has status - Top Right Corner */}
                                                {exercise.status && (
                                                    <div className="absolute top-6 right-6 flex flex-col items-center gap-1">
                                                        {exercise.status === 'Completed' ? (
                                                            <>
                                                                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <g clipPath="url(#clip0_1300_205_ex)">
                                                                        <path d="M18 0C8.05894 0 0 8.05894 0 18C0 27.9416 8.05894 36 18 36C27.9416 36 36 27.9416 36 18C36 8.05894 27.9416 0 18 0ZM18 33.7854C9.31556 33.7854 2.25 26.6844 2.25 17.9999C2.25 9.31549 9.31556 2.24993 18 2.24993C26.6844 2.24993 33.75 9.31553 33.75 17.9999C33.75 26.6843 26.6844 33.7854 18 33.7854ZM25.1837 11.4137L14.6227 22.041L9.86678 17.2851C9.42746 16.8458 8.71534 16.8458 8.27547 17.2851C7.83615 17.7244 7.83615 18.4365 8.27547 18.8758L13.8437 24.4446C14.283 24.8833 14.9951 24.8833 15.435 24.4446C15.4856 24.3939 15.5289 24.3388 15.5683 24.2814L26.7756 13.005C27.2143 12.5657 27.2143 11.8535 26.7756 11.4137C26.3357 10.9744 25.6236 10.9744 25.1837 11.4137Z" fill="#25CD25" />
                                                                    </g>
                                                                    <defs>
                                                                        <clipPath id="clip0_1300_205_ex">
                                                                            <rect width="36" height="36" fill="white" />
                                                                        </clipPath>
                                                                    </defs>
                                                                </svg>
                                                                <span className="text-xs font-semibold" style={{ color: '#25CD25' }}>{exercise.status}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-9 h-9  flex items-center justify-center">
                                                                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M25.9197 11.67C26.1185 11.4568 26.2266 11.1747 26.2215 10.8832C26.2164 10.5918 26.0983 10.3137 25.8922 10.1076C25.6861 9.90146 25.408 9.78339 25.1165 9.77825C24.8251 9.77311 24.543 9.88129 24.3297 10.08L10.0797 24.33C9.96921 24.433 9.88056 24.5572 9.81907 24.6952C9.75758 24.8332 9.72452 24.9822 9.72185 25.1332C9.71919 25.2843 9.74698 25.4343 9.80356 25.5744C9.86014 25.7145 9.94436 25.8417 10.0512 25.9486C10.158 26.0554 10.2853 26.1396 10.4253 26.1962C10.5654 26.2528 10.7155 26.2806 10.8665 26.2779C11.0176 26.2752 11.1666 26.2422 11.3045 26.1807C11.4425 26.1192 11.5667 26.0305 11.6697 25.92L25.9197 11.67Z" fill="#E53E3E" />
                                                                        <path d="M18 1.5C27.1125 1.5 34.5 8.8875 34.5 18C34.5 27.1125 27.1125 34.5 18 34.5C8.8875 34.5 1.5 27.1125 1.5 18C1.5 8.8875 8.8875 1.5 18 1.5ZM3.75 18C3.75 21.7793 5.25133 25.4039 7.92373 28.0763C10.5961 30.7487 14.2207 32.25 18 32.25C21.7793 32.25 25.4039 30.7487 28.0763 28.0763C30.7487 25.4039 32.25 21.7793 32.25 18C32.25 14.2207 30.7487 10.5961 28.0763 7.92373C25.4039 5.25133 21.7793 3.75 18 3.75C14.2207 3.75 10.5961 5.25133 7.92373 7.92373C5.25133 10.5961 3.75 14.2207 3.75 18Z" fill="#E53E3E" />
                                                                    </svg>

                                                                </div>
                                                                <span className="text-xs font-semibold" style={{ color: '#E53E3E' }}>{exercise.status}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Exercise Content */}
                                                <div className="pr-20">
                                                    <h4 className="text-lg font-bold text-[#003F8F] font-[Poppins] mb-2">
                                                        {exercise.label}. {exercise.name}
                                                    </h4>
                                                    <div className="text-sm text-[#003F8F] font-medium mb-2">
                                                        {exercise.sets} x {exercise.reps}
                                                    </div>
                                                    <p className="text-sm text-[#003F8F] font-[Inter] mb-2">
                                                        {exercise.instruction}
                                                    </p>
                                                    {exercise.videoLink && (
                                                        <a href="#" className="inline-flex items-center gap-1.5 bg-blue-100 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-blue-200 transition" style={{ color: '#003F8F' }}>
                                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M7.5 5L9.7765 3.862C9.85271 3.82392 9.93739 3.80594 10.0225 3.80977C10.1076 3.81361 10.1903 3.83912 10.2628 3.8839C10.3353 3.92868 10.3951 3.99124 10.4366 4.06564C10.4781 4.14003 10.5 4.2238 10.5 4.309V7.691C10.5 7.7762 10.4781 7.85997 10.4366 7.93436C10.3951 8.00876 10.3353 8.07132 10.2628 8.1161C10.1903 8.16088 10.1076 8.18639 10.0225 8.19023C9.93739 8.19406 9.85271 8.17608 9.7765 8.138L7.5 7V5ZM1.5 4C1.5 3.73478 1.60536 3.48043 1.79289 3.29289C1.98043 3.10536 2.23478 3 2.5 3H6.5C6.76522 3 7.01957 3.10536 7.20711 3.29289C7.39464 3.48043 7.5 3.73478 7.5 4V8C7.5 8.26522 7.39464 8.51957 7.20711 8.70711C7.01957 8.89464 6.76522 9 6.5 9H2.5C2.23478 9 1.98043 8.89464 1.79289 8.70711C1.60536 8.51957 1.5 8.26522 1.5 8V4Z" stroke="#003F8F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <span>{exercise.videoLink}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ));
                                    }
                                })}
                            </div>
                        </>
                    )}

                </div>
            </div>

            {/* Notes and Progress Photos Section - Separate from workout cards */}
            <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
                {/* Notes Section */}
                <div className="bg-white rounded-xl p-6 space-y-4">
                    <h3 className="text-2xl font-bold text-[#003F8F] font-[Poppins]">Notes</h3>

                    {/* Notes List from API - includes both regular notes and exercise notes */}
                    {calendarLoading ? (
                        <div className="text-center py-8 text-gray-500">
                            Loading notes...
                        </div>
                    ) : allNotes.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {allNotes.map((n, idx) => (
                                <div key={n.id || idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="text-xs text-gray-500">
                                            {n.created_at
                                                ? new Date(n.created_at).toLocaleString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : 'No date'}
                                        </div>
                                        {n.type === 'exercise' && n.exercise_name && (
                                            <span className="text-xs text-[#003F8F] font-semibold bg-blue-100 px-2 py-1 rounded">
                                                {n.exercise_label || ''} {n.exercise_name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-800 font-[Inter]">
                                        {n.note || n.text || ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            No notes available
                        </div>
                    )}
                </div>

                {/* Progress Photos Section */}
                <div className="bg-white rounded-xl p-6 space-y-4">
                    <h3 className="text-2xl font-bold text-[#003F8F] font-[Poppins]">Progress photos</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {progressPhotos.map((photo, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                        src={photo.image}
                                        alt={`Progress ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML =
                                                '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>';
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-gray-600 font-[Inter] text-center font-medium">
                                    {photo.date}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Completion Rate Section */}
            <div className="bg-white rounded-xl p-6 space-y-4 shadow-sm">
                <h3 className="text-2xl font-bold text-[#003F8F] font-[Poppins]">Completion Rate</h3>
                <div className="grid grid-cols-3 items-center gap-12">
                    {/* Left Spacer */}
                    <div></div>

                    {/* Pie Chart with Labels - Centered using Recharts */}
                    <div className="relative flex-shrink-0 mx-auto" style={{ width: '256px', height: '256px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart width={256} height={256}>
                                <Tooltip content={<CustomTooltip />} />
                                <Pie
                                    data={pieChartData}
                                    cx={128}
                                    cy={128}
                                    labelLine={true}
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, value, payload }) => {
                                        if (!value || value === 0) return null;
                                        const RADIAN = Math.PI / 180;
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                        // Calculate label position outside the pie
                                        const labelRadius = outerRadius + 30;
                                        const labelX = cx + labelRadius * Math.cos(-midAngle * RADIAN);
                                        const labelY = cy + labelRadius * Math.sin(-midAngle * RADIAN);

                                        const color = payload?.color || '#003F8F';

                                        return (
                                            <g>
                                                <line
                                                    x1={x}
                                                    y1={y}
                                                    x2={labelX}
                                                    y2={labelY}
                                                    stroke={color}
                                                    strokeWidth={2}
                                                />
                                                <text
                                                    x={labelX}
                                                    y={labelY}
                                                    fill={color}
                                                    textAnchor={x > cx ? 'start' : 'end'}
                                                    dominantBaseline="central"
                                                    fontSize={18}
                                                    fontWeight="bold"
                                                >
                                                    {value}
                                                </text>
                                            </g>
                                        );
                                    }}
                                    outerRadius={100}
                                    innerRadius={0}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                    paddingAngle={0}
                                    activeIndex={activeIndex}
                                    activeShape={(props) => {
                                        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                                        return (
                                            <g>
                                                <Sector
                                                    cx={cx}
                                                    cy={cy}
                                                    innerRadius={innerRadius}
                                                    outerRadius={outerRadius + 10}
                                                    startAngle={startAngle}
                                                    endAngle={endAngle}
                                                    fill={fill}
                                                    style={{ transition: 'all 0.3s ease' }}
                                                />
                                            </g>
                                        );
                                    }}
                                    onMouseEnter={(_, index) => setActiveIndex(index)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                    animationDuration={300}
                                    animationBegin={0}
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            stroke={entry.color}
                                            strokeWidth={activeIndex === index ? 3 : 1}
                                            style={{
                                                filter: activeIndex === index ? 'brightness(1.15) drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                                                transition: 'all 0.3s ease',
                                                cursor: 'pointer',
                                                opacity: activeIndex !== null && activeIndex !== index ? 0.7 : 1
                                            }}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="space-y-2 flex-1 max-w-[200px]">
                        <div>
                            <span className="text-sm font-semibold text-[#003F8F] font-[Inter]">Completed: {completed}</span>
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-[#FB923C] font-[Inter]">Missed: {missed}</span>
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-[#003F8F] font-[Inter]">Total workouts: {total}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Workout Popup Modal */}
            {/* Workout Popup Modal */}
            {isPopupOpen && selectedDate && (
                <div
                    className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={handleClosePopup}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Popup Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-semibold text-[#003F8F] font-[Poppins]">
                                Workout : {formatDateForPopup(selectedDate)}
                            </h2>
                            <button
                                onClick={handleClosePopup}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition cursor-pointer"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="24" height="24" rx="12" fill="#4D6080" fill-opacity="0.8" />
                                    <path d="M16.066 8.99502C16.1377 8.92587 16.1948 8.84314 16.2342 8.75165C16.2735 8.66017 16.2943 8.56176 16.2952 8.46218C16.2961 8.3626 16.2772 8.26383 16.2395 8.17164C16.2018 8.07945 16.1462 7.99568 16.0758 7.92523C16.0054 7.85478 15.9217 7.79905 15.8295 7.7613C15.7374 7.72354 15.6386 7.70452 15.5391 7.70534C15.4395 7.70616 15.341 7.7268 15.2495 7.76606C15.158 7.80532 15.0752 7.86242 15.006 7.93402L12 10.939L8.995 7.93402C8.92634 7.86033 8.84354 7.80123 8.75154 7.76024C8.65954 7.71925 8.56022 7.69721 8.45952 7.69543C8.35882 7.69365 8.25879 7.71218 8.1654 7.7499C8.07201 7.78762 7.98718 7.84376 7.91596 7.91498C7.84474 7.9862 7.7886 8.07103 7.75087 8.16442C7.71315 8.25781 7.69463 8.35784 7.69641 8.45854C7.69818 8.55925 7.72022 8.65856 7.76122 8.75056C7.80221 8.84256 7.86131 8.92536 7.935 8.99402L10.938 12L7.933 15.005C7.80052 15.1472 7.72839 15.3352 7.73182 15.5295C7.73525 15.7238 7.81396 15.9092 7.95138 16.0466C8.08879 16.1841 8.27417 16.2628 8.46847 16.2662C8.66278 16.2696 8.85082 16.1975 8.993 16.065L12 13.06L15.005 16.066C15.1472 16.1985 15.3352 16.2706 15.5295 16.2672C15.7238 16.2638 15.9092 16.1851 16.0466 16.0476C16.184 15.9102 16.2627 15.7248 16.2662 15.5305C16.2696 15.3362 16.1975 15.1482 16.065 15.006L13.062 12L16.066 8.99502Z" fill="white" />
                                </svg>

                            </button>
                        </div>

                        {/* Popup Content */}
                        <div className="p-6 space-y-4">
                            {(() => {
                                // Get workout data from API for the selected date
                                if (!calendarData || !calendarData.weekly_schedule) {
                                    return (
                                        <div className="text-center py-8 text-gray-500">
                                            {calendarLoading ? 'Loading workout data...' : 'No workout data available'}
                                        </div>
                                    );
                                }

                                const dateKey = formatDateKey(selectedDate);
                                const selectedDayData = calendarData.weekly_schedule.find(day => {
                                    const dayDateKey = day.date ? formatDateKey(new Date(day.date)) : null;
                                    return dayDateKey === dateKey;
                                });

                                if (!selectedDayData || !selectedDayData.sessions || selectedDayData.sessions.length === 0) {
                                    return (
                                        <div className="text-center py-8 text-gray-500">
                                            No workouts scheduled for this date
                                        </div>
                                    );
                                }

                                // Flatten all exercises from all sessions
                                const allExercises = [];
                                selectedDayData.sessions.forEach(session => {
                                    if (session.exercises && session.exercises.length > 0) {
                                        session.exercises.forEach(ex => {
                                            // Get exercise sets from API if available
                                            const exerciseSets = ex.exercise_sets || [];
                                            const setDetails = exerciseSets.length > 0
                                                ? exerciseSets.map((set, idx) => ({
                                                    set: idx + 1,
                                                    reps: set.reps || ex.reps,
                                                    weight: set.weight_kg || ex.weight_kg || 0,
                                                    rest: set.rest_seconds ? `${set.rest_seconds}s` : null,
                                                    status: set.status === 'completed' ? 'Done' :
                                                        set.status === 'skipped' ? 'Skip' : 'Pending'
                                                }))
                                                : Array.from({ length: ex.sets || 0 }, (_, idx) => ({
                                                    set: idx + 1,
                                                    reps: ex.reps,
                                                    weight: ex.weight_kg || 0,
                                                    rest: null,
                                                    status: 'Pending'
                                                }));

                                            allExercises.push({
                                                name: ex.exercise_name,
                                                sets: ex.sets,
                                                reps: ex.sets_reps_display || `${ex.sets} x ${ex.reps}`,
                                                restTime: null,
                                                setDetails: setDetails
                                            });
                                        });
                                    }
                                });

                                if (allExercises.length === 0) {
                                    return (
                                        <div className="text-center py-8 text-gray-500">
                                            No exercises found for this date
                                        </div>
                                    );
                                }

                                return allExercises.map((workout, index) => {
                                    const setDetails = workout.setDetails || [];

                                    return (
                                        <div
                                            key={index}
                                            className="!border border-[#4D60804D] rounded-xl bg-white overflow-hidden"
                                        >
                                            {/* Exercise Header */}
                                            <div
                                                className="flex items-center justify-between p-4 cursor-pointer bg-white hover:bg-gray-50 transition"
                                                onClick={() => toggleExerciseDropdown(index)}
                                            >
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-[#003F8F] font-[Inter] mb-1">
                                                        {workout.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 font-[Inter]">
                                                        Sets: {workout.sets} • Reps: {workout.reps}{" "}
                                                        {workout.restTime ? `• Rest Time: ${workout.restTime}` : ""}
                                                    </p>
                                                </div>

                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 20 20"
                                                    fill="none"
                                                    className={`transform transition-transform ${openExerciseIndex === index ? "rotate-180" : ""
                                                        }`}
                                                >
                                                    <path
                                                        d="M5 7.5L10 12.5L15 7.5"
                                                        stroke="#003F8F"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            </div>

                                            {/* Exercise Details */}
                                            {openExerciseIndex === index && (
                                                <div className=" p-4 bg-white">
                                                    {/* Table Header */}
                                                    <div className="grid grid-cols-5 gap-4 mb-3 px-2">
                                                        <div className="text-sm font-bold text-[#003F8F]">Set</div>
                                                        <div className="text-sm font-bold text-[#003F8F]">Reps</div>
                                                        <div className="text-sm font-bold text-[#003F8F]">Weight</div>
                                                        <div className="text-sm font-bold text-[#003F8F]">Rest</div>
                                                        <div className="text-sm font-bold text-[#003F8F]">Status</div>
                                                    </div>

                                                    {/* Set Rows - Each as a complete bordered box */}
                                                    <div className="space-y-3">
                                                        {setDetails.map((set, setIndex) => (
                                                            <div
                                                                key={setIndex}
                                                                className="grid grid-cols-5 gap-4 items-center border border-[#4D60804D] rounded-lg p-3 bg-white"
                                                            >
                                                                {/* Set */}
                                                                <div className="text-sm text-[#003F8F] font-semibold">
                                                                    {set.set}
                                                                </div>

                                                                {/* Reps */}
                                                                <div>
                                                                    <span className="inline-flex items-center justify-center px-3 py-1.2  !border border-[#4D60804D] rounded-full text-sm text-[#003F8F] font-semibold min-w-[60px]">
                                                                        {set.reps}
                                                                    </span>
                                                                </div>

                                                                {/* Weight */}
                                                                <div>
                                                                    <span className="inline-flex items-center justify-center  px-3 py-1.2  !border border-[#4D60804D] rounded-full text-sm text-[#003F8F] font-semibold min-w-[60px]">
                                                                        {set.weight > 0 ? set.weight : '-'}
                                                                    </span>
                                                                </div>

                                                                {/* Rest */}
                                                                <div className="text-sm text-[#003F8F] font-semibold">
                                                                    {set.rest}
                                                                </div>

                                                                {/* Status */}
                                                                <div>
                                                                    {set.status === "Done" && (
                                                                        <button className="inline-flex items-center justify-center px-5 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold font-[Inter] hover:bg-green-600 transition">
                                                                            Done
                                                                        </button>
                                                                    )}

                                                                    {set.status === "Skip" && (
                                                                        <button className="inline-flex items-center justify-center px-5 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold font-[Inter] hover:bg-orange-600 transition">
                                                                            Skip
                                                                        </button>
                                                                    )}

                                                                    {set.status === "Pending" && (
                                                                        <button className="inline-flex items-center justify-center px-5 py-1.5 bg-gray-100 border border-[#4D60804D] text-[#003F8F] rounded-lg text-xs font-semibold font-[Inter] hover:bg-gray-200 transition">
                                                                            Pending
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default WorkOut;

