import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount and sync with localStorage
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    loadUser();

    // Listen for storage changes (when user logs in from another tab/window)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch (error) {
            console.error('Error parsing user from storage event:', error);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event for same-tab updates
    const handleUserUpdate = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const login = (email, password) => {
    // This function is kept for backward compatibility
    // Login is now handled directly via API in Login.jsx
    console.warn('AuthContext.login() is deprecated. Use API login directly.');
    return { success: false, error: 'Please use API login endpoint' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    
    // Clear AI chat messages and workout plan data on logout
    localStorage.removeItem('aiChatMessages');
    localStorage.removeItem('aiWorkoutPlanData');
    
    // Trigger event to sync across components
    window.dispatchEvent(new Event('userUpdated'));
  };

  const register = (userData) => {
    // This function is kept for backward compatibility
    // Registration is now handled directly via API in registration pages
    console.warn('AuthContext.register() is deprecated. Use API registration directly.');
    return { success: false, error: 'Please use API registration endpoint' };
  };

  // Normalize role for comparisons
  const userRole = user?.role?.toLowerCase();

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    isAuthenticated: !!user,
    isClient: userRole === 'client',
    isCoach: userRole === 'coach',
    isAdmin: userRole === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

