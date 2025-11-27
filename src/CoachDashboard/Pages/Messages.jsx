import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArchiveIconForCoach, DeleteIconForCoach, EditIconForCoach, LocationIconForCoach, MailIconForCoach, MobileIconForCoach } from '../Components/Icons';
import ProfileLogo from "../../assets/clientprofile.jpg";

const Messages = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState('John Doe');

  // Sample conversations list
  const conversations = [
    {
      id: 1,
      name: 'John Doe',
      lastMessage: "Thanks! Should I also add a protein shake...",
      time: '15 min',
      unread: 0,
      isActive: true,
      isOnline: true,
      location: 'New York, USA'
    },
    {
      id: 2,
      name: 'Darrell Steward',
      lastMessage: '',
      time: '',
      unread: 2,
      isActive: false,
      isOnline: false,
      location: 'New York, USA'
    },
    {
      id: 3,
      name: 'Floyd Miles',
      lastMessage: '',
      time: '',
      unread: 1,
      isActive: false,
      isOnline: false,
      location: 'New York, USA'
    },
    {
      id: 4,
      name: 'Darlene Robertson',
      lastMessage: '',
      time: '',
      unread: 3,
      isActive: false,
      isOnline: false,
      location: 'New York, USA'
    },
    {
      id: 5,
      name: 'Jane Cooper',
      lastMessage: '',
      time: '',
      unread: 1,
      isActive: false,
      isOnline: false,
      location: 'New York, USA'
    },
    {
      id: 6,
      name: 'Floyd Miles',
      lastMessage: '',
      time: '',
      unread: 1,
      isActive: false,
      isOnline: false,
      location: 'New York, USA'
    },
    {
      id: 7,
      name: 'Darlene Robertson',
      lastMessage: '',
      time: '',
      unread: 3,
      isActive: false,
      isOnline: false,
      location: 'New York, USA'
    },
  ];

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
    <>
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
      <div className="h-screen flex bg-[#F7F7F7] text-[#003F8F] pl-4">
        {/* Left Panel - Message List */}
      <div className="w-1/3 min-w-[300px] bg-white rounded-[12px] border-r border-gray-200 flex flex-col mt-4 mb-4" style={{ maxHeight: '90vh' }}>
        {/* Messages Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-[#003F8F] font-[Poppins]">Messages</h2>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 14L11.1 11.1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search messages"
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto bg-white hide-scrollbar">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.name)}
              className={`mx-2 my-1 p-4 rounded-lg cursor-pointer transition focus:outline-none ${selectedConversation === conversation.name ? 'bg-[#4D60801A]' : 'bg-white hover:bg-gray-50'
                }`}
              style={{ outline: 'none' }}
              tabIndex={0}
            >
              <div className="flex items-start gap-3">
                {/* Profile Picture */}
                <div className="relative flex-shrink-0">
                  <img
                    src={ProfileLogo}
                    alt={conversation.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#003F8F] rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#003F8F] font-[Inter]">
                        {conversation.name}
                      </span>
                      {conversation.isOnline && (
                        <div className="w-2 h-2 bg-[#003F8F] rounded-full"></div>
                      )}
                    </div>
                    {conversation.time && (
                      <span className="text-xs text-gray-500 font-[Inter]">{conversation.time}</span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-600 font-[Inter] truncate">{conversation.lastMessage}</p>
                  )}
                  {!conversation.lastMessage && (
                    <p className="text-sm text-gray-500 font-[Inter]">{conversation.location}</p>
                  )}
                </div>

                {/* Unread Badge */}
                {conversation.unread > 0 && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-[#4D60801A] rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-[#003F8F]">{conversation.unread}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="flex-1 flex flex-col bg-[#F7F7F7]">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col m-4">
          {/* Chat Header */}
          <div className="bg-[#003F8F] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={ProfileLogo}
                alt="John Doe"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold font-[Inter]">John Doe</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Video Call Icon */}
              <button className="text-white/80 hover:text-white transition">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_737_159962)">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.13325 4.4665V11.5332H10.5333V4.4665H2.13325ZM1.99992 3.6665H10.6666C10.8434 3.6665 11.013 3.73674 11.138 3.86177C11.263 3.98679 11.3333 4.15636 11.3333 4.33317V11.6665C11.3333 11.8433 11.263 12.0129 11.138 12.1379C11.013 12.2629 10.8434 12.3332 10.6666 12.3332H1.99992C1.82311 12.3332 1.65354 12.2629 1.52851 12.1379C1.40349 12.0129 1.33325 11.8433 1.33325 11.6665V4.33317C1.33325 4.15636 1.40349 3.98679 1.52851 3.86177C1.65354 3.73674 1.82311 3.6665 1.99992 3.6665ZM12.7999 8.9485L14.5333 10.3352V5.6645L12.7999 7.05117V8.9485ZM11.9999 6.6665L14.2499 4.8665C14.3479 4.78803 14.4661 4.73883 14.5909 4.72457C14.7156 4.71031 14.8419 4.73157 14.9551 4.7859C15.0683 4.84024 15.1638 4.92544 15.2307 5.0317C15.2976 5.13795 15.3332 5.26094 15.3333 5.3865V10.6132C15.3332 10.7387 15.2976 10.8617 15.2307 10.968C15.1638 11.0742 15.0683 11.1594 14.9551 11.2138C14.8419 11.2681 14.7156 11.2894 14.5909 11.2751C14.4661 11.2608 14.3479 11.2116 14.2499 11.1332L11.9999 9.33317V6.6665Z" fill="white" />
                  </g>
                  <defs>
                    <clipPath id="clip0_737_159962">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>

              </button>
              {/* Phone Call Icon */}
              <button className="text-white/80 hover:text-white transition">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_737_159964)">
                    <path d="M12.8331 9.86989V11.6199C12.8337 11.7824 12.8005 11.9432 12.7354 12.092C12.6703 12.2409 12.5748 12.3745 12.4551 12.4843C12.3354 12.5941 12.1941 12.6778 12.0402 12.7298C11.8863 12.7819 11.7232 12.8012 11.5614 12.7866C9.76641 12.5915 8.04217 11.9781 6.52726 10.9957C5.11782 10.1001 3.92287 8.90516 3.02726 7.49573C2.04141 5.97393 1.4279 4.24131 1.23642 2.43823C1.22185 2.27692 1.24102 2.11434 1.29272 1.96084C1.34441 1.80735 1.42751 1.6663 1.5367 1.54667C1.6459 1.42705 1.77881 1.33147 1.92697 1.26603C2.07513 1.20059 2.23529 1.16671 2.39726 1.16656H4.14726C4.43035 1.16377 4.7048 1.26402 4.91945 1.44862C5.1341 1.63322 5.2743 1.88957 5.31392 2.16989C5.38779 2.72993 5.52477 3.27982 5.72226 3.80906C5.80074 4.01785 5.81773 4.24476 5.7712 4.46291C5.72468 4.68105 5.61659 4.88129 5.45976 5.03989L4.71892 5.78073C5.54933 7.24113 6.75852 8.45032 8.21892 9.28073L8.95976 8.53989C9.11836 8.38306 9.3186 8.27497 9.53674 8.22845C9.75489 8.18192 9.9818 8.19891 10.1906 8.27739C10.7198 8.47488 11.2697 8.61186 11.8298 8.68573C12.1131 8.7257 12.3719 8.86843 12.5569 9.08677C12.7419 9.3051 12.8402 9.58381 12.8331 9.86989Z" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_737_159964">
                      <rect width="14" height="14" fill="white" />
                    </clipPath>
                  </defs>
                </svg>

              </button>
              {/* Three Dot Menu Icon */}
              <button className="text-white/80 hover:text-white transition">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 10C18.5304 10 19.0391 10.2107 19.4142 10.5858C19.7893 10.9609 20 11.4696 20 12C20 12.5304 19.7893 13.0391 19.4142 13.4142C19.0391 13.7893 18.5304 14 18 14C17.4696 14 16.9609 13.7893 16.5858 13.4142C16.2107 13.0391 16 12.5304 16 12C16 11.4696 16.2107 10.9609 16.5858 10.5858C16.9609 10.2107 17.4696 10 18 10ZM12 10C12.5304 10 13.0391 10.2107 13.4142 10.5858C13.7893 10.9609 14 11.4696 14 12C14 12.5304 13.7893 13.0391 13.4142 13.4142C13.0391 13.7893 12.5304 14 12 14C11.4696 14 10.9609 13.7893 10.5858 13.4142C10.2107 13.0391 10 12.5304 10 12C10 11.4696 10.2107 10.9609 10.5858 10.5858C10.9609 10.2107 11.4696 10 12 10ZM8 12C8 11.4696 7.78929 10.9609 7.41421 10.5858C7.03914 10.2107 6.53043 10 6 10C5.46957 10 4.96086 10.2107 4.58579 10.5858C4.21071 10.9609 4 11.4696 4 12C4 12.5304 4.21071 13.0391 4.58579 13.4142C4.96086 13.7893 5.46957 14 6 14C6.53043 14 7.03914 13.7893 7.41421 13.4142C7.78929 13.0391 8 12.5304 8 12Z" fill="white" />
                </svg>

              </button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div 
            className="p-4 sm:p-6 bg-white overflow-y-auto hide-scrollbar"
            style={{ 
              minHeight: '400px', 
              maxHeight: '60vh',
            }}
          >
            {/* Date Separator */}
            <div className="flex items-center justify-center mb-6">
              <span className="px-4 py-2 text-xs font-semibold text-white bg-[#003F8F] rounded-lg">TODAY</span>
            </div>

            {/* Messages */}
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'client' ? 'justify-start' : 'justify-end'}`}
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
                    <div className="flex items-start gap-2 max-w-[70%]">
                      {/* Message Bubble and Timestamp */}
                      <div className="flex flex-col items-end">
                        <div className="rounded-2xl px-4 py-3 text-sm font-[Inter] bg-[#003F8FB2] text-white leading-relaxed break-words whitespace-normal max-w-xs sm:max-w-sm">
                          {msg.text}
                        </div>
                        {/* Timestamp */}
                        <div className="mt-1.5">
                          <span className="text-xs text-gray-500 font-[Inter]">{msg.time}</span>
                        </div>
                      </div>
                      {/* Profile Picture with Checkmarks */}
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        {/* Read Receipts */}
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
            {/* Suggested Replies/Tags */}
            <div className="flex items-center gap-2 mb-3">
              <button className="px-3 py-1.5 border border-[#003F8F] text-[#003F8F] rounded-lg text-sm font-[Inter] flex items-center gap-2 hover:bg-blue-50 transition relative">
                <span>Good Job!</span>
                <div className="absolute -top-1.5 -right-1.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="12" height="12" rx="6" fill="#003F8F"/>
                    <path d="M8.033 4.49751C8.06883 4.46293 8.09742 4.42157 8.11709 4.37583C8.13677 4.33008 8.14714 4.28088 8.14759 4.23109C8.14805 4.1813 8.13858 4.13191 8.11975 4.08582C8.10091 4.03972 8.07309 3.99784 8.0379 3.96262C8.0027 3.92739 7.96085 3.89953 7.91477 3.88065C7.86869 3.86177 7.81932 3.85226 7.76953 3.85267C7.71973 3.85308 7.67052 3.8634 7.62476 3.88303C7.579 3.90266 7.53761 3.93121 7.503 3.96701L6 5.46951L4.4975 3.96701C4.46317 3.93017 4.42177 3.90062 4.37577 3.88012C4.32977 3.85962 4.28011 3.8486 4.22976 3.84771C4.17941 3.84683 4.12939 3.85609 4.0827 3.87495C4.03601 3.89381 3.99359 3.92188 3.95798 3.95749C3.92237 3.9931 3.8943 4.03552 3.87544 4.08221C3.85658 4.12891 3.84731 4.17892 3.8482 4.22927C3.84909 4.27962 3.86011 4.32928 3.88061 4.37528C3.9011 4.42128 3.93066 4.46268 3.9675 4.49701L5.469 6.00001L3.9665 7.50251C3.90026 7.5736 3.8642 7.66762 3.86591 7.76477C3.86763 7.86192 3.90698 7.95462 3.97569 8.02332C4.04439 8.09203 4.13709 8.13138 4.23424 8.1331C4.33139 8.13481 4.42541 8.09875 4.4965 8.03251L6 6.53001L7.5025 8.03301C7.57359 8.09925 7.66761 8.13531 7.76476 8.1336C7.86191 8.13188 7.9546 8.09253 8.02331 8.02382C8.09202 7.95512 8.13137 7.86242 8.13309 7.76527C8.1348 7.66812 8.09874 7.5741 8.0325 7.50301L6.531 6.00001L8.033 4.49751Z" fill="white"/>
                  </svg>
                </div>
              </button>
              <button className="px-3 py-1.5 border border-[#003F8F] text-[#003F8F] rounded-lg text-sm font-[Inter] flex items-center gap-2 hover:bg-blue-50 transition relative">
                <span>Adjust Form On Squats</span>
                <div className="absolute -top-1.5 -right-1.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="12" height="12" rx="6" fill="#003F8F"/>
                    <path d="M8.033 4.49751C8.06883 4.46293 8.09742 4.42157 8.11709 4.37583C8.13677 4.33008 8.14714 4.28088 8.14759 4.23109C8.14805 4.1813 8.13858 4.13191 8.11975 4.08582C8.10091 4.03972 8.07309 3.99784 8.0379 3.96262C8.0027 3.92739 7.96085 3.89953 7.91477 3.88065C7.86869 3.86177 7.81932 3.85226 7.76953 3.85267C7.71973 3.85308 7.67052 3.8634 7.62476 3.88303C7.579 3.90266 7.53761 3.93121 7.503 3.96701L6 5.46951L4.4975 3.96701C4.46317 3.93017 4.42177 3.90062 4.37577 3.88012C4.32977 3.85962 4.28011 3.8486 4.22976 3.84771C4.17941 3.84683 4.12939 3.85609 4.0827 3.87495C4.03601 3.89381 3.99359 3.92188 3.95798 3.95749C3.92237 3.9931 3.8943 4.03552 3.87544 4.08221C3.85658 4.12891 3.84731 4.17892 3.8482 4.22927C3.84909 4.27962 3.86011 4.32928 3.88061 4.37528C3.9011 4.42128 3.93066 4.46268 3.9675 4.49701L5.469 6.00001L3.9665 7.50251C3.90026 7.5736 3.8642 7.66762 3.86591 7.76477C3.86763 7.86192 3.90698 7.95462 3.97569 8.02332C4.04439 8.09203 4.13709 8.13138 4.23424 8.1331C4.33139 8.13481 4.42541 8.09875 4.4965 8.03251L6 6.53001L7.5025 8.03301C7.57359 8.09925 7.66761 8.13531 7.76476 8.1336C7.86191 8.13188 7.9546 8.09253 8.02331 8.02382C8.09202 7.95512 8.13137 7.86242 8.13309 7.76527C8.1348 7.66812 8.09874 7.5741 8.0325 7.50301L6.531 6.00001L8.033 4.49751Z" fill="white"/>
                  </svg>
                </div>
              </button>
            </div>

            {/* Input Field */}
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
              <button className="text-gray-400 hover:text-gray-600 flex-shrink-0 cursor-pointer">
                <svg width="25" height="27" viewBox="0 0 25 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.7853 3.51144C12.2667 2.97827 12.8413 2.55365 13.4758 2.26219C14.1103 1.97074 14.7921 1.81825 15.4816 1.81359C16.1711 1.80892 16.8546 1.95217 17.4925 2.23501C18.1303 2.51786 18.7098 2.93467 19.1974 3.46128C19.6849 3.98789 20.0708 4.61381 20.3326 5.30273C20.5944 5.99164 20.7269 6.72985 20.7225 7.47452C20.7181 8.21919 20.5768 8.9555 20.3068 9.64073C20.0369 10.326 19.6436 10.9465 19.1499 11.4663L11.0488 20.2166C10.7596 20.5342 10.4149 20.7868 10.0348 20.9599C9.65466 21.1329 9.24657 21.223 8.83405 21.2248C8.42153 21.2267 8.01275 21.1404 7.63129 20.9707C7.24983 20.8011 6.90324 20.5516 6.61151 20.2366C6.31977 19.9216 6.08868 19.5474 5.93154 19.1355C5.77441 18.7235 5.69435 18.2821 5.69598 17.8365C5.69761 17.391 5.7809 16.9502 5.94105 16.5397C6.10119 16.1291 6.33502 15.7568 6.62905 15.4443L14.7311 6.69406L16.204 8.28481L8.10197 17.0351C8.00248 17.1388 7.92312 17.263 7.86853 17.4002C7.81394 17.5375 7.7852 17.6851 7.784 17.8345C7.7828 17.9839 7.80915 18.132 7.86153 18.2703C7.9139 18.4085 7.99125 18.5341 8.08906 18.6398C8.18686 18.7454 8.30316 18.8289 8.43118 18.8855C8.5592 18.9421 8.69636 18.9705 8.83468 18.9692C8.97299 18.9679 9.10968 18.9369 9.23676 18.8779C9.36385 18.819 9.47879 18.7333 9.57488 18.6258L17.678 9.87557C17.9682 9.56214 18.1984 9.19005 18.3555 8.78054C18.5125 8.37104 18.5934 7.93213 18.5934 7.48888C18.5934 7.04563 18.5125 6.60672 18.3555 6.19721C18.1984 5.7877 17.9682 5.41561 17.678 5.10219C17.3878 4.78877 17.0433 4.54014 16.6641 4.37052C16.2849 4.2009 15.8785 4.11359 15.4681 4.11359C15.0577 4.11359 14.6513 4.2009 14.2721 4.37052C13.893 4.54014 13.5484 4.78877 13.2582 5.10219L5.15613 13.8536C4.20739 14.9145 3.68242 16.3353 3.69429 17.8102C3.70616 19.2851 4.25391 20.6959 5.21958 21.7388C6.18525 22.7817 7.49156 23.3733 8.85717 23.3861C10.2228 23.3989 11.5384 22.832 12.5207 21.8073L21.3603 12.2617L22.8332 13.8536L13.9947 23.3992C12.6272 24.8761 10.7724 25.7058 8.83842 25.7058C6.90446 25.7058 5.0497 24.8761 3.68218 23.3992C2.31465 21.9223 1.54639 19.9191 1.54639 17.8304C1.54639 15.7418 2.31465 13.7386 3.68218 12.2617L11.7853 3.51144Z" fill="#4D6080" fill-opacity="0.1" />
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
                <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 20.925C16.6455 20.925 19.305 18.954 20.3985 16.2H6.6015C7.6815 18.954 10.3545 20.925 13.5 20.925ZM8.775 12.15C9.31206 12.15 9.82713 11.9367 10.2069 11.5569C10.5867 11.1771 10.8 10.6621 10.8 10.125C10.8 9.58794 10.5867 9.07287 10.2069 8.69311C9.82713 8.31335 9.31206 8.1 8.775 8.1C8.23794 8.1 7.72287 8.31335 7.34311 8.69311C6.96335 9.07287 6.75 9.58794 6.75 10.125C6.75 10.6621 6.96335 11.1771 7.34311 11.5569C7.72287 11.9367 8.23794 12.15 8.775 12.15ZM18.225 12.15C18.7621 12.15 19.2771 11.9367 19.6569 11.5569C20.0367 11.1771 20.25 10.6621 20.25 10.125C20.25 9.58794 20.0367 9.07287 19.6569 8.69311C19.2771 8.31335 18.7621 8.1 18.225 8.1C17.6879 8.1 17.1729 8.31335 16.7931 8.69311C16.4133 9.07287 16.2 9.58794 16.2 10.125C16.2 10.6621 16.4133 11.1771 16.7931 11.5569C17.1729 11.9367 17.6879 12.15 18.225 12.15ZM13.5 24.3C10.6357 24.3 7.88864 23.1621 5.86325 21.1368C3.83785 19.1114 2.7 16.3643 2.7 13.5C2.7 10.6357 3.83785 7.88864 5.86325 5.86325C7.88864 3.83785 10.6357 2.7 13.5 2.7C16.3643 2.7 19.1114 3.83785 21.1368 5.86325C23.1621 7.88864 24.3 10.6357 24.3 13.5C24.3 16.3643 23.1621 19.1114 21.1368 21.1368C19.1114 23.1621 16.3643 24.3 13.5 24.3ZM13.5 0C6.0345 0 0 6.075 0 13.5C0 17.0804 1.42232 20.5142 3.95406 23.0459C5.20765 24.2995 6.69588 25.2939 8.33377 25.9724C9.97167 26.6508 11.7272 27 13.5 27C17.0804 27 20.5142 25.5777 23.0459 23.0459C25.5777 20.5142 27 17.0804 27 13.5C27 11.7272 26.6508 9.97167 25.9724 8.33377C25.2939 6.69588 24.2995 5.20765 23.0459 3.95406C21.7924 2.70047 20.3041 1.70606 18.6662 1.02763C17.0283 0.349188 15.2728 0 13.5 0Z" fill="#4D6080" fill-opacity="0.1" />
                </svg>

              </button>
              <button
                onClick={handleSendMessage}
                className="w-9 h-9 text-white flex items-center justify-center flex-shrink-0 cursor-pointer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C13.5758 0 15.1364 0.31018 16.5922 0.910519C18.048 1.51086 19.371 2.39039 20.4853 3.50468C21.5996 4.61897 22.4791 5.94199 23.0795 7.39778C23.6798 8.85358 23.99 10.4142 23.99 11.99C23.99 13.5658 23.6798 15.1264 23.0795 16.5822C22.4791 18.038 21.5996 19.361 20.4853 20.4753C19.371 21.5896 18.048 22.4691 16.5922 23.0695C15.1364 23.6698 13.5758 23.98 12 23.98C8.8174 23.98 5.76516 22.7157 3.51472 20.4653C1.26428 18.2148 0 15.1626 0 11.98C0 8.79741 1.26428 5.74517 3.51472 3.49472C5.76516 1.24428 8.8174 -0.02 12 -0.02C15.1826 -0.02 18.2348 1.24428 20.4853 3.49472C22.7357 5.74517 24 8.79741 24 11.98C24 13.5558 23.6898 15.1164 23.0895 16.5722C22.4891 18.028 21.6096 19.351 20.4953 20.4653C19.381 21.5796 18.058 22.4591 16.6022 23.0595C15.1464 23.6598 13.5858 23.97 12.01 23.97C10.4342 23.97 8.87358 23.6598 7.41778 23.0595C5.96199 22.4591 4.63897 21.5796 3.52468 20.4653C2.41039 19.351 1.53086 18.028 0.930519 16.5722C0.33018 15.1164 0.02 13.5558 0.02 11.98C0.02 8.79741 1.28428 5.74517 3.53472 3.49472C5.78517 1.24428 8.83741 0 12.02 0H12Z" fill="#003F8F" />
                  <path d="M7.2 6.24V11.25L14.826 12L7.2 12.75V17.76L20.4 12L7.2 6.24Z" fill="white" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Messages;
