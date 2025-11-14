

import React, { useState } from "react";
import DloadLogo from "../../assets/DloadLogo.png";
import ClientRegisterImg from "../../assets/ClientRegisterImg.png";

const coachingCategories = ['Fitness', 'Life Coaching', 'Yoga', 'Sports', 'Nutrition'];

const CoachRegister = () => {
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState(['Yoga']);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  return (
    <div className="relative min-h-screen bg-[#F7F7F7]">
      <img src={DloadLogo} alt="Deload Logo" className="w-24 absolute top-8 left-8 z-10" />

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Section */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12">
          <div
            className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg space-y-5"
            style={{ border: '1px solid #C7C7C7CC' }}
          >
            <h2 className="text-2xl font-semibold font-[Poppins] text-[#003F8F] mb-6">Coach Registration</h2>

            {step === 1 ? (
              <form className="space-y-4">
                {[
                  { label: 'Full name', type: 'text', placeholder: 'John Coach' },
                  { label: 'Email', type: 'email', placeholder: 'coach@domain.com' },
                  { label: 'Password', type: 'password', placeholder: 'Choose a secure password' },
                  { label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' }
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-sm font-medium font-[Poppins] text-[#003F8F]">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      className="mt-1 block w-full rounded-lg border border-[#003F8F] px-3 py-2 focus:outline-none font-[Inter] text-sm"
                    />
                  </div>
                ))}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2 rounded-md text-white font-[BasisGrotesquePro]"
                    style={{ backgroundColor: '#003F8F' }}
                  >
                    Next
                  </button>
                </div>
              </form>
            ) : step === 2 ? (
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium font-[Poppins] text-[#003F8F]">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 5555 555 555"
                    className="mt-1 block w-full rounded-lg border border-[#003F8F] px-3 py-2 focus:outline-none font-[Inter] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium font-[Poppins] text-[#003F8F]">Location (City)</label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    className="mt-1 block w-full rounded-lg border border-[#003F8F] px-3 py-2 focus:outline-none font-[Inter] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium font-[Poppins] text-[#003F8F]">
                    Coaching Categories (choose one or more)
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {coachingCategories.map((category) => (
                      <button
                        type="button"
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-4 py-1 rounded-full border text-sm font-[Inter] ${
                          selectedCategories.includes(category)
                            ? 'bg-[#003F8F] text-white border-[#003F8F]'
                            : 'bg-white text-[#003F8F] border-[#E0E7FF]'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium font-[Poppins] text-[#003F8F]">Years of experience</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="mt-1 block w-full rounded-lg border border-[#003F8F] px-3 py-2 focus:outline-none font-[Inter] text-sm"
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2 rounded-md text-[#003F8F] border border-[#003F8F] font-[BasisGrotesquePro]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-2 rounded-md text-white font-[BasisGrotesquePro]"
                    style={{ backgroundColor: '#003F8F' }}
                  >
                    Next
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-4">
                <div className="flex flex-col items-start gap-3">
                  <label className="text-sm font-medium font-[Poppins] text-[#003F8F]">Profile picture (optional)</label>
                  <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full border border-[#003F8F] flex items-center justify-center text-xs text-gray-400 font-[Inter]">
                    No Image
                  </div>
                  <label className="px-4 py-2 bg-white border border-[#003F8F] text-[#003F8F] rounded-lg text-sm font-[Inter] cursor-pointer">
                    Choose Picture
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium font-[Poppins] text-[#003F8F]">Certification / License (optional)</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                    <input
                      type="text"
                      disabled
                      placeholder="No file choosen"
                      className="flex-1 rounded-lg border border-[#003F8F] px-3 py-2 bg-gray-50 text-sm text-gray-500 font-[Inter]"
                    />
                    <label className="px-4 py-2 bg-white  text-[#003F8F] rounded-lg text-sm font-[Inter] cursor-pointer text-center">
                      Choose Picture
                      <input type="file" accept="image/*,.pdf" className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium font-[Poppins] text-[#003F8F]">Short bio</label>
                  <textarea
                    rows={3}
                    placeholder="Tell coaches and clients about yourself..."
                    className="mt-1 block w-full rounded-lg border border-[#003F8F] px-3 py-2 focus:outline-none font-[Inter] text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 text-sm font-medium font-[Inter] text-gray-500">
                    <input type="checkbox" className="w-4 h-4 text-[#003F8F]" defaultChecked />
                    Available for coaching
                  </label>
                  <input
                    type="text"
                    placeholder="Availability notes (e.g. mornings, weekends)"
                    className="block w-full rounded-lg border border-[#003F8F] px-3 py-2 focus:outline-none font-[Inter] text-sm"
                  />
                </div>

                <div className="flex flex-wrap gap-3 justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2 rounded-md text-[#003F8F] border border-[#003F8F] font-[BasisGrotesquePro]"
                  >
                    Back
                  </button>
                  <div className="flex gap-3">
                  <button
                      type="submit"
                      className="px-6 py-2 rounded-md text-white font-[BasisGrotesquePro]"
                      style={{ backgroundColor: '#003F8F' }}
                    >
                      Create Account
                    </button>
                    <button
                      type="reset"
                      className="px-6 py-2 rounded-md border border-[#003F8F] text-[#003F8F] font-[BasisGrotesquePro]"
                    >
                      Reset
                    </button>
                   
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 font-[Inter]">
                  Already have an account?{' '}
                  <a href="/login" className="text-[#003F8F] font-semibold">
                    Login
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="w-1/2 bg-[linear-gradient(146.13deg,#003F8F_0%,#467EC6_30.29%,#74A8EA_50.48%,#3C75BE_74.52%,#003F8F_100%)] text-white flex flex-col ">
          <h1 className="text-3xl font-semibold mb-4 pl-10 mt-30 font-[Poppins]">Welcome to Deload</h1>
          <p className="mb-8 text-lg pl-10 font-[Inter] ">
            Create your Deload account by entering your name, email address, and a secure password.
            Complete your profile to get started as a Client.
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

