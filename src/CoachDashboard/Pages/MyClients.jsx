import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DeleteIcon, EyeIconTable, PreviousIcon ,NextIcon, SearchIcon} from '../Components/Icons';

// Use API URL from .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const MyClients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clientsData, setClientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState(null);
  const clientsPerPage = 7;

  const filters = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Fetch clients from API
  const fetchClients = useCallback(async () => {
    setLoading(true);
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
      const apiUrl = `${baseUrl}/clients/list/`;

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
        console.error('Failed to parse clients response:', parseError);
        setError('Failed to parse server response. Please try again.');
        setLoading(false);
        return;
      }

      if (response.ok) {
        // Handle paginated response with results array
        const clients = result.results || result.data || [];
        
        // Map API response to UI format
        const mappedClients = clients.map((client) => {
          // Capitalize first letter of level for display and filtering
          const capitalizeLevel = (level) => {
            if (!level) return 'Beginner';
            return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
          };

          return {
            id: client.id,
            name: client.name || 'N/A',
            email: client.email || 'N/A',
            phone: client.phone || 'N/A',
            address: client.address || 'N/A',
            level: capitalizeLevel(client.level)
          };
        });

        setClientsData(mappedClients);
      } else {
        console.error('Failed to fetch clients:', result);
        setError(result.message || 'Failed to fetch clients. Please try again.');
      }
    } catch (err) {
      console.error('Fetch clients error:', err);
      setError('Network error: Unable to fetch clients. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch clients on component mount and when user changes
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Expose refresh function to parent components via window event
  useEffect(() => {
    const handleRefreshClients = () => {
      fetchClients();
    };

    window.addEventListener('refreshClients', handleRefreshClients);
    return () => {
      window.removeEventListener('refreshClients', handleRefreshClients);
    };
  }, [fetchClients]);

  // Filter clients based on selected filter and search query
  const filteredClients = clientsData.filter(client => {
    const matchesFilter = selectedFilter === 'All' || client.level === selectedFilter;
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.phone && client.phone.toString().includes(searchQuery)) ||
      client.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Paginate clients
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * clientsPerPage,
    currentPage * clientsPerPage
  );

  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  const handleView = (clientId) => {
    navigate(`/coach/clients/${clientId}/dashboard`);
  };

  const handleDelete = (clientId) => {
    console.log('Delete client:', clientId);
    // Add delete functionality here
  };

  return (
    <div className="space-y-6 p-2 sm:p-4  text-[#003F8F]">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#003F8F] font-[Poppins]">Client</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading clients...</p>
          </div>
        )}

        {/* Filters and Search */}
        {!loading && (
          <div className="flex items-start gap-4 flex-1 lg:justify-between">
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
                placeholder="Search clients"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm text-gray-700 placeholder-gray-400 bg-[#E8F0FF]"
              />
            </div>
          </div>
        )}

        {/* Table Section */}
        {!loading && (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500 font-[Inter]">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500 font-[Inter]">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500 font-[Inter]">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500 font-[Inter]">Address</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500 font-[Inter]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client, index) => {
                  const isHovered = hoveredRow === client.id;
                  return (
                    <tr
                      key={client.id}
                      onMouseEnter={() => setHoveredRow(client.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`border-b border-gray-100 transition ${
                        isHovered ? 'bg-[#4D60801A]' : 'bg-white'
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <p className="text-sm font-medium text-[#003F8F] font-[Inter]">{client.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <p className="text-sm text-[#003F8F] font-medium font-[Inter]">{client.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <p className="text-sm text-[#003F8F] font-medium font-[Inter]">{client.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <p className="text-sm text-[#003F8F] font-medium font-[Inter] truncate max-w-[200px]" title={client.address}>
                            {client.address}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(client.id)}
                            className={` border flex items-center justify-center transition ${
                              isHovered
                                ? 'border-gray-300 bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'
                                : 'border-gray-300 bg-white text-gray-400'
                            }`}
                          >
                           <DeleteIcon />
                          </button>
                          <button
                            onClick={() => handleView(client.id)}
                            className={` border flex items-center justify-center transition cursor-pointer ${
                              isHovered
                                ? 'bg-[#003F8F] border-[#003F8F] text-white'
                                : 'border-gray-300 bg-white text-gray-400'
                            }`}
                          >
                                <EyeIconTable />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No clients found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`w-8 h-10 rounded-lg border border-gray-300 flex items-center justify-center ${
                currentPage === 1
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <PreviousIcon />
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
              className={`w-8 h-10 rounded-lg border border-gray-300 flex items-center justify-center ${
                currentPage === totalPages
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
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

export default MyClients;
