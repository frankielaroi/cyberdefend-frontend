import { useState, useEffect } from 'react';
import { useCreateCampaignMutation, useGetCampaignTemplatesQuery } from '../../store/api/realDefendXPlusApi';
import { X, Mail, Users, Calendar, AlertTriangle, Eye } from 'lucide-react';
import type { CreateCampaignDto } from '../../types';

interface Props {
  onClose: () => void;
  onSuccess?: (campaign: any) => void;
}

export default function CreateCampaignModal({ onClose, onSuccess }: Props) {
  const [createCampaign, { isLoading }] = useCreateCampaignMutation();
  const { data: templatesData, isLoading: templatesLoading } = useGetCampaignTemplatesQuery();
  
  // Extract templates from the paginated response
  const templates = templatesData?.templates || [];
  console.log(templates)
  const [formData, setFormData] = useState<Omit<CreateCampaignDto, 'targets'> & { targetsText: string }>({
    name: '',
    description: '',
    templateId: '', // Will be set to first template ID when templates load
    subject: '',
    senderName: 'IT Security Team',
    senderEmail: 'security@company.com',
    landingPageUrl: '',
    targetsText: '',
    scheduledAt: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  // Find selected template
  const selectedTemplate = templates.find(t => t.id === formData.templateId);

  // Set default template when templates load
  useEffect(() => {
    if (templates.length > 0 && !formData.templateId) {
      const firstTemplate = templates[0];
      setFormData(prev => ({ 
        ...prev, 
        templateId: firstTemplate.id,
        subject: firstTemplate.defaultSubject,
        senderName: firstTemplate.defaultSenderName
      }));
    }
  }, [templates, formData.templateId]);

  // Update form fields when template changes
  useEffect(() => {
    if (formData.templateId && selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        subject: selectedTemplate.defaultSubject,
        senderName: selectedTemplate.defaultSenderName
      }));
    }
  }, [formData.templateId]); // Remove selectedTemplate from dependencies to avoid infinite loop

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
    if (!formData.templateId) newErrors.template = 'Please select a template';
    if (!formData.subject.trim()) newErrors.subject = 'Email subject is required';
    if (!formData.senderName.trim()) newErrors.senderName = 'Sender name is required';
    if (!formData.senderEmail.trim()) newErrors.senderEmail = 'Sender email is required';
    if (!formData.targetsText.trim()) newErrors.targetsText = 'At least one target email is required';
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.senderEmail && !emailRegex.test(formData.senderEmail)) {
      newErrors.senderEmail = 'Please enter a valid email address';
    }
    
    // Validate target emails
    if (formData.targetsText) {
      const emails = formData.targetsText.split('\n').map(e => e.trim()).filter(Boolean);
      const invalidEmails = emails.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        newErrors.targetsText = `Invalid email addresses: ${invalidEmails.join(', ')}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const targetEmails = formData.targetsText.split('\n').map(e => e.trim()).filter(Boolean);
    const targets = targetEmails.map(email => ({ email }));

    try {
      const result = await createCampaign({
        name: formData.name,
        description: formData.description || undefined,
        templateId: formData.templateId,
        subject: formData.subject,
        senderName: formData.senderName,
        senderEmail: formData.senderEmail,
        landingPageUrl: formData.landingPageUrl || undefined,
        targets,
        scheduledAt: formData.scheduledAt || undefined,
      }).unwrap();
      
      onSuccess?.(result.data);
      onClose();
    } catch (error: any) {
      console.error('Failed to create campaign:', error);
      setErrors({ submit: 'Failed to create campaign. Please try again.' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Create Phishing Campaign</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.name ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Q4 Security Awareness Test"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Template ({templates.length} available)
            </label>
            {templatesLoading ? (
              <div className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-gray-50">
                <span className="text-gray-500">Loading templates...</span>
              </div>
            ) : templates.length > 0 ? (
              <select
                value={formData.templateId}
                onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.category} - {template.riskLevel})
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-4 py-2 border border-red-300 rounded-lg bg-red-50">
                <span className="text-red-600">No templates found in response. </span>
                <button
                  type="button"
                  onClick={() => window.open('/defendx-plus/templates', '_blank')}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Create a template first
                </button>
              </div>
            )}
            {errors.template && <p className="text-red-600 text-sm mt-1">{errors.template}</p>}
            {selectedTemplate && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-slate-600 line-clamp-2">
                  {selectedTemplate.description.length > 150 
                    ? `${selectedTemplate.description.substring(0, 150)}...` 
                    : selectedTemplate.description}
                </p>
                <div className="text-xs text-slate-500 mt-1 flex justify-between">
                  <div>
                    <span>Category: {selectedTemplate.category}</span>
                    <span className="ml-3">Risk: {selectedTemplate.riskLevel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Usage: {selectedTemplate.usageCount} times</span>
                    <button
                      type="button"
                      onClick={() => setShowTemplatePreview(true)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                  </div>
                </div>
                {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedTemplate.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                        {tag}
                      </span>
                    ))}
                    {selectedTemplate.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{selectedTemplate.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Email Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Subject
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.subject ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Urgent: Password Reset Required"
              />
              {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sender Name
              </label>
              <input
                type="text"
                required
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.senderName ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="IT Security Team"
              />
              {errors.senderName && <p className="text-red-600 text-sm mt-1">{errors.senderName}</p>}
            </div>
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.senderEmail ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="security@company.com"
            />
            {errors.senderEmail && <p className="text-red-600 text-sm mt-1">{errors.senderEmail}</p>}
          </div>

          {/* Target Emails */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Target Emails
            </label>
            <textarea
              required
              value={formData.targetsText}
              onChange={(e) => setFormData({ ...formData, targetsText: e.target.value })}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.targetsText ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Enter email addresses, one per line&#10;john.doe@company.com&#10;jane.smith@company.com"
            />
            {errors.targetsText && <p className="text-red-600 text-sm mt-1">{errors.targetsText}</p>}
            <p className="text-sm text-slate-600 mt-1">
              Enter one email address per line. {formData.targetsText.split('\n').filter(e => e.trim()).length} target(s) added.
            </p>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Landing Page URL (Optional)
              </label>
              <input
                type="url"
                value={formData.landingPageUrl}
                onChange={(e) => setFormData({ ...formData, landingPageUrl: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://phishing-test.company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Schedule For Later (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of this campaign's purpose..."
            />
          </div>

          {/* Warning Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">Security Testing Notice</h4>
                <p className="text-sm text-amber-700 mt-1">
                  This is a simulated phishing campaign for security awareness training. 
                  Ensure all participants are informed and have consented to participate in security testing.
                </p>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
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
              disabled={isLoading || templates.length === 0 || templatesLoading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {isLoading ? 'Creating...' : templates.length === 0 ? 'No Templates Available' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>

      {/* Template Preview Modal */}
      {showTemplatePreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Template Preview: {selectedTemplate.name}</h3>
              <button
                onClick={() => setShowTemplatePreview(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Subject:</span>
                    <p className="text-gray-900">{selectedTemplate.defaultSubject}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">From:</span>
                    <p className="text-gray-900">{selectedTemplate.defaultSenderName}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Email HTML Body:</span>
                  <div className="bg-gray-50 p-3 rounded-lg max-h-60 overflow-y-auto mt-1">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTemplate.emailBodyHtml}</pre>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Email Text Body:</span>
                  <div className="bg-gray-50 p-3 rounded-lg max-h-60 overflow-y-auto mt-1">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTemplate.emailBodyText}</pre>
                  </div>
                </div>
                {selectedTemplate.landingPageHtml && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Landing Page HTML:</span>
                    <div className="bg-gray-50 p-3 rounded-lg max-h-60 overflow-y-auto mt-1">
                      <pre className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTemplate.landingPageHtml}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
