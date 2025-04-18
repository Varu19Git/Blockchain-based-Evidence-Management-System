import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const EvidenceDetail = () => {
  const { id } = useParams();
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvidence({
        id,
        name: `Evidence Item ${id}`,
        type: id === '1' ? 'Document' : id === '2' ? 'Image' : 'Video',
        hash: id === '1' ? '0x1a2b3c...' : id === '2' ? '0x4d5e6f...' : '0x7g8h9i...',
        timestamp: new Date().toISOString(),
        description: 'This is a detailed description of the evidence item.',
        chain: [
          { action: 'Created', timestamp: '2025-04-18T10:30:00Z', user: 'Officer Smith' },
          { action: 'Verified', timestamp: '2025-04-18T11:15:00Z', user: 'Supervisor Johnson' },
          { action: 'Accessed', timestamp: '2025-04-18T14:22:00Z', user: 'Detective Brown' }
        ],
        metadata: {
          location: 'Evidence Locker B',
          caseNumber: 'CB-2025-0432',
          tags: ['important', 'digital', 'verified']
        }
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-semibold">Loading evidence details...</div>
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Evidence Not Found</h1>
        <p>The requested evidence item could not be found.</p>
        <Link to="/evidence" className="mt-4 inline-block text-indigo-600 hover:text-indigo-900">
          Back to Evidence List
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Evidence Details</h1>
        <Link to="/evidence" className="text-indigo-600 hover:text-indigo-900">
          Back to Evidence List
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <div className="mt-2 bg-gray-50 p-4 rounded">
              <p><span className="font-medium">ID:</span> {evidence.id}</p>
              <p><span className="font-medium">Name:</span> {evidence.name}</p>
              <p><span className="font-medium">Type:</span> {evidence.type}</p>
              <p><span className="font-medium">Hash:</span> {evidence.hash}</p>
              <p><span className="font-medium">Timestamp:</span> {new Date(evidence.timestamp).toLocaleString()}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Description</h2>
            <div className="mt-2 bg-gray-50 p-4 rounded">
              <p>{evidence.description}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Metadata</h2>
            <div className="mt-2 bg-gray-50 p-4 rounded">
              <p><span className="font-medium">Location:</span> {evidence.metadata.location}</p>
              <p><span className="font-medium">Case Number:</span> {evidence.metadata.caseNumber}</p>
              <div className="mt-2">
                <span className="font-medium">Tags:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {evidence.metadata.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Chain of Custody</h2>
          <div className="mt-2 bg-gray-50 p-4 rounded">
            <div className="border-l-2 border-indigo-500 pl-4 space-y-6">
              {evidence.chain.map((event, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-6 mt-1 w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                  <div>
                    <p className="font-semibold">{event.action}</p>
                    <p className="text-sm text-gray-600">by {event.user}</p>
                    <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDetail; 