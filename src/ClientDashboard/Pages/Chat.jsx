import React from 'react';
import ChatImage from "../../assets/chatprofile.png";
import { FacebookIcon, InformationIcon, LinkedInIcon, SkypeIcon } from '../Components/icons';
const messages = [
  {
    id: 1,
    type: 'trainer',
    text: "Absolutely! 🍦 I'm all in for ice cream. I'll bring my favorite flavors. What's your preference?",
    time: '3:37 PM'
  },
  {
    id: 2,
    type: 'client',
    text: 'Awesome! 🧁 I love chocolate chip cookie dough. Looking forward to pizza party on friday!!',
    time: '3:28 PM'
  },
  {
    id: 3,
    type: 'trainer',
    text: "Absolutely! 🍦 I'm all in for ice cream. I'll bring my favorite flavors. What's your preference?",
    time: '3:37 PM'
  },
  {
    id: 4,
    type: 'client',
    text: 'Awesome! 🧁 I love chocolate chip cookie dough. Looking forward to pizza party on friday!!',
    time: '3:28 PM'
  },
  {
    id: 5,
    type: 'trainer',
    text: "nice",
    time: '3:37 PM'
  },
  {
    id: 6,
    type: 'client',
    text: 'great!',
    time: '3:28 PM'
  },
  {
    id: 7,
    type: 'trainer',
    text: "Absolutely! 🍦 I'm all in for ice cream. I'll bring my favorite flavors. What's your preference?",
    time: '3:37 PM'
  },
  {
    id: 8,
    type: 'client',
    text: 'Awesome! 🧁 I love chocolate chip cookie dough. Looking forward to pizza party on friday!!',
    time: '3:28 PM'
  },
  {
    id: 9,
    type: 'trainer',
    text: "nice",
    time: '3:37 PM'
  },
  {
    id: 10,
    type: 'client',
    text: 'great!',
    time: '3:28 PM'
  },
];

const Chat = () => {
  return (
    <div className="space-y-6 p-4 sm:p-6 bg-[#F7F7F7] min-h-[100vh] overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col lg:items-start lg:justify-between gap-4 sm:items-center">
        <div>
          <p className="text-2xl sm:text-3xl font-medium text-[#003F8F] font-[Poppins]">Chats</p>
          <p className="text-gray-600 font-[Inter]">Drill down into any session for details.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.25 12.25L9.74167 9.74167M11.0833 6.41667C11.0833 8.99399 8.99399 11.0833 6.41667 11.0833C3.83934 11.0833 1.75 8.99399 1.75 6.41667C1.75 3.83934 3.83934 1.75 6.41667 1.75C8.99399 1.75 11.0833 3.83934 11.0833 6.41667Z" stroke="#4D6080" strokeOpacity="0.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <input
            placeholder="Search workout..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] text-sm text-gray-600 font-[Inter]"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        {/* Chat conversation */}
        <div
          className="bg-white rounded-2xl flex flex-col border border-gray-100"
          style={{ minHeight: '70vh', maxHeight: 'calc(100vh - 220px)' }}
        >
          <div className="bg-[#003F8F] text-white rounded-t-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={ChatImage}
                alt="Trainer"
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <div>
                <p className="font-semibold font-[Inter]">Trainer</p>
                <p className="text-xs text-white/80 font-[Inter]">Online</p>
              </div>
            </div>
            <button className="text-white/80 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-center">
              <span className="px-4 py-1 text-xs font-semibold text-white bg-[#003F8F] rounded-full">TODAY</span>
            </div>

            {messages.map((message) => (
              <div key={message.id} className={`flex items-start gap-3 ${message.type === 'client' ? 'justify-end' : ''}`}>
                {message.type === 'trainer' && (
                  <img src={ChatImage} alt="trainer" className="w-9 h-9 rounded-full" />
                )}
                <div className="max-w-[80%]">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm text-white font-[Inter] ${message.type === 'trainer' ? 'bg-[#FF9557]' : 'bg-[#174B8F]'
                      }`}
                  >
                    {message.text}
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 font-[Inter] ${message.type === 'client' ? 'text-right' : ''}`}>
                    {message.time}
                  </p>
                </div>
                {message.type === 'client' && (
                  <img src="https://i.pravatar.cc/60?img=25" alt="client" className="w-9 h-9 rounded-full" />
                )}
              </div>
            ))}
          </div>

          <div className="px-4 sm:px-6 pb-4 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-3 border border-gray-200 rounded-full px-4">
              <button className="text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.75v14.5m7.25-7.25H4.75" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Type a message"
                className="flex-1 py-3 text-sm text-gray-600 font-[Inter] focus:outline-none"
              />
              <button className="text-[#003F8F]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h13M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Profile info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center gap-4 border-t border-gray-200">
            <img
              src={ChatImage}
              alt="Coach"
              className="w-24 h-24 rounded-full object-cover border-4 border-[#E6ECF5]"
            />
            <div>
              <p className="text-xl font-semibold text-[#003F8F] font-[Poppins]">Michal Roy</p>
              <p className="text-sm text-gray-500 font-[Inter]">New York, USA</p>
            </div>
            <div className="flex items-center justify-center gap-4 text-[#003F8F]">
              <button className="hover:text-[#174B8F]">
                <FacebookIcon />
              </button>
              <button className="hover:text-[#174B8F]">
                <LinkedInIcon />
              </button>
              <button className="hover:text-[#174B8F]">
                <SkypeIcon />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2">
              <InformationIcon />
              <p className="text-lg font-medium text-gray-500 font-[Poppins] text-center">Information</p>
            </div>
            <div className="space-y-4 text-sm text-gray-600 font-[Inter]">
              <div className="flex items-center justify-between mx-[30px]">
                <p className="text-xs uppercase font-bold text-gray-400">Tel:</p>
                <p className="text-gray-600 font-sm">092 365 4165</p>
              </div>
              <div className="flex items-center justify-between gap-2 mx-[30px]">
                <p className="text-xs uppercase font-bold text-gray-400">Date of Birth:</p>
                <p className="text-gray-600 font-sm">March 5, 1995</p>
              </div>
              <div className="flex items-center justify-between gap-2 mx-[30px]">
                <p className="text-xs uppercase font-bold text-gray-400">Language</p>
                <p className="text-gray-600 font-sm">English, French</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

