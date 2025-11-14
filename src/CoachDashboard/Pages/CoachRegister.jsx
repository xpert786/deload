import React from "react";
import DloadLogo from "../../assets/DloadLogo.png";
import ClientRegisterImg from "../../assets/ClientRegisterImg.png";

const CoachRegister = () => {
  return (
    <div className="relative">
      {/* Logo at top-left corner */}
      <img src={DloadLogo} alt="Deload Logo" className="w-24 absolute top-8 left-8 z-10" />
   
      <div className="flex">
        {/* Left Form Section */}
        <div className="w-1/2 flex flex-col justify-center items-center bg-[#F7F7F7] p-12">
          <div 
            className="w-full max-w-md bg-white p-8 rounded-lg "
            style={{
              border: '1px solid #C7C7C7CC',
              backdropFilter: 'blur(65px)'
            }}
          >
            <h2 className="text-2xl font-medium font-[Poppins] mb-6" style={{ color: '#003F8F' }}>Coach Registration</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium font-[Poppins]" style={{ color: '#003F8F' }}>Full name</label>
                <input
                  type="text"
                  placeholder="John Coach"
                  className="mt-1 block w-full rounded-md px-3 py-2 focus:outline-none inter-placeholder"
                  style={{ 
                    border: '1px solid #003F8F',
                    fontFamily: 'Inter',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium font-[Poppins]" style={{ color: '#003F8F' }}>Email</label>
                <input
                  type="email"
                  placeholder="coach@domain.com"
                  className="mt-1 block w-full rounded-md px-3 py-2 focus:outline-none inter-placeholder"
                  style={{ 
                    border: '1px solid #003F8F',
                    fontFamily: 'Inter'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium font-[Poppins]" style={{ color: '#003F8F' }}>Specialization</label>
                <input
                  type="text"
                  placeholder="e.g., Strength Training, Cardio"
                  className="mt-1 block w-full rounded-md px-3 py-2 focus:outline-none inter-placeholder"
                  style={{ 
                    border: '1px solid #003F8F',
                    fontFamily: 'Inter'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium font-[Poppins]" style={{ color: '#003F8F' }}>Experience</label>
                <input
                  type="text"
                  placeholder="e.g., 5 years"
                  className="mt-1 block w-full rounded-md px-3 py-2 focus:outline-none inter-placeholder"
                  style={{ 
                    border: '1px solid #003F8F',
                    fontFamily: 'Inter'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium font-[Poppins]" style={{ color: '#003F8F' }}>Password</label>
                <input
                  type="password"
                  placeholder="Choose a secure password"
                  className="mt-1 block w-full rounded-md px-3 py-2 focus:outline-none inter-placeholder"
                  style={{ 
                    border: '1px solid #003F8F',
                    fontFamily: 'Inter'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium font-[Poppins]" style={{ color: '#003F8F' }}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  className="mt-1 block w-full rounded-md px-3 py-2 focus:outline-none inter-placeholder"
                  style={{ 
                    border: '1px solid #003F8F',
                    fontFamily: 'Inter'
                  }}
                />
              </div>
              <div className="flex justify-end font-medium ">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-md text-white transition font-[BasisGrotesquePro]"
                  style={{ backgroundColor: '#003F8F' }}
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Info Section */}
        <div className="w-1/2 bg-[linear-gradient(146.13deg,#003F8F_0%,#467EC6_30.29%,#74A8EA_50.48%,#3C75BE_74.52%,#003F8F_100%)] text-white flex flex-col">
          <h1 className="text-3xl font-semibold mb-4 pl-10 mt-30 font-[Poppins]">Welcome to Deload</h1>
          <p className="mb-8 text-lg pl-10 font-[Inter]">
            Create your Deload account by entering your name, email address, and a secure password.
            Complete your profile to get started as a Coach.
          </p>
          <div className="flex justify-end items-end mt-auto pl-10">
            <img
              src={ClientRegisterImg}
              alt="Dashboard Preview"
              style={{
                border: '10px solid #000000',
                boxShadow: '-10px -6px 24px 1px #0000001A',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachRegister;

