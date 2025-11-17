import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SearchIcon, DeleteIcon, EyeIconTable, PreviousIcon, NextIcon } from '../Components/Icons';
import { ArrowLeftIcon } from '../../ClientDashboard/Components/icons';

// Sample workout plans data
const workoutPlansData = [
  { 
    id: 1, 
    title: 'Upper Body Power', 
    description: '4 sets x 8-10 reps', 
    level: 'Beginner',
    icon: '💪',
    image: 'dumbbell'
  },
  { 
    id: 2, 
    title: 'Cardio Blast', 
    description: '30 min run', 
    level: 'Intermediate',
    icon: '🏃',
    image: 'running'
  },
  { 
    id: 3, 
    title: 'Full Body Strength', 
    description: '3 sets x 10-12 reps', 
    level: 'Advanced',
    icon: '🏋️',
    image: 'pullup'
  },
  { 
    id: 4, 
    title: 'Core Conditioning', 
    description: '5 sets x 15 reps', 
    level: 'Beginner',
    icon: '🧘',
    image: 'core'
  },
  { 
    id: 5, 
    title: 'Leg Day Power', 
    description: '4 sets x 8-10 reps', 
    level: 'Intermediate',
    icon: '🦵',
    image: 'legs'
  },
  { 
    id: 6, 
    title: 'HIIT Training', 
    description: '20 min interval', 
    level: 'Advanced',
    icon: '⚡',
    image: 'hiit'
  },
];

const ClientWorkoutPlans = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 6;

  const filters = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Filter plans based on selected filter and search query
  const filteredPlans = workoutPlansData.filter(plan => {
    const matchesFilter = selectedFilter === 'All' || plan.level === selectedFilter;
    const matchesSearch = 
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Paginate plans
  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * plansPerPage,
    currentPage * plansPerPage
  );

  const totalPages = Math.ceil(filteredPlans.length / plansPerPage);

  const handleView = (planId) => {
    console.log('View plan:', planId);
    // Add view functionality here
  };

  const handleDelete = (planId) => {
    console.log('Delete plan:', planId);
    // Add delete functionality here
  };

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-[#E5EDFF] text-[#003F8F]';
      case 'Intermediate':
        return 'bg-[#E5EDFF] text-[#003F8F]';
      case 'Advanced':
        return 'bg-[#E5EDFF] text-[#003F8F]';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7] text-[#003F8F]">
      <div className="bg-white rounded-3xl p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/coach/clients')}
              className="w-8 h-8 rounded-lg border border-gray-300 bg-white flex items-center justify-center text-[#003F8F] hover:bg-gray-50 transition"
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#003F8F] font-[Poppins]">Workout Plans</h1>
          </div>

          {/* Filters, Search, and Add Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 lg:justify-end">
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setSelectedFilter(filter);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    selectedFilter === filter
                      ? 'bg-[#003F8F] text-white'
                      : 'bg-white text-gray-500 border border-gray-300 hover:border-[#003F8F] hover:text-[#003F8F]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search plans"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Add New Plan Button */}
            <button
              onClick={() => {
                // Add new plan functionality
                console.log('Add new plan');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition-all duration-200 border border-[#003F8F] relative whitespace-nowrap"
              style={{
                boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.3), 0 0 8px rgba(59, 130, 246, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <path
                  d="M8 3V13M3 8H13"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Add New Plan</span>
            </button>
          </div>
        </div>

        {/* Workout Plans Grid */}
        {paginatedPlans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Level Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getLevelBadgeColor(plan.level)}`}>
                    {plan.level}
                  </span>
                </div>

                {/* Icon/Image */}
                <div className="w-12 h-12 rounded-full bg-[#E5EDFF] flex items-center justify-center mb-4 text-2xl">
                  {plan.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-[#003F8F] font-[Poppins] mb-2">{plan.title}</h3>

                {/* Description */}
                <p className="text-sm text-gray-600 font-[Inter] mb-4">{plan.description}</p>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="px-4 py-2 bg-white text-[#003F8F] border border-gray-300 rounded-lg font-semibold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                      <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={() => handleView(plan.id)}
                    className="px-4 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                      <path d="M8 3C4.66667 3 2.07333 5.07333 1 8C2.07333 10.9267 4.66667 13 8 13C11.3333 13 13.9267 10.9267 15 8C13.9267 5.07333 11.3333 3 8 3ZM8 11.3333C6.16 11.3333 4.66667 9.84 4.66667 8C4.66667 6.16 6.16 4.66667 8 4.66667C9.84 4.66667 11.3333 6.16 11.3333 8C11.3333 9.84 9.84 11.3333 8 11.3333ZM8 6C6.89333 6 6 6.89333 6 8C6 9.10667 6.89333 10 8 10C9.10667 10 10 9.10667 10 8C10 6.89333 9.10667 6 8 6Z" fill="white"/>
                    </svg>
                    <span>View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No workout plans found matching your criteria.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg border border-gray-300 flex items-center justify-center gap-2 ${
                currentPage === 1
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#003F8F] hover:bg-gray-50'
              }`}
            >
              <PreviousIcon />
              <span className="text-sm font-semibold">Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {[1, 2].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-10 rounded-lg text-sm font-semibold ${
                    currentPage === page
                      ? 'bg-[#003F8F] text-white'
                      : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              {currentPage > 2 && currentPage < 9 && (
                <>
                  <span className="px-2 text-gray-500">...</span>
                  <button
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
                      : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg border border-gray-300 flex items-center justify-center gap-2 ${
                currentPage === totalPages
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#003F8F] hover:bg-gray-50'
              }`}
            >
              <span className="text-sm font-semibold">Next</span>
              <NextIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientWorkoutPlans;

