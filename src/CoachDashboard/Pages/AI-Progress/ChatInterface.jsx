import React, { useState, useEffect, useRef, useCallback } from 'react';

// Use API URL from .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const ChatInterface = ({ onWorkoutPlanGenerated, initialMessage, skipInitialApiCall = false }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { type: 'ai', text: "Hi there, How can I help you?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const initialMessageSentRef = useRef(false);

  // API call function - extracted for reuse
  const handleSendMessage = useCallback(async (userMessage) => {
    if (!userMessage || !userMessage.trim()) {
      return;
    }

    const messageToSend = userMessage.trim();
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { type: 'user', text: messageToSend }]);
    setIsLoading(true);

    try {
      // Get authentication token
      let token = null;
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token || userData.access_token || userData.authToken || userData.accessToken;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      }

      const isValidToken = token &&
        typeof token === 'string' &&
        token.trim().length > 0 &&
        token.trim() !== 'null' &&
        token.trim() !== 'undefined' &&
        token.trim() !== '';

      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      // Check if baseUrl already includes /api, if not add it
      const apiUrl = baseUrl.includes('/api') 
        ? `${baseUrl}/generate-workout-plan/`
        : `${baseUrl}/api/generate-workout-plan/`;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      console.log('=== API CALL START ===');
      console.log('API URL:', apiUrl);
      console.log('Message:', messageToSend);
      console.log('Headers:', headers);

      // Call API
      console.log('Making fetch request...');
      const requestBody = {
        question: messageToSend,
        message: messageToSend,
        save_to_db: false
      };
      console.log('Request body:', requestBody);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      console.log('=== API RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      let result;
      try {
        const responseText = await response.text();
        console.log('API Response text:', responseText);
        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = {};
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Failed to parse server response');
      }

      if (response.ok && result.data) {
        // Add AI response to chat
        setChatMessages(prev => [...prev, { 
          type: 'ai', 
          text: result.message || "Workout plan generated successfully!" 
        }]);

        // Pass workout plan data to parent
        if (onWorkoutPlanGenerated) {
          onWorkoutPlanGenerated(result.data);
        }
      } else {
        // Handle validation errors
        const errorMessage = result.message || 'Failed to generate workout plan';
        const errorDetails = result.errors ? JSON.stringify(result.errors) : '';
        throw new Error(errorMessage + (errorDetails ? ` - ${errorDetails}` : ''));
      }
    } catch (error) {
      console.error('=== API ERROR ===');
      console.error('Error generating workout plan:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        text: `Sorry, I encountered an error: ${error.message}. Please check the console for details.` 
      }]);
    } finally {
      setIsLoading(false);
      console.log('=== API CALL END ===');
    }
  }, [onWorkoutPlanGenerated]);

  // Handle initial message from parent
  useEffect(() => {
    if (initialMessage && initialMessage.trim() && !initialMessageSentRef.current && !isLoading) {
      initialMessageSentRef.current = true;
      const messageToSend = initialMessage.trim();
      setMessage(messageToSend);
      
      // Add user message to chat
      setChatMessages(prev => [...prev, { type: 'user', text: messageToSend }]);
      
      // Only call API if not skipped (i.e., if API wasn't already called from initial screen)
      if (!skipInitialApiCall) {
        // Auto-send after a short delay to ensure state is updated
        setTimeout(() => {
          if (!isLoading) {
            handleSendMessage(messageToSend);
          }
        }, 200);
      }
    }
    
    // Reset ref when initialMessage changes to empty (allows resending)
    if (!initialMessage || !initialMessage.trim()) {
      initialMessageSentRef.current = false;
    }
  }, [initialMessage, handleSendMessage, isLoading, skipInitialApiCall]);

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
    console.log('Suggestion clicked:', suggestion);
    setMessage(suggestion);
    // Auto-send when suggestion is clicked
    setTimeout(() => {
      if (suggestion.trim() && !isLoading) {
        console.log('Auto-sending suggestion');
        handleSendMessage(suggestion.trim());
        setMessage('');
      }
    }, 100);
  };

  const handleSend = () => {
    console.log('handleSend called', { message: message.trim(), isLoading });
    if (message.trim() && !isLoading) {
      const userMessage = message.trim();
      console.log('Sending message:', userMessage);
      setMessage('');
      handleSendMessage(userMessage);
    } else {
      console.log('Cannot send - message empty or loading');
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
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <p className="text-sm text-gray-500 font-[Inter] italic">
                Generating workout plan...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions Section */}
      <div className="px-4 pb-4 space-y-2 bg-white">
        {/* Input Field */}
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => {
              const newValue = e.target.value;
              console.log('Message changed:', newValue);
              setMessage(newValue);
            }}
            onKeyDown={(e) => {
              console.log('Key pressed:', e.key, { message, isLoading, messageTrimmed: message.trim() });
              if (e.key === 'Enter' && !e.shiftKey && !isLoading && message.trim()) {
                e.preventDefault();
                console.log('Enter key pressed, sending message');
                handleSend();
              }
            }}
            disabled={isLoading}
            placeholder={defaultSuggestion}
            rows={3}
            className="w-full px-4 pt-4 pb-8 pr-12 bg-[#4D60801A] !border border-[#4D60804D]  rounded-[12px] text-sm text-gray-700 font-[Inter] focus:outline-none focus:ring-2 focus:ring-[#003F8F] resize-none align-top"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Button clicked', { message, isLoading, messageTrimmed: message.trim() });
              if (!isLoading && message.trim()) {
                handleSend();
              } else {
                console.log('Button click ignored - disabled state');
              }
            }}
            disabled={isLoading || !message.trim()}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center mt-6 transition z-10 ${isLoading || !message.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
            type="button"
            aria-label="Send message"
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


