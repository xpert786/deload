

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DloadLogo from "../../assets/DloadLogo.png";
import ClientRegisterImg from "../../assets/ClientRegisterImg.png";

const coachingCategories = ['Fitness',  'Yoga', 'Sports', 'Nutrition'];

// Use API URL from .env file only
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const CoachRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    address: '',
    coaching_categories: [],
    years_of_experience: '',
    profile_photo: null,
    certification_licence: null,
    short_bio: '',
    available_for_coaching: true,
    availability_notes: ''
  });

  const [profilePreview, setProfilePreview] = useState(null);
  const [certificationFileName, setCertificationFileName] = useState('');

  const toggleCategory = (category) => {
    setFormData((prev) => ({
      ...prev,
      coaching_categories: prev.coaching_categories.includes(category)
        ? prev.coaching_categories.filter((item) => item !== category)
        : [...prev.coaching_categories, category]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      if (name === 'profile_photo') {
        const file = files[0];
        if (file) {
          setFormData((prev) => ({ ...prev, profile_photo: file }));
          const reader = new FileReader();
          reader.onloadend = () => {
            setProfilePreview(reader.result);
          };
          reader.readAsDataURL(file);
        }
      } else if (name === 'certification_licence') {
        const file = files[0];
        if (file) {
          setFormData((prev) => ({ ...prev, certification_licence: file }));
          setCertificationFileName(file.name);
        }
      }
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateStep1 = () => {
    if (!formData.fullname.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.phone_number.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (formData.coaching_categories.length === 0) {
      setError('Please select at least one coaching category');
      return false;
    }
    if (!formData.years_of_experience || formData.years_of_experience < 0) {
      setError('Years of experience is required');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('fullname', formData.fullname);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('confirm_password', formData.confirmPassword); // Add confirm_password field
      submitData.append('phone_number', formData.phone_number);
      submitData.append('address', formData.address);
      submitData.append('years_of_experience', formData.years_of_experience);
      submitData.append('short_bio', formData.short_bio || '');
      
      // Add coaching categories - API expects lowercase with underscores
      // Map category names to API expected format (based on error, API expects lowercase)
      const categoryMapping = {
        'Fitness': 'fitness',
        // 'Life Coaching': 'life_coaching',
        'Yoga': 'yoga',
        'Sports': 'sports',  // API expects lowercase 'sports' not 'Sports'
        'Nutrition': 'nutrition'
      };
      
      formData.coaching_categories.forEach((category) => {
        // Use mapped value - API is case-sensitive
        const apiCategory = categoryMapping[category] || category.toLowerCase().replace(/\s+/g, '_');
        submitData.append('coaching_categories', apiCategory);
        console.log(`Sending category: ${category} -> ${apiCategory}`);
      });

      // Add availability notes
      const availabilityText = formData.available_for_coaching 
        ? (formData.availability_notes || 'Available')
        : 'Not available';
      submitData.append('available_for_coaching', availabilityText);

      // Add files if they exist
      if (formData.profile_photo) {
        submitData.append('profile_photo', formData.profile_photo);
      }
      if (formData.certification_licence) {
        submitData.append('certification_licence', formData.certification_licence);
      }

      // Log what we're sending (for debugging)
      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const apiUrl = `${baseUrl}/coach/signup/`;
      console.log('API URL:', apiUrl);
      console.log('API Base URL from env:', import.meta.env.VITE_API_BASE_URL);
      console.log('Sending data:', {
        fullname: formData.fullname,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
        years_of_experience: formData.years_of_experience,
        coaching_categories: formData.coaching_categories,
        has_profile_photo: !!formData.profile_photo,
        has_certification: !!formData.certification_licence
      });

      // Log FormData contents
      console.log('FormData contents:');
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      let response;
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          body: submitData,
          // Don't set Content-Type header - browser will set it automatically with boundary for FormData
          // mode: 'cors' is default, but we'll let browser handle it
        });
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        console.error('Error name:', fetchError.name);
        console.error('Error message:', fetchError.message);
        
        // More specific error message
        if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
          setError('Network Error: Cannot connect to the server. This is likely a CORS issue.\n\nSolution: The backend server needs to allow requests from http://localhost:5173. Please add CORS headers on the backend:\n- Access-Control-Allow-Origin: http://localhost:5173\n- Access-Control-Allow-Methods: POST, GET, OPTIONS\n- Access-Control-Allow-Headers: Content-Type');
        } else {
          setError(`Network error: ${fetchError.message || 'Unable to connect to the server. Please check your internet connection and ensure the server is running.'}`);
        }
        setLoading(false);
        return;
      }

      // Check if response exists
      if (!response) {
        setError('No response from server. Please try again.');
        setLoading(false);
        return;
      }

      // Check if response is ok before trying to parse JSON
      let result;
      try {
        const responseText = await response.text();
        console.log('Response status:', response.status);
        console.log('Response text:', responseText);
        
        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = {};
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        if (response.status === 400) {
          setError('Invalid request. Please check all fields are filled correctly.');
        } else if (response.status === 0 || response.status >= 500) {
          setError('Server error. Please try again later.');
        } else if (response.status === 404) {
          setError('API endpoint not found. Please check the API URL.');
        } else if (response.status === 403) {
          setError('Access forbidden. Please check CORS settings on the server.');
        } else {
          setError(`Request failed with status ${response.status}. Please try again.`);
        }
        setLoading(false);
        return;
      }

      if (response.ok) {
        setSuccess(true);
        // Store user data in localStorage
        // Handle both 'address' and 'city' field names (backend might return either)
        const addressField = result.data.address || result.data.city || '';
        const userData = {
          id: result.data.id,
          fullname: result.data.fullname,
          email: result.data.email,
          phone_number: result.data.phone_number,
          address: addressField, // Use address field (or city if address not present)
          role: 'coach',
          ...result.data
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Navigate to coach dashboard after 2 seconds
        setTimeout(() => {
          navigate('/coach/dashboard');
        }, 2000);
      } else {
        // Handle different error formats
        let errorMessage = 'Registration failed. Please try again.';
        let errorDetails = [];
        
        if (result.message) {
          errorMessage = result.message;
        } else if (result.error) {
          errorMessage = result.error;
        } else if (result.detail) {
          errorMessage = result.detail;
        }
        
        // Extract detailed validation errors
        if (result.errors && typeof result.errors === 'object') {
          Object.keys(result.errors).forEach((field) => {
            const fieldErrors = result.errors[field];
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach((err) => {
                errorDetails.push(`${field}: ${err}`);
              });
            } else if (typeof fieldErrors === 'object') {
              // Handle nested errors like coaching_categories[0]
              Object.keys(fieldErrors).forEach((key) => {
                const nestedErrors = fieldErrors[key];
                if (Array.isArray(nestedErrors)) {
                  nestedErrors.forEach((err) => {
                    errorDetails.push(`${field} (${key}): ${err}`);
                  });
                }
              });
            } else if (typeof fieldErrors === 'string') {
              errorDetails.push(`${field}: ${fieldErrors}`);
            }
          });
        }
        
        // Combine error message with details
        if (errorDetails.length > 0) {
          errorMessage = errorMessage + '\n\n' + errorDetails.join('\n');
        }
        
        setError(errorMessage);
        console.error('API Error Response:', result);
      }
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      // Handle CORS and network errors
      if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
        setError('Network/CORS Error: Unable to connect to the server. This could be due to:\n1. CORS issue - Backend needs to allow requests from http://localhost:5173\n2. Server is down or unreachable\n3. Network connectivity issue\n\nPlease check the API URL in .env file and ensure the backend server is running and configured for CORS.');
      } else if (err.message) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullname: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone_number: '',
      address: '',
      coaching_categories: [],
      years_of_experience: '',
      profile_photo: null,
      certification_licence: null,
      short_bio: '',
      available_for_coaching: true,
      availability_notes: ''
    });
    setProfilePreview(null);
    setCertificationFileName('');
    setError('');
    setStep(1);
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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-[Inter]">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-[Inter]">
                Registration successful! Redirecting to dashboard...
              </div>
            )}

            {step === 1 ? (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                <div>
                  <label className="block text-sm font-medium font-[Poppins] text-[#003F8F]">
                    Full name
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    placeholder="John Coach"
                    className="mt-1 block w-full rounded-lg border border-[#003F8F] px-3 py-2 focus:outline-none font-[Inter] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium font-[Poppins] text-[#003F8F]">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="coach@domain.com"
                    className="mt-1 block w-full rounded-lg border border-[#003F8F] px-3 py-2 focus:outline-none font-[Inter] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium font-[Poppins] text-[#003F8F]">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Choose a secure password"
                    className="mt-1 block w-full rounded-lg border border-[#003F8F] px-3 py-2 focus:outline-none font-[Inter] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium font-[Poppins] text-[#003F8F]">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Repeat password"
                    className="mt-1 block w-full rounded-lg border border-[#003F8F] px-3 py-2 focus:outline-none font-[Inter] text-sm"
                    required
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="px-6 py-2 rounded-md text-[#003F8F] border border-[#003F8F] font-[BasisGrotesquePro] cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-md text-white font-[BasisGrotesquePro] cursor-pointer"
                    style={{ backgroundColor: '#003F8F' }}
                  >
                    Next
                  </button>
                </div>
              </form>
            ) : step === 2 ? (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                <div>
                  <label className="block text-sm font-medium font-[Poppins] text-[#003F8F]">Phone</label>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="+1 5555 555 555"
                    className="mt-1 block w-full rounded-lg border border-[#003F8F] px-3 py-2 focus:outline-none font-[Inter] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium font-[Poppins] text-[#003F8F]">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    className="mt-1 block w-full rounded-lg border border-[#003F8F] px-3 py-2 focus:outline-none font-[Inter] text-sm"
                    required
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
                          formData.coaching_categories.includes(category)
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
                    name="years_of_experience"
                    value={formData.years_of_experience}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="mt-1 block w-full rounded-lg border border-[#003F8F] px-3 py-2 focus:outline-none font-[Inter] text-sm"
                    required
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2 rounded-md text-[#003F8F] border border-[#003F8F] font-[BasisGrotesquePro] cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-md text-white font-[BasisGrotesquePro] cursor-pointer"
                    style={{ backgroundColor: '#003F8F' }}
                  >
                    Next
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex flex-col items-start gap-3">
                  <label className="text-sm font-medium font-[Poppins] text-[#003F8F]">Profile picture (optional)</label>
                  <div className="flex items-center gap-4">
                    {profilePreview ? (
                      <img 
                        src={profilePreview} 
                        alt="Profile preview" 
                        className="w-24 h-24 rounded-full border border-[#003F8F] object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full border border-[#003F8F] flex items-center justify-center text-xs text-gray-400 font-[Inter]">
                        No Image
                      </div>
                    )}
                    <label className="px-4 py-2 bg-white border border-[#003F8F] text-[#003F8F] rounded-lg text-sm font-[Inter] cursor-pointer">
                      Choose Picture
                      <input 
                        type="file" 
                        name="profile_photo"
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleInputChange}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium font-[Poppins] text-[#003F8F]">Certification / License (optional)</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                    <input
                      type="text"
                      disabled
                      value={certificationFileName || "No file chosen"}
                      placeholder="No file chosen"
                      className="flex-1 rounded-lg border border-[#003F8F] px-3 py-2 bg-gray-50 text-sm text-gray-500 font-[Inter]"
                    />
                    <label className="px-4 py-2 bg-white text-[#003F8F] rounded-lg text-sm font-[Inter] cursor-pointer text-center border border-[#003F8F]">
                      Choose File
                      <input 
                        type="file" 
                        name="certification_licence"
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={handleInputChange}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium font-[Poppins] text-[#003F8F]">Short bio</label>
                  <textarea
                    name="short_bio"
                    value={formData.short_bio}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Tell coaches and clients about yourself..."
                    className="mt-1 block w-full rounded-lg border border-[#003F8F] px-3 py-2 focus:outline-none font-[Inter] text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 text-sm font-medium font-[Inter] text-gray-500">
                    <input 
                      type="checkbox" 
                      name="available_for_coaching"
                      checked={formData.available_for_coaching}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#003F8F]" 
                    />
                    Available for coaching
                  </label>
                  <input
                    type="text"
                    name="availability_notes"
                    value={formData.availability_notes}
                    onChange={handleInputChange}
                    placeholder="Availability notes (e.g. mornings, weekends)"
                    className="block w-full rounded-lg border border-[#003F8F] px-3 py-2 focus:outline-none font-[Inter] text-sm"
                  />
                </div>

                <div className="flex flex-wrap gap-3 justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2 rounded-md text-[#003F8F] border border-[#003F8F] font-[BasisGrotesquePro] cursor-pointer"
                  >
                    Back
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || success}
                      className="px-6 py-2 rounded-md text-white font-[BasisGrotesquePro] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      style={{ backgroundColor: '#003F8F' }}
                    >
                      {loading ? 'Creating...' : success ? 'Success!' : 'Create Account'}
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-2 rounded-md border border-[#003F8F] text-[#003F8F] font-[BasisGrotesquePro] cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 font-[Inter] cursor-pointer">
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

