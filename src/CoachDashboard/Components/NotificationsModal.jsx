import React, { useEffect, useRef } from 'react';
import { TodayMessageIcon, PercentageTodayIcon, AvgSession } from '../../ClientDashboard/Components/icons';

const NotificationsModal = ({ isOpen, onClose }) => {
  const notificationsRef = useRef(null);

  const notifications = {
    today: [
      { title: 'Mike Ross - Great! Finish His Work Out.', time: '1 Hrs Ago', icon: <TodayMessageIcon /> },
      { title: 'John Doe - 50% Progress', time: '2 Hrs Ago', icon: <PercentageTodayIcon /> }
    ],
    yesterday: [
      { title: '7:00 AM - John Doe: Send You A Message', time: 'Yesterday', icon: <AvgSession /> },
      { title: '10:00 AM - Sarah Lee: Started Cardio & Core Session', time: 'Yesterday', icon: <AvgSession /> }
    ]
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        ref={notificationsRef}
        className="fixed right-4 top-16 sm:right-6 sm:top-20 w-[90vw] sm:w-[500px] md:w-[550px] lg:w-[600px] max-w-[600px] bg-white rounded-2xl shadow-xl border border-[#E5EDFF] z-50 overflow-hidden h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)] md:h-[calc(100vh-120px)] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5EDFF] flex-shrink-0">
          <h3 className="text-xl sm:text-2xl font-bold text-[#003F8F] font-[Poppins]">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl font-semibold w-8 h-8 flex items-center justify-center focus:outline-none"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="12" fill="#4D6080" fill-opacity="0.8" />
              <path d="M16.066 8.99502C16.1377 8.92587 16.1948 8.84314 16.2342 8.75165C16.2735 8.66017 16.2943 8.56176 16.2952 8.46218C16.2961 8.3626 16.2772 8.26383 16.2395 8.17164C16.2018 8.07945 16.1462 7.99568 16.0758 7.92523C16.0054 7.85478 15.9217 7.79905 15.8295 7.7613C15.7374 7.72354 15.6386 7.70452 15.5391 7.70534C15.4395 7.70616 15.341 7.7268 15.2495 7.76606C15.158 7.80532 15.0752 7.86242 15.006 7.93402L12 10.939L8.995 7.93402C8.92634 7.86033 8.84354 7.80123 8.75154 7.76024C8.65954 7.71925 8.56022 7.69721 8.45952 7.69543C8.35882 7.69365 8.25879 7.71218 8.1654 7.7499C8.07201 7.78762 7.98718 7.84376 7.91596 7.91498C7.84474 7.9862 7.7886 8.07103 7.75087 8.16442C7.71315 8.25781 7.69463 8.35784 7.69641 8.45854C7.69818 8.55925 7.72022 8.65856 7.76122 8.75056C7.80221 8.84256 7.86131 8.92536 7.935 8.99402L10.938 12L7.933 15.005C7.80052 15.1472 7.72839 15.3352 7.73182 15.5295C7.73525 15.7238 7.81396 15.9092 7.95138 16.0466C8.08879 16.1841 8.27417 16.2628 8.46847 16.2662C8.66278 16.2696 8.85082 16.1975 8.993 16.065L12 13.06L15.005 16.066C15.1472 16.1985 15.3352 16.2706 15.5295 16.2672C15.7238 16.2638 15.9092 16.1851 16.0466 16.0476C16.184 15.9102 16.2627 15.7248 16.2662 15.5305C16.2696 15.3362 16.1975 15.1482 16.065 15.006L13.062 12L16.066 8.99502Z" fill="white" />
            </svg>

          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {/* Today Section */}
          <div className="p-4">
            <p className="text-xs font-semibold text-[#0A3D91] mb-3">Today</p>
            <div className="space-y-3">
              {notifications.today.map((note, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between px-4 py-3 border border-[#E5EDFF] rounded-xl bg-white shadow-sm gap-4 hover:bg-[#F5F8FF] transition"
                >
                  <div className="flex items-start gap-3 text-[#0A3D91] flex-1 min-w-0">
                    <span className="w-7 h-7 rounded-xl border border-[#E5EDFF] flex items-center justify-center text-[13px] flex-shrink-0 mt-0.5">
                      {note.icon}
                    </span>
                    <span className="font-semibold text-sm break-words leading-relaxed">{note.title}</span>
                  </div>
                  <span className="text-xs text-[#0A3D91] whitespace-nowrap flex-shrink-0 ml-2">{note.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Yesterday Section */}
          <div className="p-4 pt-2 border-t border-[#E5EDFF]">
            <p className="text-xs font-semibold text-[#0A3D91] mb-3">Yesterday</p>
            <div className="space-y-3">
              {notifications.yesterday.map((note, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between px-4 py-3 border border-[#E5EDFF] rounded-xl bg-white shadow-sm gap-4 hover:bg-[#F5F8FF] transition"
                >
                  <div className="flex items-start gap-3 text-[#0A3D91] flex-1 min-w-0">
                    <span className="w-7 h-7 rounded-xl border border-[#E5EDFF] flex items-center justify-center text-[13px] flex-shrink-0 mt-0.5">
                      {note.icon}
                    </span>
                    <span className="font-semibold text-sm break-words leading-relaxed">{note.title}</span>
                  </div>
                  <span className="text-xs text-[#0A3D91] whitespace-nowrap flex-shrink-0 ml-2">{note.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsModal;

