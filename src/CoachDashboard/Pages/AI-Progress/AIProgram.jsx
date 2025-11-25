import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from './ChatInterface';
import WorkoutPlan from './WorkoutPlan';

const PLACEHOLDER_TEXTS = [
  "Ask me to build a 3-day hypertrophy split for beginners.",
  "Say 'add mobility drills to Wednesday's workout'",
  "Try 'generate a deload week with lighter intensity.'",
  "You can also say 'convert this to a 4-week template."
];

const BOTTOM_TEXTS = [
  "Try: Ask me to build a 3-day hypertrophy split for beginners.",
  "Try: Say 'add mobility drills to Wednesday's workout'",
  "Try: Generate a deload week with lighter intensity.",
  "Try: Convert this to a 4-week template."
];

const SUGGESTIONS = [
  "Transition this client to a deload week.",
  "Add RPE to each lift.",
  "Generate a GPP phase for new athletes.",
  "Create a 4-week strength program.",
  "Add mobility drills to Wednesday's workout",
  "Build a 3-day hypertrophy split for beginners."
];

const AIProgram = () => {
  const navigate = useNavigate();
  const [showRotatingText, setShowRotatingText] = useState(true);
  const [currentPlaceholderText, setCurrentPlaceholderText] = useState(0);
  const [currentBottomText, setCurrentBottomText] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isHoveringBottomText, setIsHoveringBottomText] = useState(false);

  const handleCopyText = (text) => {
    // Remove "Try: " prefix if present
    const cleanText = text.replace(/^Try: /, '');
    navigator.clipboard.writeText(cleanText);
    // Don't auto-paste, let user paste manually
  };

  useEffect(() => {
    if (!showRotatingText) return;

    // Rotate placeholder text every 3 seconds
    const placeholderInterval = setInterval(() => {
      setCurrentPlaceholderText((prev) => {
        return (prev + 1) % PLACEHOLDER_TEXTS.length;
      });
    }, 3000);

    // Rotate bottom text every 3 seconds  
    const bottomInterval = setInterval(() => {
      setCurrentBottomText((prev) => {
        return (prev + 1) % BOTTOM_TEXTS.length;
      });
    }, 3000);

    return () => {
      clearInterval(placeholderInterval);
      clearInterval(bottomInterval);
    };
  }, [showRotatingText]);

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
      e.preventDefault();
      setShowRotatingText(false);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    setInputValue(pastedText);
  };

  const handleSendClick = () => {
    if (inputValue.trim()) {
      setShowRotatingText(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  // Filter suggestions based on input
  const filteredSuggestions = inputValue.trim()
    ? SUGGESTIONS.filter(suggestion =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 3)
    : SUGGESTIONS.slice(0, 3);

  if (showRotatingText) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-4xl w-full my-auto">
          <h1 className="text-[37px] sm:text-[37px] font-semibold text-[#003F8F] font-[Poppins] mb-2 text-left">
            Chat with your programming assistant
          </h1>
          <p className="text-[22px] text-gray-600 font-[Inter] mb-8 text-left ml-8">
            The AI understands goals, training phases, and exercise intent
          </p>

          {/* Main Input Field */}
          <div className="relative mb-6">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleInputKeyPress}
              onPaste={handlePaste}
              placeholder={PLACEHOLDER_TEXTS[currentPlaceholderText]}
              rows={3}
              className="w-full px-5 pt-4 pb-8 h-[100px] pr-16 !border border-[#4D60804D] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#003F8F] text-base text-gray-700 font-[Inter] bg-gray-100 placeholder:text-gray-500 resize-none align-top"
            />
            <button
              onClick={handleSendClick}
              className="absolute right-2 top-1/2 transform -translate-y-1/2  flex items-center justify-center cursor-pointer mt-6"
            >
              <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="23" height="23" rx="11.5" fill="#003F8F" />
                <path d="M12.9167 14.3333L15.75 11.5M15.75 11.5L12.9167 8.66663M15.75 11.5H7.25" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
              </svg>

            </button>
          </div>

          {/* Suggestions - Show when typing */}
          {inputValue.trim() && filteredSuggestions.length > 0 && (
            <div className="mt-4 space-y-2">
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full bg-blue-50 border border-blue-100 rounded-lg px-5 py-3 cursor-pointer hover:bg-blue-100 transition"
                >
                  <p className="text-sm text-[#003F8F] font-[Inter] font-medium">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Rotating Bottom Text Box with Copy Option - Show when input is empty */}
          {!inputValue.trim() && (
            <div className="mt-4">
              <div
                className="relative w-full min-h-[28px] flex items-center justify-between cursor-pointer hover:bg-gray-200 transition"
                onMouseEnter={() => setIsHoveringBottomText(true)}
                onMouseLeave={() => setIsHoveringBottomText(false)}
              >
                <p className="text-sm text-gray-600 font-[Inter] text-center flex-1 transition-opacity duration-500">
                  {BOTTOM_TEXTS[currentBottomText]}
                </p>
                {isHoveringBottomText && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyText(BOTTOM_TEXTS[currentBottomText]);
                    }}
                    className="ml-2 w-8 h-8 bg-[#003F8F] text-white rounded-full flex items-center justify-center hover:bg-[#002F6F] transition flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="8" height="8" rx="1" stroke="white" strokeWidth="1.2" fill="none" />
                      <rect x="5" y="5" width="8" height="8" rx="1" stroke="white" strokeWidth="1.2" fill="none" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F7F7F7] flex gap-4 p-4">
      {/* Chat Interface - Left Side */}
      <div className="w-1/3 bg-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <ChatInterface />
      </div>

      {/* Workout Plan - Right Side */}
      <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
        <WorkoutPlan onBack={() => setShowRotatingText(true)} />
      </div>
    </div>
  );
};

export default AIProgram;

