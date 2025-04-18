import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import EvidenceSubmission from './components/EvidenceSubmission';
import EvidenceList from './components/EvidenceList';
import EvidenceDetail from './components/EvidenceDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/submit" element={<EvidenceSubmission />} />
            <Route path="/evidence" element={<EvidenceList />} />
            <Route path="/evidence/:id" element={<EvidenceDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 