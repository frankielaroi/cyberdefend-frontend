import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { verifyPayment } from '../../services/paymentService';

const PaystackCallback: React.FC = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Processing payment...');
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const paymentReference = params.get('reference');

    if (!paymentReference) {
      setStatus('failed');
      setMessage('Payment reference is missing. Please contact support.');
      return;
    }

    setReference(paymentReference);

    // Verify the payment
    verifyPayment(paymentReference)
      .then((response) => {
        if (response.status && response.data.status === 'success') {
          setStatus('success');
          setMessage('Payment successful! Your subscription has been activated.');
        } else {
          setStatus('failed');
          setMessage('Payment verification failed. Please contact support if you were charged.');
        }
      })
      .catch((error) => {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setMessage('Failed to verify payment. Please contact support.');
      });
  }, [search]);

  const handleContinue = () => {
    if (status === 'success') {
      // Redirect to dashboard or subscription management page
      navigate('/dashboard');
    } else {
      // Redirect back to billing plans
      navigate('/billing');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <ArrowPathIcon className="w-16 h-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircleIcon className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-16 h-16 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          {getStatusIcon()}
        </div>

        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {status === 'loading' && 'Processing Payment'}
          {status === 'success' && 'Payment Successful!'}
          {status === 'failed' && 'Payment Failed'}
        </h1>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {reference && (
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-500">Reference:</p>
            <p className="font-mono text-sm text-gray-800">{reference}</p>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={status === 'loading'}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            status === 'success'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : status === 'failed'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          {status === 'success' ? 'Continue to Dashboard' : 'Back to Plans'}
        </button>

        {status === 'failed' && (
          <p className="text-sm text-gray-500 mt-4">
            If you believe this is an error, please contact our support team.
          </p>
        )}
      </div>
    </div>
  );
};

export default PaystackCallback;