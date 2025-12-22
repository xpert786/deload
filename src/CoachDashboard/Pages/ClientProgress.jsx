import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeftIcon } from '../../ClientDashboard/Components/icons';
import { PreviousIcon, NextIcon } from '../Components/Icons';

// Use API URL from .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

// Helper function to calculate status based on percentage
const getStatusFromPercent = (percent) => {
  if (percent >= 100) return 'Completed';
  if (percent >= 70) return 'On Track';
  if (percent >= 50) return 'At Risk';
  return 'Behind Schedule';
};

const ClientProgress = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [targetType, setTargetType] = useState('weekly'); // 'weekly' or 'monthly'
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 9;

  // API data state
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch comprehensive dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

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
      // Build API URL
      const apiUrl = baseUrl.includes('/api')
        ? `${baseUrl}/comprehensive-dashboard/`
        : `${baseUrl}/api/comprehensive-dashboard/`;

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
        console.error('Failed to parse dashboard response:', parseError);
        setError('Failed to parse server response. Please try again.');
        setLoading(false);
        return;
      }

      if (response.ok && result.data) {
        setDashboardData(result.data);
      } else {
        console.error('Failed to fetch dashboard data:', result);
        setError(result.message || 'Failed to fetch dashboard data. Please try again.');
      }
    } catch (err) {
      console.error('Fetch dashboard error:', err);
      setError('Network error: Unable to fetch dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Get client progress from API
  const allClientProgress = useMemo(() => {
    if (dashboardData?.client_progress?.clients && dashboardData.client_progress.clients.length > 0) {
      return dashboardData.client_progress.clients.map((client) => {
        const progress = targetType === 'weekly' 
          ? client.progress?.weekly 
          : client.progress?.monthly;
        
        const percent = progress?.percentage || 0;
        
        return {
          name: client.name || 'Unknown',
          percent: percent,
          status: progress?.status || getStatusFromPercent(percent),
          id: client.id
        };
      });
    }
    // Default empty array
    return [];
  }, [dashboardData, targetType]);

  // Calculate total pages based on actual data
  const totalPages = Math.ceil(allClientProgress.length / clientsPerPage);

  // Reset to page 1 when target type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [targetType]);

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7] flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#003F8F] mb-4"></div>
          <p className="text-gray-600 font-[Inter]">Loading client progress...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7]">
        <div className="space-y-6 text-[#003F8F] border border-[#E5EDFF] rounded-xl p-6 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl sm:text-3xl font-bold text-[#003F8F] font-[Poppins]">Client Progress</h2>
            <button
              onClick={() => navigate('/coach/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#003F8F] hover:bg-[#F3F7FF] rounded-lg transition"
            >
              <ArrowLeftIcon />
              Back to Dashboard
            </button>
          </div>
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Generate pagination page numbers dynamically
  const getPaginationPages = () => {
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    if (currentPage <= 3) {
      // Show first 3 pages, then ellipsis, then last 2
      pages.push(2, 3);
      pages.push('ellipsis-start');
      pages.push(totalPages - 1, totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Show first 2, then ellipsis, then last 3
      pages.push('ellipsis-start');
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    } else {
      // Show first, ellipsis, current-1, current, current+1, ellipsis, last
      pages.push('ellipsis-start');
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push('ellipsis-end');
      pages.push(totalPages);
    }
    
    return pages;
  };

  const paginationPages = getPaginationPages();

  return (
    <div className="space-y-6 text-[#003F8F] border border-[#E5EDFF] rounded-xl p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl sm:text-3xl font-bold text-[#003F8F] font-[Poppins]">Client Progress</h2>
        <button
          onClick={() => navigate('/coach/dashboard')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#003F8F] hover:bg-[#F3F7FF] rounded-lg transition"
        >
          <ArrowLeftIcon />
          Back to Dashboard
        </button>
      </div>

      {/* Weekly/Monthly Target Toggle */}
      <div className="bg-white rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-[#CBD8FF] overflow-hidden p-2">
            <button
              onClick={() => setTargetType('weekly')}
              className={`px-5 py-2 text-sm font-semibold transition rounded-lg ${
                targetType === 'weekly'
                  ? 'bg-[#003F8F] text-white'
                  : 'bg-white text-[#0D4FB8]'
              }`}
            >
              Weekly Target
            </button>
            <button
              onClick={() => setTargetType('monthly')}
              className={`px-5 py-2 text-sm font-semibold transition rounded-lg ml-3 ${
                targetType === 'monthly'
                  ? 'bg-[#003F8F] text-white'
                  : 'bg-white text-[#0D4FB8]'
              }`}
            >
              Monthly Target
            </button>
          </div>
        </div>

        {/* Client Progress List */}
        <div className="space-y-3">
          {allClientProgress.length > 0 ? (
            allClientProgress
              .slice((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage)
              .map((client) => (
                <div
                  key={client.id || client.name}
                  className="rounded-2xl border border-[#E5EDFF] bg-white p-4 space-y-2 "
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[#0D4FB8] font-medium text-base sm:text-lg">{client.name}</p>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#003F8F] text-white whitespace-nowrap">
                        {client.status}
                      </span>
                    </div>
                    <p className="text-gray-500 font-medium text-base sm:text-lg">{client.percent.toFixed(0)}%</p>
                  </div>
                  <div className="h-2 rounded-full bg-[#E4EAF5] overflow-hidden">
                    <div
                      className="h-full bg-[#FF7A00] transition-all duration-300"
                      style={{ width: `${client.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No client progress data available
            </div>
          )}
        </div>

        {/* Pagination */}
        {allClientProgress.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E5EDFF]">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`w-8 h-10 rounded-lg border border-[#D7DCE5] flex items-center justify-center ${
                currentPage === 1
                  ? 'bg-[#F5F6FA] text-gray-400 cursor-not-allowed'
                  : 'bg-[#F5F6FA] text-[#5A6477] hover:bg-[#E8E8E8]'
              }`}
            >
              <PreviousIcon />
            </button>

            <div className="flex items-center gap-1">
              {paginationPages.map((page, index) => {
                if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                  return <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>;
                }
                return (
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
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`w-8 h-10 rounded-lg border border-[#D7DCE5] flex items-center justify-center ${
                currentPage === totalPages
                  ? 'bg-[#F5F6FA] text-gray-400 cursor-not-allowed'
                  : 'bg-[#F5F6FA] text-[#5A6477] hover:bg-[#E8E8E8]'
              }`}
            >
              <NextIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProgress;



