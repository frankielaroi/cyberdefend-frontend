import { useGetSubscriptionQuery, useGetInvoicesQuery, useCancelSubscriptionMutation } from '../../store/api/billingApi';
import { CreditCard, Download, AlertCircle, CheckCircle } from 'lucide-react';
import UpgradeModal from './UpgradeModal';
import { useState } from 'react';

export default function BillingDashboard() {
  const { data: subscription, isLoading: subLoading } = useGetSubscriptionQuery();
  const { data: invoices = [], isLoading: invLoading } = useGetInvoicesQuery();
  const [cancelSubscription] = useCancelSubscriptionMutation();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel your subscription? This will take effect at the end of your billing period.')) {
      try {
        await cancelSubscription().unwrap();
      } catch (error) {
        console.error('Failed to cancel subscription:', error);
      }
    }
  };

  if (subLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Billing & Subscription</h1>
        <p className="text-slate-600 mt-1">Manage your subscription and payment history</p>
      </div>

      {subscription && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{subscription.plan}</h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                  subscription.status === 'trial' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
                {subscription.autoRenew && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Auto-renew enabled
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowUpgrade(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Upgrade Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-1">Current Period</div>
              <div className="text-slate-900 font-medium">
                {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-1">Next Billing Date</div>
              <div className="text-slate-900 font-medium">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Active Modules</h3>
            <div className="flex gap-3">
              {subscription.modules.defendX && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-slate-900">DefendX</span>
                </div>
              )}
              {subscription.modules.defendXPlus && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-slate-900">DefendX+</span>
                </div>
              )}
            </div>
          </div>

          {subscription.status === 'active' && (
            <button
              onClick={handleCancel}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Cancel Subscription
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Invoice History</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {invLoading ? (
            <div className="p-8 text-center text-slate-600">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-slate-600">
              No invoices yet. They will appear here once generated.
            </div>
          ) : (
            invoices.map((invoice) => (
              <div key={invoice.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        invoice.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                      <span className="text-sm text-slate-600">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </span>
                      {invoice.paidAt && (
                        <span className="text-sm text-slate-600">
                          Paid: {new Date(invoice.paidAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {invoice.currency} {invoice.amount.toFixed(2)}
                    </div>
                  </div>
                  {invoice.downloadUrl && (
                    <a
                      href={invoice.downloadUrl}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
