import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from './ChatInterface';

// Use API URL from .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const AddWorkout = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Day name mapping from UI format to API format
  const reverseDayMap = {
    'Mon': 'monday',
    'Tue': 'tuesday',
    'Wed': 'wednesday',
    'Thu': 'thursday',
    'Fri': 'friday',
    'Sat': 'saturday',
    'Sun': 'sunday'
  };

  // Initialize workouts for all 7 days
  const getInitialWorkouts = () => {
    return {
      Mon: { workoutName: '', exercises: [] },
      Tue: { workoutName: '', exercises: [] },
      Wed: { workoutName: '', exercises: [] },
      Thu: { workoutName: '', exercises: [] },
      Fri: { workoutName: '', exercises: [] },
      Sat: { workoutName: '', exercises: [] },
      Sun: { workoutName: 'Rest Day', exercises: [] }
    };
  };

  const [workouts, setWorkouts] = useState(getInitialWorkouts());
  
  // Get current day's workout data
  const currentDayData = workouts[selectedDay] || { workoutName: '', exercises: [] };
  const workoutName = currentDayData.workoutName;
  const exercises = currentDayData.exercises;
  const isRestDay = selectedDay === 'Sun' || (workoutName.toLowerCase().includes('rest') && exercises.length === 0);
  const [showExerciseVideoInputs, setShowExerciseVideoInputs] = useState({});
  const [newVideoLinks, setNewVideoLinks] = useState({});
  const [workoutVideoLinks, setWorkoutVideoLinks] = useState([]);
  const [showWorkoutVideoInput, setShowWorkoutVideoInput] = useState(false);
  const [newWorkoutVideoLink, setNewWorkoutVideoLink] = useState('');
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showExerciseSuggestions, setShowExerciseSuggestions] = useState({});
  const [exerciseSuggestions, setExerciseSuggestions] = useState({});
  const [showNotesSuggestions, setShowNotesSuggestions] = useState({});
  const [notesSuggestions, setNotesSuggestions] = useState({});
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedCadence, setSelectedCadence] = useState('For 3 Weeks');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showCadenceDropdown, setShowCadenceDropdown] = useState(false);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

  // Workout name suggestions
  const workoutNameSuggestions = [
    'Full Body Workout',
    'Upper Body Strength',
    'Lower Body Power',
    'Push Day',
    'Pull Day',
    'Leg Day',
    'Chest & Triceps',
    'Back & Biceps',
    'Shoulders & Arms',
    'Cardio & Core',
    'HIIT Training',
    'Strength Training',
    'Hypertrophy Split',
    'Powerlifting Session',
    'Endurance Workout',
    'Recovery Day',
    'Active Rest',
    'Mobility & Flexibility'
  ];

  // Exercise name suggestions
  const exerciseNameSuggestions = [
    'Barbell Squat',
    'Bench Press',
    'Deadlift',
    'Overhead Press',
    'Romanian Deadlift',
    'Pull-ups',
    'Push-ups',
    'Dumbbell Rows',
    'Leg Press',
    'Chest Fly',
    'Shoulder Press',
    'Bicep Curls',
    'Tricep Dips',
    'Lunges',
    'Leg Curls',
    'Calf Raises',
    'Lat Pulldown',
    'Cable Crossover',
    'Plank',
    'Burpees',
    'Mountain Climbers',
    'Jump Squats',
    'Russian Twists',
    'Bicycle Crunches'
  ];

  // Notes suggestions
  const notesSuggestionsList = [
    '3 sets, 8-10 reps, 60s rest',
    '4 sets, 6-8 reps, 90s rest',
    '3 sets, 10-12 reps, 45s rest',
    '5 sets, 5 reps, 120s rest',
    '3 sets, 12-15 reps, 30s rest',
    '4 sets, 8 reps, 75s rest',
    '3 sets, 15-20 reps, 45s rest',
    '5 sets, 3 reps, 180s rest',
    '3 sets, 6 reps, 90s rest',
    '4 sets, 10 reps, 60s rest'
  ];

  // Handle workout name change and show suggestions
  const handleWorkoutNameChange = (value) => {
    setWorkouts(prev => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], workoutName: value }
    }));
    if (value.trim().length > 0) {
      const filtered = workoutNameSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setNameSuggestions(filtered);
      setShowNameSuggestions(filtered.length > 0);
    } else {
      setShowNameSuggestions(false);
      setNameSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setWorkouts(prev => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], workoutName: suggestion }
    }));
    setShowNameSuggestions(false);
    setNameSuggestions([]);
  };

  const handleAddExercise = () => {
    const nextLabel = String.fromCharCode(65 + exercises.length);
    const maxId = Math.max(...exercises.map(ex => ex.id || 0), 0);
    const newExercise = {
      id: maxId + 1,
      label: nextLabel,
      name: '',
      sets: 0,
      reps: 0,
      weight_kg: null,
      notes: '',
      videoLinks: [],
      isSuperset: false
    };
    setWorkouts(prev => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], exercises: [...exercises, newExercise] }
    }));
  };

  const handleUpdateExercise = (id, field, value) => {
    const updatedExercises = exercises.map(ex =>
      ex.id === id ? { ...ex, [field]: value } : ex
    );
    setWorkouts(prev => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
    }));
  };

  const handleExerciseNameChange = (id, value) => {
    const match = value.match(/^([A-Z]1?[0-9]?)\.\s*(.*)$/);
    let exerciseName = '';
    let updatedExercises;
    
    if (match) {
      const label = match[1];
      exerciseName = match[2];
      updatedExercises = exercises.map(ex =>
        ex.id === id ? { ...ex, label, name: exerciseName } : ex
      );
    } else {
      const currentExercise = exercises.find(ex => ex.id === id);
      if (currentExercise) {
        exerciseName = value.replace(/^[A-Z]1?[0-9]?\.\s*/, '');
        updatedExercises = exercises.map(ex =>
          ex.id === id ? { ...ex, name: exerciseName } : ex
        );
      } else {
        updatedExercises = exercises;
      }
    }

    setWorkouts(prev => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
    }));

    // Show suggestions for exercise name
    if (exerciseName.trim().length > 0) {
      const filtered = exerciseNameSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(exerciseName.toLowerCase())
      );
      setExerciseSuggestions({ ...exerciseSuggestions, [id]: filtered });
      setShowExerciseSuggestions({ ...showExerciseSuggestions, [id]: filtered.length > 0 });
    } else {
      setShowExerciseSuggestions({ ...showExerciseSuggestions, [id]: false });
      setExerciseSuggestions({ ...exerciseSuggestions, [id]: [] });
    }
  };

  // Handle exercise suggestion selection
  const handleSelectExerciseSuggestion = (id, suggestion) => {
    const currentExercise = exercises.find(ex => ex.id === id);
    if (currentExercise) {
      const updatedExercises = exercises.map(ex =>
        ex.id === id ? { ...ex, name: suggestion } : ex
      );
      setWorkouts(prev => ({
        ...prev,
        [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
      }));
      setShowExerciseSuggestions({ ...showExerciseSuggestions, [id]: false });
      setExerciseSuggestions({ ...exerciseSuggestions, [id]: [] });
    }
  };

  // Handle notes change and show suggestions
  const handleNotesChange = (id, value) => {
    const updatedExercises = exercises.map(ex =>
      ex.id === id ? { ...ex, notes: value } : ex
    );
    setWorkouts(prev => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
    }));

    if (value.trim().length > 0) {
      const filtered = notesSuggestionsList.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setNotesSuggestions({ ...notesSuggestions, [id]: filtered });
      setShowNotesSuggestions({ ...showNotesSuggestions, [id]: filtered.length > 0 });
    } else {
      setShowNotesSuggestions({ ...showNotesSuggestions, [id]: false });
      setNotesSuggestions({ ...notesSuggestions, [id]: [] });
    }
  };

  // Handle notes suggestion selection
  const handleSelectNotesSuggestion = (id, suggestion) => {
    const updatedExercises = exercises.map(ex =>
      ex.id === id ? { ...ex, notes: suggestion } : ex
    );
    setWorkouts(prev => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
    }));
    setShowNotesSuggestions({ ...showNotesSuggestions, [id]: false });
    setNotesSuggestions({ ...notesSuggestions, [id]: [] });
  };

  const handleShowExerciseVideoInput = (exerciseId) => {
    setShowExerciseVideoInputs({ ...showExerciseVideoInputs, [exerciseId]: true });
  };

  const handleAddVideoLink = (exerciseId) => {
    const link = newVideoLinks[exerciseId]?.trim();
    if (link) {
      const updatedExercises = exercises.map(ex =>
        ex.id === exerciseId
          ? { ...ex, videoLinks: [...(ex.videoLinks || []), link] }
          : ex
      );
      setWorkouts(prev => ({
        ...prev,
        [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
      }));
      setNewVideoLinks({ ...newVideoLinks, [exerciseId]: '' });
      setShowExerciseVideoInputs({ ...showExerciseVideoInputs, [exerciseId]: false });
    }
  };

  const handleRemoveVideoLink = (exerciseId, linkIndex) => {
    const updatedExercises = exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, videoLinks: (ex.videoLinks || []).filter((_, idx) => idx !== linkIndex) }
        : ex
    );
    setWorkouts(prev => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
    }));
  };

  const handleDeleteExercise = (id) => {
    const updatedExercises = exercises.filter(ex => ex.id !== id);
    setWorkouts(prev => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
    }));
  };

  const handleSave = async () => {
    // Prevent multiple saves
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    
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

      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      // Check if baseUrl already includes /api, if not add it
      const apiUrl = baseUrl.includes('/api') 
        ? `${baseUrl}/ai-workout-plans/`
        : `${baseUrl}/api/ai-workout-plans/`;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      // Prepare request body
      const requestBody = {
        title: "John's Weekly Workout Plan",
        description: '',
        status: 'draft',
        days: transformWorkoutsToApiFormat()
      };

      console.log('=== CREATE WORKOUT PLAN API CALL ===');
      console.log('API URL:', apiUrl);
      console.log('Request body:', requestBody);

      // Call POST API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      console.log('=== CREATE WORKOUT PLAN API RESPONSE ===');
      console.log('Response status:', response.status);

      let result;
      try {
        const responseText = await response.text();
        console.log('API Response text:', responseText);
        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = {};
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Failed to parse server response');
      }

      if (response.ok && result.data) {
        console.log('Workout plan created successfully');
        console.log('Created workout plan data:', result.data);
        
        // Save to localStorage
        try {
          localStorage.setItem('aiWorkoutPlanData', JSON.stringify(result.data));
        } catch (error) {
          console.error('Error saving workout plan to localStorage:', error);
        }
        
        // Show success message
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          // Navigate back to AI program page
          navigate('/coach/ai-program');
        }, 1500);
      } else {
        // Handle errors
        const errorMessage = result.message || 'Failed to create workout plan';
        const errorDetails = result.errors ? JSON.stringify(result.errors) : '';
        const fullError = errorMessage + (errorDetails ? ` - ${errorDetails}` : '');
        console.error('API Error Response:', result);
        throw new Error(fullError);
      }
    } catch (error) {
      console.error('=== CREATE WORKOUT PLAN API ERROR ===');
      console.error('Error creating workout plan:', error);
      console.error('Error details:', error.message);
      
      // Show user-friendly error message
      alert(`Error creating workout plan: ${error.message}\n\nPlease check:\n1. All required fields are filled\n2. Your internet connection\n3. Try again`);
    } finally {
      setIsSaving(false);
      console.log('=== CREATE WORKOUT PLAN API CALL END ===');
    }
  };

  const handleCancel = () => {
    navigate('/coach/ai-program');
  };

  const handleDeleteWorkout = () => {
    // Clear current day's workout data
    setWorkouts(prev => ({
      ...prev,
      [selectedDay]: { workoutName: '', exercises: [] }
    }));
    setShowExerciseVideoInputs({});
    setNewVideoLinks({});
  };

  // Transform workouts to API format
  const transformWorkoutsToApiFormat = () => {
    return days.map((day, index) => {
      const dayData = workouts[day] || { workoutName: '', exercises: [] };
      const apiDay = reverseDayMap[day] || day.toLowerCase();
      
      // Check if it's a rest day (Sunday or workout name contains "rest" and no exercises)
      const isRestDayForDay = day === 'Sun' || 
        (dayData.workoutName.toLowerCase().includes('rest') && dayData.exercises.length === 0);
      
      const dayPayload = {
        day: apiDay,
        workout_name: dayData.workoutName || (isRestDayForDay ? 'Rest Day' : ''),
        is_rest_day: isRestDayForDay,
        order: index,
        exercises: isRestDayForDay ? [] : dayData.exercises.map((exercise, exIndex) => ({
          exercise_name: exercise.name || '',
          sets: exercise.sets || 0,
          reps: exercise.reps || 0,
          weight_kg: exercise.weight_kg || null,
          cue: exercise.notes || '',
          group_label: exercise.label || '',
          order: exIndex
        }))
      };
      
      return dayPayload;
    });
  };

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

  const handleAddWorkoutVideoLink = () => {
    const link = newWorkoutVideoLink.trim();
    if (link) {
      setWorkoutVideoLinks([...workoutVideoLinks, link]);
      setNewWorkoutVideoLink('');
      setShowWorkoutVideoInput(false);
    }
  };

  const handleRemoveWorkoutVideoLink = (index) => {
    setWorkoutVideoLinks(workoutVideoLinks.filter((_, idx) => idx !== index));
  };

  return (
    <div className="h-screen bg-[#F7F7F7] flex gap-4 p-4">
      {/* Chat Interface - Left Side */}
      <div className="w-1/3 bg-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <ChatInterface />
      </div>

      {/* Workout Form - Right Side */}
      <div className="flex-1 bg-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="h-full flex flex-col bg-gray-100 overflow-hidden p-6">
          {/* AI Chatbox Header - Inside Gray Box */}
          <div className="bg-[#003F8F] text-white p-4 flex items-center justify-between rounded-lg mb-6">
            <h2 className="text-xl font-bold font-[Poppins]">AI Chatbox</h2>
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 bg-[#F3701E] text-white rounded-lg font-semibold text-sm hover:bg-[#EA7A1A] transition flex items-center gap-2"
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
                    onClick={() => navigate('/coach/ai-program')}
                    className="px-4 py-2 bg-blue-100 text-[#003F8F] rounded-lg font-semibold text-sm hover:bg-blue-200 transition flex items-center gap-2"
                  >
                    <span>+</span>
                    Add Workout
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.3333 2L14 4.66667M11.3333 2L8.66667 4.66667M11.3333 2V5.33333M14 4.66667H11.3333M14 4.66667V14C14 14.3682 13.7015 14.6667 13.3333 14.6667H2.66667C2.29848 14.6667 2 14.3682 2 14V2.66667C2 2.29848 2.29848 2 2.66667 2H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Edit
                  </button>
                </div>
              </div>

              {/* Day Tabs */}
              <div className="flex items-end w-full mb-6">
                <div className="flex items-end flex-1 border border-gray-200 rounded-lg overflow-hidden">
                  {days.map((day, index) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`flex-1 py-3 font-semibold text-sm transition relative ${index > 0 ? 'border-l border-gray-200' : ''
                        } ${selectedDay === day
                          ? 'bg-[#003F8F] text-white z-10'
                          : 'bg-white text-[#003F8F] hover:bg-gray-50'
                        }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* White Card Container - Connected to day tabs */}
              <div className="bg-white rounded-b-lg rounded-tl-none rounded-tr-none border border-gray-200 border-t-0 p-6">
                {/* Rest Day Content - Show when toggle is on */}
                {isRestDay ? (
                  <>
                    {/* Rest Day Heading with Toggle Button */}
                    <div className="mb-6 flex items-start justify-between">
                      <div>
                        <h4 className="text-2xl font-bold text-[#003F8F] font-[Poppins] mb-2">Rest Day</h4>
                        <p className="text-sm text-gray-600 font-[Inter]">Rest Day</p>
                      </div>
                      {/* Toggle Rest Day Button - Top Right */}
                      <button
                        onClick={() => {
                          if (isRestDay) {
                            setWorkouts(prev => ({
                              ...prev,
                              [selectedDay]: { workoutName: '', exercises: [] }
                            }));
                          } else {
                            setWorkouts(prev => ({
                              ...prev,
                              [selectedDay]: { workoutName: 'Rest Day', exercises: [] }
                            }));
                          }
                        }}
                        className={`w-12 h-6 rounded-full transition relative flex-shrink-0 ${isRestDay ? 'bg-[#003F8F]' : 'bg-gray-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 shadow-sm ${isRestDay ? 'transform translate-x-6' : 'transform translate-x-1'}`}></div>
                      </button>
                    </div>

                    {/* Rest & Recovery Content */}
                    <div className="bg-white rounded-xl p-12 flex flex-col items-center justify-center min-h-[400px] mb-6 ">
                      <div className="text-center">
                        <div className="mb-6 ml-20">
                          <svg width="70" height="43" viewBox="0 0 70 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.64048 25.3202V2.82024C5.64048 2.44988 5.56753 2.08315 5.4258 1.74098C5.28407 1.39881 5.07634 1.08791 4.81445 0.826029C4.55257 0.564145 4.24167 0.356407 3.8995 0.214677C3.55733 0.0729466 3.1906 0 2.82024 0C2.44988 0 2.08315 0.0729466 1.74098 0.214677C1.39881 0.356407 1.08791 0.564145 0.826029 0.826029C0.564146 1.08791 0.356408 1.39881 0.214678 1.74098C0.0729477 2.08315 -5.51878e-09 2.44988 0 2.82024V39.6612C-5.51878e-09 40.0316 0.0729477 40.3983 0.214678 40.7404C0.356408 41.0826 0.564146 41.3935 0.826029 41.6554C1.08791 41.9173 1.39881 42.125 1.74098 42.2668C2.08315 42.4085 2.44988 42.4814 2.82024 42.4814C3.1906 42.4814 3.55733 42.4085 3.8995 42.2668C4.24167 42.125 4.55257 41.9173 4.81445 41.6554C5.07634 41.3935 5.28407 41.0826 5.4258 40.7404C5.56753 40.3983 5.64048 40.0316 5.64048 39.6612V34.3764L63.4032 34.2425V39.5244C63.4032 39.8947 63.4761 40.2613 63.6178 40.6034C63.7595 40.9455 63.9672 41.2563 64.229 41.5181C64.4908 41.7799 64.8017 41.9876 65.1437 42.1293C65.4858 42.271 65.8525 42.3439 66.2227 42.3439C66.593 42.3439 66.9596 42.271 67.3017 42.1293C67.6438 41.9876 67.9546 41.7799 68.2164 41.5181C68.4782 41.2563 68.6859 40.9455 68.8276 40.6034C68.9693 40.2613 69.0423 39.8947 69.0423 39.5244V25.1863L5.64048 25.3202Z" fill="#4D6080" fill-opacity="0.3" />
                            <path d="M69.0426 22.9054H26.1738V12.2839C26.1738 10.8043 26.7615 9.38519 27.8077 8.33877C28.8538 7.29236 30.2727 6.7043 31.7524 6.70392H57.7775C60.7652 6.70392 63.6305 7.89078 65.7432 10.0034C67.8558 12.116 69.0426 14.9813 69.0426 17.969V22.9054Z" fill="#4D6080" fill-opacity="0.3" />
                            <path d="M16.1385 21.69C19.9408 21.69 23.0232 18.6076 23.0232 14.8054C23.0232 11.0031 19.9408 7.92072 16.1385 7.92072C12.3363 7.92072 9.25391 11.0031 9.25391 14.8054C9.25391 18.6076 12.3363 21.69 16.1385 21.69Z" fill="#4D6080" fill-opacity="0.3" />
                          </svg>

                        </div>
                        <h4 className="text-2xl font-bold text-[#003F8F] font-[Poppins] mb-2">Rest & Recovery</h4>
                        <p className="text-base text-[#003F8F] font-[Inter]">Active recovery or complete rest day</p>
                      </div>
                    </div>

                    {/* Save/Cancel Buttons */}
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className={`px-6 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                            isSaving 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:bg-[#002F6F] cursor-pointer'
                          }`}
                        >
                          {isSaving ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            'Save'
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                      {/* Camera Icon - Bottom Right */}
                      <button
                        className="text-[#003F8F] hover:text-gray-600 transition"
                        title="Add Photo"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="20" height="20" rx="10" fill="#003F8F" />
                          <path d="M13.75 6.75L13.44 11.7625C13.361 13.043 13.3215 13.6835 13 14.144C12.8413 14.3716 12.637 14.5637 12.4 14.708C11.9215 15 11.28 15 9.997 15C8.712 15 8.0695 15 7.59 14.7075C7.35294 14.5629 7.14861 14.3704 6.99 14.1425C6.669 13.6815 6.63 13.04 6.553 11.7575L6.25 6.75M5.5 6.75H14.5M12.028 6.75L11.6865 6.046C11.46 5.578 11.3465 5.3445 11.151 5.1985C11.1076 5.16616 11.0616 5.1374 11.0135 5.1125C10.797 5 10.537 5 10.0175 5C9.4845 5 9.218 5 8.9975 5.117C8.94876 5.14311 8.90227 5.17321 8.8585 5.207C8.661 5.3585 8.5505 5.601 8.3295 6.0855L8.0265 6.75M8.75 12.25V9.25M11.25 12.25V9.25" stroke="white" stroke-width="0.8" stroke-linecap="round" />
                        </svg>

                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Name Input Field with Toggle Button - Always visible at the top */}
                    <div className="mb-6 relative">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={workoutName}
                            onChange={(e) => handleWorkoutNameChange(e.target.value)}
                            onFocus={() => {
                              if (workoutName.trim().length > 0) {
                                const filtered = workoutNameSuggestions.filter(suggestion =>
                                  suggestion.toLowerCase().includes(workoutName.toLowerCase())
                                );
                                setNameSuggestions(filtered);
                                setShowNameSuggestions(filtered.length > 0);
                              }
                            }}
                            onBlur={() => {
                              // Delay hiding suggestions to allow click
                              setTimeout(() => setShowNameSuggestions(false), 200);
                            }}
                            placeholder="Name"
                            className="w-full text-sm text-gray-500 font-[Inter] bg-transparent border-none focus:outline-none focus:ring-0 px-0 py-0 placeholder:text-gray-500"
                            style={{ minWidth: '100px' }}
                          />
                          {/* Suggestions Dropdown */}
                          {showNameSuggestions && nameSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                              {nameSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSelectSuggestion(suggestion)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Toggle Rest Day Button - Just toggle switch, no text */}
                        <button
                          onClick={() => {
                            if (isRestDay) {
                              setWorkouts(prev => ({
                                ...prev,
                                [selectedDay]: { workoutName: '', exercises: [] }
                              }));
                            } else {
                              setWorkouts(prev => ({
                                ...prev,
                                [selectedDay]: { workoutName: 'Rest Day', exercises: [] }
                              }));
                            }
                          }}
                          className={`w-12 h-6 rounded-full transition relative flex-shrink-0 ${isRestDay ? 'bg-[#003F8F]' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 shadow-sm ${isRestDay ? 'transform translate-x-6' : 'transform translate-x-1'}`}></div>
                        </button>
                      </div>
                    </div>

                    {/* Exercises */}
                    <div>
                      {exercises.map((exercise, index) => {
                        const isLastExercise = index === exercises.length - 1;

                        return (
                          <div key={exercise.id}>
                            {/* Exercise Card - No blue border (not superset) */}
                            <div className="bg-white relative p-4">
                              <div className="flex items-start justify-between mb-3 relative">
                                <div className="flex-1 relative">
                                  <input
                                    type="text"
                                    value={`${exercise.label}. ${exercise.name}`}
                                    onChange={(e) => handleExerciseNameChange(exercise.id, e.target.value)}
                                    onFocus={() => {
                                      if (exercise.name.trim().length > 0) {
                                        const filtered = exerciseNameSuggestions.filter(suggestion =>
                                          suggestion.toLowerCase().includes(exercise.name.toLowerCase())
                                        );
                                        setExerciseSuggestions({ ...exerciseSuggestions, [exercise.id]: filtered });
                                        setShowExerciseSuggestions({ ...showExerciseSuggestions, [exercise.id]: filtered.length > 0 });
                                      }
                                    }}
                                    onBlur={() => {
                                      setTimeout(() => setShowExerciseSuggestions({ ...showExerciseSuggestions, [exercise.id]: false }), 200);
                                    }}
                                    className="text-lg font-bold text-[#003F8F] font-[Poppins] bg-transparent border-none focus:outline-none focus:ring-0 flex-1 w-full"
                                  />
                                  {/* Exercise Name Suggestions Dropdown */}
                                  {showExerciseSuggestions[exercise.id] && exerciseSuggestions[exercise.id]?.length > 0 && (
                                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                                      {exerciseSuggestions[exercise.id].map((suggestion, idx) => (
                                        <button
                                          key={idx}
                                          onClick={() => handleSelectExerciseSuggestion(exercise.id, suggestion)}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
                                        >
                                          {suggestion}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {/* Trash Icon - Right side of exercise */}
                                <button
                                  onClick={() => handleDeleteExercise(exercise.id)}
                                  className="text-gray-600 hover:text-red-600 transition ml-4"
                                  title="Delete Exercise"
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13 3.66671L12.5867 10.35C12.4813 12.0574 12.4287 12.9114 12 13.5254C11.7884 13.8288 11.5159 14.0849 11.2 14.2774C10.562 14.6667 9.70667 14.6667 7.996 14.6667C6.28267 14.6667 5.426 14.6667 4.78667 14.2767C4.47059 14.0839 4.19814 13.8273 3.98667 13.5234C3.55867 12.9087 3.50667 12.0534 3.404 10.3434L3 3.66671M2 3.66671H14M10.704 3.66671L10.2487 2.72804C9.94667 2.10404 9.79533 1.79271 9.53467 1.59804C9.47676 1.55492 9.41545 1.51657 9.35133 1.48337C9.06267 1.33337 8.716 1.33337 8.02333 1.33337C7.31267 1.33337 6.95733 1.33337 6.66333 1.48937C6.59834 1.52418 6.53635 1.56432 6.478 1.60937C6.21467 1.81137 6.06733 2.13471 5.77267 2.78071L5.36867 3.66671M6.33333 11V7.00004M9.66667 11V7.00004" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                  </svg>
                                </button>
                              </div>

                              {/* Sets x Reps - Editable */}
                              <div className="mb-3 flex items-center gap-2">
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

                              {/* Notes/Cues - Editable with suggestions */}
                              <div className="mb-3 relative">
                                <input
                                  type="text"
                                  value={exercise.notes || ''}
                                  onChange={(e) => handleNotesChange(exercise.id, e.target.value)}
                                  onFocus={() => {
                                    if (exercise.notes && exercise.notes.trim().length > 0) {
                                      const filtered = notesSuggestionsList.filter(suggestion =>
                                        suggestion.toLowerCase().includes(exercise.notes.toLowerCase())
                                      );
                                      setNotesSuggestions({ ...notesSuggestions, [exercise.id]: filtered });
                                      setShowNotesSuggestions({ ...showNotesSuggestions, [exercise.id]: filtered.length > 0 });
                                    }
                                  }}
                                  onBlur={() => {
                                    setTimeout(() => setShowNotesSuggestions({ ...showNotesSuggestions, [exercise.id]: false }), 200);
                                  }}
                                  className="w-full text-sm text-gray-600 font-[Inter] bg-transparent border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#003F8F]"
                                  placeholder="Notes/Cues"
                                />
                                {/* Notes Suggestions Dropdown */}
                                {showNotesSuggestions[exercise.id] && notesSuggestions[exercise.id]?.length > 0 && (
                                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                                    {notesSuggestions[exercise.id].map((suggestion, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleSelectNotesSuggestion(exercise.id, suggestion)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
                                      >
                                        {suggestion}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Video Links */}
                              <div className="mb-3">
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
                                      className="bg-blue-100 text-[#003F8F] text-xs font-semibold transition hover:bg-blue-200 border border-[#003F8F] rounded-full px-3 py-2 flex items-center gap-2"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 2.5V11.5M2.5 7H11.5" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" />
                                      </svg>
                                      <span>Add Video link</span>
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

                            {/* Add Exercise Divider - After last exercise */}
                            {isLastExercise && (
                              <div className="relative flex items-center my-4">
                                <div className="flex-1 border-t border-gray-300"></div>
                                <button
                                  onClick={handleAddExercise}
                                  className="bg-blue-100 text-[#003F8F] text-xs font-semibold transition mx-2 hover:bg-blue-200 flex items-center gap-1"
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
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 2.5V11.5M2.5 7H11.5" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" />
                                  </svg>
                                  <span>Exercise</span>
                                </button>
                                <div className="flex-1 border-t border-gray-300"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Add Exercise Button - Show even when no exercises */}
                      {exercises.length === 0 && (
                        <div className="relative flex items-center my-4">
                          <div className="flex-1 border-t border-gray-300"></div>
                          <button
                            onClick={handleAddExercise}
                            className="bg-blue-100 text-[#003F8F] text-xs font-semibold transition mx-2 hover:bg-blue-200 flex items-center gap-1"
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
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M7 2.5V11.5M2.5 7H11.5" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span>Exercise</span>
                          </button>
                          <div className="flex-1 border-t border-gray-300"></div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className={`px-6 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                            isSaving 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:bg-[#002F6F] cursor-pointer'
                          }`}
                        >
                          {isSaving ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            'Save'
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                      {/* Delete/Trash Icon */}
                      <button
                        onClick={handleDeleteWorkout}
                        className="text-[#003F8F] hover:text-red-600 transition"
                        title="Delete Workout"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13 3.66671L12.5867 10.35C12.4813 12.0574 12.4287 12.9114 12 13.5254C11.7884 13.8288 11.5159 14.0849 11.2 14.2774C10.562 14.6667 9.70667 14.6667 7.996 14.6667C6.28267 14.6667 5.426 14.6667 4.78667 14.2767C4.47059 14.0839 4.19814 13.8273 3.98667 13.5234C3.55867 12.9087 3.50667 12.0534 3.404 10.3434L3 3.66671M2 3.66671H14M10.704 3.66671L10.2487 2.72804C9.94667 2.10404 9.79533 1.79271 9.53467 1.59804C9.47676 1.55492 9.41545 1.51657 9.35133 1.48337C9.06267 1.33337 8.716 1.33337 8.02333 1.33337C7.31267 1.33337 6.95733 1.33337 6.66333 1.48937C6.59834 1.52418 6.53635 1.56432 6.478 1.60937C6.21467 1.81137 6.06733 2.13471 5.77267 2.78071L5.36867 3.66671M6.33333 11V7.00004M9.66667 11V7.00004" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
              {/* End of White Card Container */}
            </div>
            {/* End of White Bordered Box */}
          </div>
        </div>
      </div>
      {/* End of Workout Form - Right Side */}

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
                  <rect width="24" height="24" rx="12" fill="#4D6080" fill-opacity="0.8" />
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

      {/* Success Message Popup */}
      {showSuccessMessage && (
        <div 
          className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 transition-all duration-300"
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.66667 10L9.16667 12.5L13.3333 8.33333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-semibold">Workout plan created successfully</span>
          <style>{`
            @keyframes slideInRight {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default AddWorkout;

