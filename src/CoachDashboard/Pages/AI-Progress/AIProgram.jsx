import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from './ChatInterface';
import WorkoutPlan from './WorkoutPlan';

// Use API URL from .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

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
  
  // Load workout plan data from localStorage on mount
  const loadWorkoutPlanFromStorage = () => {
    try {
      const stored = localStorage.getItem('aiWorkoutPlanData');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading workout plan from localStorage:', error);
    }
    return null;
  };

  // Check if there are existing chat messages
  const hasExistingChatMessages = () => {
    try {
      const stored = localStorage.getItem('aiChatMessages');
      if (stored) {
        const messages = JSON.parse(stored);
        // Check if there are any user messages (not just the default AI message)
        const userMessages = messages.filter(msg => msg.type === 'user');
        return userMessages.length > 0;
      }
    } catch (error) {
      console.error('Error loading chat messages from localStorage:', error);
    }
    return false;
  };

  // Initialize state - check if we have stored workout plan data or chat messages
  // For new coach's first chat, show the initial interface page
  const storedWorkoutPlan = loadWorkoutPlanFromStorage();
  const hasChatHistory = hasExistingChatMessages();
  // Show initial screen if no workout plan AND no chat history (new coach's first visit)
  const [showRotatingText, setShowRotatingText] = useState(!storedWorkoutPlan && !hasChatHistory);
  const [currentPlaceholderText, setCurrentPlaceholderText] = useState(0);
  const [currentBottomText, setCurrentBottomText] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isHoveringBottomText, setIsHoveringBottomText] = useState(false);
  const [workoutPlanData, setWorkoutPlanData] = useState(storedWorkoutPlan);
  const [initialMessage, setInitialMessage] = useState('');
  const [initialAiResponse, setInitialAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Save workout plan data to localStorage whenever it changes
  useEffect(() => {
    if (workoutPlanData) {
      try {
        localStorage.setItem('aiWorkoutPlanData', JSON.stringify(workoutPlanData));
      } catch (error) {
        console.error('Error saving workout plan to localStorage:', error);
      }
    } else {
      // Remove from localStorage if workout plan is cleared
      localStorage.removeItem('aiWorkoutPlanData');
    }
  }, [workoutPlanData]);

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

  const handleWorkoutPlanGenerated = (data) => {
    setWorkoutPlanData(data);
    setShowRotatingText(false);
    // Save to localStorage
    try {
      localStorage.setItem('aiWorkoutPlanData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving workout plan to localStorage:', error);
    }
  };

  const handleWorkoutPlanUpdated = (data) => {
    // Update workout plan data when it's updated via PUT API
    setWorkoutPlanData(data);
    // Save updated data to localStorage
    try {
      localStorage.setItem('aiWorkoutPlanData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving updated workout plan to localStorage:', error);
    }
    console.log('Workout plan updated in parent component');
  };

  const handleWorkoutPlanDeleted = () => {
    // Set workout plan data to empty structure to keep the view visible
    // This allows the user to stay on the workout plan page with empty state
    const emptyWorkoutPlan = {
      id: null,
      title: "Client's Weekly Workout Plan",
      description: '',
      days: [
        { day: 'monday', workout_name: '', exercises: [], is_rest_day: false },
        { day: 'tuesday', workout_name: '', exercises: [], is_rest_day: false },
        { day: 'wednesday', workout_name: '', exercises: [], is_rest_day: false },
        { day: 'thursday', workout_name: '', exercises: [], is_rest_day: false },
        { day: 'friday', workout_name: '', exercises: [], is_rest_day: false },
        { day: 'saturday', workout_name: '', exercises: [], is_rest_day: false },
        { day: 'sunday', workout_name: 'Rest Day', exercises: [], is_rest_day: true }
      ]
    };
    setWorkoutPlanData(emptyWorkoutPlan);
    // Clear from localStorage since plan is deleted
    localStorage.removeItem('aiWorkoutPlanData');
    // Keep showRotatingText false so we stay on the workout plan view
    setShowRotatingText(false);
    console.log('Workout plan deleted in parent component, showing empty state');
  };

  // Helper function to make API call with retry logic
  const makeApiCallWithRetry = async (userMessage, maxRetries = 2) => {
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
  };

  // API call function for initial screen
  const handleInitialSend = async () => {
    console.log('handleInitialSend called', { inputValue, isLoading });
    if (inputValue.trim() && !isLoading) {
      const userMessage = inputValue.trim();
      console.log('Starting API call with message:', userMessage);
      setIsLoading(true);
      setShowRotatingText(false); // Switch to chat view immediately
      setInitialMessage(userMessage); // Pass message to ChatInterface

      try {
        const result = await makeApiCallWithRetry(userMessage, 2);
        
        // Success - pass workout plan data to WorkoutPlan
        setWorkoutPlanData(result.data);
        // Store the AI response message
        const aiResponseMessage = result.message || "Your personalized workout plan has been generated and saved successfully! The plan is ready for review and can be edited before assigning to a client.";
        setInitialAiResponse(aiResponseMessage);
        // Save to localStorage
        try {
          localStorage.setItem('aiWorkoutPlanData', JSON.stringify(result.data));
        } catch (error) {
          console.error('Error saving workout plan to localStorage:', error);
        }
        console.log('Workout plan generated successfully from initial screen');
      } catch (error) {
        console.error('=== INITIAL SCREEN API ERROR ===');
        console.error('Error generating workout plan:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
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
        
        // Store error message as AI response
        setInitialAiResponse(userFriendlyError);
      } finally {
        setIsLoading(false);
        console.log('=== INITIAL SCREEN API CALL END ===');
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    setInputValue(pastedText);
  };

  const handleSendClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Send button clicked', { inputValue, isLoading });
    if (inputValue.trim() && !isLoading) {
      handleInitialSend();
    } else {
      console.log('Cannot send - input empty or loading');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    // Auto-send when suggestion is clicked
    setTimeout(() => {
      if (suggestion.trim() && !isLoading) {
        handleInitialSend();
      }
    }, 100);
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

          {/* Loading Indicator */}
          {isLoading && (
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-600 font-[Inter] italic">
                Generating workout plan...
              </p>
            </div>
          )}

          {/* Main Input Field */}
          <div className="relative mb-6">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && inputValue.trim() && !isLoading) {
                  e.preventDefault();
                  handleInitialSend();
                }
              }}
              onPaste={handlePaste}
              disabled={isLoading}
              placeholder={PLACEHOLDER_TEXTS[currentPlaceholderText]}
              rows={3}
              className="w-full px-5 pt-4 pb-8 h-[100px] pr-16 !border border-[#4D60804D] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#003F8F] text-base text-gray-700 font-[Inter] bg-gray-100 placeholder:text-gray-500 resize-none align-top"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('=== BUTTON CLICKED ===');
                console.log('Button onClick triggered', { 
                  inputValue, 
                  inputValueTrimmed: inputValue.trim(), 
                  isLoading,
                  canSend: inputValue.trim() && !isLoading
                });
                if (inputValue.trim() && !isLoading) {
                  console.log('Calling handleSendClick...');
                  handleSendClick(e);
                } else {
                  console.log('Button click ignored - disabled state');
                }
              }}
              disabled={isLoading || !inputValue.trim()}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center mt-6 transition z-10 pointer-events-auto ${isLoading || !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
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
        <ChatInterface 
          onWorkoutPlanGenerated={handleWorkoutPlanGenerated}
          initialMessage={initialMessage}
          initialAiResponse={initialAiResponse}
          skipInitialApiCall={isLoading || workoutPlanData !== null}
          externalIsLoading={isLoading}
        />
      </div>

      {/* Workout Plan - Right Side */}
      <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
        <WorkoutPlan 
          onBack={() => {
            setShowRotatingText(true);
            // Clear workout plan data when going back
            setWorkoutPlanData(null);
            localStorage.removeItem('aiWorkoutPlanData');
          }} 
          workoutPlanData={workoutPlanData}
          onWorkoutPlanUpdated={handleWorkoutPlanUpdated}
          onWorkoutPlanDeleted={handleWorkoutPlanDeleted}
        />
      </div>
    </div>
  );
};

export default AIProgram;




