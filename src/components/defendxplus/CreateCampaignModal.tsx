import { useState } from 'react';
import { useCreateCampaignMutation } from '../../store/api/defendxPlusApi';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

type CreateCampaignMutationResult = [
  (params: any) => Promise<{ data: any }>,
  { isLoading: boolean; error: any; reset: () => void }
];

export default function CreateCampaignModal({ onClose }: Props) {
  const [createCampaign, { isLoading }] = useCreateCampaignMutation() as CreateCampaignMutationResult;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template: 'PASSWORD_RESET' as const,
    subject: '',
    senderName: '',
    senderEmail: '',
    landingPageUrl: '',
    targets: '',
    scheduledAt: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetEmails = formData.targets.split('\n').map(e => e.trim()).filter(Boolean);
    const targets = targetEmails.map(email => ({ email }));

    try {
      const result = await createCampaign({
        name: formData.name,
        description: formData.description || undefined,
        template: formData.template,
        subject: formData.subject,
        senderName: formData.senderName,
        senderEmail: formData.senderEmail,
        landingPageUrl: formData.landingPageUrl || undefined,
        targets,
        scheduledAt: formData.scheduledAt || undefined,
      });
      
      if (result.data) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Create Phishing Campaign</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Q1 2024 Security Awareness Test"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Quarterly phishing simulation for all employees"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Template
            </label>
            <select
              required
              value={formData.template}
              onChange={(e) => setFormData({ ...formData, template: e.target.value as any })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PASSWORD_RESET">Password Reset Request</option>
              <option value="IT_SECURITY">IT Security Alert</option>
              <option value="SHIPPING_NOTICE">Package Delivery</option>
              <option value="HR_UPDATE">HR Update</option>
              <option value="BANK_ALERT">Bank Alert</option>
              <option value="CUSTOM">Custom Template</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Subject
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Urgent: Password Reset Required"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sender Name
              </label>
              <input
                type="text"
                required
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="IT Security Team"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sender Email
              </label>
              <input
                type="email"
                required
                value={formData.senderEmail}
                onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="security@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Landing Page URL (Optional)
            </label>
            <input
              type="url"
              value={formData.landingPageUrl}
              onChange={(e) => setFormData({ ...formData, landingPageUrl: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://secure.phishingsim.com/landing/abc123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Target Email Addresses
              <span className="text-slate-500 font-normal ml-2">(one per line)</span>
            </label>
            <textarea
              required
              value={formData.targets}
              onChange={(e) => setFormData({ ...formData, targets: e.target.value })}
              rows={8}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
            />
            <p className="text-sm text-slate-500 mt-1">
              {formData.targets.split('\n').filter(e => e.trim()).length} recipients
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Schedule Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-slate-500 mt-1">
              Leave empty to start immediately
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
