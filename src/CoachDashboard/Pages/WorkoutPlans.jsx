import React from 'react';

const WorkoutPlans = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">
          Workout Plans
        </h1>
        <p className="text-[#4D6080] font-[Inter] mt-2">
          Create and manage workout plans for your clients
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-[#4D6080] font-[Inter]">Workout plans will be displayed here</p>
      </div>
    </div>
  );
};

export default WorkoutPlans;

