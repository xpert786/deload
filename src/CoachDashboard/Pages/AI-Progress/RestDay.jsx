import React from 'react';

const RestDay = ({ onBack, onToggle, day = 'Mon' }) => {
  return (
    <div className="h-screen flex flex-col bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-[#003F8F] text-white p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold font-[Poppins]">AI Chatbox</h2>
        <button className="px-4 py-2 bg-[#FB923C] text-white rounded-lg font-semibold text-sm hover:bg-[#EA7A1A] transition">
          + Assign To Client
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-[#003F8F] font-[Poppins]">John's Weekly Workout Plan</h3>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition">
              + Add Workout
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition">
              Edit
            </button>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <button
              key={d}
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                d === day
                  ? 'bg-[#003F8F] text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {d}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-600 font-[Inter]">Toggle Rest Day</span>
            <button
              onClick={onToggle}
              className="w-12 h-6 rounded-full bg-[#003F8F] transition"
            >
              <div className="w-5 h-5 bg-white rounded-full transform translate-x-6"></div>
            </button>
          </div>
        </div>

        {/* Rest Day Content */}
        <div className="bg-white rounded-xl p-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="mb-6">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                <rect width="80" height="80" rx="8" fill="#E5EDFF"/>
                <path d="M40 30V50M30 40H50" stroke="#003F8F" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-[#003F8F] font-[Poppins] mb-2">Rest & Recovery</h4>
            <p className="text-base text-gray-600 font-[Inter]">Active recovery or complete rest day</p>
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestDay;

