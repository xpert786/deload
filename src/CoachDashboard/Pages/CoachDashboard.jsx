import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AddNewClient, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, AvgSession, ClientIcon,DoumbleIcon,PendingIcon, PercentageTodayIcon, TodayMessageIcon, WeeklyGoalIcon, MessageIconn, AiWorkout } from '../../ClientDashboard/Components/icons';
import ManImage from "../../assets/dashboard.png";
const quickStats = [
  { label: 'Clients', value: 12, icon: <ClientIcon /> },
  { label: 'Completed Today', value: 5, icon: <DoumbleIcon /> },
  { label: 'Pending Check-ins', value: 4, icon: <PendingIcon /> },
];

const sessions = [
  { name: 'David Lee', time: '9:00 AM', duration: '52 min', status: 'Completed' },
  { name: 'Sarah Kin', time: '12:30 PM', duration: '52 min', status: 'Pending' },
  { name: 'John Doe', time: '4:30 PM', duration: '52 min', status: 'Completed' }
];

const notifications = {
  today: [
    { title: 'Mike Ross - Great Finish!', time: '11m ago', icon: <TodayMessageIcon /> },
    { title: 'John Doe - 50% Progress', time: '2 hrs ago', icon: <PercentageTodayIcon /> }
  ],
  yesterday: [
    { title: '7:00 AM – John Doe: Upper Body Strength', time: 'Yesterday',icon:<AvgSession /> },
    { title: '10:00 AM – Sarah Lee: Cardio & Core', time: 'Yesterday',icon:<AvgSession /> }
  ]
};

const clientProgress = [
  { name: 'David Lee', percent: 75 },
  { name: 'Sarah Kin', percent: 68 },
  { name: 'John Doe', percent: 52 }
];

const quickActions = [{name:'Add New Client', icon:<AddNewClient />}, {name:'AI Workout', icon:<AiWorkout />}, {name:'Messages', icon:<MessageIconn />}];

const CoachDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7] text-[#003F8F]">
      {/* Hero */}
      <div className="bg-[#326DB7] rounded-lg p-6 text-white relative">
    <div className="relative flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-medium font-[Poppins] mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'John'}!
        </h1>
        <p className="text-sm font-[Inter] mb-4">
          You're on a 7-day streak! Ready to crush today's workout?
        </p>
      </div>
 
      {/* Image shown only on larger screens and moved above parent */}
      <div className="hidden sm:flex sm:absolute sm:right-0 sm:-top-15 sm:items-end">
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

      {/* Quick Start */}
      <div>
        <p className="text-sm font-semibold text-[#003F8F] font-[Poppins] mb-3">Quick Start</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickStats.map((item, idx) => (
            <div  
              key={item.label}
              className={`rounded-2xl px-5 py-4 flex flex-col justify-between border border-[#E1E6F0] transition ${idx === 2 ? 'bg-[#4C5B7F] text-white' : 'bg-white text-[#003F8F]'
                }`}
            >
              <div className="flex items-center justify-between text-sm font-[Inter]">
                <span className={`${idx === 2 ? 'text-white/80' : 'text-gray-500'}`}>{item.label}</span>
                 {item.icon}
              </div>
              <p className="text-2xl font-semibold font-[Poppins] mt-3">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Clients list & sessions stats */}
          <div className="bg-white rounded-2xl p-6 space-y-5">
            <div className="bg-white rounded-2xl p-6 space-y-6">
              <p className="text-2xl font-semibold text-[#003F8F] font-[Poppins]">Clients List</p>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-4xl font-medium font-[Poppins] text-gray-500">2,000</p>
                    <span className="flex items-center gap-2 text-xs font-semibold text-[#2B7BFF] px-3 py-1 rounded-full border border-[#C7D8F7] bg-[#F3F7FF]">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-[#C7D8F7]"><ArrowUpIcon /></span>
                      82.5% <span className="text-gray-500">vs Last Month</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-md">
                  {[
                    { title: 'Male', value: 1200, percent: '70%' },
                    { title: 'Female', value: 800, percent: '30%' }
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-[#E6EBF5] px-4 py-3 bg-white shadow-sm">
                      <p className="text-sm text-gray-500 font-[Inter]">{item.title}</p>
                      <div className="flex items-center justify-between mt-2 gap-4">
                        <p className="text-2xl font-medium text-gray-500">{item.value}</p>
                        <span className="text-xs font-semibold text-gray-500 px-2 py-1 rounded-full bg-[#EAEAEA]">
                          {item.percent}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: 'Beginner', value: 700, percent: 35, color: 'bg-[#0B53BD]' },
                  { label: 'Intermediate', value: 750, percent: 37.5, color: 'bg-[#4A5C84]' },
                  { label: 'Advanced', value: 550, percent: 27.5, color: 'bg-[#E3C8B0]' }
                ].map((level) => (
                  <div key={level.label} className="rounded-2xl border border-[#E6EBF5] p-4 bg-white shadow-sm">
                    <p className="text-lg font-medium text-gray-500 font-[Poppins]">{level.value}</p>
                    <p className="text-sm text-gray-500 font-[Inter]">{level.label}</p>
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-[#003F8F] mb-1">{level.percent}%</p>
                      <div className="h-2 rounded-full bg-[#EEF2FB]">
                        <div className={`h-full rounded-full ${level.color}`} style={{ width: `${level.percent}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </div>

          {/* Sessions */}
          <div className="bg-white rounded-2xl p-6  space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold font-[Poppins] text-[#003F8F]">Sessions</p>
                <div className="relative flex-1 mt-4">
                  <input
                    placeholder="Search client here..."
                    className="w-full border border-[#E6EBF5] rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none"
                  />
                  <svg
                    className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 12.65z" />
                  </svg>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">

                <button 
                  onClick={() => navigate('/coach/dashboard/sessions')}
                  className="px-5 py-2 bg-[#003F8F] text-white rounded-xl text-sm font-semibold whitespace-nowrap hover:bg-[#002F6F] transition cursor-pointer"
                >
                  View All
                </button>
              </div>
            </div>

            <div className="flex w-full items-center gap-3 text-xs font-semibold text-[#5A6477]">
              <button className="w-8 h-10 rounded-lg border border-[#D7DCE5] bg-[#F5F6FA] flex items-center justify-center text-[#5A6477]">
                <ArrowLeftIcon />
              </button>

              <div className="flex gap-10 overflow-x-auto flex-1 ml-8">
                {['Mon 21', 'Tue 22', 'Wed 23', 'Thu 24', 'Fri 25', 'Sat 26', 'Sun 28', 'Mon 29', 'Tue 30'].map((day, idx) => {
                  const [dayName, date] = day.split(' ');
                  const isSelected = idx === 5;

                  return (
                    <button
                      key={`${day}-${idx}`}
                      className={`relative overflow-hidden min-w-[56px] px-2 py-1.5 rounded-xl border flex flex-col items-center gap-0.5
                      ${isSelected ? 'border-[#3F547D] text-black' : 'border-[#D7DCE5] text-black'}
                    `}
                    >
                      {/* TOP HALF BACKGROUND */}
                      <span
                        className={`absolute top-0 left-0 w-full h-1/2 
                        ${isSelected ? 'bg-[#3F547D]' : 'bg-[#E0E0E0]'}
                      `}
                      />

                      {/* CONTENT */}
                      <span className="relative z-10">{dayName}</span>
                      <span className="relative z-10">{date}</span>
                    </button>

                  );
                })}
              </div>

              <button className="w-8 h-10 rounded-lg border border-[#D7DCE5] bg-[#F5F6FA] flex items-center justify-center text-[#5A6477]">
                <ArrowRightIcon />
              </button>
            </div>



            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.name}
                  className="rounded-2xl border border-[#E6EBF5] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-[#003F8F]/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-[#E8F2FF] flex items-center justify-center text-[#003F8F] font-semibold">
                      {session.name.charAt(0)}
                    </span>
                    <div>
                      <p className="font-semibold font-[Poppins] text-[#003F8F]">{session.name}</p>
                      {/* <p className="text-xs text-gray-500 font-[Inter]">{session.time}</p> */}
                    </div>
                  </div>
                  <div className="flex flex-col">
                  <span className="text-sm text-[#003F8F] font-[Inter]">{session.duration} </span>
                  <span className="text-sm text-gray-500 font-[Inter]">Duration</span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${session.status === 'Completed' ? ' text-[#003F8F]' : 'text-[#F3701E]'
                      }`}
                  >
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Client Progress */}
          <div className="bg-white rounded-3xl p-6 space-y-5">
          <div>
                <p className="text-xl font-semibold text-[#003F8F]">Client Progress</p>
              </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-lg border border-[#CBD8FF]">
                  <button className="px-5 py-2 rounded-lg bg-[#003F8F] text-white text-sm font-semibold">
                    Weekly Target
                  </button>
                  <button className="px-5 py-2 rounded-lg text-[#0D4FB8] text-sm font-semibold">
                    Monthly Target
                  </button>
                </div>
               
              </div>
            </div>

            <div className="space-y-3">
              {clientProgress.map((client) => (
                <div
                  key={client.name}
                  className="rounded-2xl border border-[#E5EDFF] bg-white p-4 space-y-2 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[#0D4FB8] font-semibold">{client.name}</p>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#003F8F] text-white">
                        On Track
                      </span>
                    </div>
                    <p className="text-gray-500 font-semibold">{client.percent}%</p>
                  </div>
                  <div className="h-2 rounded-full bg-[#E4EAF5] overflow-hidden">
                    <div
                      className="h-full bg-[#FF7A00]"
                      style={{ width: `${client.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/coach/dashboard/client-progress')}
              className="px-4 py-2 border border-[#CBD8FF] rounded-xl flex items-center gap-2 text-[#0D4FB8] font-semibold text-sm cursor-pointer"
            >
                  See All
                  <span className="text-base"><ArrowRightIcon /></span>
                </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 space-y-6">
            <p className="text-lg font-semibold text-[#0A3D91]">Number of training Session</p>

            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32">
                <span className="absolute -top-2 -right-2 text-[10px] font-semibold text-[#0A3D91] bg-white border border-[#C7D8F7] rounded-full px-2 py-1 shadow-sm">
                  70%
                </span>
                <div className="absolute inset-0 rounded-full border-[12px] border-[#E6EDFF]"></div>
                <div className="absolute inset-0 rounded-full border-[12px] border-[#1F66D0] border-t-transparent border-l-transparent rotate-[200deg]"></div>
                <div className="absolute inset-[18px] bg-white rounded-full flex flex-col items-center justify-center">
                  <p className="text-xs text-[#7A88A8] font-semibold">Total</p>
                  <p className="text-3xl font-bold text-[#0A3D91]">16</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-[#0A3D91] px-3 py-1 rounded-full border border-[#C7D8F7] bg-[#F3F7FF] font-semibold">
                <span className="w-4 h-4 rounded-full border border-[#C7D8F7] inline-flex items-center justify-center text-[10px]">
                  ↗
                </span>
                25% vs Last Week
              </span>
            </div>

            <div className="space-y-3 text-sm font-[Inter]">
              {[
                { label: 'Weekly Session Goals', value: '20', icon: <WeeklyGoalIcon /> },
                { label: 'Avg Session Per Client', value: '3', icon: <AvgSession /> }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="px-4 py-3 rounded-xl border border-[#E5EDFF] bg-white flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2 text-[#0A3D91]">
                    <span className="w-6 h-6 rounded-xl border border-[#E5EDFF] flex items-center justify-center text-[12px]">
                      {stat.icon}
                    </span>
                    <span>{stat.label}</span>
                  </div>
                  <span className="font-semibold text-[#0A3D91]">{stat.value}<span className="text-xs text-gray-500"> Sessions</span></span>
                </div>
              ))}
            </div>
          </div>
          {/* Notifications */}
          <div className="bg-white rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xl font-semibold text-[#0A3D91]">Notifications</p>
              <button className="px-4 py-2 rounded-xl bg-[#0A3D91] text-white text-sm font-semibold cursor-pointer">
                View All
              </button>
            </div>

            <div className="space-y-4 text-sm font-[Inter]">
              <p className="text-xs font-semibold text-[#0A3D91]">Today</p>
              {notifications.today.map((note) => (
                <div
                  key={note.title}
                  className="flex items-center justify-between px-4 py-3 border border-[#E5EDFF] rounded-xl bg-white shadow-sm gap-4"
                >
                  <div className="flex items-center gap-3 text-[#0A3D91]">
                    <span className="w-7 h-7 rounded-xl border border-[#E5EDFF] flex items-center justify-center text-[13px]">
                      {note.icon}
                    </span>
                    <span className="font-semibold">{note.title}</span>
                  </div>
                  <span className="text-xs text-[#0A3D91] whitespace-nowrap">{note.time}</span>
                </div>
              ))}

              <p className="text-xs font-semibold text-[#0A3D91] pt-2">Yesterday</p>
              {notifications.yesterday.map((note) => (
                <div
                  key={note.title}
                  className="flex items-center justify-between px-4 py-3 border border-[#E5EDFF] rounded-xl bg-white shadow-sm gap-4"
                >
                  <div className="flex items-center gap-3 text-[#0A3D91]">
                    <span className="w-7 h-7 rounded-xl border border-[#E5EDFF] flex items-center justify-center text-[13px]">
                      {note.icon}
                    </span>
                    <span className="font-semibold">{note.title}</span>
                  </div>
                  <span className="text-xs text-[#0A3D91] whitespace-nowrap">{note.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-6 space-y-4">
            <p className="text-xl font-semibold text-[#0A3D91]">Quick Actions</p>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={action}
                  className="w-full flex items-center gap-3 rounded-xl border border-[#C7D8F7] px-4 py-3 text-[#0A3D91] text-sm font-semibold hover:bg-[#F5F8FF] transition"
                >
                  <span className="w-6 h-6 rounded-xl border border-[#C7D8F7] flex items-center justify-center text-[12px]">
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

