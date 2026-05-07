import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/password-reset/forgot`, {
        email: email
      });

      setMessage(response.data.message || 'Password reset request submitted successfully. If you are an employee/manager, the admin has been notified. If you are an admin, check your email for the reset link.');
      setEmail('');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Email service is temporarily unavailable. Please contact your administrator directly.');
      } else {
        setError(err.response?.data?.message || 'Failed to process password reset request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF5E6] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🥐</div>
          <h2 className="text-3xl font-extrabold text-[#8B4513]">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to reset your password
          </p>
        </div>

        <div className="card">
          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-1"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex justify-center items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-[#8B4513] hover:underline">
              ← Back to Login
            </Link>
          </div>

          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              <strong>Note:</strong><br />
              • <strong>Admins</strong> will receive a reset link via email<br />
              • <strong>Employees/Managers</strong> request will be sent to admin for approval
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;