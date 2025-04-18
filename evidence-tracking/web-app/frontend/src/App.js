import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import EvidenceList from './components/EvidenceList';
import EvidenceDetail from './components/EvidenceDetail';
import EvidenceSubmission from './components/EvidenceSubmission';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navigation />
          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/evidence" element={<EvidenceList />} />
                  <Route path="/evidence/:id" element={<EvidenceDetail />} />
                  
                  {/* Routes with role-based access */}
                  <Route element={<ProtectedRoute allowedRoles={['admin', 'officer']} />}>
                    <Route path="/submit" element={<EvidenceSubmission />} />
                  </Route>
                  
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/verification" element={
                      <div className="p-4 bg-white shadow rounded-lg">
                        <h1 className="text-2xl font-bold text-gray-900">Verification Dashboard</h1>
                        <p className="mt-4 text-gray-600">This feature is coming soon.</p>
                      </div>
                    } />
                    <Route path="/reports" element={
                      <div className="p-4 bg-white shadow rounded-lg">
                        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                        <p className="mt-4 text-gray-600">This feature is coming soon.</p>
                      </div>
                    } />
                  </Route>
                </Route>
                
                {/* Redirect any unmatched routes to the dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 