// ThreadDetail Component - Shared chat view for both coach and client
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { getThreadMessages } from '../services/threadsApi';

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

  // Helper function to get first letter of name
  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Avatar logic:
  // - Coach view  : left (received) shows client, right (sent) shows coach
  // - Client view : left (received) shows coach, right (sent) shows client
  const clientAvatar = thread.client_photo || null;
  const coachAvatar = thread.coach_photo || null;
  
  const otherAvatar = isCoach ? clientAvatar : coachAvatar;
  const selfAvatar = isCoach ? coachAvatar : clientAvatar;
  
  const otherName = isCoach ? (thread.client_name || 'Client') : (thread.coach_name || 'Coach');
  const selfName = isCoach ? (thread.coach_name || 'Coach') : (thread.client_name || 'Client');

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
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#003F8F]">
            {otherUser.photo ? (
              <img
                src={otherUser.photo}
                alt={otherUser.name}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <span className={`text-white text-sm font-semibold ${otherUser.photo ? 'hidden' : 'flex'}`}>
              {getInitials(otherUser.name)}
            </span>
          </div>
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

        <div className="space-y-4">
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
                      {otherAvatar ? (
                        <>
                          <img
                            src={otherAvatar}
                            alt={otherUser.name}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold hidden"
                            style={{ backgroundColor: '#003F8F' }}
                          >
                            {getInitials(otherUser.name)}
                          </div>
                        </>
                      ) : (
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{ backgroundColor: '#003F8F' }}
                        >
                          {getInitials(otherUser.name)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start flex-1">
                      <div className="rounded-2xl px-4 py-3 text-sm font-[Inter] bg-[#F3701E] text-white leading-relaxed break-words whitespace-normal max-w-xs sm:max-w-sm">
                        {msg.content}
                      </div>
                      <div className="mt-1">
                        <span className="text-xs text-gray-500 font-[Inter]">
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {isOwnMessage && (
                  <div className="flex items-start gap-2 max-w-[70%] ml-auto">
                    <div className="flex flex-col items-end flex-1">
                      <div className="rounded-2xl px-4 py-3 text-sm font-[Inter] bg-[#003F8F] text-white leading-relaxed break-words whitespace-normal max-w-xs sm:max-w-sm">
                        {msg.content}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 justify-end">
                        <span className="text-xs text-gray-500 font-[Inter]">
                          {formatTime(msg.created_at)}
                        </span>
                        {msg.is_read && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 8L6 12L14 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {selfAvatar ? (
                        <>
                          <img
                            src={selfAvatar}
                            alt={isCoach ? 'You' : 'Client'}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold hidden"
                            style={{ backgroundColor: '#003F8F' }}
                          >
                            {getInitials(selfName)}
                          </div>
                        </>
                      ) : (
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{ backgroundColor: '#003F8F' }}
                        >
                          {getInitials(selfName)}
                        </div>
                      )}
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
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-[20px] px-4 py-3">
          {/* Attachment Icon */}
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Attach file"
          >
            
          </button>
          
          <div className="flex-1 flex items-center gap-2">
            <svg width="25" height="27" viewBox="0 0 25 27" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path d="M11.7853 3.51144C12.2667 2.97827 12.8413 2.55365 13.4758 2.26219C14.1103 1.97074 14.7921 1.81825 15.4816 1.81359C16.1711 1.80892 16.8546 1.95217 17.4925 2.23501C18.1303 2.51786 18.7098 2.93467 19.1974 3.46128C19.6849 3.98789 20.0708 4.61381 20.3326 5.30273C20.5944 5.99164 20.7269 6.72985 20.7225 7.47452C20.7181 8.21919 20.5768 8.9555 20.3068 9.64073C20.0369 10.326 19.6436 10.9465 19.1499 11.4663L11.0488 20.2166C10.7596 20.5342 10.4149 20.7868 10.0348 20.9599C9.65466 21.1329 9.24657 21.223 8.83405 21.2248C8.42153 21.2267 8.01275 21.1404 7.63129 20.9707C7.24983 20.8011 6.90324 20.5516 6.61151 20.2366C6.31977 19.9216 6.08868 19.5474 5.93154 19.1355C5.77441 18.7235 5.69435 18.2821 5.69598 17.8365C5.69761 17.391 5.7809 16.9502 5.94105 16.5397C6.10119 16.1291 6.33502 15.7568 6.62905 15.4443L14.7311 6.69406L16.204 8.28481L8.10197 17.0351C8.00248 17.1388 7.92312 17.263 7.86853 17.4002C7.81394 17.5375 7.7852 17.6851 7.784 17.8345C7.7828 17.9839 7.80915 18.132 7.86153 18.2703C7.9139 18.4085 7.99125 18.5341 8.08906 18.6398C8.18686 18.7454 8.30316 18.8289 8.43118 18.8855C8.5592 18.9421 8.69636 18.9705 8.83468 18.9692C8.97299 18.9679 9.10968 18.9369 9.23676 18.8779C9.36385 18.819 9.47879 18.7333 9.57488 18.6258L17.678 9.87557C17.9682 9.56214 18.1984 9.19005 18.3555 8.78054C18.5125 8.37104 18.5934 7.93213 18.5934 7.48888C18.5934 7.04563 18.5125 6.60672 18.3555 6.19721C18.1984 5.7877 17.9682 5.41561 17.678 5.10219C17.3878 4.78877 17.0433 4.54014 16.6641 4.37052C16.2849 4.2009 15.8785 4.11359 15.4681 4.11359C15.0577 4.11359 14.6513 4.2009 14.2721 4.37052C13.893 4.54014 13.5484 4.78877 13.2582 5.10219L5.15613 13.8536C4.20739 14.9145 3.68242 16.3353 3.69429 17.8102C3.70616 19.2851 4.25391 20.6959 5.21958 21.7388C6.18525 22.7817 7.49156 23.3733 8.85717 23.3861C10.2228 23.3989 11.5384 22.832 12.5207 21.8073L21.3603 12.2617L22.8332 13.8536L13.9947 23.3992C12.6272 24.8761 10.7724 25.7058 8.83842 25.7058C6.90446 25.7058 5.0497 24.8761 3.68218 23.3992C2.31465 21.9223 1.54639 19.9191 1.54639 17.8304C1.54639 15.7418 2.31465 13.7386 3.68218 12.2617L11.7853 3.51144Z" fill="#4D6080" fillOpacity="0.1"/>
            </svg>
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
          </div>
          
          {/* Emoji Icon */}
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Add emoji"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 8.33333C7.96024 8.33333 8.33333 7.96024 8.33333 7.5C8.33333 7.03976 7.96024 6.66667 7.5 6.66667C7.03976 6.66667 6.66667 7.03976 6.66667 7.5C6.66667 7.96024 7.03976 8.33333 7.5 8.33333Z" fill="currentColor"/>
              <path d="M12.5 8.33333C12.9602 8.33333 13.3333 7.96024 13.3333 7.5C13.3333 7.03976 12.9602 6.66667 12.5 6.66667C12.0398 6.66667 11.6667 7.03976 11.6667 7.5C11.6667 7.96024 12.0398 8.33333 12.5 8.33333Z" fill="currentColor"/>
              <path d="M6.66667 12.5C7.16667 13.8333 8.5 14.6667 10 14.6667C11.5 14.6667 12.8333 13.8333 13.3333 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* Send Button */}
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
