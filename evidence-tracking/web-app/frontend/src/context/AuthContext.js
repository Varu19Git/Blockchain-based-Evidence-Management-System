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
        const authToken = localStorage.getItem('authToken');
        
        if (authToken) {
          // Set the auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
          
          // Verify the token with backend
          const response = await axios.get(`${API_URL}/auth/me`);
          
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
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setCurrentUser(response.data.user);
        return { success: true };
      } else {
        const errorMessage = 'Invalid credentials';
        setError(errorMessage);
        return { success: false, error: errorMessage };
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
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (response.data && response.data.success) {
        return { success: true };
      } else {
        const errorMessage = response.data?.message || 'Registration failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to register';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };
  
  // Check if user has required role(s)
  const hasRole = (requiredRoles) => {
    if (!currentUser || !currentUser.role) return false;
    
    // If requiredRoles is an array, check if user has any of the roles
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(currentUser.role);
    }
    
    // If requiredRoles is a string, check if user has that role
    return currentUser.role === requiredRoles;
  };
  
  // Calculate isAuthenticated from currentUser
  const isAuthenticated = Boolean(currentUser);
  
  const value = {
    currentUser,
    user: currentUser, // Alias for compatibility with ProtectedRoute
    loading,
    error,
    login,
    register,
    logout,
    hasRole,
    isAuthenticated
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