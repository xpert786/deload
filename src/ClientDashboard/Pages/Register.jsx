import React from 'react';
import { Link } from 'react-router-dom';
import DloadLogo from "../../assets/DloadLogo.png";

const Register = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center text-white bg-[linear-gradient(146.13deg,#003F8F_0%,#467EC6_30.29%,#74A8EA_50.48%,#3C75BE_74.52%,#003F8F_100%)]">
      <div className="bg-white rounded-2xl shadow-xl p-15 flex flex-col items-center">
        {/* Logo */}
        <img 
          src={DloadLogo} 
          alt="Dload Logo"
          className="mb-6"
        />

        {/* Title */}
        <h2 className="text-[#003F8F] text-3xl font-semibold text-center font-[Poppins] px-6 py-3">
          Welcome to Deload
        </h2>

        {/* Subtext */}
        <div className="text-center space-y-3 px-4">
          <p className="text-[#4D6080CC] text-lg font-[Inter]">
            Empower Your Fitness Journey
          </p>
          <p className="text-[#4D6080CC] text-base font-[Inter]">
            Join as a Coach or Client and achieve your goals <p>together.</p> 
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button className="bg-[#003F8F] text-white rounded-lg font-medium font-[BasisGrotesquePro] px-8 py-4 hover:bg-[#002A5F] transition-colors">
            Register as Client
          </button>
          <button className="bg-[#003F8F] text-white rounded-lg font-medium font-[BasisGrotesquePro] px-8 py-4 hover:bg-[#002A5F] transition-colors">
            Register as Coach
          </button>
        </div>

        {/* Login Link */}
        <p className="text-[#4D6080CC] text-center pt-4 font-[Inter]">
          Already have an account? 
          <Link to="/login" className="text-[#003F8F] underline ml-1">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
