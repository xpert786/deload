import React, { useState } from 'react';

const todaysWorkout = [
  { id: 1, name: 'Bench Press', sets: 4, reps: '8-10', rest: '60s' },
  { id: 2, name: "Incline Dumbbells' Press", sets: 4, reps: '8-10', rest: '60s' },
  { id: 3, name: 'Military Press', sets: 4, reps: '8-10', rest: '60s' },
  { id: 4, name: "Dumbbell's Lateral Raise", sets: 4, reps: '8-10', rest: '60s' },
  { id: 5, name: 'Rope Push Down', sets: 4, reps: '8-10', rest: '60s' }
];

const workoutsHistory = [
  {
    id: 1,
    title: 'Lower Body Strength',
    date: '2024-01-15',
    duration: '52 min',
    status: 'Completed'
  },
  {
    id: 2,
    title: 'Upper Body Hypertrophy',
    date: '2024-01-13',
    duration: null,
    status: 'Incomplete'
  }
];

const progressLegend = [
  { label: 'Complete', color: '#003F8F' },
  { label: 'Incomplete', color: '#FB923C' },
  { label: 'Pending', color: '#93C5FD' }
];

const monthlyCalendars = [
  {
    month: 'July',
    days: [
      { day: 1, status: 'complete' }, { day: 2, status: 'complete' }, { day: 3, status: 'complete' },
      { day: 4, status: 'complete' }, { day: 5, status: 'complete' }, { day: 6, status: 'incomplete' },
      { day: 7, status: 'pending' }, { day: 8, status: 'complete' }, { day: 9, status: 'complete' },
      { day: 10, status: 'complete' }, { day: 11, status: 'incomplete' }, { day: 12, status: 'pending' },
      { day: 13, status: 'complete' }, { day: 14, status: 'complete' }, { day: 15, status: 'complete' },
      { day: 16, status: 'complete' }, { day: 17, status: 'incomplete' }, { day: 18, status: 'incomplete' },
      { day: 19, status: 'pending' }, { day: 20, status: 'complete' }, { day: 21, status: 'complete' },
      { day: 22, status: 'complete' }, { day: 23, status: 'complete' }, { day: 24, status: 'pending' },
      { day: 25, status: 'pending' }, { day: 26, status: 'pending' }, { day: 27, status: 'complete' },
      { day: 28, status: 'complete' }, { day: 29, status: 'complete' }, { day: 30, status: 'pending' },
      { day: 31, status: 'pending' }
    ]
  }
];

const weeklyCalendars = [
  {
    month: 'Oct',
    days: [
      { day: 20, dayLabel: 'Su', status: 'complete' },
      { day: 21, dayLabel: 'Mo', status: 'complete' },
      { day: 22, dayLabel: 'Tu', status: 'complete' },
      { day: 23, dayLabel: 'We', status: 'complete' },
      { day: 24, dayLabel: 'Th', status: 'incomplete' },
      { day: 25, dayLabel: 'Fr', status: 'pending' },
      { day: 26, dayLabel: 'Sa', status: 'pending' }
    ]
  },
  {
    month: 'Oct',
    days: [
      { day: 27, dayLabel: 'Su', status: 'complete' },
      { day: 28, dayLabel: 'Mo', status: 'complete' },
      { day: 29, dayLabel: 'Tu', status: 'pending' },
      { day: 30, dayLabel: 'We', status: 'pending' },
      { day: 31, dayLabel: 'Th', status: 'incomplete' },
      { day: 1, dayLabel: 'Fr', status: 'pending' },
      { day: 2, dayLabel: 'Sa', status: 'pending' }
    ]
  }
];

const monthlyStats = { completed: '17/19', time: '14.5 hrs', streak: '7 days' };
const weeklyStats = { completed: '17/19', time: '14.5 hrs', streak: '3 days' };

const getStatusStyle = (status) => {
  if (status === 'complete') return 'bg-[#003F8F] text-white';
  if (status === 'incomplete') return 'bg-[#FB923C] text-white';
  return 'bg-[#E0ECFF] text-[#003F8F]';
};

const WorkoutPlans = () => {
  const [viewMode, setViewMode] = useState('Monthly');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  const handlePrev = () => {
    if (viewMode === 'Monthly') {
      setCurrentMonthIndex((idx) => Math.max(idx - 1, 0));
    } else {
      setCurrentWeekIndex((idx) => Math.max(idx - 1, 0));
    }
  };

  const handleNext = () => {
    if (viewMode === 'Monthly') {
      setCurrentMonthIndex((idx) => Math.min(idx + 1, monthlyCalendars.length - 1));
    } else {
      setCurrentWeekIndex((idx) => Math.min(idx + 1, weeklyCalendars.length - 1));
    }
  };

  const activeMonth = monthlyCalendars[currentMonthIndex];
  const activeWeek = weeklyCalendars[currentWeekIndex];
  const stats = viewMode === 'Monthly' ? monthlyStats : weeklyStats;

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
            <div className="space-y-4">
              {todaysWorkout.map((workout) => (
                <div key={workout.id} className="flex items-start gap-4 rounded-xl border border-[#E4E9F2] p-4 bg-white hover transition-shadow">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#003F8F] text-[#003F8F] font-semibold">
                    {workout.id}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#003F8F] font-semibold font-[Inter]">{workout.name}</p>
                    <p className="text-sm text-gray-500 font-[Inter] mt-1">
                      Sets: {workout.sets} • Reps: {workout.reps} • Rest Time: {workout.rest}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 sm:w-auto flex items-center justify-center gap-2 border border-[#003F8F] text-[#003F8F] px-5 py-3 rounded-lg font-semibold font-[Inter] hover:bg-[#003F8F] hover:text-white transition-colors" style={{ width: "100%" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.25 2V13.5L12.75 7.75L3.25 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              Start Workout
            </button>
          </div>

          {/* Workouts history */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100">
            <div className="mb-4">
              <p className="text-xl font-medium text-[#003F8F] font-[Poppins]">Workouts History</p>
              <p className="text-sm text-gray-500 font-[Inter]">Your workout history and performance</p>
            </div>
            <div className="space-y-4">
              {workoutsHistory.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-[#E4E9F2] p-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full border border-[#003F8F] text-[#003F8F] font-semibold flex items-center justify-center">
                      {item.id}
                    </span>
                    <div>
                      <p className="font-semibold text-[#003F8F] font-[Inter]">{item.title}</p>
                      <p className="text-sm text-gray-500 font-[Inter]">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-[Inter]">

                    {/* Duration Block */}
                    <div className="flex flex-col flex-1">
                      
                      {item.duration && (
                        <span className="text-[#003F8F]">{item.duration}</span>
                      )}
                      <p className="text-gray-600">Duration</p>
                    </div>

                    {/* Status */}
                    <span
                      className={item.status === "Completed" ? "text-[#003F8F]" : "text-[#FB923C]"}
                    >
                      {item.status}
                    </span>

                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column cards */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-[#003F8F] font-[Inter]">Weight</p>
                <p className="text-xl font-bold text-[#003F8F] font-[Poppins]">75<span className="text-xs text-gray-400">kg(165 lbs)</span></p>
                
              </div>
              <div>
                <p className="text-sm text-[#003F8F] font-[Inter]">Height</p>
                <p className="text-2xl font-bold text-[#003F8F] font-[Poppins]">6.5<span className="text-xs text-gray-400">ft</span></p>
              </div>
              <div>
                <p className="text-sm text-[#003F8F] font-[Inter]">Age</p>
                <p className="text-2xl font-bold text-[#003F8F] font-[Poppins]">25<span className="text-xs text-gray-400">yrs</span></p>
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
                  className={`px-4 py-1.5 rounded-lg transition-colors ${
                    viewMode === 'Monthly' 
                      ? 'bg-[#003F8F] text-white' 
                      : 'bg-white text-[#003F8F]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setViewMode('Weekly')}
                  className={`px-4 py-1.5 rounded-lg transition-colors ${
                    viewMode === 'Weekly' 
                      ? 'bg-[#003F8F] text-white' 
                      : 'bg-white text-[#003F8F]'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>
        <div className="flex items-center justify-between mb-3 text-[#003F8F] font-semibold font-[Inter] text-sm sm:text-base">
          <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded disabled:opacity-40" disabled={(viewMode === 'Monthly' && currentMonthIndex === 0) || (viewMode === 'Weekly' && currentWeekIndex === 0)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
          <span className="text-sm sm:text-base">{viewMode === 'Monthly' ? activeMonth.month : activeWeek.month}</span>
          <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded disabled:opacity-40" disabled={(viewMode === 'Monthly' && currentMonthIndex === monthlyCalendars.length - 1) || (viewMode === 'Weekly' && currentWeekIndex === weeklyCalendars.length - 1)}>
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
              {activeMonth.days.map((item) => (
                <div
                  key={`${activeMonth.month}-${item.day}`}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs sm:text-sm ${getStatusStyle(item.status)}`}
                  style={{ minHeight: '36px' }}
                >
                  <span className="font-semibold">{item.day}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-7 text-center text-xs text-gray-500 font-semibold font-[Inter] mb-2">
              {activeWeek.days.map((item) => (
                <span key={`${item.dayLabel}-header`}>{item.dayLabel}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2 text-sm font-[Inter]">
              {activeWeek.days.map((item) => (
                <div
                  key={`${item.dayLabel}-${item.day}`}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg ${getStatusStyle(item.status)}`}
                  style={{ minHeight: '36px' }}
                >
                  <span className="text-xs font-semibold">{item.dayLabel}</span>
                  <span className="text-xs sm:text-sm font-semibold">{item.day}</span>
                </div>
              ))}
            </div>
          </>
        )}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 text-xs text-gray-500 font-[Inter]">
              {progressLegend.map((legend) => (
                <div key={legend.label} className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: legend.color }}></span>
                  <span>{legend.label}</span>
                </div>
              ))}
            </div>
          </div>

        {/* This Month / Week */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100">
          <p className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-4">{viewMode === 'Monthly' ? 'This Month' : 'This Week'}</p>
          <div className="space-y-4 text-sm sm:text-base text-gray-600 font-[Inter]">
              <div className="flex items-center justify-between">
              <span>Workouts Completed</span>
              <span className="text-xl font-medium text-[#003F8F]">{stats.completed}</span>
              </div>
              <div className="flex items-center justify-between">
              <span>Total time</span>
              <span className="text-xl font-medium text-[#003F8F]">{stats.time}</span>
              </div>
              <div className="flex items-center justify-between">
              <span>Streak</span>
              <span className="text-xl font-medium text-[#003F8F]">{stats.streak}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlans;

