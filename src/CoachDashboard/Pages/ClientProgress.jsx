import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../../ClientDashboard/Components/icons';
import { PreviousIcon, NextIcon } from '../Components/Icons';
// Full client progress list
const allClientProgress = [
  { name: 'David lee', percent: 75, status: 'On Track' },
  { name: 'Sophia Chen', percent: 40, status: 'Behind Schedule' },
  { name: 'Michael Kim', percent: 85, status: 'On Track' },
  { name: 'Emma Watson', percent: 60, status: 'At Risk' },
  { name: 'James Smith', percent: 100, status: 'Completed' },
  { name: 'Olivia Brown', percent: 80, status: 'On Track' },
  { name: 'Liam Johnson', percent: 50, status: 'Behind Schedule' },
  { name: 'Ava Davis', percent: 55, status: 'At Risk' },
  { name: 'Ethan Martinez', percent: 90, status: 'On Track' },
];

const ClientProgress = () => {
  const navigate = useNavigate();
  const [targetType, setTargetType] = useState('weekly'); // 'weekly' or 'monthly'
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 9;

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
          <div className="flex items-center rounded-lg border border-[#CBD8FF] overflow-hidden">
            <button
              onClick={() => setTargetType('weekly')}
              className={`px-5 py-2 text-sm font-semibold transition ${
                targetType === 'weekly'
                  ? 'bg-[#003F8F] text-white'
                  : 'bg-white text-[#0D4FB8]'
              }`}
            >
              Weekly Target
            </button>
            <button
              onClick={() => setTargetType('monthly')}
              className={`px-5 py-2 text-sm font-semibold transition ${
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
          {allClientProgress
            .slice((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage)
            .map((client) => (
              <div
                key={client.name}
                className="rounded-2xl border border-[#E5EDFF] bg-white p-4 space-y-2 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[#0D4FB8] font-medium text-base sm:text-lg">{client.name}</p>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#003F8F] text-white whitespace-nowrap">
                      {client.status}
                    </span>
                  </div>
                  <p className="text-gray-500 font-medium text-base sm:text-lg">{client.percent}%</p>
                </div>
                <div className="h-2 rounded-full bg-[#E4EAF5] overflow-hidden">
                  <div
                    className="h-full bg-[#FF7A00] transition-all duration-300"
                    style={{ width: `${client.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
        </div>

        {/* Pagination */}
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
            <NextIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientProgress;

