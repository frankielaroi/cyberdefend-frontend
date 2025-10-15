import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${apiUrl}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { state: { emailVerified: true } });
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to verify email. The link may be invalid or expired.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while verifying your email. Please try again.');
      console.error('Email verification error:', error);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${apiUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Verification email sent successfully! Please check your inbox.');
      } else {
        alert(data.message || 'Failed to resend verification email.');
      }
    } catch (error) {
      alert('An error occurred while resending the verification email.');
      console.error('Resend verification error:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 text-center">
          {/* Status Icon */}
          <div className="mb-6">
            {status === 'loading' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {status === 'loading' && 'Verifying Your Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          {/* Message */}
          <p className="text-slate-300 mb-8">
            {message}
          </p>

          {/* Actions */}
          {status === 'success' && (
            <div className="space-y-4">
              <div className="text-sm text-slate-400 mb-4">
                Redirecting to login in a few seconds...
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                Go to Login
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              {/* Resend verification section */}
              <div className="border-t border-slate-700 pt-6">
                <div className="flex items-center justify-center gap-2 text-slate-400 mb-4">
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">Need a new verification link?</span>
                </div>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Need help?{' '}
            <a href="mailto:support@cyberdefend.com" className="text-blue-400 hover:text-blue-300 transition-colors">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
