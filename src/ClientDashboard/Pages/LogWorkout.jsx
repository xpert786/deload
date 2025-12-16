import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NextIcon, SearchIcon } from '../Components/icons';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const workoutPlan = [
  {
    id: 1,
    name: 'Bench Press',
    allowUpload: false,
    stats: { sets: 4, reps: '8-10', rest: '60s' },
    instructions: 'Focus on controlled tempo. Record video if needed',
    sets: [
      { id: 1, setNum: 1, reps: 8, weight: 60, rest: 90, status: 'done', type: 'warmup' },
      { id: 2, setNum: 2, reps: 10, weight: 70, rest: 120, status: 'active', type: 'normal' },
      { id: 3, setNum: 3, reps: 12, weight: 80, rest: 90, status: 'pending', type: 'normal' },
      { id: 4, setNum: 4, reps: 12, weight: 80, rest: 90, status: 'pending', type: 'dropset' }
    ],
    notes: ''
  },
  {
    id: 2,
    name: "Incline Dumbbells' Press",
    allowUpload: false,
    stats: { sets: 4, reps: '8-10', rest: '60s' },
    instructions: 'Keep shoulder blades pinned and control the negative.',
    sets: [
      { id: 1, setNum: 1, reps: 8, weight: 60, rest: 90, status: 'done', type: 'warmup' },
      { id: 2, setNum: 2, reps: 10, weight: 70, rest: 120, status: 'active', type: 'normal' },
      { id: 3, setNum: 3, reps: 12, weight: 80, rest: 90, status: 'pending', type: 'normal' },
      { id: 4, setNum: 4, reps: 12, weight: 80, rest: 90, status: 'pending', type: 'normal' }
    ],
    notes: ''
  },
  {
    id: 3,
    name: 'Military Press',
    allowUpload: false,
    stats: { sets: 4, reps: '8-10', rest: '60s' },
    instructions: 'Keep elbows slightly forward to protect shoulders.',
    sets: [
      { id: 1, setNum: 1, reps: 8, weight: 60, rest: 90, status: 'done', type: 'warmup' },
      { id: 2, setNum: 2, reps: 10, weight: 70, rest: 120, status: 'active', type: 'normal' },
      { id: 3, setNum: 3, reps: 12, weight: 80, rest: 90, status: 'pending', type: 'normal' },
      { id: 4, setNum: 4, reps: 12, weight: 80, rest: 90, status: 'pending', type: 'normal' }
    ],
    notes: ''
  },
  {
    id: 4,
    name: "Dumbbell's Lateral Raise",
    allowUpload: false,
    stats: { sets: 4, reps: '8-10', rest: '60s' },
    instructions: 'Keep shoulders down and lift with control.',
    sets: [
      { id: 1, setNum: 1, reps: 8, weight: 20, rest: 90, status: 'done', type: 'warmup' },
      { id: 2, setNum: 2, reps: 10, weight: 25, rest: 120, status: 'active', type: 'normal' },
      { id: 3, setNum: 3, reps: 12, weight: 30, rest: 90, status: 'pending', type: 'normal' },
      { id: 4, setNum: 4, reps: 12, weight: 30, rest: 90, status: 'pending', type: 'dropset' }
    ],
    notes: ''
  },
  {
    id: 5,
    name: 'Rope Push Down',
    allowUpload: true,
    stats: { sets: 4, reps: '8-10', rest: '60s' },
    instructions: 'Keep elbows tight to your sides during the movement.',
    sets: [
      { id: 1, setNum: 1, reps: 8, weight: 60, rest: 90, status: 'done', type: 'warmup' },
      { id: 2, setNum: 2, reps: 10, weight: 70, rest: 120, status: 'active', type: 'normal' },
      { id: 3, setNum: 3, reps: 12, weight: 80, rest: 90, status: 'pending', type: 'normal' },
      { id: 4, setNum: 4, reps: 12, weight: 80, rest: 90, status: 'pending', type: 'dropset' }
    ],
    notes: ''
  }
];

const statusBackground = {
  done: 'bg-[#EEF2FF]',
  active: 'bg-[#FFF5EF]',
  skipped: 'bg-white',
  pending: 'bg-white'
};

const maxUploads = 5;

const LogWorkout = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadPreview, setUploadPreview] = useState([]);
  const [uploadError, setUploadError] = useState('');

  // Fetch today's workout from API
  useEffect(() => {
    const fetchTodayWorkout = async () => {
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
        // Check if baseUrl already includes /api, if not add it
        const apiUrl = baseUrl.includes('/api') 
          ? `${baseUrl}/log-workout/`
          : `${baseUrl}/api/log-workout/`;

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
          console.error('Failed to parse response:', parseError);
          throw new Error('Failed to parse server response');
        }

        if (response.ok && result.data) {
          setWorkoutData(result.data);

          // Check if it's a rest day
          if (result.data.is_rest_day) {
            setExercises([]);
            setLoading(false);
            return;
          }

          // Transform API exercises to UI format
          const transformedExercises = result.data.exercises.map((exercise, index) => {
            // Create sets array based on the sets count
            const setsArray = [];
            for (let i = 0; i < exercise.sets; i++) {
              setsArray.push({
                id: exercise.id * 100 + i, // Unique ID for each set
                setNum: i + 1,
                reps: exercise.reps,
                weight: exercise.weight_kg || null,
                rest: null, // API doesn't provide rest time
                status: exercise.status === 'completed' ? 'done' : 
                       exercise.status === 'in_progress' ? 'active' : 
                       exercise.status === 'skipped' ? 'skipped' : 'pending',
                type: 'normal' // API doesn't provide type, default to normal
              });
            }

            return {
              id: exercise.id,
              name: exercise.exercise_name,
              allowUpload: true, // Enable upload for all exercises
              stats: {
                sets: exercise.sets,
                reps: exercise.reps,
                rest: '60s' // Default rest time
              },
              instructions: exercise.cue || '',
              sets: setsArray,
              notes: '',
              group_label: exercise.group_label || '',
              order: exercise.order || index
            };
          });

          // Sort exercises by order
          transformedExercises.sort((a, b) => a.order - b.order);

          setExercises(transformedExercises);
        } else {
          const errorMessage = result.message || 'Failed to fetch workout data';
          setError(errorMessage);
        }
      } catch (err) {
        console.error('Error fetching workout:', err);
        setError(err.message || 'Failed to load workout. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTodayWorkout();
    }
  }, [user]);

  const currentExercise = exercises[currentExerciseIdx] || exercises[0];
  const isLastExercise = currentExerciseIdx === exercises.length - 1;
  const isFirstExercise = currentExerciseIdx === 0;

  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return exercises;
    return exercises.filter(ex =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [exercises, searchQuery]);

  // Keep current exercise index in bounds after filtering
  const displayedExercise = filteredExercises.length > 0 
    ? (filteredExercises.includes(currentExercise)
        ? currentExercise
        : filteredExercises[0])
    : null;

  // Update exercise status via API
  const updateExerciseStatus = async (exerciseId, status) => {
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
        ? `${baseUrl}/log-workout/exercises/${exerciseId}/status/`
        : `${baseUrl}/api/log-workout/exercises/${exerciseId}/status/`;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      // Map UI status to API status
      const apiStatus = status === 'done' ? 'completed' : 
                       status === 'skipped' ? 'skipped' : 
                       'pending';

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({ status: apiStatus }),
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
        console.log('Exercise status updated successfully:', result);
        return true;
      } else {
        const errorMessage = result.message || 'Failed to update exercise status';
        console.error('Failed to update exercise status:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Error updating exercise status:', err);
      throw err;
    }
  };

  const handleSetAction = async (setId, action) => {
    // Optimistically update UI first
    setExercises(prev =>
      prev.map((exercise, idx) => {
        if (exercise.id !== displayedExercise.id) return exercise;

        const updatedSets = exercise.sets.map(set => {
          if (set.id === setId) {
            if (action === 'done') return { ...set, status: 'done' };
            if (action === 'skip') return { ...set, status: 'skipped' };
          }
          return set;
        });

        const currentIndex = exercise.sets.findIndex(set => set.id === setId);
        const nextIndex = currentIndex + 1;

        if ((action === 'done' || action === 'skip') && nextIndex < updatedSets.length) {
          if (updatedSets[nextIndex].status === 'pending') {
            updatedSets[nextIndex] = { ...updatedSets[nextIndex], status: 'active' };
          }
        }

        return { ...exercise, sets: updatedSets };
      })
    );

    // Update exercise status via API
    try {
      await updateExerciseStatus(displayedExercise.id, action === 'done' ? 'done' : 'skipped');
    } catch (err) {
      // Revert optimistic update on error
      console.error('Failed to update exercise status:', err);
      // Optionally show error message to user
      // You can add a toast notification here if needed
    }
  };

  const handleNoteChange = (value) => {
    setExercises(prev =>
      prev.map(exercise =>
        exercise.id === displayedExercise.id
          ? { ...exercise, notes: value }
          : exercise
      )
    );
  };

  const handleNextStep = () => {
    if (!isLastExercise) {
      setCurrentExerciseIdx(idx => Math.min(idx + 1, exercises.length - 1));
      setSearchQuery('');
    }
  };

  const handlePrevStep = () => {
    if (!isFirstExercise) {
      setCurrentExerciseIdx(idx => Math.max(idx - 1, 0));
      setSearchQuery('');
    }
  };

  const handleUploadChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const previews = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    setUploadPreview(prev => {
      const combined = [...prev, ...previews];
      if (combined.length > maxUploads) {
        setUploadError(`You can upload up to ${maxUploads} files.`);
        return combined.slice(0, maxUploads);
      }
      setUploadError('');
      return combined;
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6 px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 bg-[#F7F7F7]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003F8F] mx-auto mb-4"></div>
            <p className="text-gray-600 font-[Inter]">Loading workout...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6 px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 bg-[#F7F7F7]">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Show rest day message
  if (workoutData?.is_rest_day) {
    return (
      <div className="space-y-6 px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 bg-[#F7F7F7]">
        <div className="flex flex-col lg:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-medium text-[#003F8F] font-[Poppins]">
              Log Your Workout
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-[Inter] mt-1">
              {workoutData?.workout_name || 'Rest Day'}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-[#003F8F] font-[Poppins] mb-2">
            Rest Day
          </h2>
          <p className="text-gray-600 font-[Inter]">
            Today is your rest day. Take time to recover and come back stronger tomorrow!
          </p>
        </div>
      </div>
    );
  }

  // Show empty state if no exercises
  if (!exercises || exercises.length === 0) {
    return (
      <div className="space-y-6 px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 bg-[#F7F7F7]">
        <div className="flex flex-col lg:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-medium text-[#003F8F] font-[Poppins]">
              Log Your Workout
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-[Inter] mt-1">
              {workoutData?.workout_name || 'No Workout'}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600 font-[Inter]">No exercises found for today's workout.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 bg-[#F7F7F7]">
      {/* Header */}
      <div className="flex flex-col lg:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#003F8F] font-[Poppins]">
            Log Your Workout
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-[Inter] mt-1">
            {workoutData?.workout_name || 'Workout'}
          </p>
          {workoutData?.date && (
            <p className="text-sm text-gray-500 font-[Inter] mt-1">
              {new Date(workoutData.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          )}
        </div>
        <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search here..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] text-sm text-gray-600 font-[Inter]"
          />
        </div>
      </div>

      {/* Exercise Details Section */}
      {displayedExercise && (
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-4 lg:gap-8">
            {/* Left: Exercise Info */}
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-medium text-[#003F8F] font-[Poppins] mb-3">
                {displayedExercise.name}
              </h2>
              <p className="text-sm sm:text-base text-gray-500 font-[Inter]">
                Sets: {displayedExercise.stats?.sets} • Reps: {displayedExercise.stats?.reps} • Rest Time: {displayedExercise.stats?.rest}
              </p>
            </div>

            {/* Right: Instructions */}
            <div className="lg:w-80">
              <h3 className="text-xl font-medium text-[#003F8F] font-[Poppins] mb-2">
                Instructions
              </h3>
              <p className="text-sm sm:text-base text-gray-500 font-[Inter]">
                {displayedExercise.instructions || 'No instructions provided'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Workout Log Table */}
      {displayedExercise && (
        <div className="bg-white rounded-lg p-4 sm:p-6 overflow-x-auto">
          <div className="min-w-full">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 sm:gap-4 pb-3 mb-3 border-b border-gray-200">
              <div className="col-span-2 text-sm sm:text-base font-semibold text-[#003F8F] font-[Inter]">Set</div>
              <div className="col-span-2 text-sm sm:text-base font-semibold text-[#003F8F] font-[Inter] text-center">Reps</div>
              <div className="col-span-2 text-sm sm:text-base font-semibold text-[#003F8F] font-[Inter] text-center">Weight</div>
              <div className="col-span-2 text-sm sm:text-base font-semibold text-[#003F8F] font-[Inter] text-center">Rest</div>
              <div className="col-span-4 text-sm sm:text-base font-semibold text-[#003F8F] font-[Inter] text-center">Status</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-2">
              {displayedExercise?.sets?.map((set) => (
                <div
                  key={set.id}
                  className={`grid grid-cols-12 gap-2 sm:gap-4 border border-gray-200 py-3 px-3 rounded-lg ${statusBackground[set?.status]}`}
                >
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full border border-[#C5D4F5] bg-white text-xs sm:text-sm text-[#003F8F]">
                      {set.setNum}
                    </span>
                    {displayedExercise?.group_label && (
                      <span className="px-2 py-0.5 rounded-full bg-white text-[#003F8F] border border-[#C5D4F5] text-xs font-semibold">
                        {displayedExercise.group_label}
                      </span>
                    )}
                    {set?.type === 'warmup' && (
                      <span className="px-2 py-0.5 rounded-full bg-white text-[#EA7726] border border-[#FAD3BA] text-xs font-semibold">
                        W
                      </span>
                    )}
                    {set?.type === 'dropset' && (
                      <span className="px-2 py-0.5 rounded-full bg-white text-[#EA7726] border border-[#FAD3BA] text-xs font-semibold">
                        D
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 text-center text-sm sm:text-base text-[#003F8F] font-[Inter]">
                    {set?.reps || '-'}
                  </div>
                  <div className="col-span-2 text-center text-sm sm:text-base text-[#003F8F] font-[Inter]">
                    {set?.weight ? `${set.weight} kg` : '-'}
                  </div>
                  <div className="col-span-2 text-center text-sm sm:text-base text-[#003F8F] font-[Inter]">
                    {set?.rest || '-'}
                  </div>

                  <div className="col-span-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleSetAction(set?.id, 'done')}
                      className={`px-3 sm:px-4 py-1.3 sm:py-1 rounded-lg text-xs sm:text-sm font-medium font-[Inter] transition-colors ${
                        set?.status === 'done'
                          ? 'bg-[#003F8F] text-white'
                          : set?.status === 'active'
                          ? 'bg-[#FEECE2] text-gray-800'
                          : 'bg-white text-[#003F8F] border border-gray-300'
                      }`}
                    >
                      Done
                    </button>
                    <button 
                      onClick={() => handleSetAction(set?.id, 'skip')}
                      className={`px-3 sm:px-4 py-1.3 sm:py-1 rounded-lg text-xs sm:text-sm font-medium font-[Inter] transition-colors ${
                        set?.status === 'active'
                          ? 'bg-[#F57C00] text-white'
                          : set?.status === 'done'
                          ? 'bg-white text-[#003F8F] !border border-[#4D60804D]'
                          : 'bg-white text-[#003F8F] !border border-[#4D60804D]'
                      }`}
                    >
                      Skip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exercise Notes Section */}
      {displayedExercise && (
      <div className="bg-white rounded-lg p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <span className="text-[#003F8F] font-semibold font-[Inter] cursor-pointer">Exercise</span>
          <span className="text-[#003F8F] font-semibold font-[Inter] cursor-pointer">Notes</span>
        </div>
        <textarea
          value={displayedExercise?.notes || ''}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="Add notes about this exercise..."
          className="w-full h-32 sm:h-40 p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-[#003F8F] resize-none text-sm sm:text-base font-[Inter]"
        />
      </div>
      )}

      {/* Footer Actions */}
      {displayedExercise && (
        <div className={`flex flex-col sm:flex-row sm:items-center gap-4 ${displayedExercise?.allowUpload ? 'justify-between' : 'justify-end'}`}>
        {displayedExercise?.allowUpload && (
          <button
            className="flex items-center gap-2 bg-[#003F8F] text-white px-4 py-2 rounded-lg font-[Inter] text-sm sm:text-base hover:bg-[#002A5F] transition-colors"
            onClick={() => {
              setUploadError('');
              setIsUploadModalOpen(true);
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 5v14M5 12h14"
              />
            </svg>
            Upload photo/video
          </button>
        )}

        <div className="flex items-center justify-end gap-3">
          {!isFirstExercise && (
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-2 border border-[#003F8F] text-[#003F8F] px-6 py-2.5 sm:py-3 rounded-lg font-semibold font-[Inter] hover:bg-[#003F8F] hover:text-white transition-colors"
            >
              <span className="text-sm sm:text-base">Prev</span>
            </button>
          )}
          <button
            onClick={handleNextStep}
            className={`flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-lg font-semibold font-[Inter] border border-[#003F8F] ${
              isLastExercise ? 'bg-[#003F8F] text-white' : 'text-[#003F8F] hover:bg-[#003F8F] hover:text-white'
            } transition-colors`}
            disabled={isLastExercise}
          >
            <span className="text-sm sm:text-base">{isLastExercise ? 'Completed' : 'Next'}</span>
            <NextIcon />
          </button>
        </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#003F8F] font-[Poppins]">Upload Photo/Video</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center space-y-3">
              <label className="cursor-pointer inline-flex flex-col items-center gap-2 text-[#003F8F] font-semibold">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 5v14M5 12h14"
                  />
                </svg>
                <span>Upload Photo/Video</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleUploadChange}
                />
              </label>
              <p className="text-xs text-gray-500">You can upload up to {maxUploads} files.</p>
              {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
              {uploadPreview.length > 0 && (
                <div className="flex flex-wrap gap-3 justify-center mt-4">
                  {uploadPreview.map((file, idx) => (
                    <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img src={file.url} alt={file.name} className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#003F8F] text-white font-medium"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogWorkout;

