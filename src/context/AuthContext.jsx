import React, { createContext, useContext, useState, useEffect } from 'react';

// Dummy JSON data for authentication
const DUMMY_USERS = {
  clients: [
    {
      id: 'client1',
      email: 'client@example.com',
      password: 'client123',
      name: 'John Client',
      role: 'client',
      phone: '+1234567890',
      profileImage: null
    },
    {
      id: 'client2',
      email: 'client2@example.com',
      password: 'client123',
      name: 'Jane Doe',
      role: 'client',
      phone: '+1234567891',
      profileImage: null
    }
  ],
  coaches: [
    {
      id: 'coach1',
      email: 'coach@example.com',
      password: 'coach123',
      name: 'Mike Coach',
      role: 'coach',
      phone: '+1234567892',
      specialization: 'Strength Training',
      experience: '5 years',
      profileImage: null
    },
    {
      id: 'coach2',
      email: 'coach2@example.com',
      password: 'coach123',
      name: 'Sarah Trainer',
      role: 'coach',
      phone: '+1234567893',
      specialization: 'Cardio & Weight Loss',
      experience: '8 years',
      profileImage: null
    }
  ],
  admins: [
    {
      id: 'admin1',
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      phone: '+1234567894',
      profileImage: null
    },
    {
      id: 'admin2',
      email: 'admin2@example.com',
      password: 'admin123',
      name: 'Super Admin',
      role: 'admin',
      phone: '+1234567895',
      profileImage: null
    }
  ]
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Search in all user types
    const allUsers = [
      ...DUMMY_USERS.clients,
      ...DUMMY_USERS.coaches,
      ...DUMMY_USERS.admins
    ];

    const foundUser = allUsers.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      const userData = { ...foundUser };
      delete userData.password; // Don't store password
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = (userData) => {
    // Generate new ID
    const newId = `${userData.role}${Date.now()}`;
    const newUser = {
      ...userData,
      id: newId,
      profileImage: null
    };

    // Add to appropriate array
    if (userData.role === 'client') {
      DUMMY_USERS.clients.push(newUser);
    } else if (userData.role === 'coach') {
      DUMMY_USERS.coaches.push(newUser);
    }

    // Auto login after registration
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));

    return { success: true, user: userWithoutPassword };
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    isAuthenticated: !!user,
    isClient: user?.role === 'client',
    isCoach: user?.role === 'coach',
    isAdmin: user?.role === 'admin'
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

