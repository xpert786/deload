import { Link, useLocation } from "react-router-dom";
import { Chat, Home, Settings, WorkOutPlan } from '../../ClientDashboard/Components/icons';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-2 rounded-md text-[16px] font-medium transition-all duration-300 border border-transparent ${
      isActive(path)
        ? "bg-white text-[#003F8F] font-semibold "
        : "text-white hover:bg-[#FFFFFF80] hover:border hover:[#FFFFFF80]"
    }`;

  return (
    <div className="w-[260px] h-[calc(100vh-70px)] bg-[#003F8F] flex flex-col justify-between font-[BasisGrotesquePro] overflow-hidden shadow-lg">
      {/* --- Top Section --- */}
      <div className="flex-1 flex flex-col gap-2 pt-10 px-3">
        {/* Dashboard */}
        <Link to="/admin/dashboard" className={linkClass("/admin/dashboard")}>
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full">
            <Home />
          </span>
          Dashboard
        </Link>
        {/* All Clients */}
        <Link to="/admin/clients" className={linkClass("/admin/clients")}>
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full">
            <WorkOutPlan />
          </span>
          All Clients
        </Link>
        {/* All Coaches */}
        <Link to="/admin/coaches" className={linkClass("/admin/coaches")}>
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full">
            <WorkOutPlan />
          </span>
          All Coaches
        </Link>
        {/* Reports */}
        <Link to="/admin/reports" className={linkClass("/admin/reports")}>
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full">
            <Chat />
          </span>
          Reports
        </Link>
        {/* Settings */}
        <Link to="/admin/settings" className={linkClass("/admin/settings")}>
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full">
            <Settings />
          </span>
          System Settings
        </Link>
      </div>

      {/* --- Bottom Section --- */}
      <div className="p-3 border-t border-white/20">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-[16px] font-medium text-white hover:bg-[#FFFFFF80] transition-all duration-300"
        >
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full">
            <Settings />
          </span>
          Logout
        </button>
      </div>
    </div>
  );
}

