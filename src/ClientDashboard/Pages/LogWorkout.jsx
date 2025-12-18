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
  done: 'bg-[#EEF2FF]', // Light blue background for done
  active: 'bg-white', // White background for active (next set to be done)
  skipped: 'bg-[#FFF5EF]', // Light orange/peach background for skipped
  pending: 'bg-white' // White background for pending
};

const maxUploads = 5;

// Helper function to get today's date string (YYYY-MM-DD)
const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

// Helper function to get localStorage key for sets status (with date)
const getSetsStatusKey = (exerciseId) => {
  const today = getTodayDateString();
  return `workout_sets_status_${today}_${exerciseId}`;
};

// Load saved sets status from localStorage
const loadSetsStatus = (exerciseId, defaultSets) => {
  try {
    const savedStatus = localStorage.getItem(getSetsStatusKey(exerciseId));
    if (savedStatus) {
      const parsedStatus = JSON.parse(savedStatus);
      console.log('Loading saved status for exercise', exerciseId, ':', parsedStatus);
      // Merge saved status with default sets
      return defaultSets.map((set) => {
        const savedSetStatus = parsedStatus[set.id];
        if (savedSetStatus && (savedSetStatus === 'done' || savedSetStatus === 'skipped' || savedSetStatus === 'active')) {
          console.log(`Set ${set.id} loaded with status: ${savedSetStatus}`);
          return { ...set, status: savedSetStatus };
        }
        return set;
      });
    } else {
      console.log('No saved status found for exercise', exerciseId);
    }
  } catch (error) {
    console.error('Error loading sets status:', error);
  }
  return defaultSets;
};

// Save sets status to localStorage
const saveSetsStatus = (exerciseId, sets) => {
  try {
    const statusMap = {};
    sets.forEach(set => {
      if (set.status && set.status !== 'pending') {
        statusMap[set.id] = set.status;
      }
    });
    if (Object.keys(statusMap).length > 0) {
      const key = getSetsStatusKey(exerciseId);
      localStorage.setItem(key, JSON.stringify(statusMap));
      console.log('Saved sets status for exercise', exerciseId, ':', statusMap);
    } else {
      console.log('No status to save for exercise', exerciseId);
    }
  } catch (error) {
    console.error('Error saving sets status:', error);
  }
};

// Clean up old localStorage entries (older than today)
const cleanupOldStatus = () => {
  try {
    const today = getTodayDateString();
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('workout_sets_status_') && !key.includes(today)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error cleaning up old status:', error);
  }
};

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
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]); // Store actual File objects
  const [completingWorkout, setCompletingWorkout] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

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
                id: exercise.id * 100 + i, // Unique ID for each set - MUST match when loading
                setNum: i + 1,
                reps: exercise.reps,
                weight: exercise.weight_kg || null,
                rest: null, // API doesn't provide rest time
                status: 'pending', // Default to pending, will be loaded from localStorage
                type: 'normal' // API doesn't provide type, default to normal
              });
            }

            // Load saved status from localStorage and merge - IMPORTANT: This must happen here
            const setsWithStatus = loadSetsStatus(exercise.id, setsArray);
            console.log(`Exercise ${exercise.id} (${exercise.exercise_name}): Loaded ${setsWithStatus.filter(s => s.status !== 'pending').length} sets with saved status`);

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
              sets: setsWithStatus, // Use sets with loaded status
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
      // Clean up old status entries
      cleanupOldStatus();
      fetchTodayWorkout();
    }
  }, [user]);

  // Ensure status persists when navigating back - reload from localStorage if needed
  useEffect(() => {
    if (exercises.length > 0 && !loading) {
      // Reload status from localStorage to ensure persistence
      setExercises(prevExercises => {
        let hasChanges = false;
        const updatedExercises = prevExercises.map(exercise => {
          const savedSets = loadSetsStatus(exercise.id, exercise.sets);
          // Check if any set status changed
          const statusChanged = savedSets.some((set, idx) =>
            set.status !== exercise.sets[idx]?.status
          );
          if (statusChanged) {
            hasChanges = true;
            console.log(`Reloading status for exercise ${exercise.id} (${exercise.name})`);
            return { ...exercise, sets: savedSets };
          }
          return exercise;
        });
        return hasChanges ? updatedExercises : prevExercises;
      });
    }
  }, [loading]); // Only run when loading completes

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
            if (action === 'done') {
              console.log(`Marking set ${setId} as done for exercise ${exercise.id}`);
              return { ...set, status: 'done' };
            }
            if (action === 'skip') {
              console.log(`Marking set ${setId} as skipped for exercise ${exercise.id}`);
              return { ...set, status: 'skipped' };
            }
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

        // Save updated sets status to localStorage IMMEDIATELY
        console.log(`Saving status for exercise ${exercise.id} with ${updatedSets.length} sets`);
        saveSetsStatus(exercise.id, updatedSets);

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

  // Handle bulk status update when completing workout
  const handleCompleteWorkout = async () => {
    setCompletingWorkout(true);
    
    try {
      // Get authentication token
      let token = null;
      const storedUser = localStorage.getItem('user');
      
      if (user) {
        token = user.token || user.access_token || user.authToken || user.accessToken || user.access;
      }

      if (!token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token || userData.access_token || userData.authToken || userData.accessToken || userData.access;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      if (!token) {
        token = localStorage.getItem('token') || 
                localStorage.getItem('access_token') || 
                localStorage.getItem('authToken') || 
                localStorage.getItem('accessToken') ||
                localStorage.getItem('access');
      }

      const isValidToken = token &&
        typeof token === 'string' &&
        token.trim().length > 0 &&
        token.trim() !== 'null' &&
        token.trim() !== 'undefined' &&
        token.trim() !== '' &&
        !token.startsWith('{') &&
        !token.startsWith('[');

      if (!isValidToken) {
        setError('No authentication token found. Please log in again.');
        setCompletingWorkout(false);
        return;
      }

      // Determine exercise status based on sets
      // If all sets are done -> completed
      // If any set is skipped -> skipped
      // Otherwise -> pending (but we'll only send done/skipped exercises)
      const exercisesToUpdate = exercises
        .map(exercise => {
          const allSetsDone = exercise.sets.every(set => set.status === 'done');
          const anySetSkipped = exercise.sets.some(set => set.status === 'skipped');
          const hasAnyAction = exercise.sets.some(set => set.status === 'done' || set.status === 'skipped');
          
          if (allSetsDone) {
            return { id: exercise.id, status: 'completed' };
          } else if (anySetSkipped && hasAnyAction) {
            return { id: exercise.id, status: 'skipped' };
          }
          return null;
        })
        .filter(ex => ex !== null); // Only include exercises with done/skipped status

      if (exercisesToUpdate.length === 0) {
        console.log('No exercises to update');
        setCompletingWorkout(false);
        return;
      }

      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      // Use the bulk-status API endpoint: /api/log-workout/exercises/bulk-status/
      const apiUrl = baseUrl.includes('/api')
        ? `${baseUrl}/log-workout/exercises/bulk-status/`
        : `${baseUrl}/api/log-workout/exercises/bulk-status/`;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      // Clean token
      const cleanToken = token.trim().replace(/^["']|["']$/g, '');
      headers['Authorization'] = `Bearer ${cleanToken}`;

      console.log('Updating bulk exercise status:', exercisesToUpdate);

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({ exercises: exercisesToUpdate }),
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
        console.log('Bulk exercise status updated successfully:', result);
        // Show success popup
        setShowSuccessPopup(true);
        // Auto-hide popup after 3 seconds
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 3000);
      } else {
        const errorMessage = result.message || result.detail || 'Failed to update exercise status';
        setError(errorMessage);
        console.error('Failed to update bulk exercise status:', errorMessage);
      }
    } catch (err) {
      console.error('Error updating bulk exercise status:', err);
      setError(err.message || 'Failed to complete workout. Please try again.');
    } finally {
      setCompletingWorkout(false);
    }
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
    
    // Store actual File objects
    setUploadFiles(prev => {
      const combined = [...prev, ...files];
      if (combined.length > maxUploads) {
        setUploadError(`You can upload up to ${maxUploads} files.`);
        return combined.slice(0, maxUploads);
      }
      setUploadError('');
      return combined;
    });

    // Create previews for display
    const previews = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      file: file // Store reference to actual file
    }));

    setUploadPreview(prev => {
      const combined = [...prev, ...previews];
      if (combined.length > maxUploads) {
        return combined.slice(0, maxUploads);
      }
      return combined;
    });
  };

  // Upload photos/videos to API
  const handleUploadPhotos = async () => {
    if (!displayedExercise || uploadFiles.length === 0) {
      setUploadError('Please select at least one file to upload.');
      return;
    }

    setUploadLoading(true);
    setUploadError('');

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
        ? `${baseUrl}/log-workout/photos/`
        : `${baseUrl}/api/log-workout/photos/`;

      // Prepare FormData
      const formData = new FormData();
      
      // Add exercise ID
      formData.append('exercise_id', displayedExercise.id);
      
      // Add day_id from workoutData
      if (workoutData && workoutData.day_id) {
        formData.append('day_id', workoutData.day_id);
      } else if (workoutData && workoutData.id) {
        // Fallback: use workoutData.id if day_id is not available
        formData.append('day_id', workoutData.id);
      } else {
        setUploadError('Day ID is missing. Please refresh the page.');
        setUploadLoading(false);
        return;
      }
      
      // Add all files - API expects 'photo' field (singular)
      uploadFiles.forEach((file, index) => {
        formData.append('photo', file);
      });

      // Prepare headers
      const headers = {};

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      console.log('Uploading photos to:', apiUrl);
      console.log('Exercise ID:', displayedExercise.id);
      console.log('Day ID:', workoutData?.day_id || workoutData?.id);
      console.log('Files count:', uploadFiles.length);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: formData,
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
        console.log('Photos uploaded successfully:', result);
        // Clear upload state
        setUploadPreview([]);
        setUploadFiles([]);
        setIsUploadModalOpen(false);
        // Optionally show success message
        // You can add a toast notification here
      } else {
        const errorMessage = result.message || result.detail || result.error || 'Failed to upload photos';
        setUploadError(errorMessage);
        console.error('Failed to upload photos:', errorMessage);
      }
    } catch (err) {
      console.error('Error uploading photos:', err);
      setUploadError(err.message || 'Failed to upload photos. Please try again.');
    } finally {
      setUploadLoading(false);
    }
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
                      className={`px-3 sm:px-4 py-1.3 sm:py-1 rounded-lg text-xs sm:text-sm font-medium font-[Inter] transition-colors ${set?.status === 'done'
                          ? 'bg-[#003F8F] text-white' // Solid blue when done
                          : 'bg-white text-[#003F8F] border border-gray-300' // White with border when not done
                        }`}
                    >
                      Done
                    </button>
                    <button
                      onClick={() => handleSetAction(set?.id, 'skip')}
                      className={`px-3 sm:px-4 py-1.3 sm:py-1 rounded-lg text-xs sm:text-sm font-medium font-[Inter] transition-colors ${set?.status === 'skipped'
                          ? 'bg-[#F57C00] text-white' // Solid orange when skipped
                          : 'bg-white text-[#003F8F] border border-[#4D60804D]' // White with border when not skipped
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
              className="flex items-center gap-2 bg-[#003F8F] text-white px-4 py-2.5 rounded-lg font-[Inter] text-sm sm:text-base hover:bg-[#002A5F] transition-colors cursor-pointer"
              onClick={() => {
                setUploadError('');
                setIsUploadModalOpen(true);
              }}
            >
              {/* Camera Icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
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
            {isLastExercise ? (
              <button
                onClick={handleCompleteWorkout}
                disabled={completingWorkout}
                className={`flex items-center gap-2 bg-white border border-[#003F8F] text-[#003F8F] px-6 py-2.5 sm:py-3 rounded-lg font-semibold font-[Inter] hover:bg-gray-50 transition-colors ${
                  completingWorkout ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="text-sm sm:text-base">{completingWorkout ? 'Completing...' : 'Completed'}</span>
                {/* Fast-forward icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.933 12.8a1 1 0 000-1.6L5.6 7.2A1 1 0 004 8v8a1 1 0 001.6.8l6.333-4zM19.933 12.8a1 1 0 000-1.6l-6.333-4A1 1 0 0012 8v8a1 1 0 001.6.8l6.333-4z"
                  />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-lg font-semibold font-[Inter] border border-[#003F8F] text-[#003F8F] hover:bg-[#003F8F] hover:text-white transition-colors"
              >
                <span className="text-sm sm:text-base">Next</span>
                <NextIcon />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setUploadPreview([]);
            setIsUploadModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#003F8F] font-[Poppins]">Upload Photo/Video</h3>
              <button
                onClick={() => {
                  setUploadPreview([]);
                  setIsUploadModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#4D6080" fill-opacity="0.8" />
                  <path d="M16.066 8.99502C16.1377 8.92587 16.1948 8.84314 16.2342 8.75165C16.2735 8.66017 16.2943 8.56176 16.2952 8.46218C16.2961 8.3626 16.2772 8.26383 16.2395 8.17164C16.2018 8.07945 16.1462 7.99568 16.0758 7.92523C16.0054 7.85478 15.9217 7.79905 15.8295 7.7613C15.7374 7.72354 15.6386 7.70452 15.5391 7.70534C15.4395 7.70616 15.341 7.7268 15.2495 7.76606C15.158 7.80532 15.0752 7.86242 15.006 7.93402L12 10.939L8.995 7.93402C8.92634 7.86033 8.84354 7.80123 8.75154 7.76024C8.65954 7.71925 8.56022 7.69721 8.45952 7.69543C8.35882 7.69365 8.25879 7.71218 8.1654 7.7499C8.07201 7.78762 7.98718 7.84376 7.91596 7.91498C7.84474 7.9862 7.7886 8.07103 7.75087 8.16442C7.71315 8.25781 7.69463 8.35784 7.69641 8.45854C7.69818 8.55925 7.72022 8.65856 7.76122 8.75056C7.80221 8.84256 7.86131 8.92536 7.935 8.99402L10.938 12L7.933 15.005C7.80052 15.1472 7.72839 15.3352 7.73182 15.5295C7.73525 15.7238 7.81396 15.9092 7.95138 16.0466C8.08879 16.1841 8.27417 16.2628 8.46847 16.2662C8.66278 16.2696 8.85082 16.1975 8.993 16.065L12 13.06L15.005 16.066C15.1472 16.1985 15.3352 16.2706 15.5295 16.2672C15.7238 16.2638 15.9092 16.1851 16.0466 16.0476C16.184 15.9102 16.2627 15.7248 16.2662 15.5305C16.2696 15.3362 16.1975 15.1482 16.065 15.006L13.062 12L16.066 8.99502Z" fill="white" />
                </svg>

              </button>
            </div>

            {/* Upload Area with Background Color */}
            <div className="rounded-lg p-6 mb-4" style={{ backgroundColor: '#4D60801A' }}>
              {/* Upload Button */}
              <label className="cursor-pointer flex justify-center">
                <div className="flex items-center justify-center gap-2  rounded-lg bg-white px-4 py-3 hover:bg-gray-50 transition-colors w-auto inline-flex">
                  {/* Upload Icon - User provided SVG */}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.25 8.75V11.0833C12.25 11.3928 12.1271 11.6895 11.9083 11.9083C11.6895 12.1271 11.3928 12.25 11.0833 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0833V8.75" stroke="#003F8F" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.91659 4.66667L6.99992 1.75L4.08325 4.66667" stroke="#003F8F" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 1.75V8.75" stroke="#003F8F" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[#003F8F] font-medium font-[Inter] whitespace-nowrap">Upload Photo/Video</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={handleUploadChange}
                  />
                </div>
              </label>
              {uploadError && <p className="text-xs text-red-500 mt-2 text-center">{uploadError}</p>}

              {/* Preview Thumbnails - Show below upload button */}
              {uploadPreview.length > 0 && (
                <div className="flex flex-wrap gap-3 justify-center mt-4">
                  {uploadPreview.map((file, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-white">
                      {file.url.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={file.url} className="object-cover w-full h-full" />
                      ) : (
                        <img src={file.url} alt={file.name} className="object-cover w-full h-full" />
                      )}
                      {/* Delete button on thumbnail */}
                      <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadPreview(prev => prev.filter((_, i) => i !== idx));
                        setUploadFiles(prev => prev.filter((_, i) => i !== idx));
                      }}
                        className="absolute top-1 right-1 w-5 h-5 bg-[#003F8F] rounded-full flex items-center justify-center hover:bg-[#002A5F] transition-colors"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setUploadPreview([]);
                  setUploadFiles([]);
                  setUploadError('');
                  setIsUploadModalOpen(false);
                }}
                disabled={uploadLoading}
                className={`px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium font-[Inter] hover:bg-gray-50 transition-colors ${
                  uploadLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadPhotos}
                disabled={uploadLoading || uploadFiles.length === 0}
                className={`px-6 py-2 rounded-lg bg-[#003F8F] text-white font-medium font-[Inter] hover:bg-[#002A5F] transition-colors ${
                  uploadLoading || uploadFiles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex flex-col items-center space-y-4">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 0C8.954 0 0 8.954 0 20C0 31.046 8.954 40 20 40C31.046 40 40 31.046 40 20C40 8.954 31.046 0 20 0ZM20 37.5C10.335 37.5 2.5 29.665 2.5 20C2.5 10.335 10.335 2.5 20 2.5C29.665 2.5 37.5 10.335 37.5 20C37.5 29.665 29.665 37.5 20 37.5Z" fill="#25CD25"/>
                  <path d="M27.982 13.017L16.982 24.017L12.018 19.053C11.586 18.621 10.914 18.621 10.482 19.053C10.05 19.485 10.05 20.157 10.482 20.589L16.232 26.339C16.664 26.771 17.336 26.771 17.768 26.339L29.768 14.339C30.2 13.907 30.2 13.235 29.768 12.803C29.336 12.371 28.664 12.371 28.232 12.803L27.982 13.017Z" fill="#25CD25"/>
                </svg>
              </div>
              
              {/* Success Message */}
              <h3 className="text-2xl font-bold text-[#003F8F] font-[Poppins] text-center">
                Complete Successfully!
              </h3>
              <p className="text-gray-600 text-center font-[Inter]">
                Your workout has been completed and saved successfully.
              </p>
              
              {/* Close Button */}
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="mt-4 px-6 py-2.5 bg-[#003F8F] text-white rounded-lg font-semibold font-[Inter] hover:bg-[#002A5F] transition-colors"
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

export default LogWorkout;

