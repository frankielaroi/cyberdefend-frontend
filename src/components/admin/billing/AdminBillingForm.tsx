import { useEffect, useState } from 'react';
import { XMarkIcon, ArrowPathIcon, CurrencyDollarIcon, ClockIcon, UsersIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import adminBillingService, { SubscriptionPlanDto } from '../../../services/adminBillingService';
import { FEATURES, FeaturesMap } from '../../../types/features.type';

interface Props {
  plan?: SubscriptionPlanDto | null;
  onClose: () => void;
  onSaved?: () => void; // callback after create/update
}

export default function AdminBillingForm({ plan, onClose, onSaved }: Props) {
  const [form, setForm] = useState<SubscriptionPlanDto>({
    name: '',
    description: '',
    price: 0,
    currency: 'GHS',
    type: 'monthly',
    trialDays: 0,
    maxUsers: 0,
    maxAssessments: 0,
    features: {},
  });
  const [selectedFeatures, setSelectedFeatures] = useState<FeaturesMap>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plan) {
      setForm({
        id: plan.id,
        name: plan.name ?? '',
        description: plan.description ?? '',
        price: plan.price ?? 0,
        currency: plan.currency ?? 'GHS',
        type: plan.type ?? 'monthly',
        trialDays: plan.trialDays ?? 0,
        maxUsers: plan.maxUsers ?? 0,
        maxAssessments: plan.maxAssessments ?? 0,
        features: plan.features ?? {},
      });
      setSelectedFeatures(plan.features ?? {});
    }
  }, [plan]);

  const handleChange = (key: keyof SubscriptionPlanDto, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleFeatureChange = (module: string, feature: string, checked: boolean) => {
    setSelectedFeatures(prev => {
      const moduleFeatures = prev[module] || [];
      if (checked) {
        return {
          ...prev,
          [module]: [...moduleFeatures, feature]
        };
      } else {
        return {
          ...prev,
          [module]: moduleFeatures.filter(f => f !== feature)
        };
      }
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);

    // validate
    if (!form.name || !form.name.trim()) {
      setError('Name is required.');
      setSaving(false);
      return;
    }
    if (isNaN(Number(form.price))) {
      setError('Price must be a number');
      setSaving(false);
      return;
    }

    try {
      // If the plan has a plan_code (Paystack), use Paystack API via backend proxy
      const paystackPayload = {
        name: form.name,
        amount: Math.round((form.price ?? 0) * 100),
        interval: form.type ?? 'monthly',
        description: form.description,
        features: selectedFeatures,
      };

      if (plan?.plan_code) {
        await adminBillingService.updatePaystackPlan(plan.plan_code!, paystackPayload);
      } else {
        await adminBillingService.createPaystackPlan(paystackPayload);
      }
        onSaved?.();
      onClose();
    } catch (e: any) {
      console.error('Save failed', e);
      setError(e?.body?.message || e?.body || e?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'defendx': return '🛡️';
      case 'defendxplus': return '⚡';
      case 'backup': return '💾';
      case 'monitoring': return '📊';
      case 'audience': return '👥';
      case 'common': return '⚙️';
      default: return '📦';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{plan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}</h2>
                <p className="text-blue-100 text-sm">Configure plan details and features</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-xs">⚠️</span>
                </div>
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Plan Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Professional Plan"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="GHS">GHS (Ghanaian Cedi)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    Price (in main currency unit) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="99.99"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    Billing Interval
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Limits & Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-green-600" />
                Limits & Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Trial Days</label>
                  <input
                    type="number"
                    min="0"
                    value={form.trialDays}
                    onChange={(e) => handleChange('trialDays', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Max Users</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxUsers}
                    onChange={(e) => handleChange('maxUsers', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Max Assessments</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxAssessments}
                    onChange={(e) => handleChange('maxAssessments', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Describe what this plan includes..."
              />
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-purple-600" />
                Features
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
                <div className="space-y-6">
                  {Object.entries(FEATURES).map(([module, features]) => (
                    <div key={module} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getModuleIcon(module)}</span>
                        <h4 className="font-semibold text-gray-900 capitalize">
                          {module.replace('_', ' ')}
                        </h4>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {(selectedFeatures[module] || []).length} selected
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {features.map(feature => (
                          <label key={feature} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={(selectedFeatures[module] || []).includes(feature)}
                              onChange={(e) => handleFeatureChange(module, feature, e.target.checked)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-700 font-medium">
                              {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              {saving ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {plan ? 'Save Changes' : 'Create Plan'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
