import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from './Header';
import Sidebar from './Sidebar';

export default function ClientLayout() {
  // Sidebar closed by default on mobile, open on desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Check if we're on desktop (lg breakpoint)
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      // On mobile, close sidebar; on desktop, keep current state or open
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        // On desktop, default to open if it was closed due to mobile
        setIsSidebarOpen(prev => prev || true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#F3F7FF]">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
      
      {/* Fixed Sidebar */}
      <div className={`fixed top-[70px] left-0 bottom-0 z-40 transition-all duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar isOpen={isSidebarOpen} />
      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed top-[70px] left-0 right-0 bottom-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Main Content */}
      <main
        className={`
          mt-[72px] 
          min-h-[calc(100vh-70px)] 
          overflow-y-auto 
          bg-[#F7F7F7] 
          transition-all duration-300
          ${isSidebarOpen 
            ? 'ml-[260px] w-[calc(100%-260px)] max-[1366px]:ml-[240px] max-[1366px]:w-[calc(100%-240px)]' 
            : 'ml-0 lg:ml-[80px] w-full lg:w-[calc(100%-80px)]'
          }
        `}
      >
        <Outlet />
      </main>
    </div>
  );
}
