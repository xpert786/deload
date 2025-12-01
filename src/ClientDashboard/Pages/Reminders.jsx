import React from 'react';
import { RemindersIcon } from '../Components/icons';

const upcomingReminders = [
  {
    id: 1,
    title: 'Lower Body Strength',
    date: '2024-01-13',
    timeAgo: '1 Day Ago'
  },
  {
    id: 2,
    title: 'Upper Body Hypertrophy',
    date: '2024-01-13',
    timeAgo: '1 Day Ago'
  }
];

const yesterdayReminders = [
  {
    id: 3,
    title: 'Lower Body Strength',
    date: '2024-01-13',
    timeAgo: '1 Day Ago'
  },
  {
    id: 4,
    title: 'Lower Body Strength',
    date: '2024-01-13',
    timeAgo: '1 Day Ago'
  }
];

const ReminderCard = ({ reminder }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-[#E4E9F2] p-4 bg-white">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full border border-[#003F8F] flex items-center justify-center text-[#003F8F]">
       <RemindersIcon />
      </div>
      <div>
        <p className="text-[#003F8F] font-semibold font-[Inter]">{reminder.title}</p>
        <p className="text-sm text-gray-500 font-[Inter]">{reminder.date}</p>
      </div>
    </div>
    <div className="flex items-center gap-1 text-sm text-[#003F8F] font-medium font-[Inter]">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {reminder.timeAgo}
    </div>
  </div>
);

const Reminders = () => {
  return (
    <div className="space-y-6 px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 bg-[#F7F7F7]">
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium text-[#003F8F] font-[Poppins]">
          Reminders
        </h1>
        <p className="text-gray-600 font-[Inter]">Manage your workout, hydration, and motivational alerts.</p>
      </div>

      <div className="rounded-3xl bg-white p-4 sm:p-6 space-y-6">
        <div className="space-y-4">
          {upcomingReminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-400 font-semibold font-[Inter]">Yesterday</p>
          {yesterdayReminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reminders;

