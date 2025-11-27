import React, { useState, useEffect } from 'react';

const CustomWorkouts = () => {
    const [selectedDay, setSelectedDay] = useState('Mon');
    const [workoutName, setWorkoutName] = useState('');
    const [isRestDay, setIsRestDay] = useState(false);
    const [showAddWorkout, setShowAddWorkout] = useState(false);
    const [exercises, setExercises] = useState([
        {
            id: 1,
            label: 'A',
            name: 'Exercise Title',
            sets: 0,
            reps: 0,
            notes: 'Sets, Reps, Rest, Notes',
            videoLinks: [],
            isSuperset: false
        }
    ]);
    const [showExerciseVideoInputs, setShowExerciseVideoInputs] = useState({});
    const [newVideoLinks, setNewVideoLinks] = useState({});
    const [showNameSuggestions, setShowNameSuggestions] = useState(false);
    const [nameSuggestions, setNameSuggestions] = useState([]);
    const [showExerciseSuggestions, setShowExerciseSuggestions] = useState({});
    const [exerciseSuggestions, setExerciseSuggestions] = useState({});
    const [showNotesSuggestions, setShowNotesSuggestions] = useState({});
    const [notesSuggestions, setNotesSuggestions] = useState({});
    const [notes, setNotes] = useState('');

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
        setWorkoutName(value);
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
        setWorkoutName(suggestion);
        setShowNameSuggestions(false);
        setNameSuggestions([]);
    };

    const handleAddExercise = () => {
        const nextLabel = String.fromCharCode(65 + exercises.length);
        const newExercise = {
            id: exercises.length + 1,
            label: nextLabel,
            name: 'Exercise Title',
            sets: 0,
            reps: 0,
            notes: 'Sets, Reps, Rest, Notes',
            videoLinks: [],
            isSuperset: false
        };
        setExercises([...exercises, newExercise]);
    };

    const handleExerciseNameChange = (id, value) => {
        const match = value.match(/^([A-Z]1?[0-9]?)\.\s*(.*)$/);
        let exerciseName = '';
        if (match) {
            const label = match[1];
            exerciseName = match[2];
            setExercises(exercises.map(ex =>
                ex.id === id ? { ...ex, label, name: exerciseName } : ex
            ));
        } else {
            const currentExercise = exercises.find(ex => ex.id === id);
            if (currentExercise) {
                exerciseName = value.replace(/^[A-Z]1?[0-9]?\.\s*/, '');
                setExercises(exercises.map(ex =>
                    ex.id === id ? { ...ex, name: exerciseName } : ex
                ));
            }
        }

        // Show suggestions for exercise name
        if (exerciseName.trim().length > 0) {
            const filtered = exerciseNameSuggestions.filter(suggestion =>
                suggestion.toLowerCase().includes(exerciseName.toLowerCase())
            );
            setExerciseSuggestions({ ...exerciseSuggestions, [id]: filtered });
            setShowExerciseSuggestions({ ...showExerciseSuggestions, [id]: filtered.length > 0 });
        } else {
            setShowExerciseSuggestions({ ...showExerciseSuggestions, [id]: false });
        }
    };

    const handleSelectExerciseSuggestion = (id, suggestion) => {
        const currentExercise = exercises.find(ex => ex.id === id);
        if (currentExercise) {
            setExercises(exercises.map(ex =>
                ex.id === id ? { ...ex, name: suggestion } : ex
            ));
        }
        setShowExerciseSuggestions({ ...showExerciseSuggestions, [id]: false });
    };

    const handleNotesChange = (id, value) => {
        setExercises(exercises.map(ex =>
            ex.id === id ? { ...ex, notes: value } : ex
        ));

        if (value.trim().length > 0) {
            const filtered = notesSuggestionsList.filter(suggestion =>
                suggestion.toLowerCase().includes(value.toLowerCase())
            );
            setNotesSuggestions({ ...notesSuggestions, [id]: filtered });
            setShowNotesSuggestions({ ...showNotesSuggestions, [id]: filtered.length > 0 });
        } else {
            setShowNotesSuggestions({ ...showNotesSuggestions, [id]: false });
        }
    };

    const handleSelectNotesSuggestion = (id, suggestion) => {
        setExercises(exercises.map(ex =>
            ex.id === id ? { ...ex, notes: suggestion } : ex
        ));
        setShowNotesSuggestions({ ...showNotesSuggestions, [id]: false });
    };

    const handleShowExerciseVideoInput = (exerciseId) => {
        setShowExerciseVideoInputs({ ...showExerciseVideoInputs, [exerciseId]: true });
        setNewVideoLinks({ ...newVideoLinks, [exerciseId]: '' });
    };

    const handleAddVideoLink = (exerciseId) => {
        const link = newVideoLinks[exerciseId];
        if (link && link.trim()) {
            const exercise = exercises.find(ex => ex.id === exerciseId);
            if (exercise) {
                setExercises(exercises.map(ex =>
                    ex.id === exerciseId
                        ? { ...ex, videoLinks: [...ex.videoLinks, link.trim()] }
                        : ex
                ));
            }
            setNewVideoLinks({ ...newVideoLinks, [exerciseId]: '' });
            setShowExerciseVideoInputs({ ...showExerciseVideoInputs, [exerciseId]: false });
        }
    };

    const handleRemoveVideoLink = (exerciseId, linkIndex) => {
        setExercises(exercises.map(ex =>
            ex.id === exerciseId
                ? { ...ex, videoLinks: ex.videoLinks.filter((_, idx) => idx !== linkIndex) }
                : ex
        ));
    };

    const handleDeleteExercise = (id) => {
        const updatedExercises = exercises.filter(ex => ex.id !== id);
        // Re-label exercises
        const relabeled = updatedExercises.map((ex, index) => ({
            ...ex,
            label: String.fromCharCode(65 + index)
        }));
        setExercises(relabeled);
    };

    const handleSave = () => {
        // Save workout logic
        console.log('Workout saved');
    };

    const handleCancel = () => {
        setShowAddWorkout(false);
        setIsRestDay(false);
        setWorkoutName('');
        setExercises([{
            id: 1,
            label: 'A',
            name: 'Exercise Title',
            sets: 0,
            reps: 0,
            notes: 'Sets, Reps, Rest, Notes',
            videoLinks: [],
            isSuperset: false
        }]);
    };

    const handleDeleteWorkout = () => {
        handleCancel();
    };

    const handleSaveNote = () => {
        // Save note logic
        console.log('Note saved:', notes);
    };

    return (
        <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7] text-[#003F8F]">
            {/* Header with Title and Week Button - Outside white box */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#003F8F] font-[Poppins]">Interactive Workout Calendar</h2>
                <button className="px-4 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition">
                    Week
                </button>
            </div>

            {/* Interactive Workout Calendar Section - White Box */}
            <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
                {/* Day Tabs - Full Width like WorkOut.jsx */}
                <div className="flex items-center w-full border-b border-gray-200">
                    {days.map((day, index) => (
                        <button
                            key={day}
                            onClick={() => {
                                setSelectedDay(day);
                                if (day === 'Sun') {
                                    setIsRestDay(true);
                                } else {
                                    setIsRestDay(false);
                                }
                            }}
                            className={`flex-1 px-4 py-3 font-semibold text-sm transition relative ${index > 0 ? 'border-l border-gray-200' : ''
                                } ${selectedDay === day
                                    ? 'bg-[#003F8F] text-white'
                                    : 'bg-white text-[#003F8F] hover:bg-gray-50'
                                }`}
                            style={{
                                borderRadius: selectedDay === day && index === 0 ? '0.75rem 0 0 0' :
                                    selectedDay === day && index === days.length - 1 ? '0 0.75rem 0 0' :
                                        '0'
                            }}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                {/* Workout Content Area - Directly below tabs, no outer border, full width */}
                <div className="px-6 py-6 min-h-[400px]">
                    {!showAddWorkout ? (
                        // Add Workout Placeholder - In separate bordered box
                        <div
                            className=" bg-white !border border-[#4D60804D] rounded-[10px] min-h-[400px] flex flex-col items-center justify-center cursor-pointer  transition"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowAddWorkout(true);
                            }}
                        >
                            <div className=" flex items-center justify-center mb-4">
                                <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="72" height="72" rx="36" fill="#4D6080" fill-opacity="0.3" />
                                    <path d="M31.6364 38.1818H15.2727C14.3455 38.1818 13.5687 37.8676 12.9426 37.2393C12.3164 36.6109 12.0022 35.8342 12 34.9091C11.9978 33.984 12.312 33.2073 12.9426 32.5789C13.5731 31.9505 14.3498 31.6364 15.2727 31.6364H31.6364V15.2727C31.6364 14.3455 31.9505 13.5687 32.5789 12.9426C33.2073 12.3164 33.984 12.0022 34.9091 12C35.8342 11.9978 36.612 12.312 37.2425 12.9426C37.8731 13.5731 38.1862 14.3498 38.1818 15.2727V31.6364H54.5455C55.4727 31.6364 56.2508 31.9505 56.8791 32.5789C57.5075 33.2073 57.8204 33.984 57.8182 34.9091C57.816 35.8342 57.5018 36.612 56.8756 37.2425C56.2495 37.8731 55.4727 38.1862 54.5455 38.1818H38.1818V54.5455C38.1818 55.4727 37.8676 56.2508 37.2393 56.8791C36.6109 57.5075 35.8342 57.8204 34.9091 57.8182C33.984 57.816 33.2073 57.5018 32.5789 56.8756C31.9505 56.2495 31.6364 55.4727 31.6364 54.5455V38.1818Z" fill="white" />
                                </svg>

                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowAddWorkout(true);
                                }}
                                className="text-[#4D60804D] font-medium text-lg  transition cursor-pointer"
                            >
                                Add Workout
                            </button>
                        </div>
                    ) : (
                        // Workout Form or Rest Day - In bordered box
                        <div className=" bg-white min-h-[400px]">
                            <div className="">
                                {isRestDay ? (
                                    // Rest Day Content
                                    <>
                                        {/* Rest Day Heading with Toggle Button */}
                                        <div className="mb-6 pb-6 border-b border-gray-200 flex items-start justify-between">
                                            <div>
                                                <h4 className="text-2xl font-bold text-[#003F8F] font-[Poppins] mb-2">Rest Day</h4>
                                                <p className="text-sm text-gray-600 font-[Inter]">Rest Day</p>
                                            </div>
                                            {/* Toggle Rest Day Button - Top Right */}
                                            <button
                                                onClick={() => setIsRestDay(!isRestDay)}
                                                className={`w-12 h-6 rounded-full transition relative flex-shrink-0 ${isRestDay ? 'bg-[#003F8F]' : 'bg-gray-300'}`}
                                            >
                                                <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 shadow-sm ${isRestDay ? 'transform translate-x-6' : 'transform translate-x-1'}`}></div>
                                            </button>
                                        </div>

                                        {/* Rest & Recovery Content */}
                                        <div className="bg-white  p-12 flex flex-col items-center justify-center min-h-[300px] mb-6">
                                            <div className="text-center">
                                                <div className="mb-6 ml-20">
                                                    <svg width="70" height="43" viewBox="0 0 70 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M5.64048 25.3202V2.82024C5.64048 2.44988 5.56753 2.08315 5.4258 1.74098C5.28407 1.39881 5.07634 1.08791 4.81445 0.826029C4.55257 0.564145 4.24167 0.356407 3.8995 0.214677C3.55733 0.0729466 3.1906 0 2.82024 0C2.44988 0 2.08315 0.0729466 1.74098 0.214677C1.39881 0.356407 1.08791 0.564145 0.826029 0.826029C0.564146 1.08791 0.356408 1.39881 0.214678 1.74098C0.0729477 2.08315 -5.51878e-09 2.44988 0 2.82024V39.6612C-5.51878e-09 40.0316 0.0729477 40.3983 0.214678 40.7404C0.356408 41.0826 0.564146 41.3935 0.826029 41.6554C1.08791 41.9173 1.39881 42.125 1.74098 42.2668C2.08315 42.4085 2.44988 42.4814 2.82024 42.4814C3.1906 42.4814 3.55733 42.4085 3.8995 42.2668C4.24167 42.125 4.55257 41.9173 4.81445 41.6554C5.07634 41.3935 5.28407 41.0826 5.4258 40.7404C5.56753 40.3983 5.64048 40.0316 5.64048 39.6612V34.3764L63.4032 34.2425V39.5244C63.4032 39.8947 63.4761 40.2613 63.6178 40.6034C63.7595 40.9455 63.9672 41.2563 64.229 41.5181C64.4908 41.7799 64.8017 41.9876 65.1437 42.1293C65.4858 42.271 65.8525 42.3439 66.2227 42.3439C66.593 42.3439 66.9596 42.271 67.3017 42.1293C67.6438 41.9876 67.9546 41.7799 68.2164 41.5181C68.4782 41.2563 68.6859 40.9455 68.8276 40.6034C68.9693 40.2613 69.0423 39.8947 69.0423 39.5244V25.1863L5.64048 25.3202Z" fill="#4D6080" fillOpacity="0.3" />
                                                        <path d="M69.0426 22.9054H26.1738V12.2839C26.1738 10.8043 26.7615 9.38519 27.8077 8.33877C28.8538 7.29236 30.2727 6.7043 31.7524 6.70392H57.7775C60.7652 6.70392 63.6305 7.89078 65.7432 10.0034C67.8558 12.116 69.0426 14.9813 69.0426 17.969V22.9054Z" fill="#4D6080" fillOpacity="0.3" />
                                                        <path d="M16.1385 21.69C19.9408 21.69 23.0232 18.6076 23.0232 14.8054C23.0232 11.0031 19.9408 7.92072 16.1385 7.92072C12.3363 7.92072 9.25391 11.0031 9.25391 14.8054C9.25391 18.6076 12.3363 21.69 16.1385 21.69Z" fill="#4D6080" fillOpacity="0.3" />
                                                    </svg>
                                                </div>
                                                <h4 className="text-2xl font-bold text-[#003F8F] font-[Poppins] mb-2">Rest & Recovery</h4>
                                                <p className="text-base text-[#003F8F] font-[Inter]">Active recovery or complete rest day</p>
                                            </div>
                                        </div>

                                        {/* Save/Cancel Buttons */}
                                        <div className="flex items-center justify-between mt-6 pt-6">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={handleSave}
                                                    className="px-6 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="px-6 py-2 bg-gray-100 !border border-[#4D6080CC] text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            {/* Trash Icon - Bottom Right */}
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
                                ) : (
                                    // Workout Form
                                    <>
                                        {/* Name Input Field with Toggle Button */}
                                        <div className="mb-6 pb-6 border-b border-gray-200 relative">
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
                                                {/* Toggle Rest Day Button */}
                                                <button
                                                    onClick={() => setIsRestDay(!isRestDay)}
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
                                                        {/* Exercise Card */}
                                                        <div className="bg-white relative ">
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
                                                                {/* Trash Icon */}
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

                                                            {/* Sets, Reps, Rest, Notes */}
                                                            <div className="mb-3 relative">
                                                                <input
                                                                    type="text"
                                                                    value={exercise.notes || 'Sets, Reps, Rest, Notes'}
                                                                    onChange={(e) => handleNotesChange(exercise.id, e.target.value)}
                                                                    onFocus={(e) => {
                                                                        if (e.target.value === 'Sets, Reps, Rest, Notes') {
                                                                            setExercises(exercises.map(ex =>
                                                                                ex.id === exercise.id ? { ...ex, notes: '' } : ex
                                                                            ));
                                                                        }
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
                                                                    className="w-full text-sm text-gray-600 font-[Inter] bg-transparent border-none focus:outline-none focus:ring-0 px-0 py-0 placeholder:text-gray-600"
                                                                    placeholder="Sets, Reps, Rest, Notes"
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
                                                                            className="bg-[#4D60801A] text-[#003F8F] text-xs font-semibold  rounded-full px-3 py-2 flex items-center gap-2"
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

                                                        {/* Add Exercise Divider */}
                                                        {isLastExercise && (
                                                            <div className="relative flex items-center my-4">
                                                                <div className="flex-1 border-t border-gray-300"></div>
                                                                <button
                                                                    onClick={handleAddExercise}
                                                                    className="!border border-gray-300 bg-[#FFFFFF] text-[#003F8F] text-xs font-semibold  mx-2 hflex items-center gap-1"
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
                                        </div>

                                        {/* Bottom Action Buttons */}
                                        <div className="flex items-center justify-between mt-6s">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={handleSave}
                                                    className="px-6 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition"
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
                        </div>
                    )}
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#003F8F] font-[Poppins] mb-4">Notes</h3>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for John Doe..."
                    className="w-full h-32 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003F8F] resize-none"
                />
                <div className="mt-4">
                    <button
                        onClick={handleSaveNote}
                        className="px-6 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition"
                    >
                        Save Note
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomWorkouts;
