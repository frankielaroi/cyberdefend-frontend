import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../../store/api/authApi';
import { Shield, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to send reset link. Please try again.');
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
            <h1 className="text-3xl font-bold text-slate-900">Check Your Email</h1>
            <p className="text-slate-600 mt-2">Password reset instructions sent</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
              </div>
              
              <p className="text-slate-600 text-sm">
                Please check your email and follow the instructions to reset your password. 
                The link will expire in 24 hours.
              </p>
              
              <p className="text-slate-600 text-sm">
                Don't see the email? Check your spam folder or try again.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Send Another Email
              </button>
              
              <Link
                to="/login"
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
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
          <h1 className="text-3xl font-bold text-slate-900">Forgot Password?</h1>
          <p className="text-slate-600 mt-2">No worries, we'll send you reset instructions</p>
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
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email address"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                We'll send password reset instructions to this email address
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}