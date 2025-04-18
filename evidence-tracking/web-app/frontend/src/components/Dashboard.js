import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvidence: 0,
    recentEvidence: [],
    activeCases: 0
  });
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
          recentEvidence: evidence.slice(-5).reverse(), // Get last 5 items
          activeCases: uniqueCases.size
        });
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Statistics Cards */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Evidence
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.totalEvidence}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Active Cases
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.activeCases}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Recent Submissions
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.recentEvidence.length}
            </dd>
          </div>
        </div>
      </div>

      {/* Recent Evidence */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Recent Evidence
          </h3>
          <div className="mt-4">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {stats.recentEvidence.map((evidence) => (
                  <li key={evidence.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Case ID: {evidence.caseId}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {evidence.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          Submitted: {new Date(evidence.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Link
                          to={`/evidence/${evidence.id}`}
                          className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <Link
                to="/evidence"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View all evidence
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 