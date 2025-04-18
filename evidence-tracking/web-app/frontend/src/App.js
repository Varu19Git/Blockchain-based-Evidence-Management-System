import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import EvidenceList from './components/EvidenceList';
import EvidenceDetail from './components/EvidenceDetail';
import EvidenceSubmission from './components/EvidenceSubmission';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/evidence" element={<EvidenceList />} />
              <Route path="/evidence/:id" element={<EvidenceDetail />} />
              <Route path="/submit" element={<EvidenceSubmission />} />
              <Route path="/verification" element={<div className="p-4 bg-white shadow rounded-lg"><h1 className="text-2xl font-bold text-gray-900">Verification Dashboard</h1><p className="mt-4 text-gray-600">This feature is coming soon.</p></div>} />
              <Route path="/reports" element={<div className="p-4 bg-white shadow rounded-lg"><h1 className="text-2xl font-bold text-gray-900">Reports</h1><p className="mt-4 text-gray-600">This feature is coming soon.</p></div>} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App; 