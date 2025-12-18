// ThreadDetail Component - Shared chat view for both coach and client
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { getThreadMessages } from '../services/threadsApi';
import ProfileLogo from '../assets/clientprofile.jpg';

const ThreadDetail = ({ thread, currentUserId, onBack, onThreadUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const errorTimeoutRef = useRef(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingDebounceRef = useRef(null);

  // Determine the other user (receiver)
  // Check multiple ways to determine if current user is coach
  const threadCoachId = thread.coach || thread.coach_id;
  const threadClientId = thread.client || thread.client_id;
  
  // Convert to numbers/strings for comparison - handle both string and number IDs
  const normalizeId = (id) => {
    if (id == null) return null;
    return typeof id === 'string' ? parseInt(id) : id;
  };
  
  const coachIdNormalized = normalizeId(threadCoachId);
  const currentUserIdNormalized = normalizeId(currentUserId);
  const isCoach = coachIdNormalized === currentUserIdNormalized || 
                  String(threadCoachId) === String(currentUserId) ||
                  threadCoachId == currentUserId; // Loose equality for type coercion
  
  // Debug logging
  console.log('ThreadDetail - Determining otherUser:', {
    threadId: thread.id,
    threadCoach: thread.coach,
    threadCoachId: thread.coach_id,
    coachIdNormalized: coachIdNormalized,
    currentUserId: currentUserId,
    currentUserIdNormalized: currentUserIdNormalized,
    isCoach: isCoach,
    client: thread.client,
    client_id: thread.client_id,
    client_name: thread.client_name,
    client_email: thread.client_email,
    coach_name: thread.coach_name,
    stringComparison: String(threadCoachId) === String(currentUserId),
    fullThread: thread
  });
  
  // Determine conversation counterpart:
  // - Coach view  : other user = client
  // - Client view : other user = coach
  let otherUser;
  if (isCoach) {
    otherUser = {
      id: threadClientId,
      name: thread.client_name || 'Client',
      photo: thread.client_photo || null,
    };
  } else {
    otherUser = {
      id: threadCoachId,
      name: thread.coach_name || 'Coach',
      photo: thread.coach_photo || null,
    };
  }

  // Avatar logic:
  // - Coach view  : left (received) shows client, right (sent) shows coach
  // - Client view : left (received) shows coach, right (sent) shows client
  const clientAvatar = thread.client_photo || ProfileLogo;
  const coachAvatar = thread.coach_photo || ProfileLogo;
  
  const otherAvatar = isCoach ? clientAvatar : coachAvatar;
  const selfAvatar = isCoach ? coachAvatar : clientAvatar;

  // Load messages
  const loadMessages = useCallback(async (offset = 0, append = false) => {
    try {
      if (offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await getThreadMessages(thread.id, 50, offset);
      
      if (result.data) {
        if (append) {
          setMessages(prev => [...result.data.reverse(), ...prev]);
        } else {
          setMessages(result.data.reverse()); // Reverse to show oldest first
        }
        
        setHasMore(result.data.length === 50);
      }

      setError(null);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err.userMessage || err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [thread.id]);

  // Load initial messages
  useEffect(() => {
    if (thread?.id) {
      loadMessages(0, false);
    }
  }, [thread?.id, loadMessages]);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'new_message' && data.message) {
      const message = data.message;
      
      // Only add if it belongs to this thread
      if (message.thread_id === thread.id) {
        setMessages(prev => {
          // Check if message already exists
          const exists = prev.some(m => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });

        // Update thread if callback provided
        if (onThreadUpdate) {
          onThreadUpdate(thread.id, {
            last_message: {
              id: message.id,
              content: message.content,
              sender_id: message.sender_id,
              created_at: message.created_at,
            },
            updated_at: message.created_at,
          });
        }

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (data.type === 'message_sent' && data.message) {
      const message = data.message;
      
      // Update message if it belongs to this thread
      if (message.thread_id === thread.id) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === message.id);
          if (exists) {
            return prev.map(m => m.id === message.id ? message : m);
          }
          return [...prev, message];
        });
      }
    } else if (data.type === 'messages_read' && data.message_ids) {
      // Update read status
      setMessages(prev => prev.map(m => 
        data.message_ids.includes(m.id) ? { ...m, is_read: true } : m
      ));
    } else if (data.type === 'typing' && data.sender_id === otherUser.id) {
      setIsTyping(data.is_typing);
    }
  }, [thread.id, otherUser.id, onThreadUpdate]);

  // WebSocket error handler
  const handleWebSocketError = useCallback((error) => {
    console.error('WebSocket error:', error);
    
    // Handle error messages from WebSocket
    if (error && typeof error === 'object' && error.message) {
      const errorMessage = error.message;
      
      // Show user-friendly error messages
      if (errorMessage.includes('not assigned')) {
        setError('You are not assigned to this conversation.');
      } else if (errorMessage.includes('receiver_id is required')) {
        setError('Invalid recipient. Please refresh the page.');
      } else if (errorMessage.includes('Message content cannot be empty')) {
        setError('Message cannot be empty.');
      } else if (errorMessage.includes('Receiver not found')) {
        setError('Recipient not found. Please refresh the page.');
      } else {
        setError('Connection error. Please check your internet connection.');
      }
      
      // Clear error after 5 seconds
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
      }, 5000);
    }
  }, []);

  // WebSocket connect handler
  const handleWebSocketConnect = useCallback(() => {
    console.log('WebSocket connected for thread:', thread.id);
  }, [thread.id]);

  // WebSocket disconnect handler
  const handleWebSocketDisconnect = useCallback(() => {
    console.log('WebSocket disconnected for thread:', thread.id);
  }, [thread.id]);

  // Initialize WebSocket
  const { isConnected, sendMessage } = useWebSocket(
    handleWebSocketMessage,
    handleWebSocketError,
    handleWebSocketConnect,
    handleWebSocketDisconnect
  );

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTypingValue) => {
    if (isConnected && sendMessage) {
      sendMessage({
        type: 'typing',
        receiver_id: otherUser.id,
        is_typing: isTypingValue,
      });
    }
  }, [isConnected, sendMessage, otherUser.id]);

  // Handle typing
  useEffect(() => {
    if (messageInput.trim()) {
      if (!typing) {
        setTyping(true);
        sendTypingIndicator(true);
      }

      // Clear existing timeout
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }

      // Set timeout to stop typing indicator
      typingDebounceRef.current = setTimeout(() => {
        setTyping(false);
        sendTypingIndicator(false);
      }, 2000);
    } else {
      if (typing) {
        setTyping(false);
        sendTypingIndicator(false);
      }
    }

    return () => {
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
    };
  }, [messageInput, typing, sendTypingIndicator]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    const trimmedInput = messageInput.trim();
    if (!trimmedInput || sending) {
      return;
    }

    // Allow sending even if not connected (will queue or show error)
    // The WebSocket will handle reconnection and retry

    const content = trimmedInput;
    const messageToSend = content;
    setMessageInput('');
    setSending(true);
    setTyping(false);
    setError(null);
    sendTypingIndicator(false);

    // Send via WebSocket (no optimistic duplicate; rely on server echo)
    try {
      // Try to send via WebSocket (even if not connected, it might reconnect)
      // Updated message format: { thread_id, content }
      const success = sendMessage({
        thread_id: thread.id,
        content: messageToSend,
      });

      if (!success && isConnected) {
        // Connected but send failed - show error
        setError('Failed to send message. Please check your connection and try again.');
        
        // Clear error after 5 seconds
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
        }
        errorTimeoutRef.current = setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Clear error after 5 seconds
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setSending(false);
    }
  }, [messageInput, sending, isConnected, sendMessage, thread, currentUserId, otherUser, sendTypingIndicator]);

  // Cleanup error timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0 && isConnected && sendMessage) {
      const unreadMessages = messages.filter(
        m => (m.receiver === currentUserId || m.receiver_id === currentUserId) && !m.is_read
      );

      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(m => m.id).filter(id => id && typeof id === 'number');
        
        if (messageIds.length > 0) {
          // Send read receipt via WebSocket
          // sender_id refers to the sender of the messages we're marking as read
          sendMessage({
            type: 'read',
            message_ids: messageIds,
            sender_id: otherUser.id,
          });
          
          // Optimistically update local state
          setMessages(prev => prev.map(m => 
            messageIds.includes(m.id) ? { ...m, is_read: true } : m
          ));
        }
      }
    }
  }, [messages, currentUserId, otherUser.id, isConnected, sendMessage]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  // Load more messages (pagination)
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && messages.length > 0) {
      loadMessages(messages.length, true);
    }
  }, [loadingMore, hasMore, messages.length, loadMessages]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-xl overflow-hidden shadow-sm">
      {/* Chat Header */}
      <div className="bg-[#003F8F] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-2 text-white/80 hover:text-white"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <img
            src={otherUser.photo || ProfileLogo}
            alt={otherUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold font-[Inter]">{otherUser.name}</p>
            {isTyping && (
              <p className="text-xs text-white/80 font-[Inter]">typing...</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isConnected && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-white/80">Connecting...</span>
            </div>
          )}
          {isConnected && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-white/80">Online</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white"
        style={{ maxHeight: '60vh' }}
      >
        {hasMore && (
          <div className="flex justify-center mb-4">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="text-sm text-[#003F8F] hover:underline disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        <div className="space-y-6">
          {messages.map((msg) => {
            const isOwnMessage = msg.sender_id === currentUserId || msg.sender === currentUserId;
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwnMessage && (
                  <div className="flex items-start gap-2 max-w-[70%]">
                    <div className="flex-shrink-0">
                      <img
                        src={otherAvatar}
                        alt={otherUser.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="rounded-2xl px-4 py-3 text-sm font-[Inter] bg-[#F3701EB2] text-white leading-relaxed break-words whitespace-normal max-w-xs sm:max-w-sm">
                        {msg.content}
                      </div>
                      <div className="mt-1.5">
                        <span className="text-xs text-gray-500 font-[Inter]">
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {isOwnMessage && (
                  <div className="flex items-start gap-2 max-w-[70%]">
                    <div className="flex flex-col items-end">
                      <div className="rounded-2xl px-4 py-3 text-sm font-[Inter] bg-[#003F8FB2] text-white leading-relaxed break-words whitespace-normal max-w-xs sm:max-w-sm">
                        {msg.content}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1">
                        <span className="text-xs text-gray-500 font-[Inter]">
                          {formatTime(msg.created_at)}
                        </span>
                        {msg.is_read && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 8L6 12L14 4" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <img
                        src={selfAvatar}
                        alt={isCoach ? 'You' : 'Client'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-[20px] px-4 py-3">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              setError(null); // Clear error when typing
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (messageInput.trim() && !sending) {
                  handleSendMessage();
                }
              }
            }}
            placeholder="Type a message"
            disabled={sending}
            className="flex-1 py-1 text-sm text-gray-700 font-[Inter] focus:outline-none bg-transparent disabled:opacity-50"
            autoFocus
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              if (messageInput.trim() && !sending) {
                handleSendMessage();
              }
            }}
            disabled={!messageInput.trim() || sending}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              messageInput.trim() && !sending
                ? 'bg-[#003F8F] hover:bg-[#002d66] cursor-pointer active:scale-95'
                : 'bg-gray-300 cursor-not-allowed opacity-50'
            }`}
            title={sending ? 'Sending...' : !messageInput.trim() ? 'Type a message' : 'Send message'}
            type="button"
          >
            {sending ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="white" />
              </svg>
            )}
          </button>
        </div>
        {error && (
          <div className="mt-2 text-xs text-red-500 text-center">{error}</div>
        )}
      </div>
    </div>
  );
};

export default ThreadDetail;
