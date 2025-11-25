import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArchiveIconForCoach, DeleteIconForCoach, EditIconForCoach, LocationIconForCoach, MailIconForCoach, MobileIconForCoach } from '../Components/Icons';
import ProfileLogo from "../../assets/clientprofile.jpg";

const Messages = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  // Sample messages data
  const messages = [
    {
      id: 1,
      type: 'coach',
      text: "Hi! How was your workout today?",
      time: '3:38 PM',
      read: true
    },
    {
      id: 2,
      type: 'client',
      text: "Great! I finished my leg workout but felt a bit tired.",
      time: '3:38 PM'
    },
    {
      id: 3,
      type: 'coach',
      text: "Good job! Make sure to get enough protein after the session.",
      time: '3:40 PM',
      read: true
    },
    {
      id: 4,
      type: 'client',
      text: "Thanks! Should I also add a protein shake after dinner?",
      time: '3:38 PM'
    },
    {
      id: 5,
      type: 'coach',
      text: "Yes, a light shake is fine, but don't overdo it before sleep.",
      time: '3:40 PM',
      read: true
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle send message logic here
      console.log('Message sent:', message);
      setMessage('');
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 bg-[#F7F7F7] text-[#003F8F]">
      {/* Profile Header Section */}
      <div className="bg-white rounded-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Profile Image and Info */}
          <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={ProfileLogo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#003F8F] font-[Poppins] mb-1">John Doe</h1>
              <p className="text-sm text-gray-600 font-[Inter] mb-4">Male • 20 yo • Beginner</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(`/coach/clients/${clientId}/dashboard`)}
              className="px-4 py-2 border border-[#003F8F] text-[#003F8F] rounded-lg font-semibold text-sm hover:bg-[#003F8F] hover:text-white transition flex items-center gap-2"
            >
              Back
            </button>
            <button className="px-4 py-2 border border-[#003F8F] text-[#003F8F] rounded-lg font-semibold text-sm hover:bg-[#003F8F] hover:text-white transition flex items-center gap-2">
              Edit
              <EditIconForCoach />
            </button>
            <button className="px-4 py-2 border border-[#003F8F] text-[#003F8F] rounded-lg font-semibold text-sm hover:bg-[#003F8F] hover:text-white transition flex items-center gap-2">
              Archive
              <ArchiveIconForCoach />
            </button>
            <button className="px-4 py-2 border border-[#003F8F] text-[#003F8F] rounded-lg font-semibold text-sm hover:bg-[#003F8F] hover:text-white transition flex items-center gap-2">
              <DeleteIconForCoach />
            </button>
          </div>
        </div>
        <div className="mt-4 w-full max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm font-inter text-gray-600">
            {/* Headers */}
            <div className="flex items-center gap-2">
              <span className="text-[#003F8F] font-bold">Email</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#003F8F] font-bold">Phone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#003F8F] font-bold">Address</span>
            </div>

            {/* Values */}
            <div className="flex items-center gap-2">
              <MailIconForCoach className="w-5 h-5 text-[#003F8F]" />
              <span>john.doe@email.com</span>
            </div>

            <div className="flex items-center gap-3">
              <MobileIconForCoach className="w-5 h-5 text-[#003F8F]" />
              <span>(555) 123-4567</span>
            </div>

            <div className="flex items-center gap-3">
              <LocationIconForCoach className="w-5 h-5 text-[#003F8F]" />
              <span>789 New York, USA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        {/* Chat Header */}
        <div className="bg-[#003F8F] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={ProfileLogo}
              alt="John Doe"
              className="w-10 h-10 rounded-full "
            />
            <div>
              <p className="font-semibold font-[Inter]">John Doe</p>
            </div>
          </div>
          <button className="text-white/80 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 10.8333C10.4602 10.8333 10.8333 10.4602 10.8333 10C10.8333 9.53976 10.4602 9.16667 10 9.16667C9.53976 9.16667 9.16667 9.53976 9.16667 10C9.16667 10.4602 9.53976 10.8333 10 10.8333Z" fill="currentColor" />
              <path d="M10 5.83333C10.4602 5.83333 10.8333 5.46024 10.8333 5C10.8333 4.53976 10.4602 4.16667 10 4.16667C9.53976 4.16667 9.16667 4.53976 9.16667 5C9.16667 5.46024 9.53976 5.83333 10 5.83333Z" fill="currentColor" />
              <path d="M10 15.8333C10.4602 15.8333 10.8333 15.4602 10.8333 15C10.8333 14.5398 10.4602 14.1667 10 14.1667C9.53976 14.1667 9.16667 14.5398 9.16667 15C9.16667 15.4602 9.53976 15.8333 10 15.8333Z" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="p-4 sm:p-6 bg-white" style={{ minHeight: '400px', maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Date Separator */}
          <div className="flex items-center justify-center mb-6">
            <span className="px-4 py-2 text-xs font-semibold text-white bg-[#003F8F] rounded-lg">TODAY</span>
          </div>

          {/* Messages */}
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'coach' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'client' && (
                  <div className="flex items-start gap-2 max-w-[70%]">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                      <img
                        src={ProfileLogo}
                        alt="John Doe"
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                    {/* Message Bubble and Timestamp */}
                    <div className="flex flex-col items-start">
                      <div className="rounded-2xl px-4 py-3 text-sm font-[Inter] bg-[#F3701EB2] text-white leading-relaxed break-words whitespace-normal max-w-xs sm:max-w-sm">
                        {msg.text}
                      </div>
                      {/* Timestamp */}
                      <div className="mt-1.5">
                        <span className="text-xs text-gray-500 font-[Inter]">{msg.time}</span>
                      </div>
                    </div>
                  </div>
                )}
                {msg.type === 'coach' && (
                  <div className="flex items-start gap-2 max-w-[70%] ml-auto">
                    {/* Message Bubble and Timestamp */}
                    <div className="flex flex-col">
                      <div className="rounded-2xl px-4 py-3 text-sm font-[Inter] bg-[#003F8FB2] text-white leading-relaxed break-words whitespace-normal max-w-xs sm:max-w-sm">
                        {msg.text}
                      </div>
                      {/* Timestamp */}
                      <div className="mt-1.5">
                        <span className="text-xs text-gray-500 font-[Inter]">{msg.time}</span>
                      </div>
                    </div>
                    {/* Profile Picture with Checkmarks above */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      {/* Read Receipts above profile */}
                      {msg.read && (
                        <div className="flex items-center gap-0.5">
                          <svg width="30" height="32" viewBox="0 0 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.28125 19.5L7.96875 24.5M14.5312 16.5L19.2188 11.5M10.7812 19.5L15.4688 24.5L26.7188 11.5" stroke="#003F8F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>

                        </div>
                      )}
                      {/* Profile Picture */}
                      <img
                        src="https://i.pravatar.cc/150?img=47"
                        alt="Coach"
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
            <button className="text-gray-400 hover:text-gray-600 flex-shrink-0 cursor-pointer">
              <svg width="25" height="27" viewBox="0 0 25 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.7858 3.51113C12.2672 2.97797 12.8418 2.55334 13.4763 2.26189C14.1108 1.97043 14.7926 1.81795 15.4821 1.81328C16.1716 1.80862 16.8551 1.95186 17.493 2.23471C18.1308 2.51755 18.7103 2.93437 19.1979 3.46098C19.6854 3.98759 20.0713 4.6135 20.3331 5.30242C20.5949 5.99134 20.7274 6.72954 20.723 7.47421C20.7186 8.21888 20.5773 8.95519 20.3073 9.64043C20.0374 10.3257 19.6441 10.9462 19.1504 11.466L11.0493 20.2163C10.7601 20.5339 10.4154 20.7865 10.0353 20.9596C9.65515 21.1326 9.24705 21.2227 8.83454 21.2245C8.42202 21.2264 8.01324 21.14 7.63178 20.9704C7.25032 20.8008 6.90373 20.5513 6.61199 20.2363C6.32026 19.9213 6.08917 19.5471 5.93203 19.1351C5.7749 18.7232 5.69484 18.2817 5.69647 17.8362C5.6981 17.3907 5.78139 16.9499 5.94153 16.5394C6.10168 16.1288 6.33551 15.7565 6.62954 15.444L14.7316 6.69376L16.2045 8.28451L8.10245 17.0348C8.00296 17.1385 7.92361 17.2627 7.86902 17.3999C7.81442 17.5372 7.78569 17.6848 7.78449 17.8342C7.78328 17.9836 7.80964 18.1317 7.86202 18.27C7.91439 18.4082 7.99174 18.5338 8.08954 18.6395C8.18735 18.7451 8.30365 18.8286 8.43167 18.8852C8.55969 18.9418 8.69685 18.9702 8.83517 18.9689C8.97348 18.9676 9.11016 18.9366 9.23725 18.8776C9.36434 18.8187 9.47928 18.733 9.57537 18.6255L17.6785 9.87526C17.9687 9.56184 18.1989 9.18975 18.356 8.78024C18.513 8.37073 18.5939 7.93182 18.5939 7.48857C18.5939 7.04532 18.513 6.60641 18.356 6.19691C18.1989 5.7874 17.9687 5.41531 17.6785 5.10188C17.3883 4.78846 17.0438 4.53984 16.6646 4.37021C16.2854 4.20059 15.879 4.11329 15.4686 4.11329C15.0582 4.11329 14.6518 4.20059 14.2726 4.37021C13.8934 4.53984 13.5489 4.78846 13.2587 5.10188L5.15662 13.8533C4.20788 14.9141 3.68291 16.335 3.69478 17.8099C3.70664 19.2847 4.2544 20.6956 5.22007 21.7385C6.18573 22.7814 7.49205 23.373 8.85766 23.3858C10.2233 23.3986 11.5389 22.8317 12.5212 21.807L21.3608 12.2614L22.8337 13.8533L13.9952 23.3989C12.6276 24.8758 10.7729 25.7055 8.83891 25.7055C6.90494 25.7055 5.05019 24.8758 3.68266 23.3989C2.31514 21.922 1.54688 19.9188 1.54688 17.8301C1.54687 15.7415 2.31514 13.7383 3.68266 12.2614L11.7858 3.51113Z" fill="#4D6080" fill-opacity="0.1" />
              </svg>

            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message"
              className="flex-1 py-1 text-sm text-gray-700 font-[Inter] focus:outline-none bg-transparent"
            />
            <button className="text-gray-400 hover:text-[#003F8F] flex-shrink-0 cursor-pointer">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 23.25C18.495 23.25 21.45 21.06 22.665 18H7.335C8.535 21.06 11.505 23.25 15 23.25ZM9.75 13.5C10.3467 13.5 10.919 13.2629 11.341 12.841C11.7629 12.419 12 11.8467 12 11.25C12 10.6533 11.7629 10.081 11.341 9.65901C10.919 9.23705 10.3467 9 9.75 9C9.15326 9 8.58097 9.23705 8.15901 9.65901C7.73705 10.081 7.5 10.6533 7.5 11.25C7.5 11.8467 7.73705 12.419 8.15901 12.841C8.58097 13.2629 9.15326 13.5 9.75 13.5ZM20.25 13.5C20.8467 13.5 21.419 13.2629 21.841 12.841C22.2629 12.419 22.5 11.8467 22.5 11.25C22.5 10.6533 22.2629 10.081 21.841 9.65901C21.419 9.23705 20.8467 9 20.25 9C19.6533 9 19.081 9.23705 18.659 9.65901C18.2371 10.081 18 10.6533 18 11.25C18 11.8467 18.2371 12.419 18.659 12.841C19.081 13.2629 19.6533 13.5 20.25 13.5ZM15 27C11.8174 27 8.76515 25.7357 6.51472 23.4853C4.26428 21.2348 3 18.1826 3 15C3 11.8174 4.26428 8.76515 6.51472 6.51472C8.76515 4.26428 11.8174 3 15 3C18.1826 3 21.2348 4.26428 23.4853 6.51472C25.7357 8.76515 27 11.8174 27 15C27 18.1826 25.7357 21.2348 23.4853 23.4853C21.2348 25.7357 18.1826 27 15 27ZM15 0C6.705 0 0 6.75 0 15C0 18.9782 1.58035 22.7936 4.3934 25.6066C5.78628 26.9995 7.43986 28.1044 9.25975 28.8582C11.0796 29.612 13.0302 30 15 30C18.9782 30 22.7936 28.4196 25.6066 25.6066C28.4196 22.7936 30 18.9782 30 15C30 13.0302 29.612 11.0796 28.8582 9.25975C28.1044 7.43986 26.9995 5.78628 25.6066 4.3934C24.2137 3.00052 22.5601 1.89563 20.7403 1.14181C18.9204 0.387987 16.9698 0 15 0Z" fill="#4D6080" fill-opacity="0.1" />
              </svg>

            </button>
            <button
              onClick={handleSendMessage}
              className="w-9 h-9 text-white  flex items-center justify-center flex-shrink-0 cursor-pointer"
            >
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 0C16.9698 0 18.9204 0.387987 20.7403 1.14181C22.5601 1.89563 24.2137 3.00052 25.6066 4.3934C26.9995 5.78628 28.1044 7.43986 28.8582 9.25975C29.612 11.0796 30 13.0302 30 15C30 18.9782 28.4196 22.7936 25.6066 25.6066C22.7936 28.4196 18.9782 30 15 30C13.0302 30 11.0796 29.612 9.25975 28.8582C7.43986 28.1044 5.78628 26.9995 4.3934 25.6066C1.58035 22.7936 0 18.9782 0 15C0 11.0218 1.58035 7.20644 4.3934 4.3934C7.20644 1.58035 11.0218 0 15 0ZM9 8.565V13.575L19.71 15L9 16.425V21.435L24 15L9 8.565Z" fill="#003F8F" />
              </svg>


            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
