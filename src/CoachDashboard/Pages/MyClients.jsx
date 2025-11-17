import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteIcon, EyeIconTable, PreviousIcon ,NextIcon, SearchIcon} from '../Components/Icons';

// Sample client data
const clientsData = [
  { id: 1, name: 'John Doe', email: 'john@gmail.com', phone: '+1 (212) 555-1234', address: '789 New York, USA', level: 'Beginner' },
  { id: 2, name: 'John Doe', email: 'john@gmail.com', phone: '+1 (212) 555-1234', address: '789 Pine St, Unit 4B, New York, NY 10001', level: 'Intermediate' },
  { id: 3, name: 'John Doe', email: 'john@gmail.com', phone: '+1 (212) 555-1234', address: '789 Pine St, Unit 4B, New York, NY 10001', level: 'Advanced' },
  { id: 4, name: 'John Doe', email: 'john@gmail.com', phone: '+1 (212) 555-1234', address: '789 Pine St, Unit 4B, New York, NY 10001', level: 'Beginner' },
  { id: 5, name: 'John Doe', email: 'john@gmail.com', phone: '+1 (212) 555-1234', address: '789 Pine St, Unit 4B, New York, NY 10001', level: 'Intermediate' },
  { id: 6, name: 'John Doe', email: 'john@gmail.com', phone: '+1 (212) 555-1234', address: '789 Pine St, Unit 4B, New York, NY 10001', level: 'Advanced' },
  { id: 7, name: 'John Doe', email: 'john@gmail.com', phone: '+1 (212) 555-1234', address: '789 Pine St, Unit 4B, New York, NY 10001', level: 'Beginner' },
  { id: 8, name: 'John Doe', email: 'john@gmail.com', phone: '+1 (212) 555-1234', address: '789 New York, USA', level: 'Intermediate' },
  { id: 9, name: 'John Doe', email: 'john@gmail.com', phone: '+1 (212) 555-1234', address: '789 Pine St, Unit 4B, New York, NY 10001', level: 'Advanced' },
  { id: 10, name: 'John Doe', email: 'john@gmail.com', phone: '+1 (212) 555-1234', address: '789 Pine St, Unit 4B, New York, NY 10001', level: 'Beginner' },
];

const MyClients = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState(null);
  const clientsPerPage = 7;

  const filters = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Filter clients based on selected filter and search query
  const filteredClients = clientsData.filter(client => {
    const matchesFilter = selectedFilter === 'All' || client.level === selectedFilter;
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
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
      <div className="bg-white rounded-xl p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#003F8F] font-[Poppins]">Client</h1>
          </div>

          {/* Filters and Search */}
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
        

        {/* Table Section */}
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
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="text-sm font-medium text-[#003F8F] font-[Inter]">{client.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="text-sm text-[#003F8F] font-medium font-[Inter]">{client.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="text-sm text-[#003F8F] font-medium font-[Inter]">{client.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="text-sm text-[#003F8F] font-medium font-[Inter] truncate max-w-[200px]" title={client.address}>
                            {client.address}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(client.id)}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition ${
                              isHovered
                                ? 'border-gray-300 bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'
                                : 'border-gray-300 bg-white text-gray-400'
                            }`}
                          >
                           <DeleteIcon />
                          </button>
                          <button
                            onClick={() => handleView(client.id)}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
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

        {/* Pagination */}
        {totalPages > 1 && (
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
