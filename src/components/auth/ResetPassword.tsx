import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useResetPasswordMutation } from '../../store/api/authApi';
import { Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Invalid or missing reset token');
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams]);

  const validateForm = () => {
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    try {
      await resetPassword({
        token,
        password: formData.password,
      }).unwrap();
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-xl mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Password Reset</h1>
            <p className="text-slate-600 mt-2">Your password has been successfully updated</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Continue to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-xl mb-4">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Invalid Reset Link</h1>
            <p className="text-slate-600 mt-2">This password reset link is invalid or has expired</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
            <div className="text-center space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  The password reset link is invalid, expired, or has already been used.
                </p>
              </div>
              
              <p className="text-slate-600 text-sm">
                Please request a new password reset link to continue.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                to="/forgot-password"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center"
              >
                Request New Reset Link
              </Link>
              
              <Link
                to="/login"
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors flex items-center justify-center"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Reset Password</h1>
          <p className="text-slate-600 mt-2">Enter your new password</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}