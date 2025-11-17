import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon } from '../../ClientDashboard/Components/icons';

// Full sessions list matching the image
const allSessions = [
  { id: 1, name: 'David lee', duration: '52 min', status: 'Completed' },
  { id: 2, name: 'Sarah Kin', duration: '', status: 'Pending' },
  { id: 3, name: 'John Doe', duration: '52 min', status: 'Completed' },
  { id: 4, name: 'Jane Smith', duration: '34 min', status: 'In Progress' },
  { id: 5, name: 'Alice Johnson', duration: '45 min', status: 'Completed' },
  { id: 6, name: 'Bob Brown', duration: '27 min', status: 'Completed' },
  { id: 7, name: 'Charlie Davis', duration: '48 min', status: 'In Progress' },
  { id: 8, name: 'Diana Evans', duration: '60 min', status: 'Completed' },
  { id: 9, name: 'Ethan Foster', duration: '30 min', status: 'Completed' },
];

const dateOptions = [
  'Mon 21', 'Tue 22', 'Wed 23', 'Thur 24', 'Fri 25', 'Sat 26', 'Sun 27',
  'Mon 28', 'Tue 29', 'Wed 30', 'Thr 31', 'Fri 01', 'Sat 02', 'Sun 03', 'Mon 04'
];

const Sessions = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(5); // Sat 26 is selected
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const sessionsPerPage = 9;

  // Filter sessions based on search query
  const filteredSessions = allSessions.filter(session =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate sessions
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * sessionsPerPage,
    currentPage * sessionsPerPage
  );

  const scrollDates = (direction) => {
    if (direction === 'left' && selectedDate > 0) {
      setSelectedDate(selectedDate - 1);
    } else if (direction === 'right' && selectedDate < dateOptions.length - 1) {
      setSelectedDate(selectedDate + 1);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'text-[#003F8F]';
      case 'Pending':
        return 'text-[#F3701E]';
      case 'In Progress':
        return 'text-[#003F8F]';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6 text-[#003F8F]">
    

      <div className="bg-white rounded-3xl p-6 space-y-6">
          {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl sm:text-3xl font-bold text-[#003F8F] font-[Poppins]">Sessions</h2>
        <button
          onClick={() => navigate('/coach/dashboard')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#003F8F] hover:bg-[#F3F7FF] rounded-lg transition"
        >
          <ArrowLeftIcon />
          Back to Dashboard
        </button>
      </div>
        {/* Search Bar */}
        <div className="relative w-fit">
          <input
            type="text"
            placeholder="Search Client here..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full border border-[#E6EBF5] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#003F8F]"
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

        {/* Date Selector */}
        <div className="flex w-full items-center gap-3 text-xs font-semibold text-[#5A6477]">
          <button
            onClick={() => scrollDates('left')}
            disabled={selectedDate === 0}
            className={`w-8 h-10 rounded-lg border border-[#D7DCE5] flex items-center justify-center ${
              selectedDate === 0
                ? 'bg-[#F5F6FA] text-gray-400 cursor-not-allowed'
                : 'bg-[#F5F6FA] text-[#5A6477] hover:bg-[#E8E8E8]'
            }`}
          >
            <ArrowLeftIcon />
          </button>

          <div className="flex gap-2 sm:gap-6 px-30 overflow-x-auto flex-1 hide-scrollbar">
            {dateOptions.map((day, idx) => {
              const [dayName, date] = day.split(' ');
              const isSelected = idx === selectedDate;

              return (
                <button
                  key={`${day}-${idx}`}
                  onClick={() => setSelectedDate(idx)}
                  className={`relative overflow-hidden min-w-[60px] px-2 py-1.5 rounded-xl border flex flex-col items-center gap-0.5 flex-shrink-0
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
                  <span className="relative z-10 text-xs font-semibold">{dayName}</span>
                  <span className="relative z-10 text-xs font-semibold">{date}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollDates('right')}
            disabled={selectedDate === dateOptions.length - 1}
            className={`w-8 h-10 rounded-lg border border-[#D7DCE5] flex items-center justify-center ${
              selectedDate === dateOptions.length - 1
                ? 'bg-[#F5F6FA] text-gray-400 cursor-not-allowed'
                : 'bg-[#F5F6FA] text-[#5A6477] hover:bg-[#E8E8E8]'
            }`}
          >
            <ArrowRightIcon />
          </button>
        </div>

        {/* Sessions List */}
        <div className="space-y-3">
          {paginatedSessions.length > 0 ? (
            paginatedSessions.map((session) => {
              const isPending = session.status === 'Pending';
              
              return (
                <div
                  key={session.id}
                  className={`rounded-2xl border border-[#E6EBF5] px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 transition ${
                    isPending
                      ? 'bg-[#FFF4E6] hover:border-[#003F8F]/10'
                      : 'bg-white hover:border-[#003F8F]/40'
                  }`}
                >
                  {/* Numbered Circle */}
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                      isPending
                        ? 'border border-[#003F8F] text-[#003F8F]'
                        : 'border border-[#003F8F] text-[#003F8F]'
                    }`}>
                      {session.id}
                    </span>
                    <p className="font-medium font-[Poppins] text-[#003F8F] text-base sm:text-lg">
                      {session.name}
                    </p>
                  </div>

                  {/* Duration */}
                  {session.duration && (
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-sm text-[#003F8F] font-[Inter] font-medium">
                        {session.duration}
                      </span>
                      <span className="text-xs text-gray-500 font-[Inter]">Duration</span>
                    </div>
                  )}

                  {/* Status */}
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${
                      getStatusColor(session.status)
                    } ${
                      isPending
                          ? ''
                        : session.status === 'Completed'
                        ? 'text-[#003F8F]'
                        : 'text-[#003F8F]'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              No sessions found matching your search.
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredSessions.length > sessionsPerPage && (
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-[#E5EDFF]">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`w-8 h-10 rounded-lg border border-[#D7DCE5] flex items-center justify-center ${
                currentPage === 1
                  ? 'bg-[#F5F6FA] text-gray-400 cursor-not-allowed'
                  : 'bg-[#F5F6FA] text-[#5A6477] hover:bg-[#E8E8E8]'
              }`}
            >
              <ArrowLeftIcon />
            </button>

            <div className="flex items-center gap-1">
              {[1, 2].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-10 rounded-lg text-sm font-semibold ${
                    currentPage === page
                      ? 'bg-[#003F8F] text-white'
                      : 'bg-white text-gray-500 border border-[#D7DCE5] hover:bg-[#F5F6FA]'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              {currentPage > 2 && currentPage < 9 && (
                <>
                  <span className="px-2 text-gray-500">...</span>
                  <button
                    onClick={() => setCurrentPage(currentPage)}
                    className="w-8 h-10 rounded-lg text-sm font-semibold bg-[#003F8F] text-white"
                  >
                    {currentPage}
                  </button>
                  <span className="px-2 text-gray-500">...</span>
                </>
              )}

              {currentPage <= 2 && <span className="px-2 text-gray-500">...</span>}

              {[9, 10].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-10 rounded-lg text-sm font-semibold ${
                    currentPage === page
                      ? 'bg-[#003F8F] text-white'
                      : 'bg-white text-gray-500 border border-[#D7DCE5] hover:bg-[#F5F6FA]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(10, prev + 1))}
              disabled={currentPage === 10}
              className={`w-8 h-10 rounded-lg border border-[#D7DCE5] flex items-center justify-center ${
                currentPage === 10
                  ? 'bg-[#F5F6FA] text-gray-400 cursor-not-allowed'
                  : 'bg-[#F5F6FA] text-[#5A6477] hover:bg-[#E8E8E8]'
              }`}
            >
              <ArrowRightIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;

