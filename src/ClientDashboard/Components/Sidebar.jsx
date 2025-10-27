import { Link, useLocation } from "react-router-dom";
import { Chat, Home, Reminders, Settings, WorkOut, WorkOutPlan } from "./icons";

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
  `flex items-center gap-3 px-4 py-2 rounded-md text-[16px] font-medium transition-all duration-300 border border-transparent ${
    isActive(path)
      ? "bg-white text-[#003F8F] font-semibold "
      : "text-white hover:bg-[#FFFFFF80] hover:border hover:[#FFFFFF80]"
  }`;
  return (
    <>
   
    <div className="w-[260px] h-[calc(100vh-70px)] bg-[#003F8F] flex flex-col justify-between font-[BasisGrotesquePro] overflow-hidden shadow-lg">

      {/* --- Top Section --- */}
      <div className="flex-1 flex flex-col gap-2 pt-10 px-3">
        {/* Dashboard */}
        <Link to="/dashboard" className={linkClass("/dashboard")}>
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full ">
           <Home />
          </span>
          Dashboard
        </Link>
        {/* Log Workout */}
        <Link to="/log-workout" className={linkClass("/log-workout")}>
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full ">
          <WorkOut />
          </span>
          Log Workout
        </Link>
        {/* Workout Plans */}
        <Link to="/workout-plans" className={linkClass("/workout-plans")}>
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full ">
           <WorkOutPlan />
          </span>
          Workout Plans
        </Link>
        {/* Reminders */}
        <Link to="/reminders" className={linkClass("/reminders")}>
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full ">
           <Reminders />
          </span>
          Reminders
        </Link>
        {/* Chat */}
        <Link to="/chat" className={linkClass("/chat")}>
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full ">
           <Chat />
          </span>
          Chat
        </Link>
        <Link to="/settings" className={linkClass("/settings")}>
          <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full ">
           <Settings />
          </span>
         Settings
        </Link>
      </div>
    </div>
     </>
  );
}
