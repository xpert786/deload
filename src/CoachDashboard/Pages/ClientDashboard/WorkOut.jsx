import React, { useState, useMemo } from 'react';

const WorkOut = () => {
    const [viewMode, setViewMode] = useState('Week');
    // Initialize with September 1, 2025 to match the sample data
    const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)); // Month is 0-indexed, so 8 = September
    const [note, setNote] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [openExerciseIndex, setOpenExerciseIndex] = useState(0); // Track which exercise dropdown is open

    // Detailed workout data with sets, reps, weights, rest times, and statuses
    const detailedWorkoutData = {
        '2025-09-22': [
            {
                name: 'Bench Press',
                sets: 4,
                reps: '8-10',
                restTime: '60s',
                setDetails: [
                    { set: 1, reps: 8, weight: 60, rest: '90s', status: 'Done' },
                    { set: 2, reps: 10, weight: 70, rest: '120s', status: 'Skip' },
                    { set: 3, reps: 12, weight: 80, rest: '90s', status: 'Done' },
                    { set: 4, reps: 12, weight: 80, rest: '90s', status: 'Pending' },
                ]
            },
            {
                name: 'Push-ups',
                sets: 4,
                reps: '8-10',
                restTime: '60s',
                setDetails: [
                    { set: 1, reps: 8, weight: 0, rest: '60s', status: 'Pending' },
                    { set: 2, reps: 10, weight: 0, rest: '60s', status: 'Pending' },
                    { set: 3, reps: 10, weight: 0, rest: '60s', status: 'Pending' },
                    { set: 4, reps: 10, weight: 0, rest: '60s', status: 'Pending' },
                ]
            },
            {
                name: 'Bent-over Dumbbell Rows',
                sets: 4,
                reps: '8-10',
                restTime: '60s',
                setDetails: [
                    { set: 1, reps: 8, weight: 25, rest: '60s', status: 'Pending' },
                    { set: 2, reps: 10, weight: 25, rest: '60s', status: 'Pending' },
                    { set: 3, reps: 10, weight: 30, rest: '60s', status: 'Pending' },
                    { set: 4, reps: 10, weight: 30, rest: '60s', status: 'Pending' },
                ]
            },
            {
                name: 'Plank',
                sets: 4,
                reps: '8-10',
                restTime: '60s',
                setDetails: [
                    { set: 1, reps: 8, weight: 0, rest: '60s', status: 'Pending' },
                    { set: 2, reps: 10, weight: 0, rest: '60s', status: 'Pending' },
                    { set: 3, reps: 10, weight: 0, rest: '60s', status: 'Pending' },
                    { set: 4, reps: 10, weight: 0, rest: '60s', status: 'Pending' },
                ]
            },
        ]
    };

    // Sample workout data - organized by date key (YYYY-MM-DD format)
    const workoutDataByDate = {
        // Week starting August 31, 2025 (Sunday) - September 6, 2025 (Saturday)
        '2025-08-31': [], // Sunday
        '2025-09-01': [ // Monday
            { name: 'Bench Press', sets: 4, reps: '8-10' },
            { name: 'Hamstring Curls', sets: 4, reps: '8-10' },
            { name: 'Dumbbell Pullovers', sets: 4, reps: '8-10' },
            { name: 'Squats', sets: 4, reps: '8-10' },
            { name: 'Step-ups', sets: 4, reps: '8-10' },
            { name: 'Bench Press', sets: 4, reps: '8-10' },
            { name: 'Hamstring Curls', sets: 4, reps: '8-10' },
            { name: 'Dumbbell Pullovers', sets: 4, reps: '8-10' },
            { name: 'Squats', sets: 4, reps: '8-10' },
            { name: 'Step-ups', sets: 4, reps: '8-10' },
        ],
        '2025-09-02': [ // Tuesday
            { name: 'Bench Press', sets: 4, reps: '8-10' },
            { name: 'Hamstring Curls', sets: 4, reps: '8-10' },
            { name: 'Dumbbell Pullovers', sets: 4, reps: '8-10' },
            { name: 'Squats', sets: 4, reps: '8-10' },
            { name: 'Step-ups', sets: 4, reps: '8-10' },
        ],
        '2025-09-03': [ // Wednesday
            { name: 'Leg Press', sets: 4, reps: '8-10' },
            { name: 'Romanian Deadlifts', sets: 4, reps: '8-10' },
            { name: 'Barbell Curls', sets: 4, reps: '8-10' },
            { name: 'Deadlifts', sets: 4, reps: '8-10' },
            { name: 'Pull-ups', sets: 4, reps: '8-10' },
            { name: 'Skull Crushers', sets: 4, reps: '8-10' },
        ],
        '2025-09-04': [ // Thursday
            { name: 'Incline Bench Press', sets: 4, reps: '8-10' },
            { name: 'Bicycle Crunches', sets: 4, reps: '8-10' },
            { name: 'Barbell Shrugs', sets: 4, reps: '8-10' },
        ],
        '2025-09-05': [ // Friday
            { name: 'Incline Bench Press', sets: 4, reps: '8-10' },
            { name: 'Bicycle Crunches', sets: 4, reps: '8-10' },
            { name: 'Barbell Shrugs', sets: 4, reps: '8-10' },
        ],
        '2025-09-06': [ // Saturday
            { name: 'Preacher Curls', sets: 4, reps: '8-10' },
            { name: 'Tricep Dips', sets: 4, reps: '8-10' },
            { name: 'Military Press', sets: 4, reps: '8-10' },
            { name: 'Glute Bridges', sets: 4, reps: '8-10' },
        ],
        '2025-09-22': [ // September 22 - matching the popup design
            { name: 'Bench Press', sets: 4, reps: '8-10' },
            { name: 'Push-ups', sets: 4, reps: '8-10' },
            { name: 'Bent-over Dumbbell Rows', sets: 4, reps: '8-10' },
            { name: 'Plank', sets: 4, reps: '8-10' },
        ],
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const progressPhotos = [
        { date: '14 Apr 2025', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop' },
        { date: '15 May 2025', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop' },
        { date: '15 June 2025', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop' },
        { date: '20 July 2025', image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=200&h=200&fit=crop' },
    ];

    const completed = 19;
    const missed = 6;
    const total = 25;
    const completedPercent = (completed / total) * 100;
    const missedPercent = (missed / total) * 100;

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
        // Find the index of the clicked exercise
        const dateKey = formatDateKey(date);
        const detailedWorkouts = detailedWorkoutData[dateKey] || [];
        const regularWorkouts = workoutDataByDate[dateKey] || [];

        // Use detailed workouts if available, otherwise use regular workouts
        const workoutsToUse = detailedWorkouts.length > 0 ? detailedWorkouts : regularWorkouts;
        const exerciseIndex = workoutsToUse.findIndex(w => w.name === exercise.name);
        setOpenExerciseIndex(exerciseIndex >= 0 ? exerciseIndex : 0);
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

    // Get calendar dates based on view mode
    const calendarDates = useMemo(() => {
        if (viewMode === 'Week') {
            return getWeekDates(currentDate);
        } else {
            return getMonthDates(currentDate);
        }
    }, [currentDate, viewMode]);

    const handleSaveNote = () => {
        // Handle save note logic here
        console.log('Note saved:', note);
        setNote('');
    };

    // Calculate pie chart path
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const completedDashOffset = circumference - (completedPercent / 100) * circumference;

    return (
        <div className="space-y-6 p-2 sm:p-2 bg-[#F7F7F7] text-[#003F8F]">
            {/* Interactive Workout Calendar Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-2xl font-semibold text-[#003F8F] font-[Poppins]">Interactive Workout Calendar</h2>

                    <div className="flex items-center gap-4">
                        {/* Week/Monthly Toggle */}
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('Week')}
                                className={`px-4 py-2 font-semibold text-sm transition rounded-md ${viewMode === 'Week'
                                    ? 'bg-[#003F8F] text-white'
                                    : 'text-[#003F8F] hover:bg-gray-100'
                                    }`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setViewMode('Monthly')}
                                className={`px-4 py-2 font-semibold text-sm transition rounded-md ${viewMode === 'Monthly'
                                    ? 'bg-[#003F8F] text-white'
                                    : 'text-[#003F8F] hover:bg-gray-100'
                                    }`}
                            >
                                Monthly
                            </button>
                        </div>

                    </div>
                </div>
            <div className="bg-white rounded-xl p-6 space-y-4">
            

                {/* Calendar Header - Sep 2025 and Today in Same Line */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-[#003F8F] font-[Poppins]">
                        {formatDate(currentDate)}
                    </span>

                    {/* Calendar Navigation in Light Gray Box */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-1 py-1">
                        {/* Left Arrow Button */}
                        <button
                            onClick={() => navigateDate('prev')}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded transition hover:bg-gray-50"
                        >
                            <svg width="5" height="7" viewBox="0 0 5 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.93278 0.182778C3.87496 0.124838 3.80628 0.0788707 3.73067 0.0475073C3.65506 0.0161439 3.57401 0 3.49215 0C3.4103 0 3.32925 0.0161439 3.25364 0.0475073C3.17803 0.0788707 3.10935 0.124838 3.05153 0.182778L0.182778 3.05153C0.124838 3.10935 0.0788707 3.17803 0.0475073 3.25364C0.0161439 3.32925 0 3.4103 0 3.49215C0 3.57401 0.0161439 3.65506 0.0475073 3.73067C0.0788707 3.80628 0.124838 3.87496 0.182778 3.93278L3.05153 6.80153C3.10939 6.85939 3.17809 6.90529 3.25369 6.93661C3.32929 6.96792 3.41032 6.98404 3.49215 6.98404C3.57398 6.98404 3.65501 6.96792 3.73062 6.93661C3.80622 6.90529 3.87491 6.85939 3.93278 6.80153C3.99064 6.74366 4.03654 6.67497 4.06786 6.59937C4.09917 6.52376 4.11529 6.44273 4.11529 6.3609C4.11529 6.27907 4.09917 6.19804 4.06786 6.12244C4.03654 6.04683 3.99064 5.97814 3.93278 5.92028L1.50778 3.48903L3.93278 1.06403C4.17653 0.820277 4.17028 0.420278 3.93278 0.182778Z" fill="#003F8F" />
                            </svg>

                        </button>

                        {/* Today Button */}
                        <button
                            onClick={goToToday}
                            className="px-3 py-1.5 text-sm font-bold text-[#003F8F] bg-white border border-gray-200 rounded transition hover:bg-gray-50 shadow-sm"
                        >
                            Today
                        </button>

                        {/* Right Arrow Button */}
                        <button
                            onClick={() => navigateDate('next')}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded transition hover:bg-gray-50"
                        >
                            <svg width="5" height="7" viewBox="0 0 5 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.06722 0.182778C1.12504 0.124838 1.19372 0.0788707 1.26933 0.0475073C1.34494 0.0161439 1.42599 0 1.50785 0C1.5897 0 1.67075 0.0161439 1.74636 0.0475073C1.82197 0.0788707 1.89065 0.124838 1.94847 0.182778L4.81722 3.05153C4.87516 3.10935 4.92113 3.17803 4.95249 3.25364C4.98386 3.32925 5 3.4103 5 3.49215C5 3.57401 4.98386 3.65506 4.95249 3.73067C4.92113 3.80628 4.87516 3.87496 4.81722 3.93278L1.94847 6.80153C1.89061 6.85939 1.82191 6.90529 1.74631 6.93661C1.67071 6.96792 1.58968 6.98404 1.50785 6.98404C1.42602 6.98404 1.34499 6.96792 1.26938 6.93661C1.19378 6.90529 1.12509 6.85939 1.06722 6.80153C1.00936 6.74366 0.963457 6.67497 0.932143 6.59937C0.900829 6.52376 0.884705 6.44273 0.884705 6.3609C0.884705 6.27907 0.900829 6.19804 0.932143 6.12244C0.963457 6.04683 1.00936 5.97814 1.06722 5.92028L3.49222 3.48903L1.06722 1.06403C0.82347 0.820277 0.82972 0.420278 1.06722 0.182778Z" fill="#003F8F" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Calendar Grid - Table Structure */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-7">
                        {/* Day Headers */}
                        {daysOfWeek.map((day) => (
                            <div key={day} className="text-center font-semibold text-sm text-[#003F8F] font-[Inter] py-2 border-b border-gray-200 border-r border-gray-200 last:border-r-0">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Dates Grid */}
                    <div className="grid grid-cols-7">
                        {calendarDates.map((date, idx) => {
                            const dateKey = formatDateKey(date);
                            const dayName = daysOfWeek[date.getDay()];
                            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                            const isToday = formatDateKey(date) === formatDateKey(new Date());
                            const workouts = workoutDataByDate[dateKey] || [];
                            const isWed = dayName === 'Wed' && isCurrentMonth;
                            const isTue = dayName === 'Tue' && isCurrentMonth;

                            return (
                                <div
                                    key={idx}
                                    className={`min-h-[400px] border-r border-gray-200 last:border-r-0 p-2 space-y-2 ${!isCurrentMonth && viewMode === 'Monthly' ? 'bg-gray-50' : ''
                                        }`}
                                >
                                    {/* Date Number - Only show in Monthly view or Week view */}
                                    {viewMode === 'Monthly' && (
                                        <div className={`text-xs font-semibold mb-2 ${!isCurrentMonth ? 'text-gray-400' : 'text-[#003F8F]'} ${isToday ? 'text-[#003F8F] font-bold' : ''}`}>
                                            {date.getDate()}
                                        </div>
                                    )}
                                    {viewMode === 'Week' && (
                                        <div className={`text-xs font-semibold mb-2 text-[#003F8F] ${isToday ? 'font-bold' : ''}`}>
                                            {date.getDate()}
                                        </div>
                                    )}

                                    {/* Workout Cards */}
                                    {workouts.length > 0 ? (
                                        <>
                                            {workouts.map((exercise, exerciseIdx) => (
                                                <div
                                                    key={exerciseIdx}
                                                    onClick={() => handleExerciseClick(date, exercise)}
                                                    className={`bg-[#EA77261A] border rounded-lg p-2 cursor-pointer hover:shadow-md transition relative ${isWed && exerciseIdx === 4
                                                        ? 'bg-orange-50 border-orange-300 z-10'
                                                        : isWed && exerciseIdx === 5
                                                            ? 'bg-orange-50 border-orange-300 z-20 -mt-2 ml-2'
                                                            : 'border-orange-200'
                                                        }`}
                                                >
                                                    <p className="text-sm font-semibold text-[#003F8F] font-[Inter] mb-1">
                                                        {exercise.name}
                                                    </p>
                                                    <p className="text-xs text-gray-600 font-[Inter]">
                                                        Sets: {exercise.sets} Reps: {exercise.reps}
                                                    </p>
                                                    {isWed && exerciseIdx === 5 && (
                                                        <div className="absolute top-1 right-1 cursor-grab">
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <circle cx="3" cy="3" r="1.5" fill="#003F8F" />
                                                                <circle cx="9" cy="3" r="1.5" fill="#003F8F" />
                                                                <circle cx="3" cy="9" r="1.5" fill="#003F8F" />
                                                                <circle cx="9" cy="9" r="1.5" fill="#003F8F" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {/* Icons for Tuesday */}
                                            {isTue && workouts.length > 0 && (
                                                <div className="flex items-center gap-2 mt-2 pt-2">
                                                    <button className="p-1.5 hover:bg-gray-100 rounded transition">
                                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M7 7C8.10457 7 9 6.10457 9 5C9 3.89543 8.10457 3 7 3C5.89543 3 5 3.89543 5 5C5 6.10457 5.89543 7 7 7Z" stroke="#4D6080" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M2 12C2 10.3431 3.34315 9 5 9H9C10.6569 9 12 10.3431 12 12" stroke="#4D6080" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                    <button className="p-1.5 hover:bg-gray-100 rounded transition">
                                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect x="2.5" y="2.5" width="9" height="9" rx="1.5" stroke="#4D6080" strokeWidth="1.2" />
                                                            <path d="M7 5.5V8.5M5.5 7H8.5" stroke="#4D6080" strokeWidth="1.2" strokeLinecap="round" />
                                                        </svg>
                                                    </button>
                                                    <button className="p-1.5 hover:bg-gray-100 rounded transition">
                                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M9.91667 2.33333C10.07 2.18 10.25 2.05933 10.45 1.97833C10.65 1.89733 10.8633 1.85733 11.0783 1.86133C11.2933 1.86533 11.505 1.913 11.7 2.00133C11.895 2.08967 12.0693 2.21667 12.2133 2.375C12.3573 2.53333 12.468 2.71967 12.5383 2.92333C12.6087 3.127 12.6367 3.34367 12.6207 3.55867C12.6047 3.77367 12.545 3.98267 12.445 4.17333L7.58333 9.03333L5.25 9.75L5.96667 7.41667L9.91667 2.33333Z" stroke="#4D6080" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-400 text-sm py-4">No workouts</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Section - Notes, Progress Photos, and Completion Rate */}
            <div className="space-y-6">
                {/* Top Row - Notes and Progress Photos */}
                <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
                    {/* Notes Section */}
                    <div className="bg-white rounded-xl p-6 space-y-4 shadow-sm">
                        <h3 className="text-2xl font-bold text-[#003F8F] font-[Poppins]">Notes</h3>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add notes about client's progress..."
                            className="w-full h-40 p-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-[#003F8F] resize-none text-sm font-[Inter] text-gray-700"
                        />
                        <div className="flex justify-start">
                            <button
                                onClick={handleSaveNote}
                                className="px-6 py-3 bg-[#003F8F] text-white rounded-xl font-semibold text-base hover:bg-[#002F6F] transition shadow-md"
                            >
                                Save Note
                            </button>
                        </div>
                    </div>

                    {/* Progress Photos Section */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 space-y-4 ">
                        <h3 className="text-xl sm:text-2xl font-bold text-[#003F8F] font-[Poppins]">Progress photos</h3>
                        <div className="bg-[#4D60801A] rounded-xl p-3 sm:p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                {progressPhotos.map((photo, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-white ">
                                            <img
                                                src={photo.image}
                                                alt={`Progress ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400">No Image</div>';
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600 font-[Inter] text-center font-medium">{photo.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Completion Rate (Full Width) */}
                <div className="bg-white rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-2xl font-bold text-[#003F8F] font-[Poppins]">Completion Rate</h3>
                    <div className="grid grid-cols-3 items-center gap-12">
                        {/* Left Spacer */}
                        <div></div>
                        
                        {/* Pie Chart with Labels - Centered */}
                        <div className="relative w-48 h-48 flex-shrink-0 mx-auto">
                            <svg className="w-48 h-48" viewBox="0 0 200 200">
                                {(() => {
                                    // Dynamic calculations
                                    const centerX = 100;
                                    const centerY = 100;
                                    const radius = 100;
                                    const startAngle = -Math.PI / 2; // Start from top
                                    
                                    // Calculate angles for segments
                                    const completedAngle = (completedPercent / 100) * 2 * Math.PI;
                                    const missedAngle = (missedPercent / 100) * 2 * Math.PI;
                                    
                                    // Calculate end points
                                    const completedEndX = centerX + radius * Math.cos(startAngle + completedAngle);
                                    const completedEndY = centerY + radius * Math.sin(startAngle + completedAngle);
                                    
                                    // Calculate mid angles for labels
                                    const completedMidAngle = startAngle + completedAngle / 2;
                                    const missedMidAngle = startAngle + completedAngle + missedAngle / 2;
                                    
                                    return (
                                        <>
                                            {/* Pie Chart Segments */}
                                            {/* Completed (Blue) */}
                                            <path
                                                d={`M ${centerX},${centerY} L ${centerX},${centerY - radius} A ${radius},${radius} 0 ${completedPercent > 50 ? 1 : 0},1 ${completedEndX},${completedEndY} Z`}
                                                fill="#003F8F"
                                            />
                                            {/* Missed (Orange) */}
                                            <path
                                                d={`M ${centerX},${centerY} L ${completedEndX},${completedEndY} A ${radius},${radius} 0 ${missedPercent > 50 ? 1 : 0},1 ${centerX},${centerY - radius} Z`}
                                                fill="#FB923C"
                                            />
                                            
                                            {/* Lines and Labels for Completed */}
                                            <g>
                                                <line
                                                    x1={centerX + 80 * Math.cos(completedMidAngle)}
                                                    y1={centerY + 80 * Math.sin(completedMidAngle)}
                                                    x2={centerX + 130 * Math.cos(completedMidAngle)}
                                                    y2={centerY + 130 * Math.sin(completedMidAngle)}
                                                    stroke="#003F8F"
                                                    strokeWidth="2"
                                                />
                                                <text
                                                    x={centerX + 145 * Math.cos(completedMidAngle)}
                                                    y={centerY + 145 * Math.sin(completedMidAngle)}
                                                    fill="#003F8F"
                                                    fontSize="18"
                                                    fontWeight="bold"
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    {completed}
                                                </text>
                                            </g>
                                            
                                            {/* Lines and Labels for Missed */}
                                            <g>
                                                <line
                                                    x1={centerX + 80 * Math.cos(missedMidAngle)}
                                                    y1={centerY + 80 * Math.sin(missedMidAngle)}
                                                    x2={centerX + 130 * Math.cos(missedMidAngle)}
                                                    y2={centerY + 130 * Math.sin(missedMidAngle)}
                                                    stroke="#FB923C"
                                                    strokeWidth="2"
                                                />
                                                <text
                                                    x={centerX + 145 * Math.cos(missedMidAngle)}
                                                    y={centerY + 145 * Math.sin(missedMidAngle)}
                                                    fill="#FB923C"
                                                    fontSize="18"
                                                    fontWeight="bold"
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    {missed}
                                                </text>
                                            </g>
                                        </>
                                    );
                                })()}
                            </svg>
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
                                const dateKey = formatDateKey(selectedDate);
                                const detailedWorkouts = detailedWorkoutData[dateKey] || [];
                                const regularWorkouts = workoutDataByDate[dateKey] || [];

                                const workoutsToShow =
                                    detailedWorkouts.length > 0 ? detailedWorkouts : regularWorkouts;

                                if (workoutsToShow.length === 0) {
                                    return (
                                        <div className="text-center py-8 text-gray-500">
                                            No workouts scheduled for this date
                                        </div>
                                    );
                                }

                                return workoutsToShow.map((workout, index) => {
                                    const isDetailed = "setDetails" in workout;

                                    let setDetails = workout.setDetails;
                                    if (!setDetails) {
                                        const numSets = workout.sets || 4;
                                        const repsRange = workout.reps || "8-10";
                                        const restTime = workout.restTime || "60s";
                                        const repsValue = repsRange.includes("-")
                                            ? parseInt(repsRange.split("-")[0])
                                            : parseInt(repsRange) || 8;

                                        // Define status pattern: Done, Skip, Done, Pending, then repeat
                                        const statusPattern = ["Done", "Skip", "Done", "Pending"];

                                        setDetails = Array.from({ length: numSets }, (_, i) => ({
                                            set: i + 1,
                                            reps: repsValue + i * 2,
                                            weight: 60 + (i * 10), // Progressive weight: 60, 70, 80, 90...
                                            rest: restTime,
                                            status: statusPattern[i % statusPattern.length], // Cycle through statuses
                                        }));
                                    }

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

