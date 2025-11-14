import React from 'react';

const AllClients = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">
          All Clients
        </h1>
        <p className="text-[#4D6080] font-[Inter] mt-2">
          View and manage all registered clients
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-[#4D6080] font-[Inter]">Client list will be displayed here</p>
      </div>
    </div>
  );
};

export default AllClients;

