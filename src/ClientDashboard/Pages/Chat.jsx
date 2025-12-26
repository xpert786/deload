import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { listThreads } from '../../services/threadsApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import ClientThreadDetail from '../Components/ClientThreadDetail';

const Chat = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentUserId = user?.id;

  console.log('client id====================>>>', currentUserId);
  // const number = Number(currentUserId?.replace(/\D/g, ""));
  // console.log('coachid====================>>>', number);
  // Load threads
  const loadThreads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listThreads();
      
      if (result.data) {
        // Sort by updated_at (most recent first)
        const sortedThreads = result.data.sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at);
          const dateB = new Date(b.updated_at || b.created_at);
          return dateB - dateA;
        });
        console.log('Loaded threads from API:', sortedThreads);
        setThreads(sortedThreads);

        // Auto-select first thread if available
        if (sortedThreads.length > 0 && !selectedThread) {
          setSelectedThread(sortedThreads[0]);
        }
      }
    } catch (err) {
      console.error('Error loading threads:', err);
      setError(err.userMessage || err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [selectedThread]);

  // Initial load
  useEffect(() => {
    if (currentUserId) {
      loadThreads();
    }
  }, [currentUserId, loadThreads]);

  // WebSocket handler for real-time updates
  const handleWebSocketMessage = useCallback((data) => {

    console.log('WebSocket message received:', data);
    if (data.type === 'new_message' && data.message) {
      const message = data.message;
      
      // Only update if message is not from current user (i.e., it's a message received)
      const isMessageForCurrentUser = message.receiver_id === currentUserId || message.receiver === currentUserId;
      
      // Update threads list
      setThreads(prev => prev.map(thread => {
        if (thread.id === message.thread_id) {
          // Increment unread count only if message is for current user and thread is not currently selected
          const shouldIncrementUnread = isMessageForCurrentUser && 
            (!selectedThread || selectedThread.id !== thread.id);
          
          return {
            ...thread,
            last_message: {
              id: message.id,
              content: message.content.substring(0, 100),
              sender_id: message.sender_id || message.sender,
              created_at: message.created_at,
            },
            updated_at: message.created_at,
            unread_count: shouldIncrementUnread 
              ? (thread.unread_count || 0) + 1 
              : thread.unread_count || 0,
          };
        }
        return thread;
      }));

      // Update selected thread if it's the current one
      if (selectedThread && selectedThread.id === message.thread_id) {
        // ThreadDetail will handle adding the message via its own WebSocket connection
      }
    } else if (data.type === 'messages_read' && data.message_ids) {
      // Update unread count when messages are read
      // Decrement unread count for the thread that contains these messages
      setThreads(prev => prev.map(thread => {
        // Note: In a full implementation, you'd track which messages belong to which thread
        // For now, we'll rely on the API to provide accurate unread counts on refresh
        return thread;
      }));
    } else if (data.type === 'message_sent' && data.message) {
      // Update thread with sent message confirmation
      const message = data.message;
      setThreads(prev => prev.map(thread => {
        if (thread.id === message.thread_id) {
          return {
            ...thread,
            last_message: {
              id: message.id,
              content: message.content.substring(0, 100),
              sender_id: message.sender_id || message.sender,
              created_at: message.created_at,
            },
            updated_at: message.created_at,
          };
        }
        return thread;
      }));
    }
  }, [currentUserId, selectedThread]);

  const handleWebSocketError = useCallback((error) => {
    console.error('WebSocket error in Chat:', error);
  }, []);

  const handleWebSocketConnect = useCallback(() => {
    console.log('WebSocket connected in Chat');
  }, []);

  const handleWebSocketDisconnect = useCallback(() => {
    console.log('WebSocket disconnected in Chat');
  }, []);

  // Initialize WebSocket for thread list updates
  useWebSocket(
    handleWebSocketMessage,
    handleWebSocketError,
    handleWebSocketConnect,
    handleWebSocketDisconnect
  );

  // Handle thread selection
  const handleThreadSelect = (thread) => {
    console.log('Thread selected:', thread);
    setSelectedThread(thread);
    // Reset unread count for this thread (optimistic update)
    setThreads(prev => prev.map(t => 
      t.id === thread.id ? { ...t, unread_count: 0 } : t
    ));
  };

  // Handle thread update from ThreadDetail
  const handleThreadUpdate = useCallback((threadId, updates) => {
    console.log('Thread updated:', threadId, updates);
    setThreads(prev => prev.map(thread => 
      thread.id === threadId ? { ...thread, ...updates } : thread
    ));
    
    if (selectedThread && selectedThread.id === threadId) {
      console.log('Selected thread updated:', { ...selectedThread, ...updates });
      setSelectedThread(prev => ({ ...prev, ...updates }));
    }
  }, [selectedThread]);

  // Filter threads by search query
  const filteredThreads = threads.filter(thread => {
    console.log('Filtering thread:', thread);
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const clientName = (thread.client_name || '').toLowerCase();
    const coachName = (thread.coach_name || '').toLowerCase();
    const lastMessage = (thread.last_message?.content || '').toLowerCase();
    
    return clientName.includes(query) || coachName.includes(query) || lastMessage.includes(query);
  });

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
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

  console.log('Threads:', threads);

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
            <p className="text-gray-600 font-[Inter]">Message your coach</p>
          </div>
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.25 12.25L9.74167 9.74167M11.0833 6.41667C11.0833 8.99399 8.99399 11.0833 6.41667 11.0833C3.83934 11.0833 1.75 8.99399 1.75 6.41667C1.75 3.83934 3.83934 1.75 6.41667 1.75C8.99399 1.75 11.0833 3.83934 11.0833 6.41667Z" stroke="#4D6080" strokeOpacity="0.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            {loading && threads.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-500">Loading messages...</div>
              </div>
            ) : error && threads.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-red-500">Error: {error}</div>
              </div>
            ) : selectedThread ? (
              <ClientThreadDetail
                thread={selectedThread}
                currentUserId={currentUserId}
                onBack={null}
                onThreadUpdate={handleThreadUpdate}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-semibold mb-2">No messages</p>
                  <p className="text-sm">Your coach will start a conversation with you</p>
                </div>
              </div>
            )}
          </div>

          {/* Thread List Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-[#003F8F] font-[Poppins] mb-4">Conversations</h3>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto hide-scrollbar">
                {loading ? (
                  <div className="text-center text-gray-500 py-4">Loading...</div>
                ) : filteredThreads.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">No conversations</div>
                ) : (
                  filteredThreads.map((thread) => {
                    const otherUser = thread.coach === currentUserId 
                      ? { name: thread.client_name, photo: thread.client_photo }
                      : { name: thread.coach_name, photo: thread.coach_photo };
                    console.log('Other user:', otherUser);
                    const isSelected = selectedThread?.id === thread.id;
                    
                    return (
                      <div
                        key={thread.id}
                        onClick={() => handleThreadSelect(thread)}
                        className={`p-3 rounded-lg cursor-pointer transition ${
                          isSelected ? 'bg-[#4D60801A]' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#003F8F]">
                            {(() => {
                              const getInitials = (name) => {
                                if (!name) return '';
                                const parts = name.trim().split(' ');
                                if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
                                return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
                              };
                              
                              if (otherUser.photo) {
                                return (
                                  <>
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
                                    <span className="text-white text-xs font-semibold hidden">
                                      {getInitials(otherUser.name)}
                                    </span>
                                  </>
                                );
                              }
                              return (
                                <span className="text-white text-xs font-semibold">
                                  {getInitials(otherUser.name)}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-[#003F8F] font-[Inter] truncate">
                              {otherUser.name}
                            </p>
                            {thread.last_message && (
                              <p className="text-xs text-gray-500 font-[Inter] truncate">
                                {thread.last_message.content}
                              </p>
                            )}
                          </div>
                          {thread.unread_count > 0 && (
                            <div className="w-5 h-5 bg-[#003F8F] rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-white">
                                {thread.unread_count}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Profile info */}
            {selectedThread && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center gap-4">
                {(() => {
                  const otherUser = selectedThread.coach === currentUserId 
                    ? { name: selectedThread.client_name, photo: selectedThread.client_photo }
                    : { name: selectedThread.coach_name, photo: selectedThread.coach_photo };
                  
                  const getInitials = (name) => {
                    if (!name) return '';
                    const parts = name.trim().split(' ');
                    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
                    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
                  };
                  
                  return (
                    <>
                      <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-[#E6ECF5] bg-[#003F8F]">
                        {otherUser.photo ? (
                          <>
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
                            <span className="text-white text-2xl font-semibold hidden">
                              {getInitials(otherUser.name)}
                            </span>
                          </>
                        ) : (
                          <span className="text-white text-2xl font-semibold">
                            {getInitials(otherUser.name)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-[#003F8F] font-[Poppins]">{otherUser.name}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
