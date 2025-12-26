import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listThreads, createThread } from '../../services/threadsApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import CoachThreadDetail from '../Components/CoachThreadDetail';
import ProfileLogo from "../../assets/clientprofile.jpg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Messages = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  
  // Use ref to track selectedThread without causing re-renders
  const selectedThreadRef = useRef(null);
  
  // Update ref whenever selectedThread changes
  useEffect(() => {
    selectedThreadRef.current = selectedThread;
  }, [selectedThread]);

  const currentUserId = user?.id;
  // const number = Number(currentUserId.replace(/\D/g, ""));
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
        
        // Debug: Log threads to check client_name and full structure
        console.log('Loaded threads from API:', sortedThreads.map(t => ({
          id: t.id,
          client: t.client,
          client_id: t.client_id,
          client_name: t.client_name,
          client_photo: t.client_photo,
          coach: t.coach,
          coach_id: t.coach_id,
          coach_name: t.coach_name,
          coach_photo: t.coach_photo,
          fullThread: t // Log full thread to see structure
        })));
        
        setThreads(sortedThreads);

        // If clientId is provided, find thread for that client (only on initial load)
        // Use functional update to check selectedThread without dependency
        if (clientId) {
          setSelectedThread(prevSelected => {
            // Only set if not already selected
            if (!prevSelected) {
              const existingThread = sortedThreads.find(t => t.client === parseInt(clientId));
              if (existingThread) {
                return existingThread;
              }
              // Don't create thread here - let the URL param handler do it to avoid infinite loop
            }
            return prevSelected;
          });
        }
      }
    } catch (err) {
      console.error('Error loading threads:', err);
      setError(err.userMessage || err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [clientId]); // Removed selectedThread from dependencies to prevent infinite loop

  // Initial load - only run once when component mounts or currentUserId changes
  useEffect(() => {
    if (currentUserId) {
      loadThreads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]); // Only depend on currentUserId, not loadThreads

  // WebSocket handler for real-time updates
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'new_message' && data.message) {
      const message = data.message;
      
      // Only update if message is not from current user (i.e., it's a message received)
      const isMessageForCurrentUser = message.receiver_id === currentUserId || message.receiver === currentUserId;
      
      // Update threads list - use ref to check selectedThread without dependency
      setThreads(prev => prev.map(thread => {
        if (thread.id === message.thread_id) {
          // Increment unread count only if message is for current user and thread is not currently selected
          const shouldIncrementUnread = isMessageForCurrentUser && 
            (!selectedThreadRef.current || selectedThreadRef.current.id !== thread.id);
          
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
  }, [currentUserId]); // Removed selectedThread dependency

  const handleWebSocketError = useCallback((error) => {
    console.error('WebSocket error in Messages:', error);
  }, []);

  const handleWebSocketConnect = useCallback(() => {
    console.log('WebSocket connected in Messages');
  }, []);

  const handleWebSocketDisconnect = useCallback(() => {
    console.log('WebSocket disconnected in Messages');
  }, []);

  // Initialize WebSocket for thread list updates
  const { isConnected: wsConnected, connectionStatus: wsStatus } = useWebSocket(
    handleWebSocketMessage,
    handleWebSocketError,
    handleWebSocketConnect,
    handleWebSocketDisconnect
  );
  
  // Debug WebSocket connection status
  useEffect(() => {
    console.log('📡 Messages.jsx - WebSocket status:', {
      isConnected: wsConnected,
      connectionStatus: wsStatus,
      currentUserId: currentUserId
    });
  }, [wsConnected, wsStatus, currentUserId]);

  // Handle thread selection
  const handleThreadSelect = (thread) => {
    setSelectedThread(thread);
    // Reset unread count for this thread (optimistic update)
    setThreads(prev => prev.map(t => 
      t.id === thread.id ? { ...t, unread_count: 0 } : t
    ));
  };

  // Handle thread update from ThreadDetail
  const handleThreadUpdate = useCallback((threadId, updates) => {
    setThreads(prev => prev.map(thread => 
      thread.id === threadId ? { ...thread, ...updates } : thread
    ));
    
    // Update selected thread using functional update to avoid dependency
    setSelectedThread(prev => {
      if (prev && prev.id === threadId) {
        return { ...prev, ...updates };
      }
      return prev;
    });
  }, []);

  // Filter threads by search query
  const filteredThreads = threads.filter(thread => {
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

  // Get initials from name
  const getInitials = (name) => {
    if (!name || name === 'U' || name === 'Client') return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Fetch clients for compose modal
  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      let token = null;
      const storedUser = localStorage.getItem('user');
      
      if (user) {
        token = user.token || user.access_token || user.authToken || user.accessToken;
      }

      if (!token && storedUser) {
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

      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const apiUrl = `${baseUrl}/clients/list/`;

      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers,
        credentials: 'include',
      });

      let result;
      try {
        const responseText = await response.text();
        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = {};
        }
      } catch (parseError) {
        console.error('Failed to parse clients response:', parseError);
        throw new Error('Failed to parse server response');
      }

      if (response.ok) {
        const clientsList = result.results || result.data || [];
        setClients(clientsList);
      } else {
        throw new Error(result.message || 'Failed to fetch clients');
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
  }, [user]);

  // Open compose modal
  const handleComposeClick = () => {
    setShowComposeModal(true);
    fetchClients();
  };

  // Close compose modal
  const handleCloseComposeModal = () => {
    setShowComposeModal(false);
    setClientSearchQuery('');
  };

  // Handle client selection and create thread
  const handleSelectClient = async (client) => {
    try {
      setLoading(true);
      const createResult = await createThread(client.id);
      if (createResult.data) {
        // Ensure client_name is set from the selected client object
        const threadData = {
          ...createResult.data,
          client: client.id, // Ensure client ID is set
          client_name: client.name || client.fullname || createResult.data.client_name,
          client_photo: client.photo || client.profile_picture || createResult.data.client_photo,
          coach: currentUserId, // Ensure coach ID is set to current user
        };
        
        setSelectedThread(threadData);
        setThreads(prev => {
          const exists = prev.some(t => t.id === threadData.id);
          if (exists) {
            return prev.map(t => t.id === threadData.id ? threadData : t);
          }
          return [threadData, ...prev];
        });
        handleCloseComposeModal();
        
        // No need to reload - we already have the thread data with correct client_name
        // The threadData already includes client_name from the selected client object
      }
    } catch (err) {
      console.error('Error creating thread:', err);
      setError(err.userMessage || err.message || 'Failed to create thread');
    } finally {
      setLoading(false);
    }
  };

  // Filter clients by search query
  const filteredClients = clients.filter(client => {
    if (!clientSearchQuery.trim()) return true;
    const query = clientSearchQuery.toLowerCase();
    const name = (client.name || client.fullname || '').toLowerCase();
    const email = (client.email || '').toLowerCase();
    
    return name.includes(query) || email.includes(query);
  });


  // If a thread is selected, create a client object from thread data and show only that client
  let availableClients;
  
  if (selectedThread && (selectedThread.client || selectedThread.client_id)) {
    const selectedClientId = selectedThread.client || selectedThread.client_id;
    console.log('Thread selected, showing client from thread:', {
      selectedClientId: selectedClientId,
      client_name: selectedThread.client_name,
      client_email: selectedThread.client_email
    });
    
    // Create client object from thread data
    const clientFromThread = {
      id: selectedClientId,
      name: selectedThread.client_name,
      fullname: selectedThread.client_name,
      email: selectedThread.client_email,
      photo: selectedThread.client_photo,
      profile_picture: selectedThread.client_photo
    };
    
    // Show only this client in the compose modal
    availableClients = [clientFromThread];
    
    console.log('Available clients from selected thread:', availableClients);
  } else {
    // Filter out clients that already have threads (normal compose behavior)
    availableClients = filteredClients.filter(client => {
      return !threads.some(thread => {
        const threadClientId = thread.client || thread.client_id;
        return String(threadClientId) === String(client.id) || 
               Number(threadClientId) === Number(client.id) ||
               threadClientId == client.id;
      });
    });

    console.log('Available clients from selected thread:elseeee', availableClients);
  }

  return (
    <>
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
      <div className="h-screen flex bg-[#F7F7F7] text-[#003F8F] pl-4">
        {/* Left Panel - Message List */}
        <div className="w-1/3 min-w-[300px] bg-white rounded-[12px] border-r border-gray-200 flex flex-col mt-4 mb-4" style={{ maxHeight: '90vh' }}>
          {/* Messages Header */}
          <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#003F8F] font-[Poppins]">Messages</h2>
              {/* WebSocket Connection Status Indicator */}
              <div className="flex items-center gap-1.5">
                {wsConnected ? (
                  <div className="flex items-center gap-1" title="WebSocket Connected">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500 font-[Inter]">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1" title={`WebSocket ${wsStatus}`}>
                    <div className={`w-2 h-2 rounded-full ${
                      wsStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                      wsStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-xs text-gray-500 font-[Inter]">
                      {wsStatus === 'connecting' ? 'Connecting...' : 
                       wsStatus === 'error' ? 'Error' : 'Disconnected'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleComposeClick}
              className="flex items-center gap-2 px-4 py-2 bg-[#003F8F] text-white rounded-lg hover:bg-[#002d66] transition-colors text-sm font-[Inter]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Compose
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 14L11.1 11.1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search messages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto bg-white hide-scrollbar">
            {loading && threads.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Loading messages...</div>
            ) : error && threads.length === 0 ? (
              <div className="p-4 text-center text-red-500">Error: {error}</div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No messages found</div>
            ) : (
              filteredThreads.map((thread) => {
                // For coach view: ALWAYS show client's name and photo
                // Since this is the coach dashboard, we should always display the client
                // Don't check if current user is coach - just always show client
                
                // Debug logging to see what data we have
                if (!thread.client_name) {
                  console.warn('Thread missing client_name:', {
                    threadId: thread.id,
                    client: thread.client,
                    client_id: thread.client_id,
                    client_name: thread.client_name,
                    coach: thread.coach,
                    coach_id: thread.coach_id,
                    coach_name: thread.coach_name,
                    currentUserId: currentUserId,
                    fullThread: thread
                  });
                }
                
                // Always show client name - this is coach dashboard
                // Use thread.client_name directly from API (it's always present in thread data)
                // DO NOT fallback to coach_name - this is coach dashboard, always show client
                const clientName = thread.client_name || 'Client';
                const clientPhoto = thread.client_photo || null;
                
                // Debug: Log to verify we're using client_name
                if (thread.client_name) {
                  console.log('Messages.jsx - Using client_name from thread:', {
                    threadId: thread.id,
                    client_name: thread.client_name,
                    client: thread.client,
                    coach_name: thread.coach_name // Should NOT be used
                  });
                } else {
                  console.error('Messages.jsx - Missing client_name in thread!', {
                    threadId: thread.id,
                    thread: thread
                  });
                }
                
                const otherUser = { 
                  name: clientName, 
                  photo: clientPhoto
                };
                
                const isSelected = selectedThread?.id === thread.id;
                
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleThreadSelect(thread)}
                    className={`mx-2 my-1 p-4 rounded-lg cursor-pointer transition focus:outline-none ${
                      isSelected ? 'bg-[#4D60801A]' : 'bg-white hover:bg-gray-50'
                    }`}
                    style={{ outline: 'none' }}
                    tabIndex={0}
                  >
                    <div className="flex items-start gap-3">
                      {/* Profile Picture */}
                      <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#003F8F' }}>
                        {(() => {
                          const profilePhoto = otherUser.photo;
                          const isValidPhoto = profilePhoto && 
                                               profilePhoto.trim() !== '' && 
                                               profilePhoto !== 'null' && 
                                               profilePhoto !== 'undefined' &&
                                               !profilePhoto.includes('ProfileLogo') &&
                                               !profilePhoto.includes('clientprofile');
                          
                          if (isValidPhoto) {
                            return (
                              <>
                                <img
                                  src={profilePhoto}
                                  alt={otherUser.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) {
                                      e.target.nextSibling.style.display = 'flex';
                                    }
                                  }}
                                />
                                <span className="text-white text-sm font-semibold hidden">
                                  {getInitials(otherUser.name)}
                                </span>
                              </>
                            );
                          }
                          return (
                            <span className="text-white text-sm font-semibold">
                              {getInitials(otherUser.name)}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Conversation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-[#003F8F] font-[Inter]">
                            {otherUser.name}
                          </span>
                          {thread.last_message && (
                            <span className="text-xs text-gray-500 font-[Inter]">
                              {formatTime(thread.last_message.created_at)}
                            </span>
                          )}
                        </div>
                        {thread.last_message ? (
                          <p className="text-sm text-gray-600 font-[Inter] truncate">
                            {thread.last_message.content}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 font-[Inter]">No messages yet</p>
                        )}
                      </div>

                      {/* Unread Badge */}
                      {thread.unread_count > 0 && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-[#4D60801A] rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-[#003F8F]">
                              {thread.unread_count}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="flex-1 flex flex-col bg-[#F7F7F7]">
          {selectedThread ? (
            <div className="flex-1 flex flex-col m-4">
              <CoachThreadDetail
                thread={selectedThread}
                currentUserId={currentUserId}
                onBack={null}
                onThreadUpdate={handleThreadUpdate}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white rounded-xl m-4">
              <div className="text-center text-gray-500">
                <p className="text-lg font-semibold mb-2">Select a conversation</p>
                <p className="text-sm">Choose a thread from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#003F8F] font-[Poppins]">New Message</h3>
              <button
                onClick={handleCloseComposeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Search Clients */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 14L11.1 11.1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003F8F]"
                />
              </div>
            </div>

            {/* Clients List */}
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              {loadingClients ? (
                <div className="p-4 text-center text-gray-500">Loading clients...</div>
              ) : availableClients.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {clientSearchQuery ? 'No clients found' : 'All clients already have conversations'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {availableClients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#003F8F' }}>
                          {(() => {
                            const profilePhoto = client.photo || client.profile_picture;
                            const clientName = client.name || client.fullname || 'U';
                            const isValidPhoto = profilePhoto && 
                                                 profilePhoto.trim() !== '' && 
                                                 profilePhoto !== 'null' && 
                                                 profilePhoto !== 'undefined' &&
                                                 !profilePhoto.includes('ProfileLogo') &&
                                                 !profilePhoto.includes('clientprofile');
                            
                            if (isValidPhoto) {
                              return (
                                <>
                                  <img
                                    src={profilePhoto}
                                    alt={clientName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) {
                                        e.target.nextSibling.style.display = 'flex';
                                      }
                                    }}
                                  />
                                  <span className="text-white text-xs font-semibold hidden">
                                    {getInitials(clientName)}
                                  </span>
                                </>
                              );
                            }
                            return (
                              <span className="text-white text-xs font-semibold">
                                {getInitials(clientName)}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-[#003F8F] font-[Inter]">
                            {client.name || client.fullname}
                          </p>
                          {client.email && (
                            <p className="text-xs text-gray-500 font-[Inter]">{client.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Messages;
