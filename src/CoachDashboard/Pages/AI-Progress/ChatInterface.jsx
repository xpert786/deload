import React, { useState, useEffect, useRef, useCallback } from 'react';

// Use API URL from .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const ChatInterface = ({ onWorkoutPlanGenerated, initialMessage, initialAiResponse, skipInitialApiCall = false, externalIsLoading = false }) => {
  const [message, setMessage] = useState('');
  
  // Load messages from localStorage or initialize with default
  const loadMessagesFromStorage = () => {
    try {
      const stored = localStorage.getItem('aiChatMessages');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
    }
    return [{ type: 'ai', text: "Hi there, How can I help you?" }];
  };

  const [chatMessages, setChatMessages] = useState(loadMessagesFromStorage);
  const [isLoading, setIsLoading] = useState(false);
  
  // Combine external loading state (from initial screen) with internal loading state
  const isCurrentlyLoading = isLoading || externalIsLoading;
  const initialMessageSentRef = useRef(false);
  const processedInitialMessageRef = useRef('');
  const messagesEndRef = useRef(null);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('aiChatMessages', JSON.stringify(chatMessages));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
    
    // Auto-scroll to bottom when new messages are added
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Helper function to make API call with retry logic
  const makeApiCallWithRetry = useCallback(async (userMessage, maxRetries = 2) => {
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

    // Validate API_BASE_URL before making request
    if (!API_BASE_URL || !API_BASE_URL.trim()) {
      throw new Error('API_BASE_URL is not configured. Please check your .env file.');
    }

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

    const requestBody = {
      question: userMessage,
      message: userMessage,
      save_to_db: false
    };

    let lastError = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`=== RETRY ATTEMPT ${attempt} ===`);
          // Show retry message to user
          setChatMessages(prev => [...prev, { 
            type: 'ai', 
            text: `Retrying... (Attempt ${attempt + 1}/${maxRetries + 1})` 
          }]);
          // Wait before retrying (exponential backoff: 1s, 2s)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        console.log(`=== API CALL START (Attempt ${attempt + 1}/${maxRetries + 1}) ===`);
        console.log('API URL:', apiUrl);
        console.log('Message:', userMessage);
        console.log('Headers:', headers);
        console.log('Has valid token:', isValidToken);

        let response;
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify(requestBody),
          });
        } catch (fetchError) {
          // Handle network errors (no internet, CORS, etc.)
          console.error('Fetch error (network issue):', fetchError);
          throw new Error(`Network error: ${fetchError.message}. Please check your internet connection.`);
        }

        console.log('=== API RESPONSE ===');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response statusText:', response.statusText);

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
          // Success!
          console.log('=== API CALL SUCCESS ===');
          // Remove retry message if it exists
          setChatMessages(prev => prev.filter(msg => !msg.text.includes('Retrying')));
          return { success: true, data: result.data, message: result.message };
        } else {
          // Handle API errors (non-200 status codes)
          const status = response.status;
          let errorMessage = result.message || result.detail || 'Failed to generate workout plan';
          const errorDetails = result.errors ? JSON.stringify(result.errors) : '';
          
          // Check if this is a Groq API parsing error that we should retry
          const isGroqParsingError = result.detail && (
            result.detail.includes('Failed to parse JSON response from Groq API') ||
            result.detail.includes('Groq API') ||
            result.detail.includes('parse JSON')
          );
          
          // If it's a Groq parsing error and we have retries left, continue to retry
          if (isGroqParsingError && attempt < maxRetries && status >= 500) {
            console.log('Groq API parsing error detected, will retry...');
            lastError = new Error(`Groq API parsing error (attempt ${attempt + 1})`);
            continue; // Retry
          }
          
          // Check for specific error types in detail field
          let detailMessage = '';
          if (result.detail) {
            if (result.detail.includes('Failed to parse JSON response from Groq API')) {
              detailMessage = 'The AI service returned an incomplete response. This usually happens when the response is too long or gets cut off.';
            } else if (result.detail.includes('Groq API')) {
              detailMessage = 'There was an issue with the AI service. Please try again.';
            } else {
              detailMessage = result.detail;
            }
          }
          
          // Add status code to error message for better debugging
          if (status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (status === 403) {
            errorMessage = 'You do not have permission to perform this action.';
          } else if (status === 404) {
            errorMessage = 'API endpoint not found. Please contact support.';
          } else if (status >= 500) {
            // For 500 errors, use detail message if available, otherwise generic message
            if (detailMessage) {
              errorMessage = detailMessage;
            } else {
              errorMessage = 'Server error. Please try again later.';
            }
          } else if (status === 400) {
            errorMessage = errorMessage || 'Invalid request. Please check your input.';
          }
          
          // Combine error message with details
          let fullErrorMessage = errorMessage;
          if (errorDetails && !errorMessage.includes(errorDetails)) {
            fullErrorMessage += ` - ${errorDetails}`;
          }
          fullErrorMessage += ` (Status: ${status})`;
          
          throw new Error(fullErrorMessage);
        }
      } catch (error) {
        lastError = error;
        
        // Check if this is a retryable Groq API error
        const isRetryableGroqError = (
          error.message.includes('Groq') ||
          error.message.includes('parse JSON') ||
          error.message.includes('incomplete response')
        ) && attempt < maxRetries;
        
        if (isRetryableGroqError) {
          console.log(`Retryable error detected (attempt ${attempt + 1}/${maxRetries + 1}), will retry...`);
          continue; // Retry
        }
        
        // If not retryable or out of retries, throw the error
        throw error;
      }
    }
    
    // If we exhausted all retries, throw the last error
    throw lastError || new Error('Failed after all retry attempts');
  }, []);

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
      const result = await makeApiCallWithRetry(messageToSend, 2);
      
      // Success - Add AI response to chat
      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        text: result.message || "Workout plan generated successfully!" 
      }]);

      // Pass workout plan data to parent
      if (onWorkoutPlanGenerated) {
        onWorkoutPlanGenerated(result.data);
      }
    } catch (error) {
      console.error('=== API ERROR ===');
      console.error('Error generating workout plan:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Remove retry messages
      setChatMessages(prev => prev.filter(msg => !msg.text.includes('Retrying')));
      
      // Provide more specific error messages based on error type
      let userFriendlyError = '';
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        userFriendlyError = 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
      } else if (error.message.includes('Failed to parse server response')) {
        userFriendlyError = 'Server response error: The server returned an invalid response. Please try again or contact support.';
      } else if (error.message.includes('Failed to parse JSON response from Groq API') || error.message.includes('incomplete response')) {
        userFriendlyError = 'The AI service returned an incomplete response after multiple attempts. Please try again with a simpler request or break it into smaller parts.';
      } else if (error.message.includes('Groq API')) {
        userFriendlyError = 'There was an issue with the AI service after multiple attempts. Please try again in a moment.';
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        userFriendlyError = 'Authentication error: Please log in again to continue.';
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        userFriendlyError = 'Permission error: You do not have permission to perform this action.';
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        userFriendlyError = 'API endpoint not found. Please contact support.';
      } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        // Check if it's a Groq API parsing error
        if (error.message.includes('Groq') || error.message.includes('parse JSON')) {
          userFriendlyError = 'The AI service had trouble generating a complete response after multiple attempts. Please try again - this is usually a temporary issue.';
        } else {
          userFriendlyError = 'Server error: The server encountered an issue. Please try again later.';
        }
      } else if (!API_BASE_URL) {
        userFriendlyError = 'Configuration error: API URL is not configured. Please contact support.';
      } else {
        userFriendlyError = `Sorry, I encountered an error: ${error.message}. Please try again.`;
      }
      
      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        text: userFriendlyError
      }]);
    } finally {
      setIsLoading(false);
      console.log('=== API CALL END ===');
    }
  }, [onWorkoutPlanGenerated, makeApiCallWithRetry]);

  // Handle initial message and AI response from parent
  useEffect(() => {
    const messageToSend = initialMessage && initialMessage.trim() ? initialMessage.trim() : '';
    const aiResponseToAdd = initialAiResponse && initialAiResponse.trim() ? initialAiResponse.trim() : '';
    
    // Create a unique key for this message/response combo
    const messageKey = `${messageToSend}|${aiResponseToAdd}`;
    
    // Process if we have a message to send
    if (messageToSend) {
      // Only process if this is a new combo (different from what we've already processed)
      const needsUpdate = processedInitialMessageRef.current !== messageKey;
      
      if (needsUpdate) {
        processedInitialMessageRef.current = messageKey;
        setMessage(messageToSend);
        
        // Add messages to chat immediately
        setChatMessages(prev => {
          // Check if user message already exists
          const userMessageExists = prev.some(msg => msg.type === 'user' && msg.text === messageToSend);
          
          // Start with existing messages
          let updated = [...prev];
          
          // Add user message if it doesn't exist
          if (!userMessageExists) {
            updated = [...updated, { type: 'user', text: messageToSend }];
          }
          
          // If we have an AI response, add it (even if user message existed)
          if (aiResponseToAdd) {
            const aiResponseExists = updated.some(msg => msg.type === 'ai' && msg.text === aiResponseToAdd);
            if (!aiResponseExists) {
              updated = [...updated, { type: 'ai', text: aiResponseToAdd }];
            }
          } else if (!skipInitialApiCall && !userMessageExists) {
            // Only call API if not skipped, no AI response provided, and user message was just added
            // Auto-send after a short delay to ensure state is updated
            setTimeout(() => {
              handleSendMessage(messageToSend);
            }, 100);
          }
          
          return updated;
        });
        
        // Mark as sent to prevent duplicate API calls
        if (aiResponseToAdd || skipInitialApiCall) {
          initialMessageSentRef.current = true;
        }
      }
    } else {
      // Reset ref when initialMessage changes to empty (allows resending)
      initialMessageSentRef.current = false;
      processedInitialMessageRef.current = '';
    }
  }, [initialMessage, initialAiResponse, handleSendMessage, skipInitialApiCall]);

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
      if (suggestion.trim() && !isCurrentlyLoading) {
        console.log('Auto-sending suggestion');
        handleSendMessage(suggestion.trim());
        setMessage('');
      }
    }, 100);
  };

  const handleSend = () => {
    console.log('handleSend called', { message: message.trim(), isCurrentlyLoading });
    if (message.trim() && !isCurrentlyLoading) {
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
        {isCurrentlyLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <p className="text-sm text-gray-500 font-[Inter] italic">
                Generating workout plan...
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
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
              console.log('Key pressed:', e.key, { message, isCurrentlyLoading, messageTrimmed: message.trim() });
              if (e.key === 'Enter' && !e.shiftKey && !isCurrentlyLoading && message.trim()) {
                e.preventDefault();
                console.log('Enter key pressed, sending message');
                handleSend();
              }
            }}
            disabled={isCurrentlyLoading}
            placeholder={defaultSuggestion}
            rows={3}
            className="w-full px-4 pt-4 pb-8 pr-12 bg-[#4D60801A] !border border-[#4D60804D]  rounded-[12px] text-sm text-gray-700 font-[Inter] focus:outline-none focus:ring-2 focus:ring-[#003F8F] resize-none align-top"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Button clicked', { message, isCurrentlyLoading, messageTrimmed: message.trim() });
              if (!isCurrentlyLoading && message.trim()) {
                handleSend();
              } else {
                console.log('Button click ignored - disabled state');
              }
            }}
            disabled={isCurrentlyLoading || !message.trim()}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center mt-6 transition z-10 ${isCurrentlyLoading || !message.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
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


