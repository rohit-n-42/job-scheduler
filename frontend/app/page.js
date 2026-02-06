'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    taskName: '',
    priority: 'P1',
    payload: '{\n  "key": "value"\n}'
  });

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;

      const response = await axios.get(`${API_URL}/jobs`, { params });
      setJobs(response.data.jobs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  // Create job
  const handleCreateJob = async (e) => {
    e.preventDefault();

    // Validate task name
    if (!formData.taskName.trim()) {
      toast.error('Task name cannot be empty');
      return;
    }

    // Validate JSON payload
    try {
      JSON.parse(formData.payload);
    } catch (error) {
      toast.error('Invalid JSON payload. Please check your syntax.');
      return;
    }

    try {
      await axios.post(`${API_URL}/jobs`, {
        taskName: formData.taskName,
        priority: formData.priority,
        payload: formData.payload
      });

      toast.success('Job created successfully!');
      setShowCreateModal(false);
      setFormData({
        taskName: '',
        priority: 'P1',
        payload: '{\n  "key": "value"\n}'
      });
      fetchJobs();
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error(error.response?.data?.error || 'Failed to create job');
    }
  };

  // Run job
  const handleRunJob = async (jobId) => {
    try {
      await axios.post(`${API_URL}/run-job/${jobId}`);
      toast.success('Job started successfully!');
      
      // Poll for updates
      const pollInterval = setInterval(async () => {
        try {
          const response = await axios.get(`${API_URL}/jobs/${jobId}`);
          const job = response.data.job;
          
          // Update the job in the list
          setJobs(prevJobs => 
            prevJobs.map(j => j.id === jobId ? job : j)
          );

          if (selectedJob?.id === jobId) {
            setSelectedJob(job);
          }

          if (job.status === 'completed') {
            clearInterval(pollInterval);
            toast.success('Job completed successfully!');
          }
        } catch (error) {
          console.error('Error polling job status:', error);
        }
      }, 2000);

      // Clear interval after 15 seconds regardless
      setTimeout(() => clearInterval(pollInterval), 15000);

    } catch (error) {
      console.error('Error running job:', error);
      if (error.response?.data?.error?.includes('already running')) {
        toast.error('Job is already running');
      } else if (error.response?.data?.error?.includes('already completed')) {
        toast.error('Job is already completed');
      } else {
        toast.error('Failed to run job');
      }
    }
  };

  // View job details
  const handleViewJob = async (jobId) => {
    try {
      const response = await axios.get(`${API_URL}/jobs/${jobId}`);
      setSelectedJob(response.data.job);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to fetch job details');
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1':
        return 'bg-red-100 text-red-800';
      case 'P2':
        return 'bg-orange-100 text-orange-800';
      case 'P3':
        return 'bg-yellow-100 text-yellow-800';
      case 'P4':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Job Scheduler</h1>
          <p className="text-gray-600">Manage and execute your scheduled jobs</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              + Create New Job
            </button>

            <div className="flex gap-4 flex-1 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Priorities</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                  <option value="P4">P4</option>
                </select>
              </div>
            </div>

            <button
              onClick={fetchJobs}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No jobs found. Create your first job to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {job.taskName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(job.priority)}`}>
                          {job.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewJob(job.id)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleRunJob(job.id)}
                          disabled={job.status === 'running'}
                          className={`${
                            job.status === 'running'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {job.status === 'running' ? 'Running...' : 'Run'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Job Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Job</h2>
                
                <form onSubmit={handleCreateJob} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Name *
                    </label>
                    <input
                      type="text"
                      value={formData.taskName}
                      onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter task name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="P1">P1 - Highest</option>
                      <option value="P2">P2 - High</option>
                      <option value="P3">P3 - Medium</option>
                      <option value="P4">P4 - Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payload (JSON) *
                    </label>
                    <textarea
                      value={formData.payload}
                      onChange={(e) => setFormData({ ...formData, payload: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                      rows="8"
                      placeholder='{"key": "value"}'
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Enter valid JSON data for the job payload
                    </p>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Create Job
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Job Details Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Job Details</h2>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Job ID</label>
                    <p className="text-lg text-gray-900">{selectedJob.id}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Task Name</label>
                    <p className="text-lg text-gray-900">{selectedJob.taskName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Priority</label>
                      <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getPriorityColor(selectedJob.priority)}`}>
                        {selectedJob.priority}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                      <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(selectedJob.status)}`}>
                        {selectedJob.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Payload</label>
                    <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm">
                      {JSON.stringify(selectedJob.payload, null, 2)}
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedJob.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Updated At</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedJob.updatedAt).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Completed At</label>
                      <p className="text-sm text-gray-900">
                        {selectedJob.completedAt 
                          ? new Date(selectedJob.completedAt).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        handleRunJob(selectedJob.id);
                        setSelectedJob(null);
                      }}
                      disabled={selectedJob.status === 'running'}
                      className={`px-6 py-2 rounded-lg transition-colors ${
                        selectedJob.status === 'running'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {selectedJob.status === 'running' ? 'Running...' : 'Run Job'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}