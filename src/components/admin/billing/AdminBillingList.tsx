import { useEffect, useState } from 'react';
import { TrashIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import adminBillingService, { SubscriptionPlanDto } from '../../../services/adminBillingService';

interface Props {
  onCreate: () => void;
  onEdit: (plan: SubscriptionPlanDto) => void;
}

export default function AdminBillingList({ onCreate, onEdit }: Props) {
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminBillingService.getLocalPlans();
      const rawPlans = result?.data ?? result?.plans ?? result ?? [];
      const normalized = (rawPlans || []).map((p: any) => ({
        id: p.plan_code ?? p.id,
        plan_code: p.plan_code,
        amount: p.amount,
        price: p.amount !== undefined ? (p.amount / 100) : (p.price ?? 0),
        name: p.name,
        currency: p.currency,
        type: p.interval ?? p.type,
        description: p.description,
        total_subscriptions: p.total_subscriptions,
        active_subscriptions: p.active_subscriptions,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        features: p.features ?? {},
      } as SubscriptionPlanDto));
      setPlans(normalized);
    } catch (e: any) {
      setError(e?.body?.message || e?.body || e?.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (planId?: string | number, planCode?: string | undefined) => {
    if (!planId) return;
    if (!confirm('Delete this plan? This action cannot be undone.')) return;
    try {
      if (planCode) {
        await adminBillingService.deletePaystackPlan(planCode);
      } else {
        await adminBillingService.deleteLocalPlan(String(planId));
      }
      await fetchPlans();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Unable to delete plan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Billing Plans</h2>
        <div>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          >
            <PlusIcon className="w-4 h-4" />
            Create plan
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-slate-600">Total: <b>{plans.length}</b></div>
          <div>
            <button onClick={fetchPlans} className="px-3 py-1 text-sm border rounded-md text-slate-700 hover:bg-slate-50">Refresh</button>
          </div>
        </div>
        {loading && <div className="text-sm text-gray-500">Loading plans...</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}
        {!loading && plans.length === 0 && <div className="text-sm text-gray-500">No plans found.</div>}

        {plans.length > 0 && (
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Price</th>
                  <th className="py-2 px-3">Currency</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Features</th>
                  <th className="py-2 px-3">Subscribers</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => (
                  <tr key={String(plan.id)} className="border-t">
                    <td className="py-2 px-3">{plan.name}</td>
                    <td className="py-2 px-3">{typeof plan.price === 'number' ? plan.price.toFixed(2) : plan.price}</td>
                    <td className="py-2 px-3">{plan.currency ?? 'GHS'}</td>
                    <td className="py-2 px-3">{plan.type ?? '-'}</td>
                    <td className="py-2 px-3">
                      <div className="text-xs">
                        {Object.entries(plan.features || {}).map(([module, features]) => (
                          <div key={module} className="mb-1">
                            <span className="font-medium capitalize">{module.replace('_', ' ')}:</span>{' '}
                            {features.map(f => f.replace(/_/g, ' ')).join(', ')}
                          </div>
                        ))}
                        {Object.keys(plan.features || {}).length === 0 && <span className="text-gray-400">None</span>}
                      </div>
                    </td>
                    <td className="py-2 px-3">{plan.active_subscriptions ?? '-'}</td>
                    <td className="py-2 px-3">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => onEdit(plan)}
                          title="Edit"
                          className="inline-flex items-center px-2 py-1 border border-gray-200 rounded hover:bg-gray-50"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id, plan.plan_code)}
                          title="Delete"
                          className="inline-flex items-center px-2 py-1 border border-red-200 rounded text-red-600 hover:bg-red-50"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
