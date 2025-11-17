import React, { useState } from 'react';

const AddNewClientModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    inviteEmail: '',
    name: '',
    email: '',
    gender: 'Male',
    contactNumber: '',
    goals: '',
    level: '',
    equipments: {
      dumbbells: true,
      barbell: false,
      machines: false
    },
    age: '',
    height: '',
    weight: '',
    medicalConditions: '',
    primaryFitnessGoal: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        equipments: {
          ...prev.equipments,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add form submission logic here
    onClose();
  };

  const handleInvite = () => {
    if (formData.inviteEmail) {
      console.log('Inviting:', formData.inviteEmail);
      // Add invite logic here
      setFormData(prev => ({ ...prev, inviteEmail: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#003F8F] font-[Poppins]">Add New Client</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-800 transition"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invite Section */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter email"
              value={formData.inviteEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, inviteEmail: e.target.value }))}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm"
            />

          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleInvite}
              className="px-6 py-2.5 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition whitespace-nowrap"
            >
              Invite
            </button>
          </div>

          {/* Manual Entry Section */}
          <div className=" pt-6">
            <h3 className="text-lg font-semibold text-[#003F8F] font-[Poppins] mb-6">Manual Entry</h3>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Gender</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === 'Male'}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#003F8F] focus:ring-[#003F8F]"
                    />
                    <span className="text-sm text-gray-700 font-[Inter]">Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === 'Female'}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#003F8F] focus:ring-[#003F8F]"
                    />
                    <span className="text-sm text-gray-700 font-[Inter]">Female</span>
                  </label>
                </div>
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm"
                />
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Goals</label>
                <input
                  type="text"
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  placeholder="Enter your goal"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm"
                />
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Level</label>
                <div className="relative">
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm appearance-none bg-white"
                  >
                    <option value="">Enter your level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6L8 10L12 6" stroke="#4D6080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Equipments Access */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-3 font-[Poppins]">Equipments Access</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="dumbbells"
                      checked={formData.equipments.dumbbells}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#003F8F] rounded focus:ring-[#003F8F]"
                    />
                    <span className="text-sm text-gray-700 font-[Inter]">Dumbbells</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="barbell"
                      checked={formData.equipments.barbell}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#003F8F] rounded focus:ring-[#003F8F]"
                    />
                    <span className="text-sm text-gray-700 font-[Inter]">Barbell</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="machines"
                      checked={formData.equipments.machines}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#003F8F] rounded focus:ring-[#003F8F]"
                    />
                    <span className="text-sm text-gray-700 font-[Inter]">Machines</span>
                  </label>
                </div>
              </div>

              {/* Physical Attributes */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#003F8F] mb-2 font-medium font-[Poppins]">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Add age"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#003F8F] mb-2 font-medium font-[Poppins]">Height</label>
                    <input
                      type="text"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="Add height"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#003F8F] mb-2 font-medium font-[Poppins]">Weight</label>
                    <input
                      type="text"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="Add weight"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Conditions */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Medical Conditions / Injuries</label>
                <input
                  type="text"
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleChange}
                  placeholder="Enter medical conditions"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm"
                />
              </div>

              {/* Primary Fitness Goal */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Primary Fitness Goal</label>
                <input
                  type="text"
                  name="primaryFitnessGoal"
                  value={formData.primaryFitnessGoal}
                  onChange={handleChange}
                  placeholder="Enter primary fitness goal"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter your notes"
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-[50%]">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 px-6 py-3 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:flex-1 px-6 py-3 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition"
              >
                Add Client
              </button>
            </div>
          </div>


        </form>
      </div>
    </div>
  );
};

export default AddNewClientModal;

