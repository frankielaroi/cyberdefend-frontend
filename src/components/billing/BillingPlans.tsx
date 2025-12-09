import React, { useEffect, useState } from 'react';
import { CheckIcon, CreditCardIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { fetchPaystackSubscriptionPlans, PaystackPlan, initializePaystackSubscription } from '../../services/billingService';
import { getCurrentUserEmail } from '../../services/paymentService';

interface BillingPlansProps {
  token?: string;
}

const BillingPlans: React.FC<BillingPlansProps> = ({ token }) => {
  const [plans, setPlans] = useState<PaystackPlan[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [recommendedPlan, setRecommendedPlan] = useState<string | number | undefined>(undefined);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null); // plan ID being processed
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const formatCurrency = (amount?: number | string, currency?: string) => {
    if (amount === undefined || amount === null) return '—';
    const n = Number(amount);
    if (Number.isNaN(n)) return String(amount);
    const value = Number.isInteger(n) && Math.abs(n) > 1000 ? n / 100 : n;
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(value);
    } catch {
      return `${currency ?? ''} ${value.toFixed(2)}`;
    }
  };

  const getPlanPrice = (plan: PaystackPlan) => {
    const amount = (plan as any).price ?? (plan as any).amount ?? (plan as any).cost ?? (plan as any).price_in_cents;
    const currency = (plan as any).currency ?? (plan as any).currency_code ?? (plan as any).currencyCode;
    return formatCurrency(amount, currency);
  };

  const handleChoosePlan = async (plan: PaystackPlan) => {
    setPaymentError(null);
    setPaymentLoading(plan.id);

    try {
      // Get user email - in a real app, this should come from auth context
      const email = getCurrentUserEmail();
      if (!email) {
        setPaymentError('User email not found. Please log in again.');
        return;
      }

      // Get plan code - this should be the Paystack plan_code
      const planCode = (plan as any).plan_code || plan.id;
      if (!planCode) {
        setPaymentError('Plan code not found. Please contact support.');
        return;
      }

      // Initialize payment
      const response = await initializePaystackSubscription({
        email,
        plan: planCode,
        callback_url: `${window.location.origin}/billing/callback`,
      }, token);

      if (response.status && response.data.authorization_url) {
        // Redirect to Paystack checkout
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error('Invalid payment initialization response');
      }
    } catch (err: any) {
      console.error('Payment initialization failed:', err);
      setPaymentError(
        err?.body?.message ||
        err?.message ||
        'Failed to initialize payment. Please try again.'
      );
    } finally {
      setPaymentLoading(null);
    }
  };

  async function loadPlans() {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchPaystackSubscriptionPlans(token);
      setPlans(data);
      if (Array.isArray(data) && data.length > 0) {
        // Use `amount` from the plan object as the numeric value for comparison
        const top = data.reduce((best, p) => {
          const pa = Number((p as any).amount ?? 0);
          const ba = Number((best as any).amount ?? 0);
          return pa > ba ? p : best;
        }, data[0]);
        setRecommendedPlan((top as any).id);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="p-8 text-center text-red-400">
          <p className="text-xl font-semibold mb-2">Failed to load plans</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={loadPlans}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: `${100 - mousePosition.x}%`,
            top: `${100 - mousePosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Subscription Plans</h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Choose the perfect plan for your organization's cybersecurity needs
            </p>
          </div>

          {!plans || plans.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <p className="text-lg">No plans available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="group relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl overflow-hidden transition-all duration-500 transform hover:scale-105 hover:shadow-3xl"
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Popular badge */}
                  {recommendedPlan === plan.id && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Most Popular
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name || plan.id}</h3>
                      <p className="text-slate-300 text-sm mb-4">{(plan as any).description || 'Comprehensive cybersecurity solution'}</p>

                      <div className="mb-4">
                        <div className="text-4xl font-bold text-blue-100 mb-1">{getPlanPrice(plan)}</div>
                        <div className="text-slate-400 text-sm capitalize">
                          per {plan.interval || (plan as any).interval || 'month'}
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    {Array.isArray((plan as any).features) && (plan as any).features.length > 0 && (
                      <ul className="space-y-3 mb-6">
                        {(plan as any).features.map((f: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckIcon className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-300 text-sm">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Action buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => setExpanded(prev => ({ ...prev, [plan.id]: !prev[plan.id] }))}
                        className="w-full px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-colors text-sm font-medium"
                      >
                        {expanded[plan.id] ? 'Hide Details' : 'View Details'}
                      </button>

                      {((plan as any).trial_days ?? (plan as any).trialDays) ? (
                        <button className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                          Start {(plan as any).trial_days ?? (plan as any).trialDays}-Day Free Trial
                        </button>
                      ) : (
                        <button
                          onClick={() => handleChoosePlan(plan)}
                          disabled={paymentLoading === plan.id}
                          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                          {paymentLoading === plan.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCardIcon className="w-4 h-4" />
                              Choose Plan
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Expanded details */}
                    {expanded[plan.id] && (
                      <div className="mt-6 bg-slate-800/40 backdrop-blur-xl rounded-xl p-4 border border-slate-600/50">
                        <h4 className="text-white font-semibold mb-4">Plan Details</h4>
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          {[
                            ['Price', getPlanPrice(plan)],
                            ['Billing Cycle', plan.interval ?? (plan as any).interval ?? (plan as any).billingInterval],
                            ['Currency', (plan as any).currency ?? (plan as any).currency_code ?? 'USD'],
                          ].map(([label, value]) => {
                            if (value === undefined || value === null) return null;
                            const display = Array.isArray(value) ? value.join(', ') : String(value);
                            return (
                              <div key={String(label)} className="flex justify-between items-center">
                                <span className="text-slate-400 capitalize">{String(label)}:</span>
                                <span className="text-white font-medium">{display}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payment Error Display */}
          {paymentError && (
            <div className="mt-8 max-w-md mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-red-800 font-medium">Payment Error</h3>
                    <p className="text-red-700 text-sm mt-1">{paymentError}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPaymentError(null)}
                  className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingPlans;
