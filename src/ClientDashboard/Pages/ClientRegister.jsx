import React, { useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DloadLogo from "../../assets/DloadLogo.png";
import ClientRegisterImg from "../../assets/ClientRegisterImg.png";

const ClientRegister = () => {
  const [step, setStep] = useState(1);
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
  const { register } = useAuth();
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
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setFormData(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
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

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');

    // Register user
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || '+1234567890',
      role: 'client',
      location: formData.location,
      bio: formData.bio,
      profileImage: formData.profileImage
    };

    const result = register(userData);

    if (result.success) {
      navigate('/client/dashboard');
    } else {
      setError(result.error || 'Registration failed');
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
    setStep(1);
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
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
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
                    className="px-6 py-2 rounded-md text-white transition font-[BasisGrotesquePro]"
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
                <div className="flex justify-end gap-3 font-medium ">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-md font-medium font-[Inter] transition-colors hover:opacity-90"
                    style={{ 
                      backgroundColor: '#003F8F',
                      color: 'white',
                      fontFamily: 'Inter',
                    }}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-2 rounded-md font-[Inter] font-bold transition-colors hover:bg-gray-50"
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
                
                {/* Login Link */}
                <div className="flex justify-center mt-4">
                  <p className="text-sm font-[Inter]" style={{ color: '#6C757D', fontFamily: 'sans-serif' }}>
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="underline hover:no-underline font-[Inter] transition-all"
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
