import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Create context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // On component mount, check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // Set the auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify the token with backend
          const response = await axios.get('/api/auth/me');
          
          if (response.data && response.data.user) {
            setCurrentUser(response.data.user);
          } else {
            // Invalid token
            localStorage.removeItem('authToken');
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      } catch (err) {
        // Token verification failed
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
        console.error('Auth verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    setError(null);
    
    try {
      // For demo purposes, simulate a login response
      // In production, this would be an actual API call
      
      // Simulated login API call
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setCurrentUser(response.data.user);
        return { success: true };
      } else {
        setError('Invalid credentials');
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  
  // Register function
  const register = async (userData) => {
    setError(null);
    
    try {
      // Simulated registration API call
      const response = await axios.post('/api/auth/register', userData);
      
      if (response.data.success) {
        return { success: true };
      } else {
        setError(response.data.message || 'Registration failed');
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to register';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  
  const logout = () => {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };
  
  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };
  
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    hasRole
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 