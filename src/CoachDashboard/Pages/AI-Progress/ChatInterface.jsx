import React, { useState } from 'react';

const ChatInterface = () => {
  const [message, setMessage] = useState('');

  const chatMessages = [
    { type: 'ai', text: "Hi there, How can I help you?" },
    { type: 'user', text: "create a calendar", isButton: true },
    { type: 'ai', text: "I'll create a beautiful, modern calendar application for you!" },
    { type: 'ai', text: "Design Inspiration: Google Calendar meets modern design - clean interface with vibrant gradients, smooth animations, and an intuitive layout." },
    { type: 'ai', text: "Features:\n• Month view with current date highlighting\n• Add, view, and manage events\n• Navigate between months\n• Event categories with color coding\n• Responsive design" },
    { type: 'user', text: "create the full week workout\nof a person:\nName: john,\nHeight: 5.6,\nWeight: 70kg" },
    { type: 'ai', text: "I'll help you create a comprehensive workout management system integrated with the calendar. This is a multi-system project, so let me first check the available integrations and understand the current structure." }
  ];

  const allSuggestions = [
    "You can also say 'convert this to a 4-week template'",
    "Add RPE to each lift",
    "Generate a GPP phase for new athletes",
    "Create a 4-week strength program",
    "Add mobility drills to Wednesday's workout",
    "Build a 3-day hypertrophy split for beginners"
  ];

  const defaultSuggestion = "You can also say 'convert this to a 4-week template'";
  const trySuggestion = "Try: You can also say 'convert this to a 4-week template'";

  // Filter suggestions based on input
  const filteredSuggestions = message.trim()
    ? allSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(message.toLowerCase())
    ).slice(0, 3)
    : [];

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
  };

  const handleSend = () => {
    if (message.trim()) {
      // Handle send logic here
      console.log('Sending:', message);
      setMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 bg-[#FFFFFF]">
        <h2 className="text-xl font-bold text-[#003F8F] font-[Poppins]">Your Chats</h2>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFFFF]">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'user' ? (
              <div className="bg-[#4D60801A] rounded-lg px-4 py-2 max-w-[80%]">
                <p className="text-sm text-[#003F8F] font-[Inter] font-medium whitespace-pre-line">
                  {msg.text}
                </p>
              </div>
            ) : (
              <div className="max-w-[80%]">
                <p className="text-sm text-gray-700 font-[Inter] whitespace-pre-line">
                  {msg.text}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Suggestions Section */}
      <div className="px-4 pb-4 space-y-2 bg-white">
        {/* Input Field */}
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={defaultSuggestion}
            rows={3}
            className="w-full px-4 pt-4 pb-8 pr-12 bg-[#4D60801A] !border border-[#4D60804D]  rounded-[12px] text-sm text-gray-700 font-[Inter] focus:outline-none focus:ring-2 focus:ring-[#003F8F] resize-none align-top"
          />
          <button
            onClick={handleSend}
            className="absolute right-2 top-1/2 transform -translate-y-1/2  flex items-center justify-center mt-6 transition"
          >
            <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="23" height="23" rx="11.5" fill="#003F8F" />
              <path d="M12.9167 14.3333L15.75 11.5M15.75 11.5L12.9167 8.66663M15.75 11.5H7.25" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

          </button>
        </div>

        {/* Suggestions - Show when typing */}
        {message.trim() && filteredSuggestions.length > 0 && (
          <div className="space-y-2">
            {filteredSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 cursor-pointer hover:bg-blue-100 transition"
              >
                <p className="text-sm text-[#003F8F] font-[Inter] font-medium">
                  {suggestion}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Try Suggestion - Show when input is empty */}
        {!message.trim() && (
          <div className="px-1">
            <p className="text-xs text-gray-600 font-[Inter]">
              {trySuggestion}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;

