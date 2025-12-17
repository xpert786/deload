import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArchiveIconForCoach, DeleteIconForCoach, EditIconForCoach, LocationIconForCoach, MailIconForCoach, MobileIconForCoach, PercentageIconForCoach, SearchIcon } from '../Components/Icons';
import ProfileLogo from "../../assets/clientprofile.jpg";
import { MessageIconForCoach } from '../Components/Icons';
import WorkOut from './ClientDashboard/WorkOut';
import CustomWorkouts from './ClientDashboard/CustomWorkouts';

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
  const [activeTab, setActiveTab] = useState('Overview');
  const [timeRange, setTimeRange] = useState('Weekly');
  const [searchNote, setSearchNote] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const tabs = ['Overview', 'Workout Calendar', 'Custom Workouts'];

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

  const filteredNotes = notes.filter(note =>
    note.text.toLowerCase().includes(searchNote.toLowerCase())
  );

  return (
    <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7] text-[#003F8F]">
      {/* Profile Header Section */}
      <div className="bg-white rounded-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Profile Image and Info */}
          <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={ProfileLogo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#003F8F] font-[Poppins] mb-1">John Doe</h1>
              <p className="text-sm text-gray-600 font-[Inter] mb-4">Male • 20 yo • Beginner</p>

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
            <button className="px-4 py-2 !border border-[#4D60804D] text-[#003F8F] rounded-lg font-semibold text-sm hover:bg-[#003F8F] hover:text-white transition flex items-center gap-2">
              <EditIconForCoach />
              Edit
            </button>
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
              <span>john.doe@email.com</span>
            </div>

            <div className="flex items-center gap-3">
              <MobileIconForCoach className="w-5 h-5 text-[#003F8F]" />
              <span>(555) 123-4567</span>
            </div>

            <div className="flex items-center gap-3">
              <LocationIconForCoach className="w-5 h-5 text-[#003F8F]" />
              <span>789 New York, USA</span>
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
        <WorkOut />
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
                    <p className="text-base font-medium text-gray-500 font-[Inter]">Build Muscle</p>
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
                {filteredNotes.map((note) => (
                  <div key={note.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-[Inter] mb-2">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 8 14.6667Z" stroke="#4D6080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 4.66667V8L10.6667 10.6667" stroke="#4D6080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-semibold text-[#003F8F]">{note.date}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-[Inter]">{note.text}</p>
                  </div>
                ))}
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
                // TODO: Add API call to save note
                // For now, just close the modal
                setTimeout(() => {
                  setSavingNote(false);
                  setNoteText('');
                  setShowNotesModal(false);
                  // You can add the note to the notes array here or make an API call
                }, 500);
              }}
              disabled={!noteText.trim() || savingNote}
              className="mt-4 px-4 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingNote ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;

