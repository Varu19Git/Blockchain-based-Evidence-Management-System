import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route component that restricts access based on authentication and roles
 * 
 * @param {Object} props Component props 
 * @param {string|string[]} [props.allowedRoles] - Optional role(s) allowed to access the route
 * @returns {JSX.Element} The protected route component
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user, hasRole } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="bg-white shadow rounded-lg p-8 max-w-2xl mx-auto mt-10">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-2 text-sm text-gray-500">
            You don't have permission to access this page. This page requires {Array.isArray(allowedRoles) ? allowedRoles.join(' or ') : allowedRoles} role.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Your current role: {user?.role}
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated and has the required role, render the route
  return <Outlet />;
};

export default ProtectedRoute; 