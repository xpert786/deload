// WebSocket Hook for Real-time Messaging
import { useEffect, useRef, useState, useCallback } from 'react';

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
 * Build WebSocket URL
 */
const buildWebSocketUrl = () => {
  if (!API_BASE_URL) {
    console.error('❌ API_BASE_URL is not defined');
    throw new Error('API_BASE_URL is not defined in environment variables');
  }

  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  // Convert http to ws, https to wss
  let wsUrl = baseUrl.replace(/^http/, 'ws');
  
  // Remove /api if present (WebSocket endpoint is typically at /ws/)
  // Handle both /api at the end and /api/ in the middle
  wsUrl = wsUrl.replace(/\/api\/?$/, '');
  
  const token = getAuthToken();
  
  // Check if /deload is already in the base URL
  // If baseUrl already contains /deload, we don't need to add it again
  const hasDeload = wsUrl.includes('/deload');
  
  // Updated WebSocket path: only add /deload if it's not already in the URL
  const wsPath = hasDeload ? '/ws/chat/' : '/deload/ws/chat/';
  
  // Ensure wsUrl doesn't end with / before adding wsPath
  if (wsUrl.endsWith('/')) {
    wsUrl = wsUrl.slice(0, -1);
  }
  
  if (!token) {
    console.warn('⚠️ No authentication token found. WebSocket connection may fail.');
  }
  
  const finalUrl = token 
    ? `${wsUrl}${wsPath}?token=${encodeURIComponent(token)}`
    : `${wsUrl}${wsPath}`;
  
  console.log('🔗 Built WebSocket URL:', finalUrl.replace(/token=[^&]+/, 'token=***'));
  
  return finalUrl;
};

/**
 * Custom hook for WebSocket connection
 */
export const useWebSocket = (onMessage, onError, onConnect, onDisconnect) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return; // Already connected
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      setConnectionStatus('connecting');
      const wsUrl = buildWebSocketUrl();
      
      // Log URL with token masked for debugging
      const maskedUrl = wsUrl.replace(/token=[^&]+/, 'token=***');
      console.log('🔌 Connecting to WebSocket:', maskedUrl);
      console.log('📡 API_BASE_URL:', API_BASE_URL);
      
      if (!wsUrl || !wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
        throw new Error(`Invalid WebSocket URL: ${wsUrl}`);
      }
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connection opened successfully');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        if (onConnect) onConnect();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data);
          
          if (data.type === 'connection') {
            // Connection confirmation
            console.log('✅ WebSocket connection confirmed:', data);
            setIsConnected(true);
            setConnectionStatus('connected');
            if (onConnect) onConnect(data);
          } else if (data.type === 'error') {
            console.error('❌ WebSocket error message:', data.message);
            if (onError) onError(data);
          } else {
            // Forward message to handler
            if (onMessage) onMessage(data);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error, 'Raw data:', event.data);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error event:', error);
        console.error('WebSocket readyState:', ws.readyState);
        setConnectionStatus('error');
        if (onError) onError(error);
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', {
          code: event.code,
          reason: event.reason || 'No reason provided',
          wasClean: event.wasClean,
          readyState: ws.readyState
        });
        
        setIsConnected(false);
        setConnectionStatus('disconnected');
        if (onDisconnect) onDisconnect(event);

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else if (event.code !== 1000) {
          console.error('❌ Max reconnection attempts reached. Please refresh the page.');
        }
      };
    } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
      setConnectionStatus('error');
      if (onError) onError(error);
    }
  }, [onMessage, onError, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        wsRef.current.send(messageStr);
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        if (onError) onError(error);
        return false;
      }
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
      return false;
    }
  }, [onError]);

  // Connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    connect,
    disconnect,
  };
};
