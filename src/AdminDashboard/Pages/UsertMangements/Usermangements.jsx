import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { SearchIcon } from '../../../ClientDashboard/Components/icons';

// Use API URL from .env file only
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const coachingCategories = ['Fitness', 'Life Coaching', 'Yoga', 'Sports', 'Nutrition'];

const UserManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('Sort By');
  const [registrationDateFilter, setRegistrationDateFilter] = useState('Registration Date');
  const [selectedRow, setSelectedRow] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showAddCoach, setShowAddCoach] = useState(false);

  // Add Coach Form State
  const [coachFormData, setCoachFormData] = useState({
    fullname: '',
    email: '',
    phone_number: '',
    address: '',
    years_of_experience: '',
    coaching_categories: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);


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

  // Fetch users data from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        // Get authentication token
        let token = null;
        const storedUser = localStorage.getItem('user');

        if (user) {
          token = user.token || user.access_token || user.authToken || user.accessToken;
        }

        if (!token && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            token = userData.token || userData.access_token || userData.authToken || userData.accessToken;
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }

        if (!token) {
          token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');
        }

        const isValidToken = token &&
          typeof token === 'string' &&
          token.trim().length > 0 &&
          token.trim() !== 'null' &&
          token.trim() !== 'undefined' &&
          token.trim() !== '';

        // Ensure API_BASE_URL doesn't have trailing slash
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        const apiUrl = `${baseUrl}/usermanagement/`;

        // Prepare headers
        const headers = {
          'Content-Type': 'application/json',
        };

        if (isValidToken) {
          headers['Authorization'] = `Bearer ${token.trim()}`;
        }

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: headers,
          credentials: 'include',
        });

        let result;
        try {
          const responseText = await response.text();

          if (responseText) {
            result = JSON.parse(responseText);
          } else {
            result = {};
          }
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          setError('Failed to parse server response. Please try again.');
          setLoadingUsers(false);
          return;
        }

        if (response.ok && result.data) {
          // Map API response to UI format
          const mappedUsers = result.data.map((coach) => ({
            id: coach.id,
            name: coach.fullname,
            email: coach.email,
            status: coach.is_active ? 'Active' : 'Inactive',
            registrationDate: coach.joined_ago || 'N/A',
            lastLogin: coach.last_login_ago || 'Never',
            role: coach.role || 'coach'
          }));

          setUsers(mappedUsers);
          // Reset to first page when new data is loaded
          setCurrentPage(1);
        } else {
          setError(result.message || 'Failed to fetch users. Please try again.');
        }
      } catch (err) {
        console.error('Fetch users error:', err);
        setError('Network error: Unable to fetch users. Please check your connection.');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [user, showAddCoach]); 

  // Category mapping for API
  const categoryMapping = {
    'Fitness': 'fitness',
    'Life Coaching': 'life_coaching',
    'Yoga': 'yoga',
    'Sports': 'sports',
    'Nutrition': 'nutrition'
  };

  const toggleCategory = (category) => {
    setCoachFormData((prev) => ({
      ...prev,
      coaching_categories: prev.coaching_categories.includes(category)
        ? prev.coaching_categories.filter((item) => item !== category)
        : [...prev.coaching_categories, category]
    }));
  };

  const handleCoachFormChange = (e) => {
    const { name, value } = e.target;
    setCoachFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleAddCoach = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      // Validation
      if (!coachFormData.fullname.trim()) {
        setError('Name is required');
        setLoading(false);
        return;
      }
      if (!coachFormData.email.trim()) {
        setError('Email is required');
        setLoading(false);
        return;
      }
      if (!coachFormData.phone_number.trim()) {
        setError('Phone number is required');
        setLoading(false);
        return;
      }
      if (!coachFormData.address.trim()) {
        setError('Address is required');
        setLoading(false);
        return;
      }
      if (coachFormData.coaching_categories.length === 0) {
        setError('Please select at least one coaching category');
        setLoading(false);
        return;
      }

      // Prepare data for API
      const submitData = {
        username: coachFormData.email.split('@')[0], 
        fullname: coachFormData.fullname,
        email: coachFormData.email,
        phone_number: coachFormData.phone_number,
        address: coachFormData.address,
        years_of_experience: coachFormData.years_of_experience || '0',
        coaching_categories: coachFormData.coaching_categories.map(cat =>
          categoryMapping[cat] || cat.toLowerCase().replace(/\s+/g, '_')
        )
      };

      // Get authentication token
      let token = null;
      const storedUser = localStorage.getItem('user');

      if (user) {
        token = user.token || user.access_token || user.authToken || user.accessToken;
      }

      if (!token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token || userData.access_token || userData.authToken || userData.accessToken;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      }

      const isValidToken = token &&
        typeof token === 'string' &&
        token.trim().length > 0 &&
        token.trim() !== 'null' &&
        token.trim() !== 'undefined' &&
        token.trim() !== '';

      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const apiUrl = `${baseUrl}/addcoach/`;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      let result;
      try {
        const responseText = await response.text();

        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = {};
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setError('Failed to parse server response. Please try again.');
        setLoading(false);
        return;
      }

      if (response.ok) {
        setSuccess(true);
        // Reset form
        setCoachFormData({
          fullname: '',
          email: '',
          phone_number: '',
          address: '',
          years_of_experience: '',
          coaching_categories: []
        });

        // Close modal after 2 seconds and refresh user list
        setTimeout(() => {
          setShowAddCoach(false);
          setSuccess(false);
          // Trigger useEffect to refetch users
          setLoadingUsers(true);
        }, 2000);
      } else {
        // Handle different error formats
        let errorMessage = 'Failed to add coach. Please try again.';

        if (result.message) {
          errorMessage = result.message;
        } else if (result.error) {
          errorMessage = result.error;
        } else if (result.detail) {
          errorMessage = result.detail;

          if (result.detail.includes('Authentication') || result.detail.includes('credentials')) {
            errorMessage = 'Authentication required. Please make sure you are logged in.';
          }
        }

        setError(errorMessage);
      }
    } catch (err) {
      if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
        setError('Network error: Unable to connect to the server. Please check your connection.');
      } else {
        setError(`Error: ${err.message || 'Failed to add coach. Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddCoach(false);
    setError('');
    setSuccess(false);
    setCoachFormData({
      fullname: '',
      email: '',
      phone_number: '',
      address: '',
      years_of_experience: '',
      coaching_categories: []
    });
  };

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      handleDeleteUser(userToDelete);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async (userId) => {
    setDeletingUserId(userId);
    setError('');

    try {
      // Get authentication token
      let token = null;
      const storedUser = localStorage.getItem('user');

      if (user) {
        token = user.token || user.access_token || user.authToken || user.accessToken;
      }

      if (!token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token || userData.access_token || userData.authToken || userData.accessToken;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      }

      const isValidToken = token &&
        typeof token === 'string' &&
        token.trim().length > 0 &&
        token.trim() !== 'null' &&
        token.trim() !== 'undefined' &&
        token.trim() !== '';

      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const apiUrl = `${baseUrl}/delete/${userId}/`;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: headers,
        credentials: 'include',
      });

      let result;
      try {
        const responseText = await response.text();

        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = {};
        }
      } catch (parseError) {
        console.error('Failed to parse delete response:', parseError);
        // Even if parsing fails, check if status is ok
        if (response.ok) {
          // Success - remove user from list
          setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
          
          // Show success message
          setDeleteSuccess(true);
          setTimeout(() => {
            setDeleteSuccess(false);
          }, 3000);
          
          setDeletingUserId(null);
          return;
        }
        setError('Failed to parse server response. Please try again.');
        setDeletingUserId(null);
        return;
      }

      if (response.ok) {
        // Remove user from list
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
        
        // Show success message
        setDeleteSuccess(true);
        setTimeout(() => {
          setDeleteSuccess(false);
        }, 3000);
        
        // Reset to page 1 if current page becomes empty
        if (currentPage > 1 && filteredAndSortedUsers.length <= itemsPerPage) {
          setCurrentPage(1);
        }
      } else {
        // Handle different error formats
        let errorMessage = 'Failed to delete user. Please try again.';

        if (result.message) {
          errorMessage = result.message;
        } else if (result.error) {
          errorMessage = result.error;
        } else if (result.detail) {
          errorMessage = result.detail;
        }

        setError(errorMessage);
      }
    } catch (err) {
      if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
        setError('Network error: Unable to connect to the server. Please check your connection.');
      } else {
        setError(`Error: ${err.message || 'Failed to delete user. Please try again.'}`);
      }
    } finally {
      setDeletingUserId(null);
    }
  };

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

  // Filter and sort users
  const getFilteredAndSortedUsers = () => {
    let filteredUsers = [...users];

    // Apply Registration Date Filter
    if (registrationDateFilter !== 'Registration Date') {
      const now = new Date();
      filteredUsers = filteredUsers.filter((user) => {
        const joinedDate = user.registrationDate;
        if (!joinedDate || joinedDate === 'N/A') return false;

        // Parse relative time strings like "33 minutes ago", "1 hour ago", "1 day, 21 hours ago"
        const parseRelativeTime = (timeStr) => {
          if (!timeStr || timeStr === 'Never' || timeStr === 'N/A') return null;

          const minutesMatch = timeStr.match(/(\d+)\s*minutes?\s*ago/);
          if (minutesMatch) {
            return new Date(now.getTime() - parseInt(minutesMatch[1]) * 60 * 1000);
          }

          const hoursMatch = timeStr.match(/(\d+)\s*hours?/);
          if (hoursMatch) {
            const hours = parseInt(hoursMatch[1]);
            const minutesMatch2 = timeStr.match(/(\d+)\s*minutes?/);
            const minutes = minutesMatch2 ? parseInt(minutesMatch2[1]) : 0;
            return new Date(now.getTime() - (hours * 60 + minutes) * 60 * 1000);
          }

          const daysMatch = timeStr.match(/(\d+)\s*days?/);
          if (daysMatch) {
            const days = parseInt(daysMatch[1]);
            const hoursMatch2 = timeStr.match(/(\d+)\s*hours?/);
            const hours = hoursMatch2 ? parseInt(hoursMatch2[1]) : 0;
            return new Date(now.getTime() - (days * 24 * 60 + hours * 60) * 60 * 1000);
          }

          return null;
        };

        const userDate = parseRelativeTime(joinedDate);
        if (!userDate) return false;

        switch (registrationDateFilter) {
          case 'Today':
            return userDate.toDateString() === now.toDateString();
          case 'This Week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return userDate >= weekAgo;
          case 'This Month':
            return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
          case 'Last 3 Months':
            const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            return userDate >= threeMonthsAgo;
          case 'This Year':
            return userDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    // Apply Status Filter
    if (statusFilter !== 'All Status') {
      filteredUsers = filteredUsers.filter((user) => {
        if (statusFilter === 'Active') return user.status === 'Active';
        if (statusFilter === 'Inactive') return user.status === 'Inactive';
        if (statusFilter === 'Pending') return user.status === 'Pending';
        return true;
      });
    }

    // Apply Sort
    if (sortBy !== 'Sort By') {
      filteredUsers.sort((a, b) => {
        switch (sortBy) {
          case 'Name (A-Z)':
            return a.name.localeCompare(b.name);
          case 'Name (Z-A)':
            return b.name.localeCompare(a.name);
          case 'Registration Date (Newest)':
            // Parse relative time and sort (newest first = smaller time ago = larger timestamp)
            const parseTimeForSort = (timeStr) => {
              if (!timeStr || timeStr === 'Never' || timeStr === 'N/A') return 0;
              const minutesMatch = timeStr.match(/(\d+)\s*minutes?\s*ago/);
              if (minutesMatch) return parseInt(minutesMatch[1]);
              const hoursMatch = timeStr.match(/(\d+)\s*hours?/);
              if (hoursMatch) {
                const hours = parseInt(hoursMatch[1]);
                const minutesMatch2 = timeStr.match(/(\d+)\s*minutes?/);
                const minutes = minutesMatch2 ? parseInt(minutesMatch2[1]) : 0;
                return hours * 60 + minutes;
              }
              const daysMatch = timeStr.match(/(\d+)\s*days?/);
              if (daysMatch) {
                const days = parseInt(daysMatch[1]);
                const hoursMatch2 = timeStr.match(/(\d+)\s*hours?/);
                const hours = hoursMatch2 ? parseInt(hoursMatch2[1]) : 0;
                return days * 24 * 60 + hours * 60;
              }
              return 999999; // Put unknown dates at end
            };
            return parseTimeForSort(a.registrationDate) - parseTimeForSort(b.registrationDate);
          case 'Registration Date (Oldest)':
            const parseTimeForSortOldest = (timeStr) => {
              if (!timeStr || timeStr === 'Never' || timeStr === 'N/A') return 999999;
              const minutesMatch = timeStr.match(/(\d+)\s*minutes?\s*ago/);
              if (minutesMatch) return parseInt(minutesMatch[1]);
              const hoursMatch = timeStr.match(/(\d+)\s*hours?/);
              if (hoursMatch) {
                const hours = parseInt(hoursMatch[1]);
                const minutesMatch2 = timeStr.match(/(\d+)\s*minutes?/);
                const minutes = minutesMatch2 ? parseInt(minutesMatch2[1]) : 0;
                return hours * 60 + minutes;
              }
              const daysMatch = timeStr.match(/(\d+)\s*days?/);
              if (daysMatch) {
                const days = parseInt(daysMatch[1]);
                const hoursMatch2 = timeStr.match(/(\d+)\s*hours?/);
                const hours = hoursMatch2 ? parseInt(hoursMatch2[1]) : 0;
                return days * 24 * 60 + hours * 60;
              }
              return 999999;
            };
            return parseTimeForSortOldest(b.registrationDate) - parseTimeForSortOldest(a.registrationDate);
          case 'Last Login (Recent)':
            const parseLoginTime = (timeStr) => {
              if (!timeStr || timeStr === 'Never' || timeStr === 'N/A') return 999999;
              const minutesMatch = timeStr.match(/(\d+)\s*minutes?\s*ago/);
              if (minutesMatch) return parseInt(minutesMatch[1]);
              const hoursMatch = timeStr.match(/(\d+)\s*hours?/);
              if (hoursMatch) {
                const hours = parseInt(hoursMatch[1]);
                const minutesMatch2 = timeStr.match(/(\d+)\s*minutes?/);
                const minutes = minutesMatch2 ? parseInt(minutesMatch2[1]) : 0;
                return hours * 60 + minutes;
              }
              const daysMatch = timeStr.match(/(\d+)\s*days?/);
              if (daysMatch) {
                const days = parseInt(daysMatch[1]);
                const hoursMatch2 = timeStr.match(/(\d+)\s*hours?/);
                const hours = hoursMatch2 ? parseInt(hoursMatch2[1]) : 0;
                return days * 24 * 60 + hours * 60;
              }
              return 999999;
            };
            return parseLoginTime(a.lastLogin) - parseLoginTime(b.lastLogin);
          default:
            return 0;
        }
      });
    }

    return filteredUsers;
  };

  const filteredAndSortedUsers = getFilteredAndSortedUsers();

  // Pagination logic - show 10 items per page
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);

  // Calculate which users to show on current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sortBy, registrationDateFilter]);

  // Generate page numbers for pagination
  const pages = [];
  const maxVisiblePages = 7;
  if (totalPages <= maxVisiblePages) {
    // Show all pages if total pages is less than max visible
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show first 2 pages
    for (let i = 1; i <= 2; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed
    if (currentPage > 4) {
      pages.push('...');
    }

    // Show pages around current page
    const startPage = Math.max(3, currentPage - 1);
    const endPage = Math.min(totalPages - 2, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      if (i > 2 && i < totalPages - 1) {
        pages.push(i);
      }
    }

    // Add ellipsis if needed
    if (currentPage < totalPages - 3) {
      pages.push('...');
    }

    // Show last 2 pages
    for (let i = totalPages - 1; i <= totalPages; i++) {
      pages.push(i);
    }
  }

  return (
    <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7] relative">
      {/* Success Toast Notification - Bottom Right */}
      {deleteSuccess && (
        <div 
          className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl z-[9999] flex items-center gap-3 min-w-[300px]"
          style={{
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 10L9 12L13 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-semibold flex-1">User deleted successfully!</span>
          <button
            onClick={() => setDeleteSuccess(false)}
            className="ml-2 hover:bg-green-600 rounded p-1 transition flex-shrink-0"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Add CSS animation */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Header Section */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">
              Coach Management
            </h1>
            <p className="text-sm sm:text-base text-[#4D6080] font-[Inter] mt-2">
              Manage coaches in the Deload Fitness platform.
            </p>
          </div>
          <button
            onClick={() => setShowAddCoach(true)}
            className="px-4 py-2 bg-[#003F8F] text-white rounded-lg cursor-pointer text-sm font-semibold hover:bg-[#002F6F] transition flex items-center gap-2 whitespace-nowrap"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round" />
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
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#003F8F] hover:bg-gray-50 active:text-[#003F8F] focus:text-[#003F8F] transition flex items-center gap-2 cursor-pointer"
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
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg z-50 min-w-[160px]">
                    {statusOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setStatusFilter(option);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${statusFilter === option ? 'text-[#003F8F] font-semibold bg-gray-50' : 'text-gray-700'
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
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#003F8F] hover:bg-gray-50 active:text-[#003F8F] focus:text-[#003F8F] transition flex items-center gap-2 cursor-pointer"
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
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${sortBy === option ? 'text-[#003F8F] font-semibold bg-gray-50' : 'text-gray-700'
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
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#003F8F] hover:bg-gray-50 active:text-[#003F8F] focus:text-[#003F8F] transition flex items-center gap-2 cursor-pointer"
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
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${registrationDateFilter === option ? 'text-[#003F8F] font-semibold bg-gray-50' : 'text-gray-700'
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
          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-lg text-gray-500">Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-lg text-gray-500">No users found</div>
            </div>
          ) : (
            currentUsers.map((userItem) => (
              <div
                key={userItem.id}
                onClick={() => setSelectedRow(userItem.id)}
                className={`grid grid-cols-6 gap-2 sm:gap-4 items-center px-4 py-4 rounded-lg border border-gray-200 transition cursor-pointer min-w-[800px] ${selectedRow === userItem.id ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                  }`}
              >
                <div>
                  <p className="text-sm font-semibold text-[#003F8F] font-[Inter]">{userItem.id}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#003F8F] font-[Inter]">{userItem.name}</p>
                </div>
                <div>
                  {getStatusBadge(userItem.status)}
                </div>
                <div>
                  <p className="text-sm text-[#003F8F] font-semibold font-[Inter]">{userItem.registrationDate}</p>
                </div>
                <div>
                  <p className="text-sm text-[#003F8F] font-semibold font-[Inter]">{userItem.lastLogin}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         handleDeleteClick(userItem.id);
                       }}
                       disabled={deletingUserId === userItem.id}
                       className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                       title="Delete user"
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
                        navigate(`/admin/clients/${userItem.id}`);
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
            ))
          )}
        </div>

        {/* Pagination */}
        {users.length > 0 && (
          <div className="flex items-center justify-between py-4 border-t border-gray-200 px-4">
            <div className="text-sm text-gray-600">
              Showing {filteredAndSortedUsers.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loadingUsers}
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
                  disabled={page === '...' || loadingUsers}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition ${page === currentPage
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
                disabled={currentPage === totalPages || loadingUsers}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4L10 8L6 12" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>





      {showAddCoach && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-40  flex items-center justify-center z-50">

          <div className="bg-white w-[90%] max-w-xl rounded-xl shadow-lg p-6 border border-gray-200 relative max-h-[90vh] overflow-auto">

            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={loading}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer mt-3 disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" rx="10" fill="#4D6080" fill-opacity="0.8" />
                <path d="M13.3888 7.49593C13.4485 7.43831 13.4962 7.36936 13.529 7.29313C13.5618 7.21689 13.579 7.13489 13.5798 7.0519C13.5806 6.96891 13.5648 6.88661 13.5334 6.80978C13.502 6.73296 13.4556 6.66315 13.397 6.60444C13.3383 6.54573 13.2686 6.49929 13.1918 6.46783C13.115 6.43637 13.0327 6.42051 12.9497 6.4212C12.8667 6.42188 12.7847 6.43908 12.7084 6.4718C12.6322 6.50452 12.5632 6.5521 12.5055 6.61177L10.0005 9.11593L7.49632 6.61177C7.4391 6.55036 7.3701 6.50111 7.29343 6.46695C7.21677 6.43279 7.13401 6.41442 7.05009 6.41294C6.96617 6.41146 6.88281 6.4269 6.80499 6.45833C6.72716 6.48976 6.65647 6.53655 6.59712 6.5959C6.53777 6.65525 6.49098 6.72594 6.45955 6.80377C6.42812 6.88159 6.41268 6.96495 6.41416 7.04887C6.41564 7.13279 6.43401 7.21555 6.46817 7.29221C6.50233 7.36888 6.55158 7.43788 6.61299 7.4951L9.11549 10.0001L6.61132 12.5043C6.50092 12.6227 6.44082 12.7795 6.44367 12.9414C6.44653 13.1033 6.51212 13.2578 6.62663 13.3723C6.74115 13.4868 6.89563 13.5524 7.05755 13.5552C7.21947 13.5581 7.37617 13.498 7.49465 13.3876L10.0005 10.8834L12.5047 13.3884C12.6231 13.4988 12.7798 13.5589 12.9418 13.5561C13.1037 13.5532 13.2582 13.4876 13.3727 13.3731C13.4872 13.2586 13.5528 13.1041 13.5556 12.9422C13.5585 12.7803 13.4984 12.6236 13.388 12.5051L10.8855 10.0001L13.3888 7.49593Z" fill="white" />
              </svg>

            </button>

            {/* Title */}
            <h2 className="text-xl font-bold text-[#003F8F] mb-5">
              Add New Coach
            </h2>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                Coach added successfully!
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddCoach} className="space-y-5">

              {/* Name */}
              <div>
                <label className="text-sm font-semibold text-[#003F8F]">Enter Name</label>
                <input
                  type="text"
                  name="fullname"
                  value={coachFormData.fullname}
                  onChange={handleCoachFormChange}
                  placeholder="Enter coach name"
                  required
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#003F8F] focus:border-[#003F8F]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-[#003F8F]">Email</label>
                <input
                  type="email"
                  name="email"
                  value={coachFormData.email}
                  onChange={handleCoachFormChange}
                  placeholder="Enter email"
                  required
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#003F8F] focus:border-[#003F8F]"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-semibold text-[#003F8F]">Phone</label>
                <input
                  type="text"
                  name="phone_number"
                  value={coachFormData.phone_number}
                  onChange={handleCoachFormChange}
                  placeholder="+1 555 555 5555"
                  required
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#003F8F] focus:border-[#003F8F]"
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-sm font-semibold text-[#003F8F]">Address</label>
                <input
                  type="text"
                  name="address"
                  value={coachFormData.address}
                  onChange={handleCoachFormChange}
                  placeholder="Add address"
                  required
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#003F8F] focus:border-[#003F8F]"
                />
              </div>

              {/* Coaching Categories */}
              <div>
                <label className="text-sm font-semibold text-[#003F8F]">
                  Coaching Categories (choose one or more)
                </label>

                <div className="flex gap-2 flex-wrap mt-2 text-sm">
                  {coachingCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1 rounded-full transition ${coachFormData.coaching_categories.includes(category)
                          ? 'bg-[#003F8F] text-white'
                          : 'bg-[#FFFFFF80] !border border-[#4D60804D] text-[#003F8F]'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Years of Experience */}
              <div>
                <label className="text-sm font-semibold text-[#003F8F]">
                  Years of experience
                </label>
                <input
                  type="number"
                  name="years_of_experience"
                  value={coachFormData.years_of_experience}
                  onChange={handleCoachFormChange}
                  placeholder="0"
                  min="0"
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#003F8F] focus:border-[#003F8F]"
                />
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="px-4 py-2 !border border-[#4D6080CC] rounded-lg text-sm font-semibold hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || success}
                  className="px-5 py-2 bg-[#003F8F] text-white text-sm font-semibold rounded-lg hover:bg-[#002A6A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : success ? 'Added!' : 'Add Coach'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative max-w-md w-[90%]">
            <h3 className="text-lg font-bold text-[#003F8F] mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete user <strong>{userToDelete}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
