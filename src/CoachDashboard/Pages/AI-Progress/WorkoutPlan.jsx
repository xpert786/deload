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
        <button className="px-4 py-2 bg-[#FB923C] text-white rounded-lg font-semibold text-sm hover:bg-[#EA7A1A] transition flex items-center gap-2">
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
    </div>
  );
};

export default WorkoutPlan;

