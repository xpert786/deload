import React from 'react'
import DloadLogo from "../../assets/DloadLogo.png";
import { BellIcon, SearchIcon } from './icons';
import ProfileLogo from "../../assets/ProfileLogo.png";
const Header = () => {
  return (
   <>
   <div className='flex justify-between bg-[#FFFFFF] shadow-sm'>
   <div className='border-r border-r-[#003F8F] w-[260px] pt-[14px] flex items-center justify-center'>
    <img src={DloadLogo} className='w-[75px]'/>
   </div>
   <div className='flex justify-center items-center content-center gap-5 pr-[20px]'>
    {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search here..."
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
{/* Bell Icon */}
          <div className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer">
            <BellIcon />
          </div>
           {/* Profile Image */}
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src={ProfileLogo}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
   </div>
  </div>
   </>
  )
}

export default Header