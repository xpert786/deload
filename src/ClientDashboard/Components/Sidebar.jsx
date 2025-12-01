import { Link, useLocation, useNavigate } from "react-router-dom";
import { Chat, Home, Reminders, Settings, WorkOut, } from "./icons";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ isOpen }) {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/client/dashboard') {
      return location.pathname === path || location.pathname.startsWith('/client/dashboard/');
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
    <div className={`h-[calc(100vh-70px)] flex flex-col font-[BasisGrotesquePro] overflow-hidden shadow-lg transition-all duration-300 ${
      isOpen ? 'w-[260px]' : 'w-[80px] lg:w-[80px]'
    }`}
    style={{
      background: 'linear-gradient(to bottom, #003F8F, #74A8EA)'
    }}>
      {/* --- Navigation Links --- */}
      <div className="flex-1 flex flex-col gap-2 px-2 lg:px-4 pt-13 pb-4">
        {/* Dashboard */}
        <Link 
          to="/client/dashboard" 
          className={linkClass("/client/dashboard")}
          title={!isOpen ? "Dashboard" : ""}
        >
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full flex-shrink-0">
            <Home />
          </span>
          {isOpen && <span className="whitespace-nowrap">Dashboard</span>}
        </Link>
        {/* Log Workout */}
        <Link 
          to="/client/log-workout" 
          className={linkClass("/client/log-workout")}
          title={!isOpen ? "Log Workout" : ""}
        >
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full flex-shrink-0">
            <WorkOut />
          </span>
          {isOpen && <span className="whitespace-nowrap">Log Workout</span>}
        </Link>
        {/* Workout Plan */}
        <Link 
          to="/client/workout-plans" 
          className={linkClass("/client/workout-plans")}
          title={!isOpen ? "Workout Plan" : ""}
        >
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.08301 7.91671H17.9163M2.08301 7.91671V17.0834C2.08301 17.3044 2.17081 17.5163 2.32709 17.6726C2.48337 17.8289 2.69533 17.9167 2.91634 17.9167H17.083C17.304 17.9167 17.516 17.8289 17.6723 17.6726C17.8285 17.5163 17.9163 17.3044 17.9163 17.0834V7.91671M2.08301 7.91671V4.16671C2.08301 3.94569 2.17081 3.73373 2.32709 3.57745C2.48337 3.42117 2.69533 3.33337 2.91634 3.33337H17.083C17.304 3.33337 17.516 3.42117 17.6723 3.57745C17.8285 3.73373 17.9163 3.94569 17.9163 4.16671V7.91671" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M6.66602 12.9167L9.16602 15.4167L14.166 10.4167" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.66602 2.08337V5.41671M13.3327 2.08337V5.41671" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
</svg>

          </span>
          {isOpen && <span className="whitespace-nowrap">Workout Plan</span>}
        </Link>
        {/* Reminders */}
        <Link 
          to="/client/reminders" 
          className={linkClass("/client/reminders")}
          title={!isOpen ? "Reminders" : ""}
        >
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full flex-shrink-0">
            <Reminders />
          </span>
          {isOpen && <span className="whitespace-nowrap">Reminders</span>}
        </Link>
        {/* Chat */}
        <Link 
          to="/client/chat" 
          className={linkClass("/client/chat")}
          title={!isOpen ? "Chat" : ""}
        >
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full flex-shrink-0">
            <Chat />
          </span>
          {isOpen && <span className="whitespace-nowrap">Chat</span>}
        </Link>
        {/* Settings */}
        <Link 
          to="/client/settings" 
          className={linkClass("/client/settings")}
          title={!isOpen ? "Settings" : ""}
        >
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full flex-shrink-0">
            <Settings />
          </span>
          {isOpen && <span className="whitespace-nowrap">Settings</span>}
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {isOpen && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </div>
  );
}
