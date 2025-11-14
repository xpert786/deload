import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Consistency, StrengthGain, TotalVolume } from '../Components/icons';
import Running from "../../assets/running.png";
import WeightLoss from "../../assets/weightloss.png";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
const Strength = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('Last 8 weeks');
  const [progressTimeframe, setProgressTimeframe] = useState('Weekly');
  const [activityTimeframe, setActivityTimeframe] = useState('Weekly');

  // Activity data for bar chart
  const activityData = [
    { week: 'W1', value: 25, color: '#9CA3AF' },
    { week: 'W2', value: 40, color: '#9CA3AF' },
    { week: 'W3', value: 25, color: '#9CA3AF' },
    { week: 'W4', value: 40, color: '#9CA3AF' },
    { week: 'W5', value: 50, color: '#FB923C' },
    { week: 'W6', value: 40, color: '#9CA3AF' },
    { week: 'W7', value: 25, color: '#9CA3AF' }
  ];

  const maxActivity = Math.max(...activityData.map(d => d.value));

  // Custom shape component that includes the bar and tooltip for W5
  const CustomBar = (props) => {
    const { x, y, width, height, payload } = props;
    const isW5 = payload.week === 'W5';
    const barColor = isW5 ? '#FB923C' : '#E8F1FD';
    const centerX = x + width / 2;

    return (
      <g>
        {/* Tooltip for W5 */}
        {isW5 && (
          <g>
            <rect
              x={centerX - 20}
              y={y - 35}
              width={40}
              height={24}
              fill="#003F8F"
              rx={4}
            />
            <text
              x={centerX}
              y={y - 18}
              fill="white"
              textAnchor="middle"
              fontSize={12}
              fontWeight="600"
              fontFamily="Inter"
            >
              50%
            </text>
            {/* Triangle pointing down */}
            <polygon
              points={`${centerX - 4},${y - 11} ${centerX + 4},${y - 11} ${centerX},${y - 5}`}
              fill="#003F8F"
            />
          </g>
        )}
        {/* Bar with rounded top corners */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={barColor}
          rx={4}
          ry={0}
        />
      </g>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-[#F7F7F7]">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-[#003F8F] font-[Poppins] mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'John'}!
        </h1>
        <p className="text-lg text-gray-600 font-[Inter]">
          You're on a 7-day streak! Ready to crush today's workout?
        </p>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex justify-between items-start w-full">
          {/* Left: Weight / Height / Age card */}
          <div className="bg-white rounded-lg shadow-sm p-6 w-1/2">
            <div className="flex justify-between items-center">
              {/* Weight - left */}
              <div className="text-left">
                <p className="text-sm text-[#003F8F] font-[Inter] mb-1">Weight</p>
                <p className="text-2xl font-bold text-[#003F8F] font-[Inter]">75<span className="text-sm text-gray-500 font-[Inter]">kg (165 lbs)</span></p>
              </div>

              {/* Height - center */}
              <div className="text-center">
                <p className="text-sm text-[#003F8F] font-[Inter] mb-1">Height</p>
                <p className="text-2xl font-bold text-[#003F8F] font-[Inter]">6.5"</p>
              </div>

              {/* Age - right */}
              <div className="text-right">
                <p className="text-sm text-[#003F8F] font-[Inter] mb-1">Age</p>
                <p className="text-2xl font-bold text-[#003F8F] font-[Inter]">25<span className="text-sm text-gray-500 font-[Inter]">yrs</span></p>
              </div>
            </div>
          </div>

          {/* Right: Timeframe Selector */}
          <div className="flex justify-end items-center pl-4 bg-white">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#003F8F] focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
            >
              <option>Last 8 weeks</option>
              <option>Last 4 weeks</option>
              <option>Last month</option>
            </select>
          </div>
        </div>

      </div>



      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ">
        <div className="bg-white rounded-lg shadow-sm p-6 relative">
          <div className="absolute top-4 right-4">
            <StrengthGain />
          </div>
          <p className="text-sm text-[#003F8F] font-[Inter] mb-1">Strength Gain</p>
          <p className="text-2xl font-bold text-[#003F8F] font-[Inter] mb-1">+20 lbs</p>
          <p className="text-xs text-[#003F8F] font-[Inter]">Bench press improvement</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 relative">
          <div className="absolute top-4 right-4">
            <Consistency />
          </div>
          <p className="text-sm text-[#003F8F] font-[Inter] mb-1">Consistency</p>
          <p className="text-2xl font-bold text-[#003F8F] font-[Inter] mb-1">90%</p>
          <p className="text-xs text-[#003F8F] font-[Inter]">Workout completion rate</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 relative">
          <div className="absolute top-4 right-4">
            <TotalVolume />
          </div>
          <p className="text-sm text-[#003F8F] font-[Inter] mb-1">Total Volume</p>
          <p className="text-2xl font-bold text-[#003F8F] font-[Inter] mb-1">+20 lbs</p>
          <p className="text-xs text-[#003F8F] font-[Inter]">Bench press improvement</p>
        </div>
        <div className="bg-[#4D6080] rounded-lg shadow-sm p-6 relative text-white">
          <div className="absolute top-4 right-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="text-sm text-white/80 font-[Inter] mb-1">Achievements</p>
          <p className="text-2xl font-bold text-white font-[Inter] mb-1">4</p>
          <p className="text-xs text-white/80 font-[Inter]">New milestones this month</p>
        </div>
      </div>



      {/* Progress and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Section */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#003F8F] font-[Poppins]">Progress</h2>
            <select
              value={progressTimeframe}
              onChange={(e) => setProgressTimeframe(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-[Inter] text-white focus:outline-none focus:ring-2 focus:ring-[#003F8F] bg-[#003F8F]"
            >
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-8 flex-wrap">
            {/* Chart */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56">
              <svg viewBox="0 0 120 120" className="transform -rotate-90 w-full h-full">
                {/* Cardio - 30 hrs - Light Blue */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth="20"
                  strokeDasharray={`${(30 / 120) * 314} 314`}
                  strokeDashoffset="0"
                />
                {/* Stretching - 40 hrs - Orange */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#FB923C"
                  strokeWidth="20"
                  strokeDasharray={`${(40 / 120) * 314} 314`}
                  strokeDashoffset={`-${(30 / 120) * 314}`}
                />
                {/* Treadmill - 30 hrs - Dark Blue */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#003F8F"
                  strokeWidth="20"
                  strokeDasharray={`${(30 / 120) * 314} 314`}
                  strokeDashoffset={`-${((30 + 40) / 120) * 314}`}
                />
                {/* Strength - 20 hrs - Teal */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#14B8A6"
                  strokeWidth="20"
                  strokeDasharray={`${(20 / 120) * 314} 314`}
                  strokeDashoffset={`-${((30 + 40 + 30) / 120) * 314}`}
                />
              </svg>

              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-xs sm:text-sm text-gray-600 font-[Inter]">Stretching</p>
                <p className="text-lg sm:text-2xl font-bold text-[#003F8F] font-[Inter]">40 hrs</p>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full sm:w-60 space-y-3">
              {/* Cardio */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#60A5FA]"></div>
                  <span className="text-sm font-[Inter] text-gray-700">Cardio</span>
                </div>
                <span className="text-sm font-[Inter] text-gray-600">30 hrs</span>
              </div>

              {/* Stretching */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#FB923C]"></div>
                  <span className="text-sm font-[Inter] text-gray-700">Stretching</span>
                </div>
                <span className="text-sm font-[Inter] text-gray-600">40 hrs</span>
              </div>

              {/* Treadmill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#003F8F]"></div>
                  <span className="text-sm font-[Inter] text-gray-700">Treadmill</span>
                </div>
                <span className="text-sm font-[Inter] text-gray-600">30 hrs</span>
              </div>

              {/* Strength */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#14B8A6]"></div>
                  <span className="text-sm font-[Inter] text-gray-700">Strength</span>
                </div>
                <span className="text-sm font-[Inter] text-gray-600">20 hrs</span>
              </div>
            </div>
          </div>


        </div>

        {/* Activity Section */}
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#003F8F] font-[Poppins]">Activity</h2>
            <div className="relative">
              <select
                value={activityTimeframe}
                onChange={(e) => setActivityTimeframe(e.target.value)}
                className="appearance-none px-3 py-1.5 sm:px-4 sm:py-2 pr-8 sm:pr-10 border border-gray-300 rounded-lg text-xs sm:text-sm font-[Inter] text-white focus:outline-none focus:ring-2 focus:ring-[#003F8F] bg-[#003F8F] cursor-pointer"
              >
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
              <div className="absolute inset-y-0 right-2 sm:right-3 flex items-center pointer-events-none">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="w-full h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityData}
                margin={{ top: 50, right: 0, left: 0, bottom: 0 }}
                barCategoryGap="10%"
              >
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'Inter' }}
                />
                <YAxis hide domain={[0, maxActivity]} />
                <Bar
                  dataKey="value"
                  shape={<CustomBar />}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Your Goals Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#003F8F] font-[Poppins] mb-6">Your Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Running Goal */}
          <div className="border border-gray-200 rounded-lg p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <img src={Running} alt="Running" className="w-6 h-6 transform scale-x-[-1]" />

              </div>
              <div>
                <p className="font-semibold text-gray-800 font-[Inter] mb-1">Running</p>
                <p className="text-sm text-gray-600 font-[Inter]">70km/80km</p>
              </div>
            </div>
            <div className="relative w-16 h-16">
              <svg className="transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="6"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="6"
                  strokeDasharray={`${(79 / 100) * 175.9} 175.9`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-[#10B981] font-[Inter]">79%</span>
              </div>
            </div>
          </div>

          {/* Weight Loss Goal */}
          <div className="border border-gray-200 rounded-lg p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <img src={WeightLoss} alt="Weight Loss" className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 font-[Inter] mb-1">Weight Loss</p>
                <p className="text-sm text-gray-600 font-[Inter]">70kg/100kg</p>
              </div>
            </div>
            <div className="relative w-16 h-16">
              <svg className="transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="6"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#FB923C"
                  strokeWidth="6"
                  strokeDasharray={`${(60 / 100) * 175.9} 175.9`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-[#FB923C] font-[Inter]">60%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Strength;

