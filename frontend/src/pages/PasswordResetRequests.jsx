import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { KeyIcon, EnvelopeIcon, UserIcon, ClockIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const PasswordResetRequests = () => {
  const { token } = useSelector((state) => state.auth);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwords, setPasswords] = useState({});
  const [showPassword, setShowPassword] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const API_URL = 'http://localhost:8080/api';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/password-reset/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data);
    } catch (err) {
      setError('Failed to fetch password reset requests');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (requestId, value) => {
    setPasswords({ ...passwords, [requestId]: value });
    if (validationErrors[requestId]) {
      setValidationErrors({ ...validationErrors, [requestId]: '' });
    }
  };

  const toggleShowPassword = (requestId) => {
    setShowPassword({ ...showPassword, [requestId]: !showPassword[requestId] });
  };

  const validatePassword = (password) => {
    if (!password || password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  const handleSetPassword = async (requestId) => {
    const password = passwords[requestId];
    const validationError = validatePassword(password);
    
    if (validationError) {
      setValidationErrors({ ...validationErrors, [requestId]: validationError });
      return;
    }

    setProcessingId(requestId);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(
        `${API_URL}/password-reset/requests/${requestId}/set-password`,
        { newPassword: password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(response.data.message);
      // Clear password for this request
      setPasswords({ ...passwords, [requestId]: '' });
      // Refresh the list
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set password');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#8B4513]">Password Reset Requests</h1>
          <p className="text-gray-600 mt-1">Manage pending password reset requests from employees and managers</p>
        </div>
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
          <span className="font-semibold">{requests.length}</span> Pending Requests
        </div>
      </div>

      {message && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg">
          <CheckCircleIcon className="h-5 w-5 inline mr-2" />
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Requests</h3>
          <p className="text-gray-600">There are no password reset requests waiting for your approval.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div key={request.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col gap-4">
                {/* User Info Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{request.user?.fullName}</h3>
                        <p className="text-sm text-gray-600">{request.user?.email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.user?.role === 'MANAGER' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {request.user?.role}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <ClockIcon className="h-4 w-4" />
                        <span>Requested: {formatDate(request.requestedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <EnvelopeIcon className="h-4 w-4" />
                        <span>Expires: {formatDate(request.expiresAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Input Section */}
                <div className="border-t pt-4 mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Set New Password for {request.user?.fullName}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <input
                        type={showPassword[request.id] ? 'text' : 'password'}
                        value={passwords[request.id] || ''}
                        onChange={(e) => handlePasswordChange(request.id, e.target.value)}
                        placeholder="Enter new password (min 6 characters)"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent ${
                          validationErrors[request.id] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        disabled={processingId === request.id}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowPassword(request.id)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword[request.id] ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => handleSetPassword(request.id)}
                      disabled={processingId === request.id || !passwords[request.id]}
                      className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                    >
                      {processingId === request.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <KeyIcon className="h-4 w-4" />
                          Set Password
                        </>
                      )}
                    </button>
                  </div>
                  {validationErrors[request.id] && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationErrors[request.id]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
          <li>Employees and Managers submit password reset requests from the login page</li>
          <li>System verifies the email exists and creates a pending request</li>
          <li>Admin reviews the request and enters a new password above</li>
          <li>Click "Set Password" to save and automatically email the new password to the user</li>
          <li>The request is marked as processed and removed from this list</li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordResetRequests;