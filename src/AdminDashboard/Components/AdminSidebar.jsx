import { Link, useLocation, useNavigate } from "react-router-dom";
import { Chat, Home, Settings, SidebarIcon  } from '../../ClientDashboard/Components/icons';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ isOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === path || location.pathname.startsWith('/admin/dashboard/');
    }
    return location.pathname === path;
  };

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-2 rounded-md text-[16px] font-medium transition-all duration-300 border border-transparent ${
      isActive(path)
        ? "bg-[#FFFFFF80] text-white font-medium "
        : "text-white hover:bg-[#FFFFFF80] hover:border hover:[#FFFFFF80]"
    }`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div 
      className={`h-[calc(100vh-70px)] flex flex-col font-[BasisGrotesquePro] overflow-hidden shadow-lg transition-all duration-300 ${
        isOpen ? 'w-[260px]' : 'w-[80px] lg:w-[80px]'
      }`}
      style={{
        background: 'linear-gradient(to bottom, #003F8F, #74A8EA)'
      }}
    >
      {/* --- Navigation Links --- */}
      <div className="flex-1 flex flex-col gap-2 px-2 lg:px-4 pt-13 pb-4">
        <Link
          to="/admin/dashboard"
          className={linkClass("/admin/dashboard")}
          title={!isOpen ? "Dashboard" : ""}
        >
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full flex-shrink-0">
            <Home />
          </span>
          {isOpen && <span className="whitespace-nowrap">Dashboard</span>}
        </Link>

        <Link
          to="/admin/clients"
          className={linkClass("/admin/clients")}
          title={!isOpen ? "All Clients" : ""}
        >
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full flex-shrink-0">
            <SidebarIcon />
          </span>
          {isOpen && <span className="whitespace-nowrap">User Management</span>}
        </Link>

        <Link
          to="/admin/coaches"
          className={linkClass("/admin/coaches")}
          title={!isOpen ? "All Coaches" : ""}
        >
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full flex-shrink-0">
            <SidebarIcon  />
          </span>
          {isOpen && <span className="whitespace-nowrap">Billing & Subscription</span>}
        </Link>

      
       
      </div>

      {/* Logout Button */}
      <div className="px-2 lg:px-4 pb-4 border-t border-white/20 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-md text-[16px] font-medium transition-all duration-300 border border-transparent text-white hover:bg-[#FFFFFF80] hover:border hover:[#FFFFFF80] w-full"
          title={!isOpen ? "Logout" : ""}
        >
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full flex-shrink-0">
            <Settings />
          </span>
          {isOpen && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </div>
  );
}
