import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteWorkoutModal from './DeleteWorkoutModal';
import AddEditWorkout from './AddEditWorkout';
import RestDay from './RestDay';

const WorkoutPlan = ({ onBack }) => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showRestDay, setShowRestDay] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedCadence, setSelectedCadence] = useState('For 3 Weeks');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showCadenceDropdown, setShowCadenceDropdown] = useState(false);
  const fullBodyWorkout = {
    workoutName: 'Full Body Workout',
    exercises: [
      {
        id: 1,
        label: 'A1',
        name: 'Barbell Squat',
        sets: 4,
        reps: 8,
        notes: 'Keep chest up, go below parallel',
        videoLinks: ['Seated Cable Row...']
      },
      {
        id: 2,
        label: 'A2',
        name: 'Bench Press',
        sets: 3,
        reps: 10,
        notes: 'Shoulders retracted, elbows at 45°',
        videoLinks: ['Bench Press Form...']
      },
      {
        id: 3,
        label: 'B',
        name: 'Romanian Deadlift',
        sets: 3,
        reps: 10,
        notes: 'Slight knee bend, hinge at hips',
        videoLinks: []
      }
    ]
  };

  const [workouts, setWorkouts] = useState({
    Mon: fullBodyWorkout,
    Tue: fullBodyWorkout,
    Wed: fullBodyWorkout,
    Thu: fullBodyWorkout,
    Fri: fullBodyWorkout,
    Sat: fullBodyWorkout,
    Sun: { workoutName: 'Rest Day', exercises: [] }
  });
  const [isRestDay, setIsRestDay] = useState(false);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDelete = () => {
    setWorkouts(prev => ({
      ...prev,
      [selectedDay]: { workoutName: '', exercises: [] }
    }));
    setIsRestDay(false);
    setShowDeleteModal(false);
  };

  const handleEdit = (exerciseId) => {
    setEditingExerciseId(exerciseId);
    setShowAddWorkout(true);
  };

  const handleAddWorkout = () => {
    setEditingExerciseId(null);
    setShowAddWorkout(true);
  };

  const handleSave = () => {
    // Save logic
    console.log('Workout saved');
    setShowAddWorkout(false);
  };

  const handleToggleRestDay = () => {
    const newRestDayState = !isRestDay;
    setIsRestDay(newRestDayState);
    if (newRestDayState) {
      setShowRestDay(true);
    } else {
      setShowRestDay(false);
    }
  };

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

  const currentDayData = workouts[selectedDay] || { workoutName: '', exercises: [] };
  const currentWorkouts = currentDayData.exercises || [];
  const workoutName = currentDayData.workoutName || '';
  const isSunday = selectedDay === 'Sun';

  if (showRestDay && isRestDay && !isSunday) {
    return <RestDay day={selectedDay} onBack={() => { setShowRestDay(false); setIsRestDay(false); }} onToggle={() => setIsRestDay(false)} />;
  }

  if (showAddWorkout) {
    return (
      <AddEditWorkout
        day={selectedDay}
        exerciseId={editingExerciseId}
        onBack={() => {
          setShowAddWorkout(false);
          setEditingExerciseId(null);
        }}
        onSave={() => {
          handleSave();
          setShowAddWorkout(false);
          setEditingExerciseId(null);
        }}
        onToggleRestDay={() => {
          setShowAddWorkout(false);
          setIsRestDay(true);
          setShowRestDay(true);
        }}
        isRestDay={isRestDay}
      />
    );
  }

  if (showDeleteModal) {
    return (
      <DeleteWorkoutModal
        day={selectedDay}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-100 overflow-hidden p-6">
      {/* AI Chatbox Header - Inside Gray Box */}
      <div className="bg-[#003F8F] text-white p-4 flex items-center justify-between rounded-lg mb-6">
        <h2 className="text-xl font-bold font-[Poppins]">AI Chatbox</h2>
        <button 
          onClick={() => setShowAssignModal(true)}
          className="px-4 py-2 bg-[#FB923C] text-white rounded-lg font-semibold text-sm hover:bg-[#EA7A1A] transition flex items-center gap-2"
        >
          <span>+</span>
          Assign To Client
        </button>
      </div>

      {/* Main Content - Gray Background */}
      <div className="flex-1 overflow-y-auto">
        {/* White Bordered Box - Contains All Content */}
        <div className="bg-white rounded-lg !border border-[#4D60804D] p-6">
          {/* Title and Actions */}
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
              <button
                onClick={handleAddWorkout}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.3333 2L14 4.66667M11.3333 2L8.66667 4.66667M11.3333 2V5.33333M14 4.66667H11.3333M14 4.66667V14C14 14.3682 13.7015 14.6667 13.3333 14.6667H2.66667C2.29848 14.6667 2 14.3682 2 14V2.66667C2 2.29848 2.29848 2 2.66667 2H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Edit
              </button>
            </div>
          </div>

          {/* Day Tabs - Full Width */}
          <div className="flex items-end w-full mb-6 border border-gray-200 rounded-lg overflow-hidden">
            {days.map((day, index) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 py-3 font-semibold text-sm transition relative ${
                  index > 0 ? 'border-l border-gray-200' : ''
                } ${selectedDay === day
                    ? 'bg-[#003F8F] text-white z-10'
                    : 'bg-white text-[#003F8F] hover:bg-gray-50'
                  }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Workout Content */}
          {isSunday ? (
            <>
              {/* Rest Day Title - Outside the Box, Separate Section */}
              <h4 className="text-xl font-bold text-[#003F8F] font-[Poppins] mb-4 mt-4">
                Rest Day
              </h4>

              {/* Rest Day Content Card */}
              <div className="bg-white rounded-lg p-12 flex flex-col items-center justify-center min-h-[400px] !border border-[#4D60804D]">
                <div className="text-center">
                  <div className="mb-6 flex justify-center">
                    <svg width="70" height="43" viewBox="0 0 70 43" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                      <path d="M5.64048 25.3202V2.82024C5.64048 2.44988 5.56753 2.08315 5.4258 1.74098C5.28407 1.39881 5.07634 1.08791 4.81445 0.826029C4.55257 0.564145 4.24167 0.356407 3.8995 0.214677C3.55733 0.0729466 3.1906 0 2.82024 0C2.44988 0 2.08315 0.0729466 1.74098 0.214677C1.39881 0.356407 1.08791 0.564145 0.826029 0.826029C0.564146 1.08791 0.356408 1.39881 0.214678 1.74098C0.0729477 2.08315 -5.51878e-09 2.44988 0 2.82024V39.6612C-5.51878e-09 40.0316 0.0729477 40.3983 0.214678 40.7404C0.356408 41.0826 0.564146 41.3935 0.826029 41.6554C1.08791 41.9173 1.39881 42.125 1.74098 42.2668C2.08315 42.4085 2.44988 42.4814 2.82024 42.4814C3.1906 42.4814 3.55733 42.4085 3.8995 42.2668C4.24167 42.125 4.55257 41.9173 4.81445 41.6554C5.07634 41.3935 5.28407 41.0826 5.4258 40.7404C5.56753 40.3983 5.64048 40.0316 5.64048 39.6612V34.3764L63.4032 34.2425V39.5244C63.4032 39.8947 63.4761 40.2613 63.6178 40.6034C63.7595 40.9455 63.9672 41.2563 64.229 41.5181C64.4908 41.7799 64.8017 41.9876 65.1437 42.1293C65.4858 42.271 65.8525 42.3439 66.2227 42.3439C66.593 42.3439 66.9596 42.271 67.3017 42.1293C67.6438 41.9876 67.9546 41.7799 68.2164 41.5181C68.4782 41.2563 68.6859 40.9455 68.8276 40.6034C68.9693 40.2613 69.0423 39.8947 69.0423 39.5244V25.1863L5.64048 25.3202Z" fill="#4D6080" fill-opacity="0.3" />
                      <path d="M69.0422 22.9053H26.1733V12.2839C26.1733 10.8042 26.761 9.38512 27.8072 8.33871C28.8533 7.2923 30.2722 6.70424 31.7519 6.70386H57.777C60.7647 6.70386 63.6301 7.89072 65.7427 10.0033C67.8553 12.116 69.0422 14.9813 69.0422 17.969V22.9053Z" fill="#4D6080" fill-opacity="0.3" />
                      <path d="M16.1381 21.6899C19.9403 21.6899 23.0227 18.6076 23.0227 14.8053C23.0227 11.003 19.9403 7.92065 16.1381 7.92065C12.3358 7.92065 9.25342 11.003 9.25342 14.8053C9.25342 18.6076 12.3358 21.6899 16.1381 21.6899Z" fill="#4D6080" fill-opacity="0.3" />
                    </svg>

                  </div>
                  <h4 className="text-2xl font-bold text-[#003F8F] font-[Poppins] mb-2">Rest & Recovery</h4>
                  <p className="text-base text-[#003F8F] font-[Inter]">Active recovery or complete rest day</p>
                </div>
              </div>
            </>
          ) : currentWorkouts.length === 0 && !isRestDay ? (
            <div className="bg-white rounded-b-lg rounded-tl-none rounded-tr-none p-12 flex flex-col items-center justify-center min-h-[400px] border border-gray-200 border-t-0">
              <button
                onClick={() => navigate('/coach/ai-program/add-workout')}
                className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8V24M8 16H24" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <p className="mt-4 text-gray-500 font-[Inter]">Add Workout</p>
            </div>
          ) : (
            <>
              {/* Workout Name - Outside the Box, Separate Section */}
              {workoutName && (
                <h4 className="text-xl font-bold text-[#003F8F] font-[Poppins] mb-4 mt-4">
                  {workoutName}
                </h4>
              )}

              {/* Exercises Box - Single Main White Box with Border */}
              <div className="bg-white rounded-lg p-6 !border border-[#4D60804D]">
                {/* Exercises - All in One Main Box, A1 and A2 with Blue Left Border */}
                <div>
                  {currentWorkouts.map((exercise, index) => {
                    const isA1OrA2 = exercise.label === 'A1' || exercise.label === 'A2';
                    const prevExercise = index > 0 ? currentWorkouts[index - 1] : null;
                    const isPrevA1OrA2 = prevExercise && (prevExercise.label === 'A1' || prevExercise.label === 'A2');
                    const shouldAddSpacing = !isA1OrA2 || !isPrevA1OrA2;

                    return (
                      <div
                        key={exercise.id}
                        className={`bg-white py-4 ${isA1OrA2 ? 'border-l-4 border-l-[#003F8F] pl-4' : 'pl-4'} ${shouldAddSpacing && index > 0 ? 'mt-6' : ''}`}
                      >
                        <h5 className="text-lg font-bold text-[#003F8F] font-[Poppins] mb-2">
                          <span className="text-[#003F8F]">{exercise.label}.</span> <span className="text-[#003F8F]">{exercise.name}</span>
                        </h5>
                        <p className="text-sm text-[#003F8F] font-[Inter] mb-2">
                          {exercise.sets} × {exercise.reps}
                        </p>
                        <p className="text-sm text-gray-600 font-[Inter] mb-3">
                          {exercise.notes}
                        </p>
                        {exercise.videoLinks.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {exercise.videoLinks.map((link, idx) => (
                              <button
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4D60801A] rounded-full hover:bg-[#4D60801A] transition"
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M7.5 5L9.7765 3.862C9.85271 3.82392 9.93739 3.80594 10.0225 3.80977C10.1076 3.81361 10.1903 3.83912 10.2628 3.8839C10.3353 3.92868 10.3951 3.99124 10.4366 4.06564C10.4781 4.14003 10.5 4.2238 10.5 4.309V7.691C10.5 7.7762 10.4781 7.85997 10.4366 7.93436C10.3951 8.00876 10.3353 8.07132 10.2628 8.1161C10.1903 8.16088 10.1076 8.18639 10.0225 8.19023C9.93739 8.19406 9.85271 8.17608 9.7765 8.138L7.5 7V5ZM1.5 4C1.5 3.73478 1.60536 3.48043 1.79289 3.29289C1.98043 3.10536 2.23478 3 2.5 3H6.5C6.76522 3 7.01957 3.10536 7.20711 3.29289C7.39464 3.48043 7.5 3.73478 7.5 4V8C7.5 8.26522 7.39464 8.51957 7.20711 8.70711C7.01957 8.89464 6.76522 9 6.5 9H2.5C2.23478 9 1.98043 8.89464 1.79289 8.70711C1.60536 8.51957 1.5 8.26522 1.5 8V4Z" stroke="#003F8F" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-xs font-medium text-[#003F8F]">{link}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          {/* End of White Bordered Box */}
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

export default WorkoutPlan;

