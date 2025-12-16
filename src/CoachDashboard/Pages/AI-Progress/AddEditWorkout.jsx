import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AddEditWorkout = ({ day, onBack, onSave, exerciseId = null, onToggleRestDay, isRestDay = false, initialWorkoutName = '', initialExercises = [], isEditMode = false }) => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(day);
  const [workoutName, setWorkoutName] = useState(initialWorkoutName || 'Full Body');
  const [fullBodyVideoLinks, setFullBodyVideoLinks] = useState([
    'Seated Cable Row...',
    'Bench Press Form...',
    'How to Barbell...'
  ]);
  
  // Initialize exercises from props if provided (for editing), otherwise use default
  const getInitialExercises = () => {
    if (initialExercises && initialExercises.length > 0) {
      // If editing a single exercise, return just that exercise
      if (isEditMode && exerciseId) {
        return initialExercises;
      }
      // Otherwise return all exercises
      return initialExercises.map(ex => ({
        ...ex,
        videoLinks: ex.videoLinks || []
      }));
    }
    // Default exercises for new workout
    return [
      {
        id: 1,
        label: 'A1',
        name: 'Barbell Squat',
        sets: 4,
        reps: 8,
        notes: 'Keep chest up, go below parallel',
        videoLinks: ['Seated Cable Row...'],
        isSuperset: true
      },
      {
        id: 2,
        label: 'A2',
        name: 'Bench Press',
        sets: 3,
        reps: 10,
        notes: 'Shoulders retracted, elbows at 45°',
        videoLinks: ['Bench Press Form...'],
        isSuperset: true
      },
      {
        id: 3,
        label: 'B',
        name: 'Romanian Deadlift',
        sets: 3,
        reps: 10,
        notes: 'Slight knee bend, hinge at hips',
        videoLinks: [],
        isSuperset: false
      },
      {
        id: 4,
        label: 'C',
        name: 'Exercise Title',
        sets: 0,
        reps: 0,
        notes: 'Sets, Reps, Rest, Notes',
        videoLinks: [],
        isSuperset: false
      }
    ];
  };
  
  const [exercises, setExercises] = useState(getInitialExercises());
  const [newVideoLinks, setNewVideoLinks] = useState({});
  const [newFullBodyVideoLink, setNewFullBodyVideoLink] = useState('');
  const [showFullBodyVideoInput, setShowFullBodyVideoInput] = useState(false);
  const [showExerciseVideoInputs, setShowExerciseVideoInputs] = useState({});
  const [hoveredExerciseId, setHoveredExerciseId] = useState(null);
  const [showReorderMenuFor, setShowReorderMenuFor] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isWorkoutDeleted, setIsWorkoutDeleted] = useState(false);
  const [showSuggestionsFor, setShowSuggestionsFor] = useState(null);
  const [suggestionInputValue, setSuggestionInputValue] = useState({});
  const [localEditMode, setLocalEditMode] = useState(isEditMode || false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // Use prop isEditMode if provided, otherwise use local state
  const currentEditMode = isEditMode !== undefined ? isEditMode : localEditMode;
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedCadence, setSelectedCadence] = useState('For 3 Weeks');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showCadenceDropdown, setShowCadenceDropdown] = useState(false);
  const menuRef = useRef(null);
  const suggestionRefs = useRef({});

  // Exercise suggestions list
  const exerciseSuggestions = [
    'Burpees', 'Biceps Curls', 'Box Jumps', 'Bridge Pose', 'Bent-Over Rows',
    'Bodyweight Squats', 'Balls Slams', 'Barbell Squat', 'Bench Press',
    'Bulgarian Split Squats', 'Bicep Hammer Curls', 'Back Extensions',
    'A1', 'A2', 'Arnold Press', 'Ab Crunches', 'Assisted Pull-ups',
    'Calf Raises', 'Chest Press', 'Cable Crossovers', 'Chin-ups',
    'Deadlifts', 'Dumbbell Rows', 'Dips', 'Dumbbell Press',
    'Front Squats', 'Face Pulls', 'Flyes', 'Farmer\'s Walk',
    'Goblet Squats', 'Glute Bridges', 'Good Mornings',
    'Hip Thrusts', 'Hammer Curls', 'Hanging Leg Raises',
    'Incline Press', 'Inverted Rows', 'Isometric Holds',
    'Jump Squats', 'Jumping Lunges', 'Jogging',
    'Kettlebell Swings', 'Knee Raises', 'Kickbacks',
    'Lunges', 'Leg Press', 'Lat Pulldowns', 'Lateral Raises',
    'Military Press', 'Mountain Climbers', 'Muscle-ups',
    'Overhead Press', 'Overhead Squats', 'One-Arm Rows',
    'Pull-ups', 'Push-ups', 'Planks', 'Pistol Squats',
    'Romanian Deadlift', 'Rows', 'Reverse Flyes',
    'Squats', 'Shoulder Press', 'Side Planks', 'Snatches',
    'Tricep Dips', 'T-Bar Rows', 'Turkish Get-ups',
    'Upright Rows', 'Underhand Rows',
    'V-Ups', 'Vertical Jumps',
    'Wall Sits', 'Wide Grip Pull-ups',
    'Zercher Squats'
  ];

  // Update state when initial props change (for editing)
  useEffect(() => {
    if (initialWorkoutName && initialWorkoutName !== workoutName) {
      setWorkoutName(initialWorkoutName);
    }
    if (initialExercises && initialExercises.length > 0) {
      const exercisesToUse = isEditMode && exerciseId 
        ? initialExercises 
        : initialExercises.map(ex => ({
            ...ex,
            videoLinks: ex.videoLinks || []
          }));
      setExercises(exercisesToUse);
    }
  }, [initialWorkoutName, initialExercises, isEditMode, exerciseId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowReorderMenuFor(null);
      }
      // Close suggestions when clicking outside
      if (!event.target.closest('.suggestions-dropdown') && !event.target.closest('input[type="text"]')) {
        setShowSuggestionsFor(null);
      }
    };

    if (showReorderMenuFor || showSuggestionsFor) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReorderMenuFor, showSuggestionsFor]);

  const handleAddExercise = () => {
    const nextLabel = String.fromCharCode(65 + exercises.length);
    setExercises([
      ...exercises,
      {
        id: exercises.length + 1,
        label: nextLabel,
        name: '',
        sets: 0,
        reps: 0,
        notes: '',
        videoLinks: [],
        isSuperset: false
      }
    ]);
  };

  const handleAddVideoLink = (exerciseId) => {
    const link = newVideoLinks[exerciseId];
    if (link && link.trim()) {
      setExercises(exercises.map(ex =>
        ex.id === exerciseId
          ? { ...ex, videoLinks: [...ex.videoLinks, link] }
          : ex
      ));
      setNewVideoLinks({ ...newVideoLinks, [exerciseId]: '' });
      setShowExerciseVideoInputs({ ...showExerciseVideoInputs, [exerciseId]: false });
    }
  };

  const handleShowExerciseVideoInput = (exerciseId) => {
    setShowExerciseVideoInputs({ ...showExerciseVideoInputs, [exerciseId]: true });
  };

  const handleAddFullBodyVideoLink = () => {
    if (newFullBodyVideoLink.trim()) {
      setFullBodyVideoLinks([...fullBodyVideoLinks, newFullBodyVideoLink]);
      setNewFullBodyVideoLink('');
      setShowFullBodyVideoInput(false);
    }
  };

  const handleShowFullBodyVideoInput = () => {
    setShowFullBodyVideoInput(true);
  };

  const handleRemoveVideoLink = (exerciseId, linkIndex) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, videoLinks: ex.videoLinks.filter((_, idx) => idx !== linkIndex) }
        : ex
    ));
  };

  const handleRemoveFullBodyVideoLink = (linkIndex) => {
    setFullBodyVideoLinks(fullBodyVideoLinks.filter((_, idx) => idx !== linkIndex));
  };

  const handleUpdateExercise = (exerciseId, field, value) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, [field]: value }
        : ex
    ));
  };

  const toggleSuperset = (exerciseId) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, isSuperset: !ex.isSuperset }
        : ex
    ));
  };

  const handleAddSuperset = (exerciseId) => {
    const exerciseIndex = exercises.findIndex(ex => ex.id === exerciseId);
    if (exerciseIndex === -1) return;

    const currentExercise = exercises[exerciseIndex];
    const baseLetter = currentExercise.label.replace(/[0-9]/g, '') || 'A';

    // Convert current exercise to B1 (or baseLetter1)
    const updatedExercise = {
      ...currentExercise,
      label: `${baseLetter}1`,
      isSuperset: true
    };

    // Create B2 (or baseLetter2)
    const maxId = Math.max(...exercises.map(ex => ex.id), 0);
    const newExercise2 = {
      id: maxId + 1,
      label: `${baseLetter}2`,
      name: '',
      sets: 0,
      reps: 0,
      notes: '',
      videoLinks: [],
      isSuperset: true
    };

    // Replace current exercise with B1 and add B2 after it
    const newExercises = [...exercises];
    newExercises[exerciseIndex] = updatedExercise;
    newExercises.splice(exerciseIndex + 1, 0, newExercise2);
    setExercises(newExercises);
  };

  const handleDeleteExercise = (exerciseId) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
    setHoveredExerciseId(null);
  };

  const handleMoveExercise = (exerciseId, direction) => {
    const currentIndex = exercises.findIndex(ex => ex.id === exerciseId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= exercises.length) return;

    const newExercises = [...exercises];
    [newExercises[currentIndex], newExercises[newIndex]] = [newExercises[newIndex], newExercises[currentIndex]];
    setExercises(newExercises);
  };

  // Filter suggestions based on input
  const getFilteredSuggestions = (exerciseId) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    const inputValue = suggestionInputValue[exerciseId] !== undefined
      ? suggestionInputValue[exerciseId]
      : (exercise ? exercise.name : '');

    if (!inputValue.trim()) return [];

    const searchTerm = inputValue.toLowerCase();
    return exerciseSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(searchTerm)
    ).slice(0, 10); // Limit to 10 suggestions
  };

  // Handle exercise name input change
  const handleExerciseNameChange = (exerciseId, value) => {
    const parts = value.split('. ');
    const exerciseName = parts.length > 1 ? parts.slice(1).join('. ') : value;

    handleUpdateExercise(exerciseId, 'name', exerciseName);

    // Update suggestion input value
    setSuggestionInputValue({
      ...suggestionInputValue,
      [exerciseId]: exerciseName
    });

    // Show suggestions if there are filtered results
    const filtered = exerciseName.trim()
      ? exerciseSuggestions.filter(s => s.toLowerCase().includes(exerciseName.toLowerCase())).slice(0, 10)
      : [];

    if (filtered.length > 0) {
      setShowSuggestionsFor(exerciseId);
    } else {
      setShowSuggestionsFor(null);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (exerciseId, suggestion) => {
    handleUpdateExercise(exerciseId, 'name', suggestion);
    setSuggestionInputValue({
      ...suggestionInputValue,
      [exerciseId]: suggestion
    });
    setShowSuggestionsFor(null);
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
                onClick={() => {
                  navigate('/coach/ai-program/add-workout');
                }}
                className="px-4 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition flex items-center gap-2"
              >
                <span>+</span>
                Add Workout
              </button>
              <button 
                onClick={() => {
                  if (isEditMode === undefined) {
                    setLocalEditMode(!localEditMode);
                  }
                }}
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
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, index) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`flex-1 py-3 font-semibold text-sm transition relative ${index > 0 ? 'border-l border-gray-200' : ''
                } ${d === selectedDay
                  ? 'bg-[#003F8F] text-white z-10'
                  : 'bg-white text-[#003F8F] hover:bg-gray-50'
                  }`}
              >
                {d}
              </button>
            ))}
            {false && onToggleRestDay && !exerciseId && !currentEditMode && (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm text-gray-600 font-[Inter] whitespace-nowrap">Toggle Rest Day</span>
                <button
                  onClick={onToggleRestDay}
                  className={`w-12 h-6 rounded-full transition relative ${isRestDay ? 'bg-[#003F8F]' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isRestDay ? 'transform translate-x-6' : 'transform translate-x-1'}`}></div>
                </button>
              </div>
            )}
          </div>

          {/* Workout Name - Outside the Box, Separate Section */}
          {selectedDay !== 'Sun' && !isWorkoutDeleted && exercises.length > 0 && workoutName && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xl font-bold text-[#003F8F] font-[Poppins]">
                  {workoutName}
                </h4>
                <button className="text-[#003F8F] hover:text-[#002F6F] transition">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="10" cy="15" r="1.5" fill="currentColor" />
                    <circle cx="5" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="5" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="5" cy="15" r="1.5" fill="currentColor" />
                  </svg>
                </button>
              </div>
              <div className="border-t border-gray-300"></div>
            </div>
          )}

          {/* Video Links Section for Full Body Workout */}
          {selectedDay !== 'Sun' && !isWorkoutDeleted && exercises.length > 0 && workoutName && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                <h6 className="text-sm font-semibold text-[#9CA3AF]">Video Links</h6>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5 8.33333L16.2942 6.43667C16.4212 6.3732 16.5623 6.34323 16.7042 6.34962C16.846 6.35601 16.9839 6.39854 17.1047 6.47317C17.2255 6.5478 17.3252 6.65206 17.3944 6.77606C17.4636 6.90006 17.4999 7.03967 17.5 7.18167V12.8183C17.4999 12.9603 17.4636 13.0999 17.3944 13.2239C17.3252 13.3479 17.2255 13.4522 17.1047 13.5268C16.9839 13.6015 16.846 13.644 16.7042 13.6504C16.5623 13.6568 16.4212 13.6268 16.2942 13.5633L12.5 11.6667V8.33333ZM2.5 6.66667C2.5 6.22464 2.67559 5.80072 2.98816 5.48816C3.30072 5.17559 3.72464 5 4.16667 5H10.8333C11.2754 5 11.6993 5.17559 12.0118 5.48816C12.3244 5.80072 12.5 6.22464 12.5 6.66667V13.3333C12.5 13.7754 12.3244 14.1993 12.0118 14.5118C11.6993 14.8244 11.2754 15 10.8333 15H4.16667C3.72464 15 3.30072 14.8244 2.98816 14.5118C2.67559 14.1993 2.5 13.7754 2.5 13.3333V6.66667Z" stroke="#4D6080" stroke-opacity="0.8" stroke-linecap="round" stroke-linejoin="round" />
</svg>

              </div>
              <div className="space-y-2">
                {fullBodyVideoLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.5 5L9.7765 3.862C9.85271 3.82392 9.93739 3.80594 10.0225 3.80977C10.1076 3.81361 10.1903 3.83912 10.2628 3.8839C10.3353 3.92868 10.3951 3.99124 10.4366 4.06564C10.4781 4.14003 10.5 4.2238 10.5 4.309V7.691C10.5 7.7762 10.4781 7.85997 10.4366 7.93436C10.3951 8.00876 10.3353 8.07132 10.2628 8.1161C10.1903 8.16088 10.1076 8.18639 10.0225 8.19023C9.93739 8.19406 9.85271 8.17608 9.7765 8.138L7.5 7V5ZM1.5 4C1.5 3.73478 1.60536 3.48043 1.79289 3.29289C1.98043 3.10536 2.23478 3 2.5 3H6.5C6.76522 3 7.01957 3.10536 7.20711 3.29289C7.39464 3.48043 7.5 3.73478 7.5 4V8C7.5 8.26522 7.39464 8.51957 7.20711 8.70711C7.01957 8.89464 6.76522 9 6.5 9H2.5C2.23478 9 1.98043 8.89464 1.79289 8.70711C1.60536 8.51957 1.5 8.26522 1.5 8V4Z" stroke="#003F8F" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="flex-1 text-sm text-[#003F8F]">{link}</span>
                    <button
                      onClick={() => handleRemoveFullBodyVideoLink(idx)}
                      className="w-5 h-5 bg-[#003F8F] rounded-full flex items-center justify-center hover:bg-[#002F6F] transition"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
                {!showFullBodyVideoInput ? (
                  <button
                    onClick={handleShowFullBodyVideoInput}
                    className="w-full flex items-center justify-between bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-[#003F8F] font-semibold hover:bg-gray-200 transition shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 2.5V11.5M2.5 7H11.5" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span>Add Video link</span>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.5 5L9.7765 3.862C9.85271 3.82392 9.93739 3.80594 10.0225 3.80977C10.1076 3.81361 10.1903 3.83912 10.2628 3.8839C10.3353 3.92868 10.3951 3.99124 10.4366 4.06564C10.4781 4.14003 10.5 4.2238 10.5 4.309V7.691C10.5 7.7762 10.4781 7.85997 10.4366 7.93436C10.3951 8.00876 10.3353 8.07132 10.2628 8.1161C10.1903 8.16088 10.1076 8.18639 10.0225 8.19023C9.93739 8.19406 9.85271 8.17608 9.7765 8.138L7.5 7V5ZM1.5 4C1.5 3.73478 1.60536 3.48043 1.79289 3.29289C1.98043 3.10536 2.23478 3 2.5 3H6.5C6.76522 3 7.01957 3.10536 7.20711 3.29289C7.39464 3.48043 7.5 3.73478 7.5 4V8C7.5 8.26522 7.39464 8.51957 7.20711 8.70711C7.01957 8.89464 6.76522 9 6.5 9H2.5C2.23478 9 1.98043 8.89464 1.79289 8.70711C1.60536 8.51957 1.5 8.26522 1.5 8V4Z" stroke="#003F8F" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newFullBodyVideoLink}
                      onChange={(e) => setNewFullBodyVideoLink(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddFullBodyVideoLink();
                        }
                      }}
                      placeholder="https://"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003F8F] bg-white"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAddFullBodyVideoLink}
                        className="px-4 py-2 bg-[#003F8F] text-white rounded-lg text-sm font-semibold hover:bg-[#002F6F] transition"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowFullBodyVideoInput(false);
                          setNewFullBodyVideoLink('');
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State - Separate White Card with Border (like Rest Day) */}
          {(isWorkoutDeleted || exercises.length === 0) && selectedDay !== 'Sun' ? (
            <div className="bg-white rounded-lg p-12 flex flex-col items-center justify-center min-h-[400px] !border border-[#4D60804D] mt-0">
              <div className="text-center">
                <button
                  onClick={() => {
                    navigate('/coach/ai-program/add-workout');
                  }}
                  className="mb-6 flex justify-center cursor-pointer hover:opacity-80 transition"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center ml-10">
                    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="72" height="72" rx="36" fill="#4D6080" fillOpacity="0.3" />
                      <g clipPath="url(#clip0_1025_156839)">
                        <path d="M31.6364 38.1818H15.2727C14.3455 38.1818 13.5687 37.8676 12.9426 37.2393C12.3164 36.6109 12.0022 35.8342 12 34.9091C11.9978 33.984 12.312 33.2073 12.9426 32.5789C13.5731 31.9505 14.3498 31.6364 15.2727 31.6364H31.6364V15.2727C31.6364 14.3455 31.9505 13.5687 32.5789 12.9426C33.2073 12.3164 33.984 12.0022 34.9091 12C35.8342 11.9978 36.612 12.312 37.2425 12.9426C37.8731 13.5731 38.1862 14.3498 38.1818 15.2727V31.6364H54.5455C55.4727 31.6364 56.2508 31.9505 56.8791 32.5789C57.5075 33.2073 57.8204 33.984 57.8182 34.9091C57.816 35.8342 57.5018 36.612 56.8756 37.2425C56.2495 37.8731 55.4727 38.1862 54.5455 38.1818H38.1818V54.5455C38.1818 55.4727 37.8676 56.2508 37.2393 56.8791C36.6109 57.5075 35.8342 57.8204 34.9091 57.8182C33.984 57.816 33.2073 57.5018 32.5789 56.8756C31.9505 56.2495 31.6364 55.4727 31.6364 54.5455V38.1818Z" fill="white" />
                      </g>
                      <defs>
                        <clipPath id="clip0_1025_156839">
                          <rect width="48" height="48" fill="white" transform="translate(12 12)" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                </button>
                <h4 className="text-2xl font-bold text-[#4D60804D] font-[Poppins] mb-2">Add Workout</h4>
              </div>
            </div>
          ) : selectedDay === 'Sun' ? (
            <>
              {/* Rest Day Title */}
              <h4 className="text-xl font-bold text-[#003F8F] font-[Poppins] mb-4">
                Rest Day
              </h4>
              {/* Rest Day Content Card */}
              <div className="bg-white rounded-lg p-12 flex flex-col items-center justify-center min-h-[400px] !border border-[#4D60804D]">
                <div className="text-center">
                  <div className="mb-6 flex justify-center">
                    <svg width="70" height="43" viewBox="0 0 70 43" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                      <path d="M5.64048 25.3202V2.82024C5.64048 2.44988 5.56753 2.08315 5.4258 1.74098C5.28407 1.39881 5.07634 1.08791 4.81445 0.826029C4.55257 0.564145 4.24167 0.356407 3.8995 0.214677C3.55733 0.0729466 3.1906 0 2.82024 0C2.44988 0 2.08315 0.0729466 1.74098 0.214677C1.39881 0.356407 1.08791 0.564145 0.826029 0.826029C0.564146 1.08791 0.356408 1.39881 0.214678 1.74098C0.0729477 2.08315 -5.51878e-09 2.44988 0 2.82024V39.6612C-5.51878e-09 40.0316 0.0729477 40.3983 0.214678 40.7404C0.356408 41.0826 0.564146 41.3935 0.826029 41.6554C1.08791 41.9173 1.39881 42.125 1.74098 42.2668C2.08315 42.4085 2.44988 42.4814 2.82024 42.4814C3.1906 42.4814 3.55733 42.4085 3.8995 42.2668C4.24167 42.125 4.55257 41.9173 4.81445 41.6554C5.07634 41.3935 5.28407 41.0826 5.4258 40.7404C5.56753 40.3983 5.64048 40.0316 5.64048 39.6612V34.3764L63.4032 34.2425V39.5244C63.4032 39.8947 63.4761 40.2613 63.6178 40.6034C63.7595 40.9455 63.9672 41.2563 64.229 41.5181C64.4908 41.7799 64.8017 41.9876 65.1437 42.1293C65.4858 42.271 65.8525 42.3439 66.2227 42.3439C66.593 42.3439 66.9596 42.271 67.3017 42.1293C67.6438 41.9876 67.9546 41.7799 68.2164 41.5181C68.4782 41.2563 68.6859 40.9455 68.8276 40.6034C68.9693 40.2613 69.0423 39.8947 69.0423 39.5244V25.1863L5.64048 25.3202Z" fill="#4D6080" fillOpacity="0.3" />
                      <path d="M69.0422 22.9053H26.1733V12.2839C26.1733 10.8042 26.761 9.38512 27.8072 8.33871C28.8533 7.2923 30.2722 6.70424 31.7519 6.70386H57.777C60.7647 6.70386 63.6301 7.89072 65.7427 10.0033C67.8553 12.116 69.0422 14.9813 69.0422 17.969V22.9053Z" fill="#4D6080" fillOpacity="0.3" />
                      <path d="M16.1381 21.6899C19.9403 21.6899 23.0227 18.6076 23.0227 14.8053C23.0227 11.003 19.9403 7.92065 16.1381 7.92065C12.3358 7.92065 9.25342 11.003 9.25342 14.8053C9.25342 18.6076 12.3358 21.6899 16.1381 21.6899Z" fill="#4D6080" fillOpacity="0.3" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-[#003F8F] font-[Poppins] mb-2">Rest & Recovery</h4>
                  <p className="text-base text-[#003F8F] font-[Inter]">Active recovery or complete rest day</p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* White Card Container */}
              <div className="bg-white rounded-b-lg rounded-tl-none rounded-tr-none border border-gray-200 border-t-0 p-6">
                {/* Exercises */}
                <div>
                  {exercises.map((exercise, index) => {
                    const prevExercise = index > 0 ? exercises[index - 1] : null;
                    // Show "- Superset" before each exercise that is in a superset
                    const isInSuperset = exercise.isSuperset;
                    const prevIsInSameSuperset = prevExercise && prevExercise.isSuperset &&
                      prevExercise.label.replace(/[0-9]/g, '') === exercise.label.replace(/[0-9]/g, '');
                    // Show "- Superset" before every exercise in superset (including A2 after A1)
                    const showSupersetDivider = isInSuperset;
                    // Show "+ Superset" before exercises that are not in superset, but not before the last exercise
                    const showAddSuperset = !exercise.isSuperset && index > 0 && index < exercises.length - 1;
                    // Show "+ Exercise" after the last exercise only (C ke neeche)
                    const showAddExercise = index === exercises.length - 1;
                    // Check if previous exercise is in the same superset group
                    const isInSameSupersetGroup = prevExercise &&
                      exercise.isSuperset &&
                      prevExercise.isSuperset &&
                      prevExercise.label.replace(/[0-9]/g, '') === exercise.label.replace(/[0-9]/g, '');
                    const hasBlueBorder = exercise.isSuperset;

                    return (
                      <div key={exercise.id}>
                        {/* Superset Divider with Centered Button - Above each exercise in superset */}
                        {showSupersetDivider && (
                          <div
                            className={`relative flex items-center ${isInSameSupersetGroup ? 'mb-0 mt-0' : 'my-4'}`}
                            style={isInSameSupersetGroup ? { marginTop: '0', marginBottom: '0' } : {}}
                          >
                            <div className="flex-1 border-t border-gray-300"></div>
                            <button
                              onClick={() => toggleSuperset(exercise.id)}
                              className="bg-[#003F8F] text-white text-xs font-semibold transition mx-2 hover:bg-[#002F6F]"
                              style={{
                                borderRadius: '9999px',
                                padding: '0.5rem 1.25rem',
                                height: 'auto',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                whiteSpace: 'nowrap',
                                lineHeight: '1.5',
                                border: 'none',
                                outline: 'none'
                              }}
                            >
                              - Superset
                            </button>
                            <div className="flex-1 border-t border-gray-300"></div>
                          </div>
                        )}

                        {/* Add Superset Divider */}
                        {showAddSuperset && (
                          <div className="relative flex items-center my-4">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <button
                              onClick={() => handleAddSuperset(exercise.id)}
                              className="bg-blue-100 text-[#003F8F] text-xs font-semibold transition mx-2 hover:bg-blue-200"
                              style={{
                                borderRadius: '9999px',
                                padding: '0.5rem 1.25rem',
                                height: 'auto',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                whiteSpace: 'nowrap',
                                lineHeight: '1.5',
                                border: 'none',
                                outline: 'none'
                              }}
                            >
                              + Superset
                            </button>
                            <div className="flex-1 border-t border-gray-300"></div>
                          </div>
                        )}

                        {/* Exercise Card - Blue left border for all exercises in superset */}
                        {(() => {
                          // Check if previous exercise is in the same superset group
                          const isInSameSupersetGroup = prevExercise &&
                            exercise.isSuperset &&
                            prevExercise.isSuperset &&
                            prevExercise.label.replace(/[0-9]/g, '') === exercise.label.replace(/[0-9]/g, '');
                          const shouldRemoveTopPadding = isInSameSupersetGroup;

                          return (
                        <div
                              className={`bg-white relative ${shouldRemoveTopPadding ? 'pt-0 pb-4 px-4' : 'p-4'} ${index > 0 && !shouldRemoveTopPadding ? 'mt-6' : ''} ${hasBlueBorder ? 'border-l-4 border-l-[#003F8F]' : ''}`}
                              style={shouldRemoveTopPadding ? {
                                marginTop: '2px',
                                paddingTop: '0',
                                marginBottom: '0',
                                paddingBottom: '1rem',
                                zIndex: 1
                              } : {}}
                          onMouseEnter={() => setHoveredExerciseId(exercise.id)}
                          onMouseLeave={() => setHoveredExerciseId(null)}
                        >
                          <div className="flex items-start justify-between mb-3 relative">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={`${exercise.label}. ${exercise.name}`}
                                onChange={(e) => {
                                  handleExerciseNameChange(exercise.id, e.target.value);
                                }}
                                onFocus={() => {
                                  // Show suggestions if there are filtered results
                                  if (getFilteredSuggestions(exercise.id).length > 0) {
                                    setShowSuggestionsFor(exercise.id);
                                  }
                                }}
                                onBlur={(e) => {
                                  // Delay hiding suggestions to allow click on suggestion
                                  setTimeout(() => {
                                    if (!e.relatedTarget || !e.relatedTarget.closest('.suggestions-dropdown')) {
                                      setShowSuggestionsFor(null);
                                    }
                                  }, 200);
                                }}
                                className="text-lg font-bold text-[#003F8F] font-[Poppins] bg-transparent border-none focus:outline-none focus:ring-0 flex-1 w-full"
                                ref={(el) => {
                                  if (el) {
                                    suggestionRefs.current[exercise.id] = el;
                                  }
                                }}
                              />
                              {/* Suggestions Dropdown */}
                              {showSuggestionsFor === exercise.id && getFilteredSuggestions(exercise.id).length > 0 && (
                                <div className="suggestions-dropdown absolute top-full left-0 mt-1 bg-white rounded-b-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto min-w-[250px]">
                                  <div className="py-1">
                                    <div className="px-4 py-2 text-xs font-bold text-[#003F8F] border-b border-gray-200">
                                      {exercise.label}
                                    </div>
                                    {getFilteredSuggestions(exercise.id).map((suggestion, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectSuggestion(exercise.id, suggestion)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition border-b border-gray-100 last:border-b-0"
                                        onMouseDown={(e) => e.preventDefault()}
                                      >
                                        {suggestion}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Side Dark Blue Pill with Icons - Appears on Hover */}
                          {hoveredExerciseId === exercise.id && (
                            <div className="absolute top-4 right-4 bg-[#003F8F] rounded-full px-3 py-2 flex flex-col items-center gap-3 z-10">
                              {/* Grid Icon - For Reordering (Move Up/Down) */}
                              <div
                                className="relative"
                                ref={menuRef}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (showReorderMenuFor === exercise.id) {
                                      setShowReorderMenuFor(null);
                                    } else {
                                      setShowReorderMenuFor(exercise.id);
                                    }
                                  }}
                                  className="text-white hover:text-gray-200 transition"
                                  title="Reorder Exercise"
                                >
                                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="4.5" cy="4.5" r="1.5" fill="white" />
                                    <circle cx="9" cy="4.5" r="1.5" fill="white" />
                                    <circle cx="13.5" cy="4.5" r="1.5" fill="white" />
                                    <circle cx="4.5" cy="9" r="1.5" fill="white" />
                                    <circle cx="9" cy="9" r="1.5" fill="white" />
                                    <circle cx="13.5" cy="9" r="1.5" fill="white" />
                                    <circle cx="4.5" cy="13.5" r="1.5" fill="white" />
                                    <circle cx="9" cy="13.5" r="1.5" fill="white" />
                                    <circle cx="13.5" cy="13.5" r="1.5" fill="white" />
                                  </svg>
                                </button>
                                {/* Dropdown menu for move up/down */}
                                {showReorderMenuFor === exercise.id && (
                                  <div
                                    className="absolute right-4 top-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[120px]"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const currentIndex = exercises.findIndex(ex => ex.id === exercise.id);
                                        if (currentIndex > 0) {
                                          handleMoveExercise(exercise.id, 'up');
                                          setShowReorderMenuFor(null);
                                        }
                                      }}
                                      disabled={exercises.findIndex(ex => ex.id === exercise.id) === 0}
                                      className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${exercises.findIndex(ex => ex.id === exercise.id) === 0
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 12V4M4 8L8 4L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                      Move Up
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const currentIndex = exercises.findIndex(ex => ex.id === exercise.id);
                                        if (currentIndex < exercises.length - 1) {
                                          handleMoveExercise(exercise.id, 'down');
                                          setShowReorderMenuFor(null);
                                        }
                                      }}
                                      disabled={exercises.findIndex(ex => ex.id === exercise.id) === exercises.length - 1}
                                      className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${exercises.findIndex(ex => ex.id === exercise.id) === exercises.length - 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 4V12M4 8L8 12L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                      Move Down
                                    </button>
                                  </div>
                                )}
                              </div>
                              {/* Trash Icon - For Deleting */}
                              <button
                                onClick={() => handleDeleteExercise(exercise.id)}
                                className="text-white hover:text-gray-200 transition"
                                title="Delete Exercise"
                              >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M3 4.5H15M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M7.5 8.25V12.75M10.5 8.25V12.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            </div>
                          )}

                          <div className="mb-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={exercise.sets || ''}
                                onChange={(e) => handleUpdateExercise(exercise.id, 'sets', parseInt(e.target.value) || 0)}
                                placeholder="Sets"
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#003F8F]"
                              />
                              <span className="text-gray-700">x</span>
                              <input
                                type="number"
                                value={exercise.reps || ''}
                                onChange={(e) => handleUpdateExercise(exercise.id, 'reps', parseInt(e.target.value) || 0)}
                                placeholder="Reps"
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#003F8F]"
                              />
                            </div>
                            <input
                              type="text"
                              value={exercise.notes}
                              onChange={(e) => handleUpdateExercise(exercise.id, 'notes', e.target.value)}
                              placeholder="Sets, Reps, Rest, Notes"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#003F8F]"
                            />
                          </div>

                          {/* Video Links */}
                          <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">

                                    <h6 className="text-sm font-semibold text-[#4D6080CC]">Video Links</h6>
                                  </div>
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.5 8.33333L16.2942 6.43667C16.4212 6.3732 16.5623 6.34323 16.7042 6.34962C16.846 6.35601 16.9839 6.39854 17.1047 6.47317C17.2255 6.5478 17.3252 6.65206 17.3944 6.77606C17.4636 6.90006 17.4999 7.03967 17.5 7.18167V12.8183C17.4999 12.9603 17.4636 13.0999 17.3944 13.2239C17.3252 13.3479 17.2255 13.4522 17.1047 13.5268C16.9839 13.6015 16.846 13.644 16.7042 13.6504C16.5623 13.6568 16.4212 13.6268 16.2942 13.5633L12.5 11.6667V8.33333ZM2.5 6.66667C2.5 6.22464 2.67559 5.80072 2.98816 5.48816C3.30072 5.17559 3.72464 5 4.16667 5H10.8333C11.2754 5 11.6993 5.17559 12.0118 5.48816C12.3244 5.80072 12.5 6.22464 12.5 6.66667V13.3333C12.5 13.7754 12.3244 14.1993 12.0118 14.5118C11.6993 14.8244 11.2754 15 10.8333 15H4.16667C3.72464 15 3.30072 14.8244 2.98816 14.5118C2.67559 14.1993 2.5 13.7754 2.5 13.3333V6.66667Z" stroke="#4D6080" stroke-opacity="0.8" stroke-linecap="round" stroke-linejoin="round" />
                                  </svg>

                                </div>
                            <div className="space-y-2">
                              {exercise.videoLinks.map((link, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.5 5L9.7765 3.862C9.85271 3.82392 9.93739 3.80594 10.0225 3.80977C10.1076 3.81361 10.1903 3.83912 10.2628 3.8839C10.3353 3.92868 10.3951 3.99124 10.4366 4.06564C10.4781 4.14003 10.5 4.2238 10.5 4.309V7.691C10.5 7.7762 10.4781 7.85997 10.4366 7.93436C10.3951 8.00876 10.3353 8.07132 10.2628 8.1161C10.1903 8.16088 10.1076 8.18639 10.0225 8.19023C9.93739 8.19406 9.85271 8.17608 9.7765 8.138L7.5 7V5ZM1.5 4C1.5 3.73478 1.60536 3.48043 1.79289 3.29289C1.98043 3.10536 2.23478 3 2.5 3H6.5C6.76522 3 7.01957 3.10536 7.20711 3.29289C7.39464 3.48043 7.5 3.73478 7.5 4V8C7.5 8.26522 7.39464 8.51957 7.20711 8.70711C7.01957 8.89464 6.76522 9 6.5 9H2.5C2.23478 9 1.98043 8.89464 1.79289 8.70711C1.60536 8.51957 1.5 8.26522 1.5 8V4Z" stroke="#003F8F" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  <span className="flex-1 text-sm text-[#003F8F]">{link}</span>
                                  <button
                                    onClick={() => handleRemoveVideoLink(exercise.id, idx)}
                                    className="w-5 h-5 bg-[#003F8F] rounded-full flex items-center justify-center hover:bg-[#002F6F] transition"
                                  >
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                              {!showExerciseVideoInputs[exercise.id] ? (
                                <button
                                  onClick={() => handleShowExerciseVideoInput(exercise.id)}
                                  className="w-full flex items-center justify-between bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-[#003F8F] font-semibold hover:bg-gray-200 transition shadow-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M7 2.5V11.5M2.5 7H11.5" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    <span>Add Video link</span>
                                  </div>
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.5 5L9.7765 3.862C9.85271 3.82392 9.93739 3.80594 10.0225 3.80977C10.1076 3.81361 10.1903 3.83912 10.2628 3.8839C10.3353 3.92868 10.3951 3.99124 10.4366 4.06564C10.4781 4.14003 10.5 4.2238 10.5 4.309V7.691C10.5 7.7762 10.4781 7.85997 10.4366 7.93436C10.3951 8.00876 10.3353 8.07132 10.2628 8.1161C10.1903 8.16088 10.1076 8.18639 10.0225 8.19023C9.93739 8.19406 9.85271 8.17608 9.7765 8.138L7.5 7V5ZM1.5 4C1.5 3.73478 1.60536 3.48043 1.79289 3.29289C1.98043 3.10536 2.23478 3 2.5 3H6.5C6.76522 3 7.01957 3.10536 7.20711 3.29289C7.39464 3.48043 7.5 3.73478 7.5 4V8C7.5 8.26522 7.39464 8.51957 7.20711 8.70711C7.01957 8.89464 6.76522 9 6.5 9H2.5C2.23478 9 1.98043 8.89464 1.79289 8.70711C1.60536 8.51957 1.5 8.26522 1.5 8V4Z" stroke="#003F8F" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </button>
                              ) : (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={newVideoLinks[exercise.id] || ''}
                                    onChange={(e) => setNewVideoLinks({ ...newVideoLinks, [exercise.id]: e.target.value })}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddVideoLink(exercise.id);
                                      }
                                    }}
                                    placeholder="https://"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003F8F] bg-white"
                                    autoFocus
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleAddVideoLink(exercise.id)}
                                      className="px-4 py-2 bg-[#003F8F] text-white rounded-lg text-sm font-semibold hover:bg-[#002F6F] transition"
                                    >
                                      Add
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowExerciseVideoInputs({ ...showExerciseVideoInputs, [exercise.id]: false });
                                        setNewVideoLinks({ ...newVideoLinks, [exercise.id]: '' });
                                      }}
                                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                          );
                        })()}

                        {/* Add Exercise Divider - After exercise card */}
                        {showAddExercise && (
                          <div className="relative flex items-center my-4">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <button
                              onClick={handleAddExercise}
                              className="bg-blue-100 text-[#003F8F] text-xs font-semibold transition mx-2 hover:bg-blue-200"
                              style={{
                                borderRadius: '9999px',
                                padding: '0.5rem 1.25rem',
                                height: 'auto',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                whiteSpace: 'nowrap',
                                lineHeight: '1.5',
                                border: 'none',
                                outline: 'none'
                              }}
                            >
                              + Exercise
                            </button>
                            <div className="flex-1 border-t border-gray-300"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Action Buttons - Inside White Box - Only show when workout exists */}
                {!isWorkoutDeleted && exercises.length > 0 && selectedDay !== 'Sun' && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (onSave) {
                            // Pass the updated workout data back to parent
                            onSave({
                              day: selectedDay,
                              workoutName: workoutName,
                              exercises: exercises.filter(ex => ex.name.trim() !== '' || ex.sets > 0 || ex.reps > 0)
                            });
                          } else {
                            onBack();
                          }
                        }}
                        className="px-6 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={onBack}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                    {/* Delete/Trash Icon */}
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="text-gray-600 hover:text-red-600 transition"
                      title="Delete Workout"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 3.66671L12.5867 10.35C12.4813 12.0574 12.4287 12.9114 12 13.5254C11.7884 13.8288 11.5159 14.0849 11.2 14.2774C10.562 14.6667 9.70667 14.6667 7.996 14.6667C6.28267 14.6667 5.426 14.6667 4.78667 14.2767C4.47059 14.0839 4.19814 13.8273 3.98667 13.5234C3.55867 12.9087 3.50667 12.0534 3.404 10.3434L3 3.66671M2 3.66671H14M10.704 3.66671L10.2487 2.72804C9.94667 2.10404 9.79533 1.79271 9.53467 1.59804C9.47676 1.55492 9.41545 1.51657 9.35133 1.48337C9.06267 1.33337 8.716 1.33337 8.02333 1.33337C7.31267 1.33337 6.95733 1.33337 6.66333 1.48937C6.59834 1.52418 6.53635 1.56432 6.478 1.60937C6.21467 1.81137 6.06733 2.13471 5.77267 2.78071L5.36867 3.66671M6.33333 11V7.00004M9.66667 11V7.00004" stroke="#003F8F" stroke-width="1.5" stroke-linecap="round" />
                      </svg>

                    </button>
                  </div>
                )}
              </div>
              {/* End of White Card Container */}
            </>
          )}
          {/* End of White Bordered Box */}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 ">
              <h3 className="text-lg "></h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className=""
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#4D6080" fill-opacity="0.8" />
                  <path d="M16.066 8.99502C16.1377 8.92587 16.1948 8.84314 16.2342 8.75165C16.2735 8.66017 16.2943 8.56176 16.2952 8.46218C16.2961 8.3626 16.2772 8.26383 16.2395 8.17164C16.2018 8.07945 16.1462 7.99568 16.0758 7.92523C16.0054 7.85478 15.9217 7.79905 15.8295 7.7613C15.7374 7.72354 15.6386 7.70452 15.5391 7.70534C15.4395 7.70616 15.341 7.7268 15.2495 7.76606C15.158 7.80532 15.0752 7.86242 15.006 7.93402L12 10.939L8.995 7.93402C8.92634 7.86033 8.84354 7.80123 8.75154 7.76024C8.65954 7.71925 8.56022 7.69721 8.45952 7.69543C8.35882 7.69365 8.25879 7.71218 8.1654 7.7499C8.07201 7.78762 7.98718 7.84376 7.91596 7.91498C7.84474 7.9862 7.7886 8.07103 7.75087 8.16442C7.71315 8.25781 7.69463 8.35784 7.69641 8.45854C7.69818 8.55925 7.72022 8.65856 7.76122 8.75056C7.80221 8.84256 7.86131 8.92536 7.935 8.99402L10.938 12L7.933 15.005C7.80052 15.1472 7.72839 15.3352 7.73182 15.5295C7.73525 15.7238 7.81396 15.9092 7.95138 16.0466C8.08879 16.1841 8.27417 16.2628 8.46847 16.2662C8.66278 16.2696 8.85082 16.1975 8.993 16.065L12 13.06L15.005 16.066C15.1472 16.1985 15.3352 16.2706 15.5295 16.2672C15.7238 16.2638 15.9092 16.1851 16.0466 16.0476C16.184 15.9102 16.2627 15.7248 16.2662 15.5305C16.2696 15.3362 16.1975 15.1482 16.065 15.006L13.062 12L16.066 8.99502Z" fill="white" />
                </svg>

              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700">
                Are you sure you want to delete "{selectedDay}" Workout?
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center gap-3 p-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsWorkoutDeleted(true);
                  setExercises([]);
                  setFullBodyVideoLinks([]);
                  setWorkoutName('');
                  setShowDeleteModal(false);
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

export default AddEditWorkout;
