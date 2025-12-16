// Threads API Service
// Handles all REST API calls for threads and messages

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
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

  return isValidToken ? token.trim() : null;
};

/**
 * Get API headers with authentication
 */
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Build API URL
 */
const buildApiUrl = (endpoint) => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const apiPath = baseUrl.includes('/api') ? '' : '/api';
  return `${baseUrl}${apiPath}${endpoint}`;
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
  let result;
  try {
    const responseText = await response.text();
    if (responseText) {
      result = JSON.parse(responseText);
    } else {
      result = {};
    }
  } catch (parseError) {
    console.error('Failed to parse response:', parseError);
    const error = new Error('Failed to parse server response');
    error.status = response.status;
    error.errors = { detail: 'Invalid response format from server' };
    throw error;
  }

  if (!response.ok) {
    const errorMessage = result.message || `Request failed with status ${response.status}`;
    const errorDetails = result.errors || {};
    const error = new Error(errorMessage);
    error.status = response.status;
    error.errors = errorDetails;
    
    // Add user-friendly messages for common errors
    if (response.status === 401) {
      error.userMessage = 'Authentication required. Please log in again.';
    } else if (response.status === 403) {
      error.userMessage = errorDetails.detail || 'You do not have permission to perform this action.';
    } else if (response.status === 404) {
      error.userMessage = errorDetails.detail || 'Resource not found.';
    } else if (response.status === 400) {
      error.userMessage = errorDetails.detail || 'Invalid request. Please check your input.';
    } else {
      error.userMessage = errorMessage;
    }
    
    throw error;
  }

  return result;
};

/**
 * List all threads for the authenticated user
 * @returns {Promise<{message: string, data: Array, total: number}>}
 * @throws {Error} If request fails (401, 403, 500, etc.)
 */
export const listThreads = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      const error = new Error('Authentication required');
      error.status = 401;
      error.userMessage = 'Please log in to view messages.';
      throw error;
    }

    const response = await fetch(buildApiUrl('/threads/'), {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error listing threads:', error);
    // Re-throw with enhanced error info if not already enhanced
    if (!error.status) {
      error.status = 500;
      error.userMessage = 'Failed to load messages. Please try again.';
    }
    throw error;
  }
};

/**
 * Create a new thread (coach only)
 * @param {number} clientId - The ID of the client to create a thread with
 * @returns {Promise<{message: string, data: Object}>} Thread data (201 for new, 200 for existing)
 * @throws {Error} If request fails (400, 403, 404, 500, etc.)
 */
export const createThread = async (clientId) => {
  try {
    if (!clientId || typeof clientId !== 'number') {
      const error = new Error('Validation failed');
      error.status = 400;
      error.errors = { client_id: 'client_id is required and must be a number' };
      error.userMessage = 'Please select a valid client.';
      throw error;
    }

    const token = getAuthToken();
    if (!token) {
      const error = new Error('Authentication required');
      error.status = 401;
      error.userMessage = 'Please log in to create a thread.';
      throw error;
    }

    const response = await fetch(buildApiUrl('/threads/'), {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ client_id: clientId }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating thread:', error);
    // Re-throw with enhanced error info if not already enhanced
    if (!error.status) {
      error.status = 500;
      error.userMessage = 'Failed to create conversation. Please try again.';
    }
    throw error;
  }
};

/**
 * Get messages for a specific thread
 * @param {number} threadId - The ID of the thread
 * @param {number} limit - Maximum number of messages to return (default: 50)
 * @param {number} offset - Number of messages to skip for pagination (default: 0)
 * @returns {Promise<{message: string, thread_id: number, data: Array, total: number}>}
 * @throws {Error} If request fails (403, 404, 500, etc.)
 */
export const getThreadMessages = async (threadId, limit = 50, offset = 0) => {
  try {
    if (!threadId || typeof threadId !== 'number') {
      const error = new Error('Validation failed');
      error.status = 400;
      error.errors = { thread_id: 'thread_id is required and must be a number' };
      error.userMessage = 'Invalid thread ID.';
      throw error;
    }

    const token = getAuthToken();
    if (!token) {
      const error = new Error('Authentication required');
      error.status = 401;
      error.userMessage = 'Please log in to view messages.';
      throw error;
    }

    const params = new URLSearchParams({
      limit: Math.max(1, Math.min(100, limit)).toString(), // Clamp between 1 and 100
      offset: Math.max(0, offset).toString(),
    });

    const response = await fetch(buildApiUrl(`/threads/${threadId}/messages/?${params}`), {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting thread messages:', error);
    // Re-throw with enhanced error info if not already enhanced
    if (!error.status) {
      error.status = 500;
      error.userMessage = 'Failed to load messages. Please try again.';
    }
    throw error;
  }
};
