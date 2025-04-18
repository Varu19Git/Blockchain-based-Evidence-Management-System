import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const Dashboard = () => {
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
    <div className="space-y-6">
      <header className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Evidence Tracking Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Overview of evidence management system activity
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Submit New Evidence
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Evidence</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalEvidence}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/evidence" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all evidence <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Verification</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.pendingVerification}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/verification" className="font-medium text-indigo-600 hover:text-indigo-500">
                Verify pending evidence <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Recently Added</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.recentlyAdded}</div>
                    <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="sr-only">Increased by</span>
                      12%
                    </p>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/recent" className="font-medium text-indigo-600 hover:text-indigo-500">
                View recent activities <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/users" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all users <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Evidence by Type</h3>
            <div className="mt-4 h-64 flex items-center justify-center">
              {/* Simulated chart */}
              <div className="flex items-end space-x-6 h-48 w-full max-w-lg">
                <div className="flex flex-col items-center">
                  <div className="bg-indigo-500 w-12 h-32 rounded-t-md"></div>
                  <span className="mt-2 text-xs font-medium text-gray-500">Documents</span>
                  <span className="text-sm font-medium">42%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-yellow-500 w-12 h-24 rounded-t-md"></div>
                  <span className="mt-2 text-xs font-medium text-gray-500">Images</span>
                  <span className="text-sm font-medium">32%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-green-500 w-12 h-16 rounded-t-md"></div>
                  <span className="mt-2 text-xs font-medium text-gray-500">Videos</span>
                  <span className="text-sm font-medium">15%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-red-500 w-12 h-8 rounded-t-md"></div>
                  <span className="mt-2 text-xs font-medium text-gray-500">Audio</span>
                  <span className="text-sm font-medium">7%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-gray-500 w-12 h-4 rounded-t-md"></div>
                  <span className="mt-2 text-xs font-medium text-gray-500">Other</span>
                  <span className="text-sm font-medium">4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Evidence Activity</h3>
            <div className="mt-4 h-64 flex items-center justify-center">
              {/* Simulated line chart */}
              <div className="w-full max-w-lg">
                <svg viewBox="0 0 400 200" className="w-full h-48">
                  <path
                    d="M0,180 L40,160 L80,170 L120,130 L160,150 L200,110 L240,130 L280,100 L320,70 L360,40 L400,30"
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="2"
                  />
                  <path
                    d="M0,180 L40,160 L80,170 L120,130 L160,150 L200,110 L240,130 L280,100 L320,70 L360,40 L400,30"
                    fill="rgba(79, 70, 229, 0.1)"
                    strokeWidth="0"
                  />
                  
                  {/* Axis labels */}
                  <text x="0" y="195" className="text-xs fill-gray-500">Apr 12</text>
                  <text x="80" y="195" className="text-xs fill-gray-500">Apr 14</text>
                  <text x="160" y="195" className="text-xs fill-gray-500">Apr 16</text>
                  <text x="240" y="195" className="text-xs fill-gray-500">Apr 18</text>
                  <text x="320" y="195" className="text-xs fill-gray-500">Apr 20</text>
                </svg>
                <div className="flex justify-around text-sm text-gray-500 mt-2">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full inline-block mr-1"></span>
                    <span>Uploads</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-1"></span>
                    <span>Verifications</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block mr-1"></span>
                    <span>Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Latest actions in the evidence tracking system</p>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center
                      ${activity.action === 'Evidence Uploaded' ? 'bg-indigo-100 text-indigo-500' : 
                        activity.action === 'Evidence Verified' ? 'bg-green-100 text-green-500' : 
                        activity.action === 'Evidence Accessed' ? 'bg-yellow-100 text-yellow-500' : 
                        'bg-purple-100 text-purple-500'}`}
                    >
                      {activity.action === 'Evidence Uploaded' ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : activity.action === 'Evidence Verified' ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : activity.action === 'Evidence Accessed' ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                      <div className="text-sm text-gray-500">
                        <Link to={`/evidence/${activity.evidenceId}`} className="hover:underline">
                          {activity.evidenceName}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <div className="flex flex-col items-end">
                      <div className="text-sm text-gray-500">by {activity.user}</div>
                      <time className="text-xs text-gray-400" dateTime={activity.timestamp}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </time>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/activity" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all activity <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 