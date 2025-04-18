import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser, checkUserRole, logout } = useAuth();
  const [stats, setStats] = useState({
    totalEvidence: 0,
    pendingVerification: 0,
    recentlyAdded: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:4000');

    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/evidence');
        const evidence = response.data;
        
        // Calculate statistics
        const uniqueCases = new Set(evidence.map(ev => ev.caseId));
        setStats({
          totalEvidence: evidence.length,
          pendingVerification: 0, // Assuming no pending verification in the original code
          recentlyAdded: 0, // Assuming no recently added evidence in the original code
          activeUsers: uniqueCases.size
        });
        setRecentActivity([
          { id: '1', action: 'Evidence Uploaded', user: 'Officer Smith', timestamp: '2025-04-18T15:30:00Z', evidenceId: '157', evidenceName: 'Case #2025-0432 Crime Scene Photos' },
          { id: '2', action: 'Evidence Verified', user: 'Supervisor Johnson', timestamp: '2025-04-18T15:15:00Z', evidenceId: '156', evidenceName: 'Case #2025-0430 Witness Statement' },
          { id: '3', action: 'Evidence Accessed', user: 'Detective Brown', timestamp: '2025-04-18T15:00:00Z', evidenceId: '149', evidenceName: 'Case #2025-0427 Surveillance Video' },
          { id: '4', action: 'Evidence Transferred', user: 'Officer Davis', timestamp: '2025-04-18T14:45:00Z', evidenceId: '145', evidenceName: 'Case #2025-0425 Fingerprint Scans' },
          { id: '5', action: 'Evidence Uploaded', user: 'Officer Wilson', timestamp: '2025-04-18T14:30:00Z', evidenceId: '155', evidenceName: 'Case #2025-0429 Audio Recording' }
        ]);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Listen for real-time updates
    socket.on('evidenceUpdated', () => {
      fetchDashboardData();
    });

    return () => socket.disconnect();
  }, []);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-semibold">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Evidence Tracking System</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              {currentUser?.email} ({currentUser?.role})
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
            {checkUserRole('admin') && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Admin Dashboard
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Manage users and approve submissions
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        User Approvals Pending
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          3 pending
                        </span>
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Evidence Submissions Pending
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          5 pending
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
            
            {checkUserRole('police') && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Police Officer Dashboard
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Submit and track evidence cases
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Active Cases
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          7 cases
                        </span>
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Recent Submissions
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          3 new
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
            
            {checkUserRole('lab') && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Lab Technician Dashboard
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Process and analyze evidence
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Pending Analysis
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          4 items
                        </span>
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Completed Reports
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          8 reports
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
            
            {checkUserRole('legal') && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Legal Officer Dashboard
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Review evidence and cases
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Cases for Review
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          5 cases
                        </span>
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Court Submissions
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          2 pending
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
            
            {/* Display this if user account is still pending approval */}
            {currentUser?.status === 'pending' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Your account is pending approval from an administrator. You'll have limited access until approved.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Activity
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Evidence tracking system updates
                </p>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  <li className="p-4">
                    <div className="flex space-x-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Evidence #1234 Updated</h3>
                          <p className="text-sm text-gray-500">2 hours ago</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          Lab analysis completed for Case #5678
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="p-4">
                    <div className="flex space-x-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">New Case #5679 Created</h3>
                          <p className="text-sm text-gray-500">1 day ago</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          Officer Johnson submitted a new case
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="p-4">
                    <div className="flex space-x-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Evidence Transfer Completed</h3>
                          <p className="text-sm text-gray-500">2 days ago</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          Evidence #1122 transferred from Lab to Legal
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 