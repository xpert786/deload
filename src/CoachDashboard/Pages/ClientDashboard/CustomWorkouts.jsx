import React, { useState } from 'react';
import { SearchIcon } from '../../Components/Icons';

const CustomWorkouts = () => {
  const [selectedDay, setSelectedDay] = useState('Day 1');
  const [expandedExercise, setExpandedExercise] = useState('Squats');
  const [searchQuery, setSearchQuery] = useState('');

  const days = ['Day 1', 'Day 2', 'Day 3'];

  const exercises = [
    {
      id: 1,
      name: 'Squats',
      sets: 3,
      reps: '10-12',
      setsData: [
        { id: 1, reps: 10, weight: 60, rest: 60 },
        { id: 2, reps: 10, weight: 70, rest: 60 },
        { id: 3, reps: 10, weight: 80, rest: 60 }
      ]
    },
    {
      id: 2,
      name: 'Push-ups',
      sets: 4,
      reps: '8-10',
      setsData: [
        { id: 1, reps: 8, weight: 0, rest: 45 },
        { id: 2, reps: 8, weight: 0, rest: 45 },
        { id: 3, reps: 9, weight: 0, rest: 45 },
        { id: 4, reps: 10, weight: 0, rest: 45 }
      ]
    },
    {
      id: 3,
      name: 'Bent-over Dumbbell Rows',
      sets: 4,
      reps: '8-10',
      setsData: [
        { id: 1, reps: 8, weight: 25, rest: 60 },
        { id: 2, reps: 9, weight: 25, rest: 60 },
        { id: 3, reps: 9, weight: 30, rest: 60 },
        { id: 4, reps: 10, weight: 30, rest: 60 }
      ]
    },
    {
      id: 4,
      name: 'Plank',
      sets: 4,
      reps: '8-10',
      setsData: [
        { id: 1, reps: 8, weight: 0, rest: 30 },
        { id: 2, reps: 9, weight: 0, rest: 30 },
        { id: 3, reps: 9, weight: 0, rest: 30 },
        { id: 4, reps: 10, weight: 0, rest: 30 }
      ]
    }
  ];

  const toggleExercise = (exerciseName) => {
    setExpandedExercise(expandedExercise === exerciseName ? null : exerciseName);
  };

  const handleIncrement = (exerciseId, setId, field) => {
    // Handle increment logic
    console.log('Increment', exerciseId, setId, field);
  };

  const handleDecrement = (exerciseId, setId, field) => {
    // Handle decrement logic
    console.log('Decrement', exerciseId, setId, field);
  };

  const handleRemoveSet = (exerciseId, setId) => {
    // Handle remove set logic
    console.log('Remove set', exerciseId, setId);
  };

  const handleAddSet = (exerciseId) => {
    // Handle add set logic
    console.log('Add set', exerciseId);
  };

  const handleRemoveExercise = (exerciseId) => {
    // Handle remove exercise logic
    console.log('Remove exercise', exerciseId);
  };

  return (
    <div className="space-y-6 bg-[#F7F7F7] p-2 sm:p-2">
      {/* Day Selection */}
      <div className="flex flex-wrap items-center gap-2 !border border-gray-200 rounded-lg w-fit p-1 bg-white">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 font-semibold text-sm transition ${
              selectedDay === day
                ? 'text-white bg-[#003F8F] border border-[#003F8F] rounded-lg'
                : 'text-gray-600 hover:text-[#003F8F]'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Add New Exercise Button */}
      <div>
        <button className="px-4 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition flex items-center gap-2">
          <span className="text-lg">+</span>
          Add New Exercise
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] text-sm text-gray-600 font-[Inter] bg-white"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-4">
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-white rounded-lg !border border-[#4D60804D] p-4"
          >
            {/* Exercise Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-[#003F8F] font-[Poppins]">
                    {exercise.name}
                  </h3>
                  <span className="text-sm text-gray-600 font-[Inter]">
                    Sets: {exercise.sets} • Reps: {exercise.reps}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRemoveExercise(exercise.id)}
                  className="px-3 py-1 text-sm text-gray-600 !border border-[#4D60804D] rounded-lg hover:bg-gray-50 font-[Inter]"
                >
                  Remove
                </button>
                <button
                  onClick={() => toggleExercise(exercise.name)}
                  className="text-gray-600 hover:text-[#003F8F]"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transform transition-transform ${
                      expandedExercise === exercise.name ? 'rotate-180' : ''
                    }`}
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Exercise Details Table */}
            {expandedExercise === exercise.name && (
              <div className="mt-4  pt-4">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 mb-3 pb-2 !border-b border-gray-200 ml-3">
                  <div className="text-sm font-bold text-[#003F8F] font-[Inter]">Set</div>
                  <div className="text-sm font-bold text-[#003F8F] font-[Inter]">Reps</div>
                  <div className="text-sm font-bold text-[#003F8F] font-[Inter]">Weight</div>
                  <div className="text-sm font-bold text-[#003F8F] font-[Inter]">Rest</div>
                  <div className="text-sm font-bold text-[#003F8F] font-[Inter]">Action</div>
                </div>

                {/* Table Rows */}
                <div className="space-y-3">
                  {exercise.setsData.map((set) => (
                    <div
                      key={set.id}
                      className="grid grid-cols-5 gap-4 items-center p-3 !border border-[#4D60804D] rounded-lg "
                    >
                      {/* Set Number */}
                      <div className="text-sm text-[#003F8F] font-semibold font-[Inter]">
                        {set.id}
                      </div>

                      {/* Reps */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDecrement(exercise.id, set.id, 'reps')}
                          className="w-6 h-6 flex items-center justify-center  text-gray-600 hover:bg-gray-50 text-sm"
                        >
                          -
                        </button>
                        <div className="w-14 px-2 py-0.5 !border border-gray-300 rounded-full text-sm text-[#003F8F] font-semibold text-center bg-white">
                          {set.reps}
                        </div>
                        <button
                          onClick={() => handleIncrement(exercise.id, set.id, 'reps')}
                          className="w-6 h-6 flex items-center justify-center  text-gray-600 hover:bg-gray-50 text-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* Weight */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDecrement(exercise.id, set.id, 'weight')}
                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm"
                        >
                          -
                        </button>
                        <div className="w-14 px-2 py-1 !border border-gray-300 rounded-full text-sm text-[#003F8F] font-semibold text-center bg-white">
                          {set.weight}
                        </div>
                        <button
                          onClick={() => handleIncrement(exercise.id, set.id, 'weight')}
                          className="w-6 h-6 flex items-center justify-center  text-gray-600 hover:bg-gray-50 text-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* Rest */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDecrement(exercise.id, set.id, 'rest')}
                          className="w-6 h-6 flex items-center justify-center  text-gray-600 hover:bg-gray-50 text-sm"
                        >
                          -
                        </button>
                        <div className="w-16 px-2 py-1 !border border-gray-300 rounded-full text-sm text-[#003F8F] font-semibold text-center bg-white">
                          {set.rest}s
                        </div>
                        <button
                          onClick={() => handleIncrement(exercise.id, set.id, 'rest')}
                          className="w-6 h-6 flex items-center justify-center  text-gray-600 hover:bg-gray-50 text-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* Action */}
                      <div>
                        <button
                          onClick={() => handleRemoveSet(exercise.id, set.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="23.4444" height="23.9991" rx="4" fill="white" fillOpacity="0.5"/>
                            <rect x="0.25" y="0.25" width="22.9444" height="23.4991" rx="3.75" stroke="#4D6080" strokeOpacity="0.3" strokeWidth="0.5"/>
                            <path d="M16.4444 8.66602H7" stroke="#003F8F" strokeLinecap="round"/>
                            <path d="M8.66699 8.66667H8.7281C8.95168 8.66095 9.16834 8.5879 9.34973 8.45706C9.53112 8.32622 9.6688 8.14369 9.74477 7.93333L9.76366 7.87611L9.81755 7.71444C9.86366 7.57611 9.88699 7.50722 9.91755 7.44833C9.97766 7.33299 10.0639 7.23333 10.1695 7.15731C10.275 7.08129 10.3969 7.03103 10.5253 7.01056C10.5903 7 10.6631 7 10.8087 7H12.6364C12.782 7 12.8548 7 12.9198 7.01056C13.0482 7.03103 13.1701 7.08129 13.2756 7.15731C13.3812 7.23333 13.4674 7.33299 13.5275 7.44833C13.5581 7.50722 13.5814 7.57611 13.6275 7.71444L13.6814 7.87611C13.7518 8.11015 13.8974 8.31445 14.0957 8.45737C14.294 8.60029 14.5338 8.67385 14.7781 8.66667" stroke="#003F8F"/>
                            <path d="M7.92676 10.0547L8.18231 13.888C8.28065 15.3625 8.32954 16.0997 8.81009 16.5491C9.2912 16.9991 10.0301 16.9991 11.5079 16.9991H11.9379C13.4162 16.9991 14.1551 16.9986 14.6356 16.5491C15.1162 16.0997 15.1656 15.3625 15.264 13.888L15.519 10.0547" stroke="#003F8F" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Set Button */}
                <div className="mt-4">
                  <button
                    onClick={() => handleAddSet(exercise.id)}
                    className="px-4 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition flex items-center gap-2"
                  >
                    <span className="text-lg">+</span>
                    Add Set
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button className="px-6 py-2 !border !border-1px border-[#4D60804D] text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition">
          Cancel
        </button>
        <button className="px-6 py-2 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition">
          Save Workout
        </button>
      </div>
    </div>
  );
};

export default CustomWorkouts;

