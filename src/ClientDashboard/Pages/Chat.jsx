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
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="space-y-6 px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 bg-[#F7F7F7] min-h-[100vh] overflow-y-auto hide-scrollbar">
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
                  className="w-10 h-10 rounded-full "
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

            <div className="p-4 sm:p-6 flex-1 overflow-y-auto hide-scrollbar">
              {/* Date Separator */}
              <div className="flex items-center justify-center mb-6">
                <span className="px-4 py-2 text-xs font-semibold text-white bg-[#003F8F] rounded-lg">TODAY</span>
              </div>

              {/* Messages */}
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'trainer' ? 'justify-start' : 'justify-end'}`}
                  >
                    {message.type === 'trainer' && (
                      <div className="flex items-start gap-2 max-w-[70%]">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                          <img
                            src={ChatImage}
                            alt="trainer"
                            className="w-8 h-8 rounded-full"
                          />
                        </div>
                        {/* Message Bubble and Timestamp */}
                        <div className="flex flex-col items-start">
                          <div className="rounded-2xl px-4 py-3 text-sm font-[Inter] bg-[#F3701EB2] text-white leading-relaxed break-words whitespace-normal max-w-xs sm:max-w-sm">
                            {message.text}
                          </div>
                          {/* Timestamp */}
                          <div className="mt-1.5">
                            <span className="text-xs text-gray-500 font-[Inter]">{message.time}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {message.type === 'client' && (
                      <div className="flex items-start gap-2 max-w-[70%]">
                        {/* Message Bubble and Timestamp */}
                        <div className="flex flex-col items-end">
                          <div className="rounded-2xl px-4 py-3 text-sm font-[Inter] bg-[#003F8FB2] text-white leading-relaxed break-words whitespace-normal max-w-xs sm:max-w-sm">
                            {message.text}
                          </div>
                          {/* Timestamp */}
                          <div className="mt-1.5">
                            <span className="text-xs text-gray-500 font-[Inter]">{message.time}</span>
                          </div>
                        </div>
                        {/* Profile Picture with Checkmarks */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          {/* Read Receipts */}
                          <div className="flex items-center gap-0.5">
                            <svg width="30" height="32" viewBox="0 0 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3.28125 19.5L7.96875 24.5M14.5312 16.5L19.2188 11.5M10.7812 19.5L15.4688 24.5L26.7188 11.5" stroke="#003F8F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          {/* Profile Picture */}
                          <img
                            src="https://i.pravatar.cc/60?img=25"
                            alt="client"
                            className="w-8 h-8 rounded-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-4 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-[20px] px-4 py-3">
                {/* Attachment Icon */}
                <button className="text-gray-400 hover:text-gray-600 flex-shrink-0 cursor-pointer">
                  <svg width="25" height="27" viewBox="0 0 25 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.7853 3.51144C12.2667 2.97827 12.8413 2.55365 13.4758 2.26219C14.1103 1.97074 14.7921 1.81825 15.4816 1.81359C16.1711 1.80892 16.8546 1.95217 17.4925 2.23501C18.1303 2.51786 18.7098 2.93467 19.1974 3.46128C19.6849 3.98789 20.0708 4.61381 20.3326 5.30273C20.5944 5.99164 20.7269 6.72985 20.7225 7.47452C20.7181 8.21919 20.5768 8.9555 20.3068 9.64073C20.0369 10.326 19.6436 10.9465 19.1499 11.4663L11.0488 20.2166C10.7596 20.5342 10.4149 20.7868 10.0348 20.9599C9.65466 21.1329 9.24657 21.223 8.83405 21.2248C8.42153 21.2267 8.01275 21.1404 7.63129 20.9707C7.24983 20.8011 6.90324 20.5516 6.61151 20.2366C6.31977 19.9216 6.08868 19.5474 5.93154 19.1355C5.77441 18.7235 5.69435 18.2821 5.69598 17.8365C5.69761 17.391 5.7809 16.9502 5.94105 16.5397C6.10119 16.1291 6.33502 15.7568 6.62905 15.4443L14.7311 6.69406L16.204 8.28481L8.10197 17.0351C8.00248 17.1388 7.92312 17.263 7.86853 17.4002C7.81394 17.5375 7.7852 17.6851 7.784 17.8345C7.7828 17.9839 7.80915 18.132 7.86153 18.2703C7.9139 18.4085 7.99125 18.5341 8.08906 18.6398C8.18686 18.7454 8.30316 18.8289 8.43118 18.8855C8.5592 18.9421 8.69636 18.9705 8.83468 18.9692C8.97299 18.9679 9.10968 18.9369 9.23676 18.8779C9.36385 18.819 9.47879 18.7333 9.57488 18.6258L17.678 9.87557C17.9682 9.56214 18.1984 9.19005 18.3555 8.78054C18.5125 8.37104 18.5934 7.93213 18.5934 7.48888C18.5934 7.04563 18.5125 6.60672 18.3555 6.19721C18.1984 5.7877 17.9682 5.41561 17.678 5.10219C17.3878 4.78877 17.0433 4.54014 16.6641 4.37052C16.2849 4.2009 15.8785 4.11359 15.4681 4.11359C15.0577 4.11359 14.6513 4.2009 14.2721 4.37052C13.893 4.54014 13.5484 4.78877 13.2582 5.10219L5.15613 13.8536C4.20739 14.9145 3.68242 16.3353 3.69429 17.8102C3.70616 19.2851 4.25391 20.6959 5.21958 21.7388C6.18525 22.7817 7.49156 23.3733 8.85717 23.3861C10.2228 23.3989 11.5384 22.832 12.5207 21.8073L21.3603 12.2617L22.8332 13.8536L13.9947 23.3992C12.6272 24.8761 10.7724 25.7058 8.83842 25.7058C6.90446 25.7058 5.0497 24.8761 3.68218 23.3992C2.31465 21.9223 1.54639 19.9191 1.54639 17.8304C1.54639 15.7418 2.31465 13.7386 3.68218 12.2617L11.7853 3.51144Z" fill="#4D6080" fillOpacity="0.1" />
                  </svg>
                </button>
                {/* Input Field */}
                <input
                  type="text"
                  placeholder="Type a message"
                  className="flex-1 py-1 text-sm text-gray-700 font-[Inter] focus:outline-none bg-transparent"
                />
                {/* Emoji Icon */}
                <button className="text-gray-400  cursor-pointer">
                  <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 20.925C16.6455 20.925 19.305 18.954 20.3985 16.2H6.6015C7.6815 18.954 10.3545 20.925 13.5 20.925ZM8.775 12.15C9.31206 12.15 9.82713 11.9367 10.2069 11.5569C10.5867 11.1771 10.8 10.6621 10.8 10.125C10.8 9.58794 10.5867 9.07287 10.2069 8.69311C9.82713 8.31335 9.31206 8.1 8.775 8.1C8.23794 8.1 7.72287 8.31335 7.34311 8.69311C6.96335 9.07287 6.75 9.58794 6.75 10.125C6.75 10.6621 6.96335 11.1771 7.34311 11.5569C7.72287 11.9367 8.23794 12.15 8.775 12.15ZM18.225 12.15C18.7621 12.15 19.2771 11.9367 19.6569 11.5569C20.0367 11.1771 20.25 10.6621 20.25 10.125C20.25 9.58794 20.0367 9.07287 19.6569 8.69311C19.2771 8.31335 18.7621 8.1 18.225 8.1C17.6879 8.1 17.1729 8.31335 16.7931 8.69311C16.4133 9.07287 16.2 9.58794 16.2 10.125C16.2 10.6621 16.4133 11.1771 16.7931 11.5569C17.1729 11.9367 17.6879 12.15 18.225 12.15ZM13.5 24.3C10.6357 24.3 7.88864 23.1621 5.86325 21.1368C3.83785 19.1114 2.7 16.3643 2.7 13.5C2.7 10.6357 3.83785 7.88864 5.86325 5.86325C7.88864 3.83785 10.6357 2.7 13.5 2.7C16.3643 2.7 19.1114 3.83785 21.1368 5.86325C23.1621 7.88864 24.3 10.6357 24.3 13.5C24.3 16.3643 23.1621 19.1114 21.1368 21.1368C19.1114 23.1621 16.3643 24.3 13.5 24.3ZM13.5 0C6.0345 0 0 6.075 0 13.5C0 17.0804 1.42232 20.5142 3.95406 23.0459C5.20765 24.2995 6.69588 25.2939 8.33377 25.9724C9.97167 26.6508 11.7272 27 13.5 27C17.0804 27 20.5142 25.5777 23.0459 23.0459C25.5777 20.5142 27 17.0804 27 13.5C27 11.7272 26.6508 9.97167 25.9724 8.33377C25.2939 6.69588 24.2995 5.20765 23.0459 3.95406C21.7924 2.70047 20.3041 1.70606 18.6662 1.02763C17.0283 0.349188 15.2728 0 13.5 0Z" fill="#4D6080" fillOpacity="0.1" />
                  </svg>
                </button>
                {/* Send Button */}
                <button className="text-white flex items-center justify-center flex-shrink-0 cursor-pointer  transition-colors">
                  <svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 0C15.8385 0 17.659 0.349188 19.3576 1.02763C21.0561 1.70606 22.5995 2.70047 23.8995 3.95406C25.1995 5.20765 26.2307 6.69588 26.9343 8.33377C27.6379 9.97167 28 11.7272 28 13.5C28 17.0804 26.525 20.5142 23.8995 23.0459C21.274 25.5777 17.713 27 14 27C12.1615 27 10.341 26.6508 8.64243 25.9724C6.94387 25.2939 5.40053 24.2995 4.1005 23.0459C1.475 20.5142 0 17.0804 0 13.5C0 9.91958 1.475 6.4858 4.1005 3.95406C6.72601 1.42232 10.287 0 14 0ZM8.4 7.7085V12.2175L18.396 13.5L8.4 14.7825V19.2915L22.4 13.5L8.4 7.7085Z" fill="#003F8F" />
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
              <div className="space-y-0 text-sm text-gray-600 font-[Inter]">
                <div className="flex items-center justify-between mx-[30px] py-3 border-b border-gray-200">
                  <p className="text-xs uppercase font-bold text-gray-400">Tel:</p>
                  <p className="text-gray-600 font-sm">092 365 4165</p>
                </div>
                <div className="flex items-center justify-between gap-2 mx-[30px] py-3 border-b border-gray-200">
                  <p className="text-xs uppercase font-bold text-gray-400">Date of Birth:</p>
                  <p className="text-gray-600 font-sm">March 5, 1995</p>
                </div>
                <div className="flex items-center justify-between gap-2 mx-[30px] py-3">
                  <p className="text-xs uppercase font-bold text-gray-400">Language</p>
                  <p className="text-gray-600 font-sm">English, French</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;

