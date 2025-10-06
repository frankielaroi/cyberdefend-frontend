import { useState } from 'react';
import { useGetPlansQuery, useCreateCheckoutSessionMutation } from '../../store/api/billingApi';
import { X, Check } from 'lucide-react';

interface Props {
  onClose: () => void;
}

type CreateCheckoutMutationResult = [
  (data: any) => Promise<{ data: any }>,
  { isLoading: boolean; error: any; reset: () => void }
];

export default function UpgradeModal({ onClose }: Props) {
  const { data: plans = [], isLoading } = useGetPlansQuery();
  const [createCheckout, { isLoading: isCreating }] = useCreateCheckoutSessionMutation() as CreateCheckoutMutationResult;
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo'>('card');

  const handleCheckout = async () => {
    if (!selectedPlan) return;

    try {
      const result = await createCheckout({
        planId: selectedPlan,
        paymentMethod,
      });

      if (result.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-slate-900">Choose Your Plan</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">Loading plans...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {(plans as any[]).map((plan: any, index: number) => (
                <div
                  key={plan.id || index}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`rounded-xl border-2 p-6 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name || 'Plan'}</h3>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {plan.currency || '$'} {plan.price || '0'}
                  </div>
                  <div className="text-sm text-slate-600 mb-4">
                    per {plan.interval === 'monthly' ? 'month' : 'year'}
                  </div>

                  <div className="space-y-2 mb-4">
                    {(plan.features || []).map((feature: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-200">
                    <div className="text-sm font-medium text-slate-700">Includes:</div>
                    {plan.modules?.defendX && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-blue-600" />
                        DefendX Assessment
                      </div>
                    )}
                    {plan.modules?.defendXPlus && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-blue-600" />
                        DefendX+ Monitoring
                      </div>
                    )}
                  </div>

                  {selectedPlan === plan.id && (
                    <div className="mt-4 px-3 py-2 bg-blue-600 text-white rounded-lg text-center font-medium">
                      Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedPlan && (
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-medium text-slate-900">Credit/Debit Card</div>
                  <div className="text-sm text-slate-600 mt-1">Visa, Mastercard</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('momo')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'momo'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-medium text-slate-900">Mobile Money</div>
                  <div className="text-sm text-slate-600 mt-1">MTN, Vodafone, AirtelTigo</div>
                </button>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCreating}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-lg transition-colors"
              >
                {isCreating ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
