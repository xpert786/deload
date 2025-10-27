import { Outlet } from "react-router-dom";
import Header from './Header';
import Sidebar from './Sidebar';

export default function ClientLayout() {
  return (
    <div className="min-h-screen bg-[#F3F7FF]">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      
      {/* Fixed Sidebar */}
      <div className="fixed top-[70px] left-0 bottom-0 z-40">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <main
        className="
          ml-[260px] mt-[98px] 
          min-h-[calc(100vh-70px)] 
          overflow-y-auto 
          bg-[#F3F7FF] 
          p-5 
          w-[calc(100%-260px)]
          max-[1366px]:ml-[240px] 
          max-[1366px]:w-[calc(100%-240px)]
        "
      >
        <Outlet />
      </main>
    </div>
  );
}
