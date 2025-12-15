import React, { useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import DloadLogo from "../../assets/DloadLogo.png";
import ClientRegisterImg from "../../assets/ClientRegisterImg.png";

// Use API URL from .env file only
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const ClientRegister = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    bio: '',
    profileImage: null
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Store the actual file for API submission
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChoosePicture = () => {
    fileInputRef.current?.click();
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('fullname', formData.name);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('confirm_password', formData.confirmPassword);
      submitData.append('phone_number', formData.phone || '');
      submitData.append('city', formData.location || '');
      submitData.append('short_bio', formData.bio || '');

      // Add profile photo if exists
      if (formData.profileImage) {
        submitData.append('profile_photo', formData.profileImage);
      }

      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const apiUrl = `${baseUrl}/signup/`;
      
      console.log('API URL:', apiUrl);
      console.log('Sending data:', {
        fullname: formData.name,
        email: formData.email,
        phone_number: formData.phone,
        city: formData.location,
        has_profile_photo: !!formData.profileImage
      });

      let response;
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          body: submitData,
        });
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
          setError('Network Error: Cannot connect to the server. This is likely a CORS issue.\n\nSolution: The backend server needs to allow requests from http://localhost:5173. Please add CORS headers on the backend.');
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

      // Parse response
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
        } else {
          setError(`Request failed with status ${response.status}. Please try again.`);
        }
        setLoading(false);
        return;
      }

      if (response.ok) {
        setSuccess(true);
        // Store user data in localStorage
        const userData = {
          id: result.data.id,
          fullname: result.data.fullname,
          email: result.data.email,
          phone_number: result.data.phone_number,
          city: result.data.city,
          role: 'client',
          ...result.data
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Navigate to client dashboard after 2 seconds
        setTimeout(() => {
          navigate('/client/dashboard');
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
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      location: '',
      bio: '',
      profileImage: null
    });
    setSelectedImage(null);
    setError('');
    setSuccess(false);
    setLoading(false);
    setStep(1);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      {/* Logo at top-left corner */}
      <img src={DloadLogo} alt="Deload Logo" className="w-24 absolute top-8 left-8 z-10" />
   
      <div className="flex">
        {/* Left Form Section */}
        <div className="w-1/2 flex flex-col items-center bg-[#F7F7F7] p-12 pt-44">
          <div 
            className="w-full max-w-md bg-white p-8 rounded-lg "
            style={{
              border: '1px solid #C7C7C7CC',
              backdropFilter: 'blur(65px)'
            }}
          >
            <h2 className="text-2xl font-medium font-[Poppins] mb-6" style={{ color: '#003F8F' }}>Client Registration</h2>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm whitespace-pre-line">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                Registration successful! Redirecting to dashboard...
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium font-[Poppins]" style={{ color: '#003F8F' }}>Full name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Jane Doe"
                    required
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
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@domain.com"
                    required
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
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Choose a secure password"
                    required
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
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Repeat password"
                    required
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
                    className="px-6 py-2 rounded-md text-white transition font-[BasisGrotesquePro] cursor-pointer"
                    style={{ backgroundColor: '#003F8F' }}
                  >
                    Next
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleStep2Submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium font-[Poppins]" style={{ color: '#003F8F' }}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 555 555 5555"
                    className="mt-1 block w-full rounded-md px-3 py-2 focus:outline-none inter-placeholder"
                    style={{ 
                      border: '1px solid #003F8F',
                      fontFamily: 'Inter',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium font-[Poppins]" style={{ color: '#003F8F' }}>Location (City)</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Mumbai"
                    className="mt-1 block w-full rounded-md px-3 py-2 focus:outline-none inter-placeholder"
                    style={{ 
                      border: '1px solid #003F8F',
                      fontFamily: 'Inter'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium font-[Poppins] mb-3" style={{ color: '#003F8F' }}>Profile picture (optional)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <div 
                      className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
                      style={{ 
                        background: '#4D60801A',
                        border: '0.5px solid #003F8F'
                      }}
                    >
                      {selectedImage ? (   
                        <img
                          src={selectedImage}
                          alt="Selected profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span 
                          className="text-sm font-medium"
                          style={{ 
                            color: '#6C757D',
                            fontFamily: 'sans-serif'
                          }}
                        >
                          No Image
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleChoosePicture}
                      className="px-4 py-2 rounded-md font-[Inter] font-medium text-sm transition-colors hover:bg-gray-200"
                      style={{ 
                        background: '#4D60801A',
                        border: '0.5px solid #003F8F',
                        color: '#003F8F',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      Choose Picture
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium font-[Poppins] mb-3" style={{ color: '#003F8F' }}>Short bio</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell coaches and clients about yourself..."
                    rows="4"
                    className="w-full rounded-md px-3 py-3 focus:outline-none resize-none"
                    style={{ 
                      border: '1px solid #003F8F',
                      backgroundColor: 'white',
                      fontFamily: 'Inter',
                      color: '#333'
                    }}
                  ></textarea>
                </div>
                <div className="flex justify-between gap-3 font-medium ">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2 rounded-md font-[Inter] font-bold transition-colors hover:bg-gray-50 cursor-pointer"
                    style={{ 
                      backgroundColor: 'white',
                      border: '1px solid #003F8F',
                      color: '#003F8F',
                      fontFamily: 'Inter',
                    }}
                  >
                    Back
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || success}
                      className="px-6 py-2 rounded-md font-medium font-[Inter] transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      style={{ 
                        backgroundColor: '#003F8F',
                        color: 'white',
                        fontFamily: 'Inter',
                      }}
                    >
                      {loading ? 'Creating...' : success ? 'Success!' : 'Create Account'}
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-2 rounded-md font-[Inter] font-bold transition-colors hover:bg-gray-50 cursor-pointer"
                      style={{ 
                        backgroundColor: 'white',
                        border: '1px solid #003F8F',
                        color: '#003F8F',
                        fontFamily: 'Inter',
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
                
                {/* Login Link */}
                <div className="flex justify-center mt-4">
                  <p className="text-sm font-[Inter]" style={{ color: '#6C757D', fontFamily: 'sans-serif' }}>
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="underline hover:no-underline font-[Inter] transition-all cursor-pointer"
                      style={{ color: '#003F8F' }}
                    >
                      Login
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Info Section - Same for both steps */}
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

export default ClientRegister;
