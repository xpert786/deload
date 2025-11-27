import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from '../../../ClientDashboard/Components/icons';

const UserManagement = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('Sort By');
  const [registrationDateFilter, setRegistrationDateFilter] = useState('Registration Date');
  const [selectedRow, setSelectedRow] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  
  const statusDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const dateDropdownRef = useRef(null);

  // Dropdown options
  const statusOptions = ['All Status', 'Active', 'Inactive', 'Pending'];
  const sortOptions = ['Sort By', 'Name (A-Z)', 'Name (Z-A)', 'Registration Date (Newest)', 'Registration Date (Oldest)', 'Last Login (Recent)'];
  const dateOptions = ['Registration Date', 'Today', 'This Week', 'This Month', 'Last 3 Months', 'This Year'];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) {
        setShowDateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sample user data
  const users = [
    { id: 'C101', name: 'Jane Doe', status: 'Active', registrationDate: '20 June 2025', lastLogin: '2 min ago' },
    { id: 'C102', name: 'John Smith', status: 'Inactive', registrationDate: '15 July 2025', lastLogin: '5 min ago' },
    { id: 'C103', name: 'Alice Johnson', status: 'Active', registrationDate: '10 August 2025', lastLogin: '10 min ago' },
    { id: 'C104', name: 'Bob Brown', status: 'Inactive', registrationDate: '25 September 2025', lastLogin: '15 min ago' },
    { id: 'C105', name: 'Emily Davis', status: 'Active', registrationDate: '30 October 2025', lastLogin: '20 min ago' },
    { id: 'C106', name: 'Michael Wilson', status: 'Inactive', registrationDate: '5 November 2025', lastLogin: '25 min ago' },
    { id: 'C107', name: 'Sarah Clark', status: 'Active', registrationDate: '12 December 2025', lastLogin: '30 min ago' }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      Active: 'bg-[#10B981] text-white',
      Inactive: 'bg-[#10B981] text-white'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.Inactive}`}>
        {status}
      </span>
    );
  };

  const totalPages = 10;
  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 7); i++) {
    if (i <= 2 || i > totalPages - 2 || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7]">
      {/* Header Section */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">
              User Management
            </h1>
            <p className="text-sm sm:text-base text-[#4D6080] font-[Inter] mt-2">
              Manage all users, coaches, and clients in the Deload Fitness platform.
            </p>
          </div>
          <button className="px-4 py-2 bg-[#003F8F] text-white rounded-lg text-sm font-semibold hover:bg-[#002F6F] transition flex items-center gap-2 whitespace-nowrap">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add New Coach
          </button>
        </div>
      </div>

      {/* Main White Card - Search, Filters, and Table */}
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Search and Filter Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-20 items-center">
            {/* Search Bar */}
            <div className="relative w-full sm:w-auto sm:max-w-[300px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search Client here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-3">
              {/* Status Dropdown */}
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowSortDropdown(false);
                    setShowDateDropdown(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#003F8F] hover:bg-gray-50 active:text-[#003F8F] focus:text-[#003F8F] transition flex items-center gap-2"
                >
                  {statusFilter}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`}
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="#003F8F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showStatusDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[160px]">
                    {statusOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setStatusFilter(option);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                          statusFilter === option ? 'text-[#003F8F] font-semibold bg-gray-50' : 'text-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown);
                    setShowStatusDropdown(false);
                    setShowDateDropdown(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#003F8F] hover:bg-gray-50 active:text-[#003F8F] focus:text-[#003F8F] transition flex items-center gap-2"
                >
                  {sortBy}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="#003F8F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showSortDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[200px]">
                    {sortOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                          sortBy === option ? 'text-[#003F8F] font-semibold bg-gray-50' : 'text-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Registration Date Dropdown */}
              <div className="relative" ref={dateDropdownRef}>
                <button
                  onClick={() => {
                    setShowDateDropdown(!showDateDropdown);
                    setShowStatusDropdown(false);
                    setShowSortDropdown(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#003F8F] hover:bg-gray-50 active:text-[#003F8F] focus:text-[#003F8F] transition flex items-center gap-2"
                >
                  {registrationDateFilter}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform ${showDateDropdown ? 'rotate-180' : ''}`}
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="#003F8F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showDateDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[180px]">
                    {dateOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setRegistrationDateFilter(option);
                          setShowDateDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                          registrationDateFilter === option ? 'text-[#003F8F] font-semibold bg-gray-50' : 'text-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="border-b border-gray-200 px-4 py-4 overflow-x-auto ml-3">
          <div className="grid grid-cols-6 gap-2 sm:gap-4 min-w-[800px]">
            <div className="text-sm font-semibold text-[#4B5563] font-[Inter]">User ID</div>
            <div className="text-sm font-semibold text-[#4B5563] font-[Inter]">Name</div>
            <div className="text-sm font-semibold text-[#4B5563] font-[Inter]">Status</div>
            <div className="text-sm font-semibold text-[#4B5563] font-[Inter]">Registration Date</div>
            <div className="text-sm font-semibold text-[#4B5563] font-[Inter]">Last Login</div>
            <div className="text-sm font-semibold text-[#4B5563] font-[Inter]">Actions</div>
          </div>
        </div>

        {/* User Rows - Individual Bordered Cards */}
        <div className="p-4 space-y-3 bg-white overflow-x-auto">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedRow(user.id)}
              className={`grid grid-cols-6 gap-2 sm:gap-4 items-center px-4 py-4 rounded-lg border border-gray-200 transition cursor-pointer min-w-[800px] ${
                selectedRow === user.id ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-[#003F8F] font-[Inter]">{user.id}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#003F8F] font-[Inter]">{user.name}</p>
              </div>
              <div>
                {getStatusBadge(user.status)}
              </div>
              <div>
                <p className="text-sm text-[#003F8F] font-semibold font-[Inter]">{user.registrationDate}</p>
              </div>
              <div>
                <p className="text-sm text-[#003F8F] font-semibold font-[Inter]">{user.lastLogin}</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle delete
                    }}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition cursor-pointer"
                  >
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="4" fill="white" fillOpacity="0.5" />
                      <rect x="0.25" y="0.25" width="23.5" height="23.5" rx="3.75" stroke="#4D6080" strokeOpacity="0.3" strokeWidth="0.5" />
                      <path d="M16.7218 8.66406H7.27734" stroke="#003F8F" strokeLinecap="round" />
                      <path d="M8.94336 8.66667H9.00447C9.22805 8.66095 9.4447 8.5879 9.62609 8.45706C9.80748 8.32622 9.94517 8.14369 10.0211 7.93333L10.04 7.87611L10.0939 7.71444C10.14 7.57611 10.1634 7.50722 10.1939 7.44833C10.254 7.33299 10.3403 7.23333 10.4458 7.15731C10.5514 7.08129 10.6733 7.03103 10.8017 7.01056C10.8667 7 10.9395 7 11.085 7H12.9128C13.0584 7 13.1311 7 13.1961 7.01056C13.3246 7.03103 13.4464 7.08129 13.552 7.15731C13.6575 7.23333 13.7438 7.33299 13.8039 7.44833C13.8345 7.50722 13.8578 7.57611 13.9039 7.71444L13.9578 7.87611C14.0282 8.11015 14.1738 8.31445 14.3721 8.45737C14.5703 8.60029 14.8102 8.67385 15.0545 8.66667" stroke="#003F8F" />
                      <path d="M8.20312 10.0547L8.45868 13.888C8.55701 15.3625 8.6059 16.0997 9.08646 16.5491C9.56757 16.9991 10.3065 16.9991 11.7842 16.9991H12.2142C13.6926 16.9991 14.4315 16.9986 14.912 16.5491C15.3926 16.0997 15.442 15.3625 15.5403 13.888L15.7953 10.0547" stroke="#003F8F" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/clients/${user.id}`);
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-[#003F8F] rounded hover:bg-[#002F6F] transition cursor-pointer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="4" fill="#003F8F" />
                      <path d="M6.16602 11.9974C6.16602 11.9974 7.91602 7.91406 11.9993 7.91406C16.0827 7.91406 17.8327 11.9974 17.8327 11.9974C17.8327 11.9974 16.0827 16.0807 11.9993 16.0807C7.91602 16.0807 6.16602 11.9974 6.16602 11.9974Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 13.75C12.9665 13.75 13.75 12.9665 13.75 12C13.75 11.0335 12.9665 10.25 12 10.25C11.0335 10.25 10.25 11.0335 10.25 12C10.25 12.9665 11.0335 13.75 12 13.75Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 py-4 border-t border-gray-200 px-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {pages.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={page === '...'}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition ${
                page === currentPage
                  ? 'bg-[#003F8F] text-white'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4L10 8L6 12" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
