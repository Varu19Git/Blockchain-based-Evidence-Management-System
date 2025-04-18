import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EvidenceSubmission = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    caseId: '',
    description: '',
    file: null,
    metadata: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formPayload = new FormData();
      formPayload.append('caseId', formData.caseId);
      formPayload.append('description', formData.description);
      formPayload.append('file', formData.file);
      formPayload.append('metadata', formData.metadata);

      const response = await axios.post('http://localhost:4000/api/evidence', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Evidence submitted:', response.data);
      navigate(`/evidence/${response.data.evidenceId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit evidence');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Submit New Evidence</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="caseId" className="block text-sm font-medium text-gray-700">
            Case ID
          </label>
          <input
            type="text"
            id="caseId"
            name="caseId"
            required
            value={formData.caseId}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            Evidence File
          </label>
          <input
            type="file"
            id="file"
            name="file"
            required
            onChange={handleFileChange}
            className="mt-1 block w-full"
          />
          <p className="mt-1 text-sm text-gray-500">
            Upload evidence file (max 5MB)
          </p>
        </div>

        <div>
          <label htmlFor="metadata" className="block text-sm font-medium text-gray-700">
            Additional Metadata
          </label>
          <textarea
            id="metadata"
            name="metadata"
            rows={2}
            value={formData.metadata}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter any additional metadata in JSON format"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Evidence'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EvidenceSubmission; 