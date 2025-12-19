import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// Use API URL from .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const AddNewClientModal = ({ isOpen, onClose, onClientAdded }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    inviteEmail: '',
    name: '',
    email: '',
    gender: 'Male',
    contactNumber: '',
    address: '',
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

  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.contactNumber) {
        setError('Please fill in all required fields (Name, Email, Contact Number)');
        setLoading(false);
        return;
      }

      // Get authentication token
      let token = null;
      const storedUser = localStorage.getItem('user');

      if (user) {
        token = user.token || user.access_token || user.authToken || user.accessToken;
      }

      if (!token && storedUser) {
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
      const apiUrl = `${baseUrl}/coach/add-client/`;

      // Prepare equipments array
      const equipmentsArray = [];
      if (formData.equipments.dumbbells) equipmentsArray.push('dumbbells');
      if (formData.equipments.barbell) equipmentsArray.push('barbell');
      if (formData.equipments.machines) equipmentsArray.push('machines');

      // Prepare request body
      // Send address as city field since API expects city and returns city in response
      const requestBody = {
        name: formData.name,
        email: formData.email,
        contact_number: formData.contactNumber,
        city: formData.address || '', // Send address as city field
        address: formData.address || '', // Also send as address for compatibility
        gender: formData.gender.toLowerCase(),
        level: formData.level ? formData.level.toLowerCase() : 'beginner',
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        goals: formData.goals || '',
        primary_fitness_goal: formData.primaryFitnessGoal || '',
        equipments_access: equipmentsArray,
        medical_conditions: formData.medicalConditions || '',
        notes: formData.notes || ''
      };
      
      console.log('Request body with address/city:', requestBody);

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      let result;
      try {
        const responseText = await response.text();

        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = {};
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setError('Failed to parse server response. Please try again.');
        setLoading(false);
        return;
      }

      if (response.ok) {
        setSuccess(result.message || 'Client added successfully!');
        
        // Reset form
        setFormData({
          inviteEmail: '',
          name: '',
          email: '',
          gender: 'Male',
          contactNumber: '',
          address: '',
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

        // Dispatch event to refresh clients list
        window.dispatchEvent(new CustomEvent('refreshClients'));

        // Call callback to refresh client list if provided
        if (onClientAdded) {
          onClientAdded();
        }

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 2000);
      } else {
        console.error('Failed to add client:', result);
        setError(result.message || result.error || 'Failed to add client. Please try again.');
      }
    } catch (err) {
      console.error('Add client error:', err);
      setError('Network error: Unable to add client. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!formData.inviteEmail) {
      setError('Please enter an email address');
      return;
    }

    setError('');
    setInviteSuccess('');
    setInviteLoading(true);

    try {
      // Get authentication token
      let token = null;
      const storedUser = localStorage.getItem('user');

      if (user) {
        token = user.token || user.access_token || user.authToken || user.accessToken;
      }

      if (!token && storedUser) {
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
      const apiUrl = `${baseUrl}/coach/invite-client/`;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({ email: formData.inviteEmail }),
      });

      let result;
      try {
        const responseText = await response.text();

        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = {};
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setError('Failed to parse server response. Please try again.');
        setInviteLoading(false);
        return;
      }

      if (response.ok) {
        setInviteSuccess(result.message || 'Invitation sent successfully!');
        setFormData(prev => ({ ...prev, inviteEmail: '' }));
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setInviteSuccess('');
        }, 3000);
      } else {
        console.error('Failed to invite client:', result);
        setError(result.message || result.error || 'Failed to send invitation. Please try again.');
      }
    } catch (err) {
      console.error('Invite client error:', err);
      setError('Network error: Unable to send invitation. Please check your connection.');
    } finally {
      setInviteLoading(false);
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
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-800 transition cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invite Section */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter email"
              value={formData.inviteEmail}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, inviteEmail: e.target.value }));
                setError('');
                setInviteSuccess('');
              }}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm"
            />
          </div>
          <div className="flex justify-end items-center gap-3">
            {inviteSuccess && (
              <span className="text-sm text-green-600">{inviteSuccess}</span>
            )}
            <button
              type="button"
              onClick={handleInvite}
              disabled={inviteLoading}
              className="px-6 py-2.5 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inviteLoading ? 'Sending...' : 'Invite'}
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

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
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
                className="w-full sm:flex-1 px-6 py-3 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 px-6 py-3 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Client'}
              </button>
            </div>
          </div>


        </form>
      </div>
    </div>
  );
};

export default AddNewClientModal;

