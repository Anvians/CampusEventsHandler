import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '/src/utils/api.js'; // Use our updated api.js

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          const res = await api.get('/api/auth/verify'); 
          setUser(res.data); 
        } catch (err) {
          console.error("Auth verification failed:", err);
          localStorage.removeItem('token'); 
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    verifyUser();
  }, []); 

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

