import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArchiveIconForCoach, DeleteIconForCoach, EditIconForCoach, LocationIconForCoach, MailIconForCoach, MobileIconForCoach, PercentageIconForCoach, SearchIcon } from '../Components/Icons';
import ProfileLogo from "../../assets/clientprofile.jpg";
import { MessageIconForCoach } from '../Components/Icons';
import WorkOut from './ClientDashboard/WorkOut';
import CustomWorkouts from './ClientDashboard/CustomWorkouts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

// Sample data
const progressData = {
  cardio: 30,
  stretching: 40,
  treadmill: 30,
  strength: 20
};

const seasonHistory = [
  {
    date: '15 sep 2025',
    exercises: [
      { id: 1, name: 'Upper Body Power', details: '4 sets x 8-10 reps' },
      { id: 2, name: 'Overhead Press', details: '3 sets x 10-12 reps' },
      { id: 3, name: 'Incline Dumbbell Press', details: '3 sets x 12-15 reps' }
    ]
  }
];

const goals = [
  { id: 1, name: 'Running', icon: '🏃', current: 70, target: 80, unit: 'km', percent: 79 },
  { id: 2, name: 'Weight Loss', icon: '🔥', current: 70, target: 100, unit: 'kg', percent: 60 }
];

const notes = [
  { id: 1, date: 'Today', text: 'Great job on completing your cardio sessions this week! Try to maintain...' },
  { id: 2, date: '28-Aug-2025', text: 'Excellent strength training session today! Make sure to maintain correct form to avoid injuries...' }
];

const ClientDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [timeRange, setTimeRange] = useState('Weekly');
  const [searchNote, setSearchNote] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingData, setEditingData] = useState({});
  const [saving, setSaving] = useState(false);

  const tabs = ['Overview', 'Workout Calendar', 'Custom Workouts'];

  // Fetch client details from API
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

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
        // Check if baseUrl already includes /api, if not add it
        const apiUrl = baseUrl.includes('/api') 
          ? `${baseUrl}/clients/${id}/detail/`
          : `${baseUrl}/api/clients/${id}/detail/`;

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
          console.error('Failed to parse client details response:', parseError);
          setError('Failed to parse server response. Please try again.');
          setLoading(false);
          return;
        }

        if (response.ok && result.data) {
          setClientData(result.data);
          setEditingData(result.data); // Initialize editing data
        } else {
          console.error('Failed to fetch client details:', result);
          setError(result.message || 'Failed to fetch client details. Please try again.');
        }
      } catch (err) {
        console.error('Fetch client details error:', err);
        setError('Network error: Unable to fetch client details. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [id, user]);

  // Calculate total for donut chart
  const total = Object.values(progressData).reduce((sum, val) => sum + val, 0);

  // Calculate segments for donut chart
  const chartSegments = [
    { label: 'Cardio', value: progressData.cardio, color: '#003F8F' },
    { label: 'Stretching', value: progressData.stretching, color: '#FB923C' },
    { label: 'Treadmill', value: progressData.treadmill, color: '#93C5FD' },
    { label: 'Strength', value: progressData.strength, color: '#4A5568' }
  ];

  // Calculate segments for donut chart using arcs
  const radius = 60;
  const centerX = 80;
  const centerY = 80;

  const createArcPath = (startAngle, endAngle) => {
    const start = {
      x: centerX + radius * Math.cos((startAngle * Math.PI) / 180),
      y: centerY + radius * Math.sin((startAngle * Math.PI) / 180)
    };
    const end = {
      x: centerX + radius * Math.cos((endAngle * Math.PI) / 180),
      y: centerY + radius * Math.sin((endAngle * Math.PI) / 180)
    };
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  let currentAngle = -90; // Start from top
  const segmentsWithData = chartSegments.map(segment => {
    const percent = (segment.value / total) * 100;
    const angle = (percent / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...segment,
      percent,
      path: createArcPath(startAngle, endAngle)
    };
  });

  // Prepare notes for display - use API notes if available, otherwise use sample data
  const getClientNotes = () => {
    if (!clientData) return notes;
    
    // If notes is a string, convert it to array format
    if (typeof clientData.notes === 'string' && clientData.notes.trim() !== '') {
      return [{ 
        id: 1, 
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }), 
        text: clientData.notes 
      }];
    }
    
    // If notes is an array, use it
    if (Array.isArray(clientData.notes) && clientData.notes.length > 0) {
      return clientData.notes;
    }
    
    // Otherwise use sample data
    return notes;
  };

  const clientNotes = getClientNotes();
  const filteredNotes = clientNotes.filter(note =>
    (note.text && note.text.toLowerCase().includes(searchNote.toLowerCase())) || 
    (note.date && note.date.toLowerCase().includes(searchNote.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7] text-[#003F8F]">
        <div className="bg-white rounded-xl p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Loading client details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7] text-[#003F8F]">
        <div className="bg-white rounded-xl p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7] text-[#003F8F]">
        <div className="bg-white rounded-xl p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">No client data found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not Specified';
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Format as (XXX) XXX-XXXX if 10 digits
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Handle edit mode toggle
  const handleEditClick = () => {
    setIsEditMode(true);
    setEditingData({ ...clientData }); // Copy current data to editing state
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingData({ ...clientData }); // Reset to original data
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!id) return;

    setSaving(true);
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

      if (!isValidToken) {
        setError('Authentication token not found. Please login again.');
        setSaving(false);
        return;
      }

      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      // Build API URL - use /edit/ endpoint
      const apiUrl = baseUrl.includes('/api')
        ? `${baseUrl}/clients/${id}/edit/`
        : `${baseUrl}/api/clients/${id}/edit/`;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`,
      };

      // Prepare request body with edited data
      const requestBody = {
        fullname: editingData.fullname || clientData.fullname,
        email: editingData.email || clientData.email,
        phone_number: editingData.phone_number || clientData.phone_number,
        address: editingData.address || clientData.address,
        city: editingData.city || clientData.city,
        gender: editingData.gender || clientData.gender,
        age: editingData.age || clientData.age,
        level: editingData.level || clientData.level,
        goals: editingData.goals || clientData.goals,
        primary_fitness_goal: editingData.primary_fitness_goal || clientData.primary_fitness_goal,
        equipments_access: editingData.equipments_access || clientData.equipments_access,
        medical_conditions: editingData.medical_conditions || clientData.medical_conditions,
        notes: editingData.notes || clientData.notes,
        weekly_session_goal: editingData.weekly_session_goal || clientData.weekly_session_goal,
      };

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
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
        setSaving(false);
        return;
      }

      if (response.ok && result.data) {
        // Update client data with response
        setClientData(result.data);
        setEditingData(result.data);
        setIsEditMode(false);
        // Show success message
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 3000);
      } else {
        setError(result.message || 'Failed to update client details. Please try again.');
      }
    } catch (err) {
      console.error('Update client error:', err);
      setError('Network error: Unable to update client details. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7] text-[#003F8F]">
      {/* Profile Header Section */}
      <div className="bg-white rounded-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Profile Image and Info */}
          <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={clientData.profile_photo_url || ProfileLogo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              {isEditMode ? (
                <input
                  type="text"
                  value={editingData.fullname || ''}
                  onChange={(e) => setEditingData({ ...editingData, fullname: e.target.value })}
                  className="text-2xl sm:text-3xl font-bold text-[#003F8F] font-[Poppins] mb-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
                  placeholder="Full Name"
                />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-bold text-[#003F8F] font-[Poppins] mb-1">
                  {clientData.fullname || 'N/A'}
                </h1>
              )}
              <p className="text-sm text-gray-600 font-[Inter] mb-4">
                {clientData.gender_display || 'N/A'} • {clientData.age || 'N/A'} yo • {clientData.level_display || 'N/A'}
              </p>

              {/* Contact Info Table */}


            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(`/coach/messages/${id}`)}
              className="px-4 py-2 border bg-[#003F8F] border-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#003F8F] hover:text-white transition flex items-center gap-2"
            >
              <MessageIconForCoach />
              Message
            </button>
            <button 
              onClick={handleEditClick}
              disabled={isEditMode}
              className={`px-4 py-2 !border border-[#4D60804D] text-[#003F8F] rounded-lg font-semibold text-sm hover:bg-[#003F8F] hover:text-white transition flex items-center gap-2 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <EditIconForCoach />
              Edit
            </button>
            {isEditMode && (
              <>
                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="px-4 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-4 py-2 !border border-[#4D60804D] text-[#003F8F] rounded-lg font-semibold text-sm hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </>
            )}
            <button className="px-4 py-2 !border border-[#4D60804D] text-[#003F8F] rounded-lg font-semibold text-sm hover:bg-[#003F8F] hover:text-white transition flex items-center gap-2">
              <ArchiveIconForCoach />
              Archive
            </button>
            <button className="px-4 py-2 !border border-[#4D60804D] text-[#003F8F] rounded-lg font-semibold text-sm hover:bg-[#003F8F] hover:text-white transition flex items-center gap-2">
              <DeleteIconForCoach />
            </button>
          </div>
        </div>
        <div className="mt-4 w-full max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm font-inter text-gray-600">

            {/* Headers */}
            <div className="flex items-center gap-2">
              <span className="text-[#003F8F] font-bold">Email</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#003F8F] font-bold">Phone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#003F8F] font-bold">Address</span>
            </div>

            {/* Values */}
            <div className="flex items-center gap-2">
              <MailIconForCoach className="w-5 h-5 text-[#003F8F]" />
              {isEditMode ? (
                <input
                  type="email"
                  value={editingData.email || ''}
                  onChange={(e) => setEditingData({ ...editingData, email: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
                  placeholder="Email"
                />
              ) : (
                <span>{clientData.email || 'Not Specified'}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <MobileIconForCoach className="w-5 h-5 text-[#003F8F]" />
              {isEditMode ? (
                <input
                  type="tel"
                  value={editingData.phone_number || ''}
                  onChange={(e) => setEditingData({ ...editingData, phone_number: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
                  placeholder="Phone Number"
                />
              ) : (
                <span>{formatPhoneNumber(clientData.phone_number)}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <LocationIconForCoach className="w-5 h-5 text-[#003F8F]" />
              {isEditMode ? (
                <input
                  type="text"
                  value={editingData.address || editingData.city || ''}
                  onChange={(e) => setEditingData({ ...editingData, address: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
                  placeholder="Address"
                />
              ) : (
                <span>{clientData.address && clientData.address !== 'Not Specified' ? clientData.address : (clientData.city && clientData.city !== 'Not Specified' ? clientData.city : 'Not Specified')}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Separate from profile header */}
      <div className="flex flex-wrap items-center gap-2 border border-gray-200 rounded-lg w-fit p-1 bg-white">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold text-sm transition ${activeTab === tab
              ? 'text-[#FFFFFF] bg-[#003F8F] border border-[#003F8F] rounded-lg'
              : 'text-[#003F8F] hover:text-[#003F8F]'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Render Workout Calendar when tab is active */}
      {activeTab === 'Workout Calendar' ? (
        <WorkOut clientId={id} />
      ) : activeTab === 'Custom Workouts' ? (
        <CustomWorkouts />
      ) : (
        <>
          {/* Main Content - Two Columns */}
          <div className="grid lg:grid-cols-[2fr_2fr] gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Progress Overview Card */}
              <div className="bg-white rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-semibold text-[#003F8F] font-[Poppins]">Progress Overview</h3>
                <div className="space-y-3">
                  <div className='border border-gray-200 p-2 rounded-lg'>
                    <p className="text-base text-[#003F8F] font-medium font-[Inter] mb-1">Goal</p>
                    <p className="text-base font-medium text-gray-500 font-[Inter]">{clientData.primary_fitness_goal || clientData.goals || 'Not Specified'}</p>
                  </div>
                  <div className='border border-gray-200 p-2 rounded-lg'>
                    <p className="text-base text-[#003F8F] font-medium font-[Inter] mb-1">Injury Risk</p>
                    <p className="text-base font-[#003F8F] text-[#FB923C] font-[Inter]">Medium</p>
                  </div>
                  <div className='border border-gray-200 p-2 rounded-lg'>
                    <p className="text-base text-[#003F8F] font-medium font-[Inter] mb-1">Strength</p>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium text-gray-500 font-[Inter] flex items-center gap-2">Improved <span>
                        <PercentageIconForCoach />
                      </span><span>12%</span> </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Column */}
            <div className="space-y-6">
              {/* Progress Card with Donut Chart */}
              <div className="bg-white rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-[#003F8F] font-[Poppins]">Progress</h3>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-[#003F8F] bg-[#003F8F]"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Donut Chart */}
                  <div className="relative w-60 h-60 flex-shrink-0">
                    <svg className="w-60 h-60" viewBox="0 0 160 160">
                      {segmentsWithData.map((segment) => (
                        <path
                          key={segment.label}
                          d={segment.path}
                          stroke={segment.color}
                          strokeWidth="20"
                          fill="none"
                          style={{
                            transition: 'all 0.5s ease'
                          }}
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-lg font-bold text-[#003F8F] font-[Poppins]">Stretching</p>
                        <p className="text-sm font-semibold text-gray-600 font-[Inter]">40hrs</p>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-3 flex-1">
                    {chartSegments.map((segment) => (
                      <div key={segment.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: segment.color }}
                          ></span>
                          <span className="text-sm font-semibold text-[#003F8F] font-[Inter]">{segment.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-600 font-[Inter]">{segment.value} hrs</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>


            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#003F8F] font-[Poppins]">Season History</h3>
              <button className="text-sm font-semibold text-[#003F8F] font-[Inter] hover:underline">
                See More
              </button>
            </div>
            {seasonHistory.map((session, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-[Inter]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 8 14.6667Z" stroke="#4D6080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 4.66667V8L10.6667 10.6667" stroke="#4D6080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{session.date}</span>
                </div>
                <div className="space-y-2 ">
                  {session.exercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-start gap-3 border border-gray-200 p-3 rounded-lg">
                      <span className="w-6 h-6 rounded-full bg-[#E5EDFF] text-[#003F8F] flex items-center justify-center text-xs font-semibold flex-shrink-0 ">
                        {exercise.id}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#003F8F] font-[Inter]">{exercise.name}</p>
                        <p className="text-sm text-gray-600 font-[Inter]">{exercise.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* footer content with left right area */}
          <div className="grid lg:grid-cols-[2fr_2fr] gap-6">
            <div className="space-y-6">
              {/* Goals Card */}
              <div className="bg-white rounded-3xl p-6 space-y-4">
                <h3 className="text-xl font-semibold text-[#003F8F] font-[Poppins]">Goals</h3>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="flex items-center gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{goal.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#003F8F] font-[Inter]">{goal.name}</p>
                          <p className="text-xs text-gray-600 font-[Inter]">{goal.current}{goal.unit}/{goal.target}{goal.unit}</p>
                        </div>
                      </div>
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <svg className="transform -rotate-90 w-16 h-16">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#E5EDFF"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#003F8F"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - goal.percent / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-semibold text-[#003F8F]">{goal.percent}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes Card */}
            <div className="bg-white rounded-3xl p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#003F8F] font-[Poppins]">Notes</h3>

              {/* Search and Add Button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchNote}
                    onChange={(e) => setSearchNote(e.target.value)}
                    className="w-[50%] pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowNotesModal(true)}
                  className="px-4 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition whitespace-nowrap cursor-pointer"
                >
                  + New Note
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {filteredNotes.length > 0 ? (
                  filteredNotes.map((note) => (
                    <div key={note.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-[Inter] mb-2">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 8 14.6667Z" stroke="#4D6080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 4.66667V8L10.6667 10.6667" stroke="#4D6080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="font-semibold text-[#003F8F]">{note.date || 'No date'}</span>
                      </div>
                      <p className="text-sm text-gray-700 font-[Inter]">{note.text || ''}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500">
                    {searchNote ? 'No notes found matching your search.' : 'No notes available.'}
                  </div>
                )}
              </div>
            </div>



          </div>
          {/* Season History Card */}
        </>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4">
            {/* Title and Close Button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#003F8F] font-[Poppins]">Notes</h3>
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setNoteText('');
                }}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#4D6080" fill-opacity="0.8" />
                  <path d="M16.066 8.99502C16.1377 8.92587 16.1948 8.84314 16.2342 8.75165C16.2735 8.66017 16.2943 8.56176 16.2952 8.46218C16.2961 8.3626 16.2772 8.26383 16.2395 8.17164C16.2018 8.07945 16.1462 7.99568 16.0758 7.92523C16.0054 7.85478 15.9217 7.79905 15.8295 7.7613C15.7374 7.72354 15.6386 7.70452 15.5391 7.70534C15.4395 7.70616 15.341 7.7268 15.2495 7.76606C15.158 7.80532 15.0752 7.86242 15.006 7.93402L12 10.939L8.995 7.93402C8.92634 7.86033 8.84354 7.80123 8.75154 7.76024C8.65954 7.71925 8.56022 7.69721 8.45952 7.69543C8.35882 7.69365 8.25879 7.71218 8.1654 7.7499C8.07201 7.78762 7.98718 7.84376 7.91596 7.91498C7.84474 7.9862 7.7886 8.07103 7.75087 8.16442C7.71315 8.25781 7.69463 8.35784 7.69641 8.45854C7.69818 8.55925 7.72022 8.65856 7.76122 8.75056C7.80221 8.84256 7.86131 8.92536 7.935 8.99402L10.938 12L7.933 15.005C7.80052 15.1472 7.72839 15.3352 7.73182 15.5295C7.73525 15.7238 7.81396 15.9092 7.95138 16.0466C8.08879 16.1841 8.27417 16.2628 8.46847 16.2662C8.66278 16.2696 8.85082 16.1975 8.993 16.065L12 13.06L15.005 16.066C15.1472 16.1985 15.3352 16.2706 15.5295 16.2672C15.7238 16.2638 15.9092 16.1851 16.0466 16.0476C16.184 15.9102 16.2627 15.7248 16.2662 15.5305C16.2696 15.3362 16.1975 15.1482 16.065 15.006L13.062 12L16.066 8.99502Z" fill="white" />
                </svg>

              </button>
            </div>

            {/* Text Area */}
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add notes about client's progress..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm text-gray-700 placeholder-gray-400 resize-none"
            />

            {/* Save Button */}
            <button
              onClick={async () => {
                if (!noteText.trim()) return;

                setSavingNote(true);
                try {
                  // Get authentication token
                  let token = null;
                  const storedUser = localStorage.getItem('user');
                  
                  if (storedUser) {
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

                  // Build API URL
                  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
                  const apiUrl = baseUrl.includes('/api') 
                    ? `${baseUrl}/clients/notes/`
                    : `${baseUrl}/api/clients/notes/`;

                  // Prepare headers
                  const headers = {
                    'Content-Type': 'application/json',
                  };

                  if (isValidToken) {
                    headers['Authorization'] = `Bearer ${token.trim()}`;
                  }

                  // Prepare request body
                  const requestBody = {
                    client_id: parseInt(id),
                    note: noteText.trim()
                  };

                  console.log('Saving note to:', apiUrl);
                  console.log('Request body:', requestBody);

                  // Call API
                  const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: headers,
                    credentials: 'include',
                    body: JSON.stringify(requestBody),
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
                    throw new Error('Failed to parse server response');
                  }

                  if (response.ok) {
                    // Success - close modal and reset
                    setNoteText('');
                    setShowNotesModal(false);
                    // Show success popup
                    setShowSuccessPopup(true);
                    // Auto hide after 3 seconds
                    setTimeout(() => {
                      setShowSuccessPopup(false);
                    }, 3000);
                  } else {
                    // Handle error silently - just log it
                    const errorMessage = result.message || result.detail || 'Failed to save note';
                    console.error('Error saving note:', errorMessage);
                    setSavingNote(false);
                  }
                } catch (error) {
                  // Handle error silently - just log it
                  console.error('Error saving note:', error);
                  setSavingNote(false);
                }
              }}
              disabled={!noteText.trim() || savingNote}
              className="mt-4 px-4 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingNote ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {/* Success Message */}
              <div>
                <h3 className="text-xl font-bold text-[#003F8F] font-[Poppins] mb-2">Success!</h3>
                <p className="text-gray-600 font-[Inter]">Note saved successfully!</p>
              </div>
              {/* Close Button */}
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="px-6 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;

