import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Chat, DashboardMessageCoach, DashboardStartWorkout, DashboardViewProgress, DashboardWorkoutHistory } from '../Components/icons';
import ManImage from '../../assets/dashboard.png';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('Monthly');

  // Calendar data - July 2024
  const calendarDays = [
    { date: 1, status: 'complete' }, { date: 2, status: 'complete' }, { date: 3, status: 'complete' },
    { date: 4, status: 'complete' }, { date: 5, status: 'complete' }, { date: 6, status: 'incomplete' },
    { date: 7, status: 'pending' }, { date: 8, status: 'complete' }, { date: 9, status: 'complete' },
    { date: 10, status: 'complete' }, { date: 11, status: 'incomplete' }, { date: 12, status: 'pending' },
    { date: 13, status: 'complete' }, { date: 14, status: 'complete' }, { date: 15, status: 'complete' },
    { date: 16, status: 'complete' }, { date: 17, status: 'incomplete' }, { date: 18, status: 'incomplete' },
    { date: 19, status: 'pending' }, { date: 20, status: 'complete' }, { date: 21, status: 'complete' },
    { date: 22, status: 'complete' }, { date: 23, status: 'complete' }, { date: 24, status: 'pending' },
    { date: 25, status: 'pending' }, { date: 26, status: 'pending' }, { date: 27, status: 'complete' },
    { date: 28, status: 'complete' }, { date: 29, status: 'complete' }, { date: 30, status: 'pending' },
    { date: 31, status: 'pending' }
  ];

  const weeklyDays = [
    { dayLabel: 'Su', date: 20, status: 'complete' },
    { dayLabel: 'Mo', date: 21, status: 'complete' },
    { dayLabel: 'Tu', date: 22, status: 'complete' },
    { dayLabel: 'We', date: 23, status: 'complete' },
    { dayLabel: 'Th', date: 24, status: 'pending' },
    { dayLabel: 'Fr', date: 25, status: 'complete' },
    { dayLabel: 'Sa', date: 26, status: 'pending' }
  ];

  const getStatusColor = (status) => {
    if (status === 'complete') return 'bg-[#003F8F] text-white';
    if (status === 'incomplete') return 'bg-orange-500 text-white';
    return 'bg-gray-200 text-gray-600';
  };

  return (
    <div className="space-y-6 p-6 bg-[#F7F7F7]">
      {/* Welcome Banner */}
      <div className="bg-[#326DB7] rounded-lg p-6 text-white relative overflow-hidden">
  <div className="flex justify-between items-start">
    <div>
      <h1 className="text-2xl font-medium font-[Poppins] mb-2">
        Welcome back, {user?.name?.split(' ')[0] || 'John'}!
      </h1>
      <p className="text-sm font-[Inter] mb-4">
        You're on a 7-day streak! Ready to crush today's workout?
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

    {/* Image shown only on larger screens */}
    <div className="hidden sm:absolute sm:right-0 sm:bottom-0 sm:h-full sm:flex sm:items-end">
      <img
        src={ManImage}
        alt="Fitness"
        className="h-full w-auto object-cover opacity-90"
        style={{ maxHeight: '200px' }}
      />
    </div>
  </div>

  {/* Background image only on mobile */}
  <div
    className="absolute inset-0 bg-cover bg-no-repeat bg-bottom sm:hidden opacity-30"
    style={{ backgroundImage: `url(${ManImage})` }}
  ></div>
</div>


      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Today's Workout */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Workout */}
          <div className="bg-white rounded-lg  p-6">
            <div className="mb-4 flex items-start justify-between">
              {/* Left side */}
              <h2 className="text-xl font-medium text-[#003F8F] font-[Poppins]">
                Today's Workout
              </h2>

              {/* Right side */}
              <div className="flex flex-col items-end">
                <p className="text-lg font-semibold text-gray-700 px-4 py-2" style={{ color: '#003F8F' }}>
                  Upper Body Power
                </p>
                <p className="text-sm text-gray-600 font-[Inter]">
                  You have 5 exercises today • 45 minutes
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {[
                { name: 'Bench Press', sets: '4 sets x 8-10 reps' },
                { name: 'Overhead Press', sets: '3 sets x 10-12 reps' },
                { name: 'Incline Dumbbell Press', sets: '3 sets x 12-15 reps' }
              ].map((exercise, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 flex items-center justify-center rounded-full border border-[#003F8F] text-[#003F8F] font-semibold">{idx + 1}.</span>
                    <div>
                      <p className="font-semibold text-gray-800 font-[Inter]" style={{ color: '#003F8F' }}>{exercise.name}</p>
                      <p className="text-sm text-gray-600 font-[Inter]" >{exercise.sets}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full text-gray-600 border border-gray-300 py-3 rounded-lg font-medium font-[Inter] transition-colors flex items-center justify-center gap-2" style={{ color: '#003F8F' }}>
              <DashboardStartWorkout />

              Start Workout
            </button>
          </div>

          {/* Recent Workouts */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-1">Recent Workouts</h2>
            <p className="text-sm text-gray-600 font-[Inter] mb-4">Your workout history and performance</p>
            <div className="space-y-3">
              {[
                { name: 'Lower Body Strength', date: '2024-01-15', duration: '52 min', status: 'Completed' },
                { name: 'Upper Body Hypertrophy', date: '2024-01-13', duration: null, status: 'Incomplete' },
                { name: 'Full Body Circuit', date: '2024-01-11', duration: '52 min', status: 'Completed' }
              ].map((workout, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                  <div className="flex justify-between items-center gap-3">
                    {/* Left: name + date */}
                    <span className="w-10 h-10 flex items-center justify-center rounded-full border border-[#003F8F] text-[#003F8F] font-semibold">{idx + 1}.</span>
                    <div className="flex flex-col">
                      <p className="font-semibold text-gray-800 font-[Inter]" style={{ color: '#003F8F' }}>{workout.name}</p>
                      <p className="text-sm text-gray-600 font-[Inter]">{workout.date}</p>
                    </div>

                    {/* Center: duration */}
                    <div className="text-center flex-1">
                      {workout.duration ? (
                        <p className="text-sm text-gray-700 font-[Inter]" style={{ color: '#003F8F' }}>{workout.duration}</p>
                      ) : (
                        <p className="text-sm text-gray-400 font-[Inter]">—</p>
                      )}
                    </div>

                    {/* Right: status */}
                    <span
                      className={`text-sm font-medium font-[Inter] ${workout.status === 'Completed'
                        ? 'text-[#003F8F]'
                        : workout.status === 'Incomplete'
                          ? 'text-orange-500'
                          : 'text-gray-500'
                        }`}
                    >
                      {workout.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
          {/* Notifications */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-4">Notifications</h2>
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500 font-[Inter]">No notifications</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="bg-white rounded-lg p-6">
            <p className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-4">Progress Overview</p>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedTab('Monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium font-[Inter] transition-colors ${selectedTab === 'Monthly'
                  ? 'bg-[#003F8F] text-white'
                  : 'bg-gray-100 text-[#003F8F] hover:bg-gray-200'
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedTab('Weekly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium font-[Inter] transition-colors ${selectedTab === 'Weekly'
                  ? 'bg-[#003F8F] text-white'
                  : 'bg-gray-100 text-[#003F8F] hover:bg-gray-200'
                  }`}
              >
                Weekly
              </button>
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
                  <h3 className="font-semibold text-[#003F8F] font-[Inter] text-center">July</h3>

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
                  <div className="grid grid-cols-7 gap-1 text-xs font-[Inter]">
                    {calendarDays.map((day, idx) => (
                      <div
                        key={idx}
                        className={`min-h-[56px] flex items-center justify-center rounded ${getStatusColor(
                          day.status
                        )}`}
                      >
                        <span className="font-semibold">{day.date}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weeklyDays.map((day) => (
                      <div key={`${day.dayLabel}-header`} className="text-center text-xs font-medium text-gray-600 font-[Inter] py-1">
                        {day.dayLabel}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-xs font-[Inter]">
                    {weeklyDays.map((day) => (
                      <div
                        key={day.date}
                        className={`min-h-[56px] flex flex-col items-center justify-center rounded ${getStatusColor(day.status)}`}
                      >
                        <span className="font-semibold">{day.date}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-4 text-xs font-[Inter]">
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
            </div>
          </div>

          {/* This Month & Quick Actions */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-4">{selectedTab === 'Weekly' ? 'This Week' : 'This Month'}</h2>
            <div className="space-y-3 mb-6">
              <div className='flex items-center justify-between'>
                <p className="text-sm text-gray-600 font-[Inter]">Workouts Completed</p>
                <p className="text-xl font-medium text-[#003F8F] font-[Inter]">17/19</p>
              </div>
              <div className='flex items-center justify-between'>
                <p className="text-sm text-gray-600 font-[Inter]">Total time</p>
                <p className="text-xl font-medium text-[#003F8F] font-[Inter]">14.5 hrs</p>
              </div>
              <div className='flex items-center justify-between'>
                <p className="text-sm text-gray-600 font-[Inter]">Streak</p>
                <p className="text-xl font-medium text-[#003F8F] font-[Inter]">7 days</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-[#003F8F] font-[Poppins] mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/client/dashboard/strength"
                  className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <DashboardViewProgress />
                  <span className="font-medium text-gray-700 font-[Inter]">View Progress</span>
                </Link>
                <button className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <DashboardWorkoutHistory />
                  <span className="font-medium text-gray-700 font-[Inter]">Workout History</span>
                </button>
                <Link
                  to="/client/chat"
                  className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <DashboardMessageCoach />
                  <span className="font-medium text-gray-700 font-[Inter]">Message Coach</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
