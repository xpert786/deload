import React, { useState, useRef } from "react";
import DloadLogo from "../../assets/DloadLogo.png";
import ClientRegisterImg from "../../assets/ClientRegisterImg.png";
const ClientDetail = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
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
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium font-[Poppins]" style={{ color: '#003F8F' }}>Phone</label>
              <input
                type="number"
                placeholder="+1 5555 555 555"
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
                placeholder="you@domain.com"
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
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                
                {/* Profile Picture Placeholder */}
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
                
                {/* Choose Picture Button */}
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
                name="shortBio" 
                id="shortBio"
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
              {/* Reset Button */}
              {/* Create Account Button */}
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
                <a 
                  href="#" 
                  className="underline hover:no-underline font-[Inter] transition-all"
                  style={{ color: '#003F8F' }}
                >
                  Login
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Info Section */}
      
      <div className="w-1/2 bg-[linear-gradient(146.13deg,#003F8F_0%,#467EC6_30.29%,#74A8EA_50.48%,#3C75BE_74.52%,#003F8F_100%)] text-white  flex flex-col ">
        <h1 className="text-3xl font-semibold mb-4 pl-10 mt-30 font-[Poppins]">Welcome to Deload</h1>
        <p className="mb-8 text-lg pl-10 font-[Inter] ">
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

export default ClientDetail;
