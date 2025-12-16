import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteWorkoutModal from './DeleteWorkoutModal';
import AddEditWorkout from './AddEditWorkout';
import RestDay from './RestDay';

// Use API URL from .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const WorkoutPlan = ({ onBack, workoutPlanData, onWorkoutPlanUpdated, onWorkoutPlanDeleted }) => {
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
  const [isRestDay, setIsRestDay] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableDescription, setEditableDescription] = useState('');
  const [newVideoLinks, setNewVideoLinks] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessageText, setSuccessMessageText] = useState('Updated successfully');
  const [showExerciseVideoInputs, setShowExerciseVideoInputs] = useState({});
  const [hoveredExerciseId, setHoveredExerciseId] = useState(null);
  const [fullBodyVideoLinks, setFullBodyVideoLinks] = useState([]);
  const [newFullBodyVideoLink, setNewFullBodyVideoLink] = useState('');
  const [showFullBodyVideoInput, setShowFullBodyVideoInput] = useState(false);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState(null);

  // Day name mapping from API format to UI format
  const dayNameMap = {
    'monday': 'Mon',
    'tuesday': 'Tue',
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun'
  };

  // Reverse mapping from UI format to API format
  const reverseDayMap = {
    'Mon': 'monday',
    'Tue': 'tuesday',
    'Wed': 'wednesday',
    'Thu': 'thursday',
    'Fri': 'friday',
    'Sat': 'saturday',
    'Sun': 'sunday'
  };

  // Transform API data to UI format
  const transformWorkoutPlanData = (apiData) => {
    if (!apiData || !apiData.days) {
      return null;
    }

    const transformedWorkouts = {};
    
    apiData.days.forEach((day, index) => {
      const dayKey = dayNameMap[day.day.toLowerCase()] || day.day;
      
      if (day.is_rest_day) {
        transformedWorkouts[dayKey] = {
          workoutName: day.workout_name || 'Rest Day',
          dayId: day.id, // Store day ID for API update
          exercises: []
        };
      } else {
        transformedWorkouts[dayKey] = {
          workoutName: day.workout_name || '',
          dayId: day.id, // Store day ID for API update
          exercises: day.exercises.map((exercise, exIndex) => ({
            id: exercise.id || (index * 100) + exIndex + 1, // Preserve original exercise ID
            label: exercise.group_label || '',
            name: exercise.exercise_name || '',
            sets: exercise.sets || 0,
            reps: exercise.reps || 0,
            weight_kg: exercise.weight_kg || null,
            notes: exercise.cue || '',
            videoLinks: [],
            isSuperset: exercise.group_label && /[A-Z]1$|[A-Z]2$/.test(exercise.group_label) || false
          }))
        };
      }
    });

    return transformedWorkouts;
  };

  // Initialize workouts from API data or use default
  const getInitialWorkouts = () => {
    if (workoutPlanData) {
      const transformed = transformWorkoutPlanData(workoutPlanData);
      if (transformed) {
        return transformed;
      }
    }
    
    // Default empty workouts
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

  // Update workouts when workoutPlanData changes
  useEffect(() => {
    if (workoutPlanData) {
      const transformed = transformWorkoutPlanData(workoutPlanData);
      if (transformed) {
        setWorkouts(transformed);
      }
      // Initialize editable fields (title is not editable)
      setEditableDescription(workoutPlanData.description || '');
    }
  }, [workoutPlanData]);

  // Handle edit mode toggle
  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset to original values (title is not editable)
    if (workoutPlanData) {
      setEditableDescription(workoutPlanData.description || '');
      const transformed = transformWorkoutPlanData(workoutPlanData);
      if (transformed) {
        setWorkouts(transformed);
      }
    }
    setIsEditMode(false);
  };

  // Handle save from edit mode
  const handleSaveFromEditMode = async () => {
    await handleUpdateWorkoutPlan();
    setIsEditMode(false);
  };

  // Handle adding video link to exercise
  const handleAddVideoLink = (exerciseId) => {
    const link = newVideoLinks[exerciseId];
    if (link && link.trim()) {
      const updatedExercises = currentWorkouts.map(ex =>
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

  // Handle showing video link input for exercise
  const handleShowExerciseVideoInput = (exerciseId) => {
    setShowExerciseVideoInputs({ ...showExerciseVideoInputs, [exerciseId]: true });
  };

  // Handle removing video link from exercise
  const handleRemoveVideoLink = (exerciseId, linkIndex) => {
    const updatedExercises = currentWorkouts.map(ex =>
      ex.id === exerciseId
        ? { ...ex, videoLinks: (ex.videoLinks || []).filter((_, idx) => idx !== linkIndex) }
        : ex
    );
    setWorkouts(prev => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
    }));
  };

  // Handle adding full body video link
  const handleAddFullBodyVideoLink = () => {
    if (newFullBodyVideoLink.trim()) {
      setFullBodyVideoLinks([...fullBodyVideoLinks, newFullBodyVideoLink]);
      setNewFullBodyVideoLink('');
      setShowFullBodyVideoInput(false);
    }
  };

  // Handle removing full body video link
  const handleRemoveFullBodyVideoLink = (linkIndex) => {
    setFullBodyVideoLinks(fullBodyVideoLinks.filter((_, idx) => idx !== linkIndex));
  };

  // Toggle superset for exercise
  const toggleSuperset = (exerciseId) => {
    const updatedExercises = currentWorkouts.map(ex => {
      if (ex.id === exerciseId) {
        const isSuperset = ex.isSuperset || false;
        return { ...ex, isSuperset: !isSuperset };
      }
      return ex;
    });
    setWorkouts(prev => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
    }));
  };

  // Handle adding superset
  const handleAddSuperset = (exerciseId) => {
    const exerciseIndex = currentWorkouts.findIndex(ex => ex.id === exerciseId);
    if (exerciseIndex === -1) return;

    const currentExercise = currentWorkouts[exerciseIndex];
    const baseLetter = currentExercise.label ? currentExercise.label.replace(/[0-9]/g, '') || 'A' : 'A';

    // Convert current exercise to baseLetter1
    const updatedExercise = {
      ...currentExercise,
      label: `${baseLetter}1`,
      isSuperset: true
    };

    // Create baseLetter2
    const maxId = Math.max(...currentWorkouts.map(ex => ex.id || 0), 0);
    const newExercise2 = {
      id: maxId + 1,
      label: `${baseLetter}2`,
      name: '',
      sets: 0,
      reps: 0,
      weight_kg: null,
      notes: '',
      videoLinks: [],
      isSuperset: true
    };

    // Replace current exercise and add new one after it
    const newExercises = [...currentWorkouts];
    newExercises[exerciseIndex] = updatedExercise;
    newExercises.splice(exerciseIndex + 1, 0, newExercise2);
    
    setWorkouts(prev => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], exercises: newExercises }
    }));
  };

  // Handle delete exercise
  const handleDeleteExercise = (exerciseId) => {
    const updatedExercises = currentWorkouts.filter(ex => ex.id !== exerciseId);
    setWorkouts(prev => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
    }));
    setHoveredExerciseId(null);
  };

  // Handle add exercise
  const handleAddExercise = () => {
    const nextLabel = String.fromCharCode(65 + currentWorkouts.length);
    const maxId = Math.max(...currentWorkouts.map(ex => ex.id || 0), 0);
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
      [selectedDay]: { ...prev[selectedDay], exercises: [...currentWorkouts, newExercise] }
    }));
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Handle delete workout plan via API
  const handleDelete = async () => {
    if (!workoutPlanData || !workoutPlanData.id) {
      console.error('Workout plan ID not found. Cannot delete.');
      alert('Workout plan ID not found. Cannot delete.');
      setShowDeleteModal(false);
      return;
    }

    setIsDeleting(true);

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
        ? `${baseUrl}/ai-workout-plans/${workoutPlanData.id}/`
        : `${baseUrl}/api/ai-workout-plans/${workoutPlanData.id}/`;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      console.log('=== DELETE WORKOUT PLAN API CALL ===');
      console.log('API URL:', apiUrl);

      // Call DELETE API
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: headers,
        credentials: 'include',
      });

      console.log('=== DELETE WORKOUT PLAN API RESPONSE ===');
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
        // Even if response is empty, treat as success if status is ok
        if (response.ok) {
          result = { message: 'Workout plan deleted successfully' };
        } else {
          throw new Error('Failed to parse server response');
        }
      }

      if (response.ok) {
        console.log('Workout plan deleted successfully');
        // Clear workout plan data locally
        setWorkouts({
          Mon: { workoutName: '', exercises: [] },
          Tue: { workoutName: '', exercises: [] },
          Wed: { workoutName: '', exercises: [] },
          Thu: { workoutName: '', exercises: [] },
          Fri: { workoutName: '', exercises: [] },
          Sat: { workoutName: '', exercises: [] },
          Sun: { workoutName: 'Rest Day', exercises: [] }
        });
        setIsRestDay(false);
        setIsEditMode(false);
        setShowDeleteModal(false);
        setEditableDescription('');
        
        // Notify parent component that workout plan was deleted
        // This will set workoutPlanData to empty structure and keep us on the workout plan view
        if (onWorkoutPlanDeleted) {
          onWorkoutPlanDeleted();
        }
        
        // Don't call onBack - we want to stay on the workout plan view with empty state
      } else {
        // Handle errors
        const errorMessage = result.message || 'Failed to delete workout plan';
        const errorDetails = result.errors ? JSON.stringify(result.errors) : '';
        throw new Error(errorMessage + (errorDetails ? ` - ${errorDetails}` : ''));
      }
    } catch (error) {
      console.error('=== DELETE WORKOUT PLAN API ERROR ===');
      console.error('Error deleting workout plan:', error);
      alert(`Error deleting workout plan: ${error.message}`);
    } finally {
      setIsDeleting(false);
      console.log('=== DELETE WORKOUT PLAN API CALL END ===');
    }
  };

  const handleEdit = (exerciseId) => {
    setEditingExerciseId(exerciseId);
    setShowAddWorkout(true);
  };

  const handleAddWorkout = () => {
    setEditingExerciseId(null);
    setShowAddWorkout(true);
  };

  const handleSave = async (savedData) => {
    if (savedData) {
      // Update the workouts state with the saved data
      const { workoutName: savedWorkoutName, exercises: savedExercises, day: savedDay } = savedData;
      
      setWorkouts(prev => {
        const currentDayWorkout = prev[savedDay] || { workoutName: '', exercises: [] };
        
        // If editing a single exercise, update only that exercise
        if (editingExerciseId && savedExercises && savedExercises.length === 1) {
          const updatedExercises = currentDayWorkout.exercises.map(ex => 
            ex.id === editingExerciseId ? savedExercises[0] : ex
          );
          
          return {
            ...prev,
            [savedDay]: {
              workoutName: savedWorkoutName || currentDayWorkout.workoutName,
              exercises: updatedExercises
            }
          };
        }
        
        // Otherwise, replace all exercises
        return {
          ...prev,
          [savedDay]: {
            workoutName: savedWorkoutName || currentDayWorkout.workoutName || '',
            exercises: savedExercises || []
          }
        };
      });
      
      console.log('Workout saved for day:', savedDay);

      // If workout plan was deleted (no id), create new one via POST API after saving workout details
      if (!workoutPlanData?.id) {
        await handleCreateWorkoutPlan();
      }
    }
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

  // Fetch clients list from API
  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      
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
        ? `${baseUrl}/clients/list/`
        : `${baseUrl}/api/clients/list/`;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      console.log('Fetching clients from:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers,
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data && Array.isArray(result.data)) {
          setClients(result.data);
          console.log('Clients fetched successfully:', result.data);
        } else {
          console.error('Invalid response format:', result);
          setClients([]);
        }
      } else {
        console.error('Failed to fetch clients:', response.status);
        setClients([]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  // Fetch clients when modal opens
  useEffect(() => {
    if (showAssignModal) {
      fetchClients();
    }
  }, [showAssignModal]);

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
    // Check if client is already selected by ID
    if (!selectedClients.some(c => c.id === client.id)) {
      setSelectedClients([...selectedClients, client]);
    }
    setShowClientDropdown(false);
  };

  // Handle client removal
  const handleRemoveClient = (clientId) => {
    setSelectedClients(selectedClients.filter(c => c.id !== clientId));
  };

  // Handle assign plan
  const handleAssignPlan = async () => {
    if (!workoutPlanData?.id) {
      setAssignError('Workout plan must be saved before assigning to clients');
      return;
    }

    if (selectedClients.length === 0) {
      setAssignError('Please select at least one client');
      return;
    }

    setIsAssigning(true);
    setAssignError(null);

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
      
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      // Extract weeks from cadence (e.g., "For 3 Weeks" -> 3)
      const weeksMatch = selectedCadence.match(/\d+/);
      const weeks = weeksMatch ? parseInt(weeksMatch[0]) : 3;

      // Assign plan to each selected client
      const assignPromises = selectedClients.map(async (client) => {
        // Check if baseUrl already includes /api, if not add it
        const apiUrl = baseUrl.includes('/api') 
          ? `${baseUrl}/ai-workout-plans/${workoutPlanData.id}/assign/`
          : `${baseUrl}/api/ai-workout-plans/${workoutPlanData.id}/assign/`;

        const requestBody = {
          client_id: client.id,
          weeks: weeks
        };

        console.log(`Assigning plan to client ${client.name} (ID: ${client.id}):`, apiUrl, requestBody);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: headers,
          credentials: 'include',
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText || 'Failed to assign workout plan' };
          }
          throw new Error(errorData.message || `Failed to assign plan to ${client.name}`);
        }

        const result = await response.json();
        console.log(`Successfully assigned plan to ${client.name}:`, result);
        return result;
      });

      // Wait for all assignments to complete
      await Promise.all(assignPromises);

      // Show success message
      setSuccessMessageText('Assigned successfully');
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      // Close modal and reset
      setShowAssignModal(false);
      setSelectedClients([]);
      setSelectedCadence('For 3 Weeks');
      setShowClientDropdown(false);
      setShowCadenceDropdown(false);

    } catch (error) {
      console.error('Error assigning workout plan:', error);
      setAssignError(error.message || 'Failed to assign workout plan. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  // Transform local workouts state back to API format
  const transformWorkoutsToApiFormat = (isCreate = false) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, index) => {
      const dayData = workouts[day] || { workoutName: '', exercises: [], dayId: null };
      const apiDay = reverseDayMap[day] || day.toLowerCase();
      
      // Check if it's a rest day (Sunday or workout name contains "rest" and no exercises)
      const isRestDay = day === 'Sun' || 
        (dayData.workoutName.toLowerCase().includes('rest') && dayData.exercises.length === 0);
      
      const dayPayload = {
        day: apiDay,
        workout_name: dayData.workoutName || (isRestDay ? 'Rest Day' : ''),
        is_rest_day: isRestDay,
        order: index,
        exercises: isRestDay ? [] : dayData.exercises.map((exercise, exIndex) => {
          const exercisePayload = {
            exercise_name: exercise.name || '',
            sets: exercise.sets || 0,
            reps: exercise.reps || 0,
            weight_kg: exercise.weight_kg || null,
            cue: exercise.notes || '',
            group_label: exercise.label || '',
            order: exIndex
          };
          
          // Include exercise ID only for updates, not for create
          if (!isCreate && exercise.id) {
            exercisePayload.id = exercise.id;
          }
          
          return exercisePayload;
        })
      };
      
      // Include day ID only for updates, not for create
      if (!isCreate && dayData.dayId) {
        dayPayload.id = dayData.dayId;
      }
      
      return dayPayload;
    });
  };

  // Handle create new workout plan via POST API
  const handleCreateWorkoutPlan = async () => {
    setIsCreating(true);

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

      // Transform workouts to API format (isCreate = true for POST)
      const daysPayload = transformWorkoutsToApiFormat(true);

      // Prepare request body
      const requestBody = {
        title: workoutPlanData?.title || "Client's Weekly Workout Plan",
        description: editableDescription || workoutPlanData?.description || '',
        days: daysPayload
      };

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

      console.log('=== CREATE WORKOUT PLAN API CALL ===');
      console.log('API URL:', apiUrl);
      console.log('Request body:', requestBody);

      // Call POST API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(requestBody)
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
        // Update local workouts with the response data
        const transformed = transformWorkoutPlanData(result.data);
        if (transformed) {
          setWorkouts(transformed);
        }
        // Update the workout plan data in parent component
        if (onWorkoutPlanUpdated) {
          onWorkoutPlanUpdated(result.data);
        }
        // Show success message
        setSuccessMessageText('Created successfully');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        // Handle errors
        const errorMessage = result.message || 'Failed to create workout plan';
        const errorDetails = result.errors ? JSON.stringify(result.errors) : '';
        throw new Error(errorMessage + (errorDetails ? ` - ${errorDetails}` : ''));
      }
    } catch (error) {
      console.error('=== CREATE WORKOUT PLAN API ERROR ===');
      console.error('Error creating workout plan:', error);
      alert(`Error creating workout plan: ${error.message}`);
    } finally {
      setIsCreating(false);
      console.log('=== CREATE WORKOUT PLAN API CALL END ===');
    }
  };

  // Handle update workout plan
  const handleUpdateWorkoutPlan = async () => {
    if (!workoutPlanData || !workoutPlanData.id) {
      console.error('Workout plan ID not found. Cannot update.');
      alert('Workout plan ID not found. Please generate a new workout plan first.');
      return;
    }

    setIsUpdating(true);

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
        ? `${baseUrl}/ai-workout-plans/${workoutPlanData.id}/`
        : `${baseUrl}/api/ai-workout-plans/${workoutPlanData.id}/`;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      // Prepare request body - use editable fields if in edit mode (title is not editable, keep original)
      const requestBody = {
        title: workoutPlanData.title || "Client's Weekly Workout Plan",
        description: isEditMode ? editableDescription : (workoutPlanData.description || ''),
        status: workoutPlanData.status || 'draft',
        days: transformWorkoutsToApiFormat()
      };

      console.log('=== UPDATE WORKOUT PLAN API CALL ===');
      console.log('API URL:', apiUrl);
      console.log('Request body:', requestBody);

      // Call PUT API
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      console.log('=== UPDATE WORKOUT PLAN API RESPONSE ===');
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
        console.log('Workout plan updated successfully');
        // Update local workouts with the response data
        const transformed = transformWorkoutPlanData(result.data);
        if (transformed) {
          setWorkouts(transformed);
        }
        // Update local workoutPlanData state if available
        // The parent will update it via callback, but we also need to update our local editable fields
        setEditableDescription(result.data.description || editableDescription);
        // Update the workout plan data in parent component
        if (onWorkoutPlanUpdated) {
          onWorkoutPlanUpdated(result.data);
        }
        // Show success message
        setSuccessMessageText('Updated successfully');
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        // Handle errors
        const errorMessage = result.message || 'Failed to update workout plan';
        const errorDetails = result.errors ? JSON.stringify(result.errors) : '';
        throw new Error(errorMessage + (errorDetails ? ` - ${errorDetails}` : ''));
      }
    } catch (error) {
      console.error('=== UPDATE WORKOUT PLAN API ERROR ===');
      console.error('Error updating workout plan:', error);
      // Error can still use alert or we can add error message state too
    } finally {
      setIsUpdating(false);
      console.log('=== UPDATE WORKOUT PLAN API CALL END ===');
    }
  };

  const currentDayData = workouts[selectedDay] || { workoutName: '', exercises: [] };
  const currentWorkouts = currentDayData.exercises || [];
  const workoutName = currentDayData.workoutName || '';
  const isSunday = selectedDay === 'Sun';
  // Check if current day is a rest day (either Sunday or has "Rest Day" in workout name and no exercises)
  const isCurrentDayRestDay = isSunday || (workoutName.toLowerCase().includes('rest') && currentWorkouts.length === 0);

  if (showRestDay && isRestDay && !isSunday) {
    return <RestDay day={selectedDay} onBack={() => { setShowRestDay(false); setIsRestDay(false); }} onToggle={() => setIsRestDay(false)} />;
  }

  // Get current day's workout data for AddEditWorkout (used inline, not as early return)
  const currentDayDataForAdd = workouts[selectedDay] || { workoutName: '', exercises: [] };
  const exerciseToEdit = editingExerciseId 
    ? currentDayDataForAdd.exercises.find(ex => ex.id === editingExerciseId)
    : null;

  if (showDeleteModal) {
    return (
      <DeleteWorkoutModal
        day={selectedDay}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
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
        {/* Show AddEditWorkout inline if showAddWorkout is true */}
        {showAddWorkout ? (
          <AddEditWorkout
            day={selectedDay}
            exerciseId={editingExerciseId}
            initialWorkoutName={currentDayDataForAdd.workoutName}
            initialExercises={editingExerciseId ? [exerciseToEdit].filter(Boolean) : currentDayDataForAdd.exercises}
            isEditMode={!!editingExerciseId}
            onBack={() => {
              setShowAddWorkout(false);
              setEditingExerciseId(null);
            }}
            onSave={async (savedData) => {
              await handleSave(savedData);
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
        ) : (
        /* White Bordered Box - Contains All Content */
        <div className="bg-white rounded-lg !border border-[#4D60804D] p-6">
          {/* Title and Actions */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[#003F8F] font-[Poppins]">
              {workoutPlanData?.title || "Client's Weekly Workout Plan"}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Add Workout button clicked - navigating to add-workout page');
                  // Always navigate to AddWorkout page
                  navigate('/coach/ai-program/add-workout');
                }}
                disabled={isEditMode || showAddWorkout}
                className={`px-4 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                  isEditMode || showAddWorkout
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[#002F6F] cursor-pointer'
                }`}
                type="button"
              >
                <span>+</span>
                Add Workout
              </button>
              {!isEditMode && (
                <button
                  onClick={handleToggleEditMode}
                  disabled={!workoutPlanData?.id}
                  className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                    !workoutPlanData?.id 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.3333 2L14 4.66667M11.3333 2L8.66667 4.66667M11.3333 2V5.33333M14 4.66667H11.3333M14 4.66667V14C14 14.3682 13.7015 14.6667 13.3333 14.6667H2.66667C2.29848 14.6667 2 14.3682 2 14V2.66667C2 2.29848 2.29848 2 2.66667 2H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Edit
                </button>
              )}
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

          {/* Description */}
          {(workoutPlanData?.description || isEditMode) && (
            <div className="mb-4">
              {isEditMode ? (
                <textarea
                  value={editableDescription}
                  onChange={(e) => setEditableDescription(e.target.value)}
                  className="text-sm text-gray-600 font-[Inter] bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-[#003F8F] w-full resize-none"
                  placeholder="Add description..."
                  rows={2}
                />
              ) : (
                <p className="text-sm text-gray-600 font-[Inter]">
                  {workoutPlanData.description}
                </p>
              )}
            </div>
          )}

          {/* Workout Content */}
          {isCurrentDayRestDay ? (
            <>
              {/* Rest Day Title - Outside the Box, Separate Section */}
              {isEditMode ? (
                <input
                  type="text"
                  value={workoutName || 'Rest Day'}
                  onChange={(e) => {
                    setWorkouts(prev => ({
                      ...prev,
                      [selectedDay]: { ...prev[selectedDay], workoutName: e.target.value }
                    }));
                  }}
                  className="text-xl font-bold text-[#003F8F] font-[Poppins] mb-4 mt-4 bg-transparent border-b-2 border-[#003F8F] focus:outline-none focus:border-[#002F6F]"
                  placeholder="Rest Day"
                />
              ) : (
                <h4 className="text-xl font-bold text-[#003F8F] font-[Poppins] mb-4 mt-4">
                  {workoutName || 'Rest Day'}
                </h4>
              )}

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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Empty state Add Workout clicked - navigating to add-workout page');
                  // Navigate to AddWorkout page
                  navigate('/coach/ai-program/add-workout');
                }}
                className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition cursor-pointer"
                type="button"
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
              {(workoutName || isEditMode) && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={workoutName || ''}
                        onChange={(e) => {
                          setWorkouts(prev => ({
                            ...prev,
                            [selectedDay]: { ...prev[selectedDay], workoutName: e.target.value }
                          }));
                        }}
                        className="text-xl font-bold text-[#003F8F] font-[Poppins] bg-transparent border-b-2 border-[#003F8F] focus:outline-none focus:border-[#002F6F]"
                        placeholder="Workout Name"
                      />
                    ) : (
                      <h4 className="text-xl font-bold text-[#003F8F] font-[Poppins]">
                        {workoutName}
                      </h4>
                    )}
                    {!isEditMode && (
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
                    )}
                  </div>
                  <div className="border-t border-gray-300"></div>
                </div>
              )}

              {/* Video Links Section for Full Body Workout - Editable in edit mode */}
              {isEditMode && workoutName && currentWorkouts.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                    <h6 className="text-sm font-semibold text-[#9CA3AF]">Video Links</h6>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.5 8.33333L16.2942 6.43667C16.4212 6.3732 16.5623 6.34323 16.7042 6.34962C16.846 6.35601 16.9839 6.39854 17.1047 6.47317C17.2255 6.5478 17.3252 6.65206 17.3944 6.77606C17.4636 6.90006 17.4999 7.03967 17.5 7.18167V12.8183C17.4999 12.9603 17.4636 13.0999 17.3944 13.2239C17.3252 13.3479 17.2255 13.4522 17.1047 13.5268C16.9839 13.6015 16.846 13.644 16.7042 13.6504C16.5623 13.6568 16.4212 13.6268 16.2942 13.5633L12.5 11.6667V8.33333ZM2.5 6.66667C2.5 6.22464 2.67559 5.80072 2.98816 5.48816C3.30072 5.17559 3.72464 5 4.16667 5H10.8333C11.2754 5 11.6993 5.17559 12.0118 5.48816C12.3244 5.80072 12.5 6.22464 12.5 6.66667V13.3333C12.5 13.7754 12.3244 14.1993 12.0118 14.5118C11.6993 14.8244 11.2754 15 10.8333 15H4.16667C3.72464 15 3.30072 14.8244 2.98816 14.5118C2.67559 14.1993 2.5 13.7754 2.5 13.3333V6.66667Z" stroke="#4D6080" strokeOpacity="0.8" strokeLinecap="round" strokeLinejoin="round" />
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
                        onClick={() => setShowFullBodyVideoInput(true)}
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

              {/* Exercises Box - White Card Container */}
              <div className="bg-white rounded-b-lg rounded-tl-none rounded-tr-none border border-gray-200 border-t-0 p-6">
                {/* Exercises */}
                <div>
                  {currentWorkouts.map((exercise, index) => {
                    const prevExercise = index > 0 ? currentWorkouts[index - 1] : null;
                    const isSuperset = exercise.isSuperset || false;
                    const isInSuperset = isSuperset;
                    const prevIsInSameSuperset = prevExercise && prevExercise.isSuperset &&
                      prevExercise.label && exercise.label &&
                      prevExercise.label.replace(/[0-9]/g, '') === exercise.label.replace(/[0-9]/g, '');
                    const showSupersetDivider = isInSuperset;
                    const showAddSuperset = !exercise.isSuperset && index > 0 && index < currentWorkouts.length - 1;
                    const showAddExercise = index === currentWorkouts.length - 1;
                    const isInSameSupersetGroup = prevExercise &&
                      exercise.isSuperset &&
                      prevExercise.isSuperset &&
                      prevExercise.label && exercise.label &&
                      prevExercise.label.replace(/[0-9]/g, '') === exercise.label.replace(/[0-9]/g, '');
                    // Blue border for A1, A2 or any label ending with 1 or 2 (superset exercises)
                    const hasBlueBorder = exercise.isSuperset || 
                      (exercise.label && /[A-Z][12]$/.test(exercise.label)) || false;

                    return (
                      <div key={exercise.id}>
                        {/* Superset Divider with Centered Button - Above each exercise in superset - Only in edit mode */}
                        {isEditMode && showSupersetDivider && (
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

                        {/* Add Superset Divider - Only in edit mode */}
                        {isEditMode && showAddSuperset && (
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

                        {/* Exercise Card */}
                        <div
                          className={`bg-white relative ${isEditMode && isInSameSupersetGroup ? 'pt-0 pb-4 px-4' : 'p-4'} ${index > 0 && !(isEditMode && isInSameSupersetGroup) ? 'mt-6' : ''} ${hasBlueBorder ? 'border-l-4 border-l-[#003F8F]' : ''}`}
                          style={isEditMode && isInSameSupersetGroup ? {
                            marginTop: '2px',
                            paddingTop: '0',
                            marginBottom: '0',
                            paddingBottom: '1rem',
                            zIndex: 1
                          } : {}}
                          onMouseEnter={() => isEditMode && setHoveredExerciseId(exercise.id)}
                          onMouseLeave={() => isEditMode && setHoveredExerciseId(null)}
                        >
                          {/* Right Side Dark Blue Pill with Icons - Appears on Hover */}
                          {hoveredExerciseId === exercise.id && isEditMode && (
                            <div className="absolute top-4 right-4 bg-[#003F8F] rounded-full px-3 py-2 flex flex-col items-center gap-3 z-10">
                              {/* Delete Icon */}
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

                          {isEditMode ? (
                            <div className="space-y-3">
                              {/* Exercise Name - Editable */}
                              <div className="mb-3">
                                <input
                                  type="text"
                                  value={`${exercise.label || ''}. ${exercise.name || ''}`}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const match = value.match(/^([A-Z]?\d*)\s*\.\s*(.*)$/);
                                    const updatedExercises = [...currentWorkouts];
                                    if (match) {
                                      updatedExercises[index].label = match[1] || '';
                                      updatedExercises[index].name = match[2] || '';
                                    } else {
                                      updatedExercises[index].name = value;
                                    }
                                    setWorkouts(prev => ({
                                      ...prev,
                                      [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
                                    }));
                                  }}
                                  className="text-lg font-bold text-[#003F8F] font-[Poppins] bg-transparent border-none focus:outline-none focus:ring-0 flex-1 w-full"
                                  placeholder="A1. Exercise Name"
                                />
                              </div>

                              {/* Sets x Reps - Editable */}
                              <div className="mb-3 flex items-center gap-2">
                                <input
                                  type="number"
                                  value={exercise.sets || ''}
                                  onChange={(e) => {
                                    const updatedExercises = [...currentWorkouts];
                                    updatedExercises[index].sets = parseInt(e.target.value) || 0;
                                    setWorkouts(prev => ({
                                      ...prev,
                                      [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
                                    }));
                                  }}
                                  placeholder="Sets"
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#003F8F]"
                                />
                                <span className="text-gray-700">x</span>
                                <input
                                  type="number"
                                  value={exercise.reps || ''}
                                  onChange={(e) => {
                                    const updatedExercises = [...currentWorkouts];
                                    updatedExercises[index].reps = parseInt(e.target.value) || 0;
                                    setWorkouts(prev => ({
                                      ...prev,
                                      [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
                                    }));
                                  }}
                                  placeholder="Reps"
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#003F8F]"
                                />
                                {exercise.weight_kg !== null && exercise.weight_kg !== undefined && (
                                  <>
                                    <span className="text-gray-400 mx-1">|</span>
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={exercise.weight_kg || ''}
                                      onChange={(e) => {
                                        const updatedExercises = [...currentWorkouts];
                                        updatedExercises[index].weight_kg = parseFloat(e.target.value) || null;
                                        setWorkouts(prev => ({
                                          ...prev,
                                          [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
                                        }));
                                      }}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#003F8F]"
                                      placeholder="Weight"
                                    />
                                    <span className="text-gray-400 text-xs">kg</span>
                                  </>
                                )}
                              </div>

                              {/* Notes/Cues - Editable */}
                              <input
                                type="text"
                                value={exercise.notes || ''}
                                onChange={(e) => {
                                  const updatedExercises = [...currentWorkouts];
                                  updatedExercises[index].notes = e.target.value;
                                  setWorkouts(prev => ({
                                    ...prev,
                                    [selectedDay]: { ...prev[selectedDay], exercises: updatedExercises }
                                  }));
                                }}
                                placeholder="Sets, Reps, Rest, Notes"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#003F8F] mb-3"
                              />

                              {/* Video Links - Editable */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h6 className="text-sm font-semibold text-[#4D6080CC]">Video Links</h6>
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.5 8.33333L16.2942 6.43667C16.4212 6.3732 16.5623 6.34323 16.7042 6.34962C16.846 6.35601 16.9839 6.39854 17.1047 6.47317C17.2255 6.5478 17.3252 6.65206 17.3944 6.77606C17.4636 6.90006 17.4999 7.03967 17.5 7.18167V12.8183C17.4999 12.9603 17.4636 13.0999 17.3944 13.2239C17.3252 13.3479 17.2255 13.4522 17.1047 13.5268C16.9839 13.6015 16.846 13.644 16.7042 13.6504C16.5623 13.6568 16.4212 13.6268 16.2942 13.5633L12.5 11.6667V8.33333ZM2.5 6.66667C2.5 6.22464 2.67559 5.80072 2.98816 5.48816C3.30072 5.17559 3.72464 5 4.16667 5H10.8333C11.2754 5 11.6993 5.17559 12.0118 5.48816C12.3244 5.80072 12.5 6.22464 12.5 6.66667V13.3333C12.5 13.7754 12.3244 14.1993 12.0118 14.5118C11.6993 14.8244 11.2754 15 10.8333 15H4.16667C3.72464 15 3.30072 14.8244 2.98816 14.5118C2.67559 14.1993 2.5 13.7754 2.5 13.3333V6.66667Z" stroke="#4D6080" strokeOpacity="0.8" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                                <div className="space-y-2">
                                  {(exercise.videoLinks || []).map((link, idx) => (
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
                          ) : (
                            <>
                              <h5 className="text-lg font-bold text-[#003F8F] font-[Poppins] mb-2">
                                <span className="text-[#003F8F]">{exercise.label}.</span> <span className="text-[#003F8F]">{exercise.name}</span>
                              </h5>
                              <p className="text-sm text-[#003F8F] font-[Inter] mb-2">
                                {exercise.sets} × {exercise.reps}
                                {exercise.weight_kg && ` | ${exercise.weight_kg} kg`}
                              </p>
                              <p className="text-sm text-gray-600 font-[Inter] mb-3">
                                {exercise.notes}
                              </p>
                              {exercise.videoLinks && exercise.videoLinks.length > 0 && (
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
                            </>
                          )}
                        </div>

                        {/* Add Exercise Divider - Removed from edit mode */}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          
        </div>
        )}
        </div>

      {/* Save and Cancel Buttons - Bottom (shown only in edit mode) */}
      {isEditMode && !isCurrentDayRestDay && currentWorkouts.length > 0 && (
        <div className="mt-6 flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancelEdit}
              disabled={isUpdating}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveFromEditMode}
              disabled={isUpdating || !workoutPlanData?.id}
              className={`px-6 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm transition ${
                isUpdating || !workoutPlanData?.id 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-[#002F6F]'
              }`}
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </button>
          </div>
          {/* Delete/Trash Icon */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-gray-600 hover:text-red-600 transition"
            title="Delete Workout"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 3.66671L12.5867 10.35C12.4813 12.0574 12.4287 12.9114 12 13.5254C11.7884 13.8288 11.5159 14.0849 11.2 14.2774C10.562 14.6667 9.70667 14.6667 7.996 14.6667C6.28267 14.6667 5.426 14.6667 4.78667 14.2767C4.47059 14.0839 4.19814 13.8273 3.98667 13.5234C3.55867 12.9087 3.50667 12.0534 3.404 10.3434L3 3.66671M2 3.66671H14M10.704 3.66671L10.2487 2.72804C9.94667 2.10404 9.79533 1.79271 9.53467 1.59804C9.47676 1.55492 9.41545 1.51657 9.35133 1.48337C9.06267 1.33337 8.716 1.33337 8.02333 1.33337C7.31267 1.33337 6.95733 1.33337 6.66333 1.48937C6.59834 1.52418 6.53635 1.56432 6.478 1.60937C6.21467 1.81137 6.06733 2.13471 5.77267 2.78071L5.36867 3.66671M6.33333 11V7.00004M9.66667 11V7.00004" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
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
                      <span className={`text-sm ${selectedClients.length > 0 ? 'text-[#003F8F] font-medium' : 'text-gray-400'}`}>
                        {selectedClients.length > 0 ? `${selectedClients.length} client${selectedClients.length > 1 ? 's' : ''} selected` : 'Select client'}
                      </span>
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
                        {selectedClients.map((client) => (
                          <div
                            key={client.id}
                            className="bg-[#4D60801A] px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            <span className="text-[#003F8F] font-medium">{client.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveClient(client.id);
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
                      {loadingClients ? (
                        <div className="px-4 py-2 text-sm text-gray-500 text-center">Loading clients...</div>
                      ) : clients.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-500 text-center">No clients available</div>
                      ) : (
                        clients
                          .filter(client => !selectedClients.some(c => c.id === client.id))
                          .map((client) => (
                            <button
                              key={client.id}
                              onClick={() => handleSelectClient(client)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
                            >
                              {client.name}
                            </button>
                          ))
                      )}
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

              {/* Error Message */}
              {assignError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 font-[Inter]">{assignError}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setShowClientDropdown(false);
                  setShowCadenceDropdown(false);
                  setAssignError(null);
                  setSelectedClients([]);
                  setSelectedCadence('For 3 Weeks');
                }}
                disabled={isAssigning}
                className={`px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm transition ${
                  isAssigning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignPlan}
                disabled={isAssigning || selectedClients.length === 0 || !workoutPlanData?.id}
                className={`px-6 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm transition ${
                  isAssigning || selectedClients.length === 0 || !workoutPlanData?.id
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[#002F6F]'
                }`}
              >
                {isAssigning ? 'Assigning...' : 'Assign Plan'}
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
          <span className="font-semibold">{successMessageText}</span>
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

export default WorkoutPlan;

