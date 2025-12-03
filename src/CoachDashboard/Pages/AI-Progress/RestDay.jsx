import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RestDay = ({ onBack, onToggle, day = 'Mon' }) => {
  const navigate = useNavigate();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedCadence, setSelectedCadence] = useState('For 3 Weeks');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showCadenceDropdown, setShowCadenceDropdown] = useState(false);

  // Sample client list
  const clientList = [
    'John Doe',
    'John Miller',
    'Sarah Johnson',
    'Mike Wilson',
    'Emily Davis',
    'David Brown'
  ];

  // Cadence options
  const cadenceOptions = [
    'For 1 Week',
    'For 2 Weeks',
    'For 3 Weeks',
    'For 4 Weeks',
    'For 6 Weeks',
    'For 8 Weeks'
  ];

  // Handle client selection
  const handleSelectClient = (client) => {
    if (!selectedClients.includes(client)) {
      setSelectedClients([...selectedClients, client]);
    }
    setShowClientDropdown(false);
  };

  // Handle client removal
  const handleRemoveClient = (client) => {
    setSelectedClients(selectedClients.filter(c => c !== client));
  };

  // Handle assign plan
  const handleAssignPlan = () => {
    console.log('Assigning plan to clients:', selectedClients, 'Cadence:', selectedCadence);
    setShowAssignModal(false);
    setSelectedClients([]);
    setSelectedCadence('For 3 Weeks');
  };
  return (
    <div className="h-screen flex flex-col bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-[#003F8F] text-white p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold font-[Poppins]">AI Chatbox</h2>
        <button 
          onClick={() => setShowAssignModal(true)}
          className="px-4 py-2 bg-[#FB923C] text-white rounded-lg font-semibold text-sm hover:bg-[#EA7A1A] transition"
        >
          + Assign To Client
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-[#003F8F] font-[Poppins]">John's Weekly Workout Plan</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/coach/ai-program/add-workout')}
              className="px-4 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition flex items-center gap-2"
            >
              <span>+</span>
              Add Workout
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

      {/* Assign To Client Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-[#003F8F] font-[Poppins]">Assign To Client</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setShowClientDropdown(false);
                  setShowCadenceDropdown(false);
                }}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#4D6080" fillOpacity="0.8" />
                  <path d="M16.067 8.99502C16.1386 8.92587 16.1958 8.84314 16.2352 8.75165C16.2745 8.66017 16.2952 8.56176 16.2962 8.46218C16.2971 8.3626 16.2781 8.26383 16.2405 8.17164C16.2028 8.07945 16.1472 7.99568 16.0768 7.92523C16.0064 7.85478 15.9227 7.79905 15.8305 7.7613C15.7384 7.72354 15.6396 7.70452 15.54 7.70534C15.4404 7.70616 15.342 7.7268 15.2505 7.76606C15.159 7.80532 15.0762 7.86242 15.007 7.93402L12.001 10.939L8.99597 7.93402C8.92731 7.86033 8.84451 7.80123 8.75251 7.76024C8.66051 7.71925 8.5612 7.69721 8.4605 7.69543C8.35979 7.69365 8.25976 7.71218 8.16638 7.7499C8.07299 7.78762 7.98815 7.84376 7.91694 7.91498C7.84572 7.9862 7.78957 8.07103 7.75185 8.16442C7.71413 8.25781 7.69561 8.35784 7.69738 8.45854C7.69916 8.55925 7.7212 8.65856 7.76219 8.75056C7.80319 8.84256 7.86229 8.92536 7.93597 8.99402L10.939 12L7.93397 15.005C7.80149 15.1472 7.72937 15.3352 7.7328 15.5295C7.73623 15.7238 7.81494 15.9092 7.95235 16.0466C8.08977 16.1841 8.27515 16.2628 8.46945 16.2662C8.66375 16.2696 8.8518 16.1975 8.99397 16.065L12.001 13.06L15.006 16.066C15.1481 16.1985 15.3362 16.2706 15.5305 16.2672C15.7248 16.2638 15.9102 16.1851 16.0476 16.0476C16.185 15.9102 16.2637 15.7248 16.2671 15.5305C16.2706 15.3362 16.1985 15.1482 16.066 15.006L13.063 12L16.067 8.99502Z" fill="white" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Select Client Section */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2">Select Client</label>
                <div className="relative">
                  <div
                    onClick={() => setShowClientDropdown(!showClientDropdown)}
                    className="w-full border border-gray-300 rounded-lg bg-white cursor-pointer relative"
                  >
                    {/* Top Row - Placeholder and Dropdown */}
                    <div className="px-3 py-2 flex items-center justify-between relative">
                      <span className="text-gray-400 text-sm">Select client</span>
                      <svg
                        className="w-5 h-5 text-[#003F8F]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Chips Row - Below placeholder */}
                    {selectedClients.length > 0 && (
                      <div className="px-3 pb-2 flex flex-wrap gap-2">
                        {selectedClients.map((client, index) => (
                          <div
                            key={index}
                            className="bg-[#4D60801A] px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            <span className="text-[#003F8F] font-medium">{client}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveClient(client);
                              }}
                              className="text-[#003F8F] hover:text-[#002F6F] transition flex items-center justify-center cursor-pointer"
                            >
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="8" height="8" rx="4" fill="#003F8F" />
                                <path d="M5.35631 2.9983C5.3802 2.97525 5.39926 2.94767 5.41237 2.91718C5.42549 2.88668 5.4324 2.85388 5.4327 2.82069C5.43301 2.78749 5.4267 2.75457 5.41414 2.72384C5.40159 2.69311 5.38304 2.66519 5.35958 2.6417C5.33611 2.61822 5.30821 2.59964 5.27749 2.58706C5.24677 2.57447 5.21386 2.56813 5.18066 2.56841C5.14747 2.56868 5.11466 2.57556 5.08415 2.58865C5.05364 2.60173 5.02605 2.62077 5.00298 2.64463L4.00098 3.6463L2.99931 2.64463C2.97642 2.62007 2.94882 2.60037 2.91816 2.58671C2.88749 2.57304 2.85438 2.56569 2.82082 2.5651C2.78725 2.56451 2.75391 2.57069 2.72278 2.58326C2.69165 2.59583 2.66337 2.61455 2.63963 2.63829C2.61589 2.66203 2.59718 2.6903 2.5846 2.72143C2.57203 2.75256 2.56585 2.78591 2.56645 2.81947C2.56704 2.85304 2.57438 2.88615 2.58805 2.91681C2.60171 2.94748 2.62141 2.97508 2.64598 2.99797L3.64698 3.99997L2.64531 5.00163C2.60115 5.04903 2.57711 5.11171 2.57825 5.17647C2.57939 5.24124 2.60563 5.30304 2.65144 5.34884C2.69724 5.39464 2.75903 5.42088 2.8238 5.42202C2.88857 5.42317 2.95125 5.39913 2.99864 5.35497L4.00098 4.3533L5.00264 5.3553C5.05003 5.39946 5.11272 5.4235 5.17748 5.42236C5.24225 5.42122 5.30405 5.39498 5.34985 5.34917C5.39565 5.30337 5.42189 5.24157 5.42303 5.17681C5.42418 5.11204 5.40014 5.04936 5.35598 5.00197L4.35498 3.99997L5.35631 2.9983Z" fill="white" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {showClientDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {clientList
                        .filter(client => !selectedClients.includes(client))
                        .map((client, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectClient(client)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
                          >
                            {client}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Set Cadence Section */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2">Set Cadence</label>
                <div className="relative">
                  <input
                    type="text"
                    value={selectedCadence}
                    onClick={() => setShowCadenceDropdown(!showCadenceDropdown)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003F8F] bg-white cursor-pointer text-gray-400"
                    readOnly
                  />
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#003F8F]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {showCadenceDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {cadenceOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedCadence(option);
                            setShowCadenceDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setShowClientDropdown(false);
                  setShowCadenceDropdown(false);
                }}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignPlan}
                className="px-6 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition"
              >
                Assign Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestDay;

