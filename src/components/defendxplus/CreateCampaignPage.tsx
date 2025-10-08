import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useCreateCampaignMutation, 
  useLaunchCampaignMutation,
  useGetCampaignTemplatesQuery 
} from '../../store/api/realDefendXPlusApi';
import { 
  ArrowLeft, 
  ArrowRight,
  Mail, 
  Users, 
  Settings,
  Play,
  Check,
  AlertTriangle,
  Calendar,
  Eye
} from 'lucide-react';
import type { CreateCampaignDto } from '../../types';

interface CampaignFormData extends Omit<CreateCampaignDto, 'targets'> {
  targetsText: string;
}

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const [createCampaign, { isLoading: isCreating }] = useCreateCampaignMutation();
  const [launchCampaign, { isLoading: isLaunching }] = useLaunchCampaignMutation();
  const { data: templatesData, error: templatesError, isLoading: templatesLoading } = useGetCampaignTemplatesQuery();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  // Debug templates API call
  React.useEffect(() => {
    if (templatesError) {
      console.error('Templates API Error:', templatesError);
    }
    if (templatesData) {
      console.log('Templates Data:', templatesData);
    }
  }, [templatesData, templatesError]);
  
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    templateId: '',
    subject: '',
    senderName: 'IT Security Team',
    senderEmail: 'security@company.com',
    landingPageUrl: '',
    targetsText: '',
    scheduledAt: '',
  });

  // Use backend templates only, no fallback
  const templates = templatesData?.templates || [];
  
  // Initialize form with first available template when templates load
  React.useEffect(() => {
    if (templates.length > 0 && !formData.templateId) {
      const firstTemplate = templates[0];
      setFormData(prev => ({
        ...prev,
        templateId: firstTemplate.id,
        subject: firstTemplate.defaultSubject || '',
        senderName: firstTemplate.defaultSenderName || 'IT Security Team',
      }));
    }
  }, [templates, formData.templateId]);
  
  // Show loading state if templates are still being fetched
  if (templatesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading campaign templates...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if templates failed to load
  if (templatesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Templates Not Available</h2>
            <p className="text-gray-600 mb-4">
              Unable to load campaign templates from the backend.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Error: {JSON.stringify(templatesError)}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no templates are available
  if (templates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📧</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Templates Available</h2>
            <p className="text-gray-600 mb-4">
              No campaign templates are currently configured in the system.
            </p>
            <button
              onClick={() => navigate('/defendx-plus')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Campaign Details', icon: Settings },
    { id: 2, title: 'Email Template', icon: Mail },
    { id: 3, title: 'Target Audience', icon: Users },
    { id: 4, title: 'Review & Launch', icon: Check },
  ];

  const selectedTemplate = templates.find(t => t.id === formData.templateId);

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '';
      case 2:
        return formData.subject.trim() !== '' && formData.senderName.trim() !== '' && formData.senderEmail.trim() !== '';
      case 3:
        return formData.targetsText.trim() !== '';
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateCampaign = async () => {
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
      
      setCampaignId(result.data?.id || null);
      return result.data;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  };

  const handleLaunchCampaign = async () => {
    if (!campaignId) {
      const campaign = await handleCreateCampaign();
      if (campaign) {
        await launchCampaign({
          campaignId: campaign.id,
          launchType: 'NOW'
        }).unwrap();
        navigate('/defendx-plus/campaigns');
      }
    } else {
      await launchCampaign({
        campaignId,
        launchType: 'NOW'
      }).unwrap();
      navigate('/defendx-plus/campaigns');
    }
  };

  const handleSaveDraft = async () => {
    try {
      await handleCreateCampaign();
      navigate('/defendx-plus/campaigns');
    } catch (error) {
      // Error handling is done in handleCreateCampaign
    }
  };

  // Auto-fill template defaults when template changes
  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      updateFormData({
        templateId: templateId as any,
        subject: template.defaultSubject,
        senderName: template.defaultSenderName,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/defendx-plus/campaigns')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Create Phishing Campaign</h1>
              <p className="text-slate-600">Set up a new security awareness campaign</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isValid = validateStep(step.id);
              const IconComponent = step.icon;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-700' :
                    isCompleted ? 'bg-green-100 text-green-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive ? 'bg-blue-600 text-white' :
                      isCompleted ? 'bg-green-600 text-white' :
                      'bg-slate-300 text-slate-600'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                    </div>
                    <div>
                      <div className="font-medium">{step.title}</div>
                      {isActive && !isValid && (
                        <div className="text-xs text-red-600">Required fields missing</div>
                      )}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-16 h-1 bg-slate-200 mx-4">
                      <div className={`h-full transition-all duration-300 ${
                        currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          {/* Step 1: Campaign Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Campaign Details</h2>
                <p className="text-slate-600">Give your campaign a name and description</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Q4 Security Awareness Test"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of this campaign's purpose and goals..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Schedule Launch (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => updateFormData({ scheduledAt: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-slate-600 mt-1">
                  Leave empty to launch immediately after creation
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Email Template */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Email Template</h2>
                <p className="text-slate-600">Choose a template and customize the email content</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Select Template
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateChange(template.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.templateId === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-slate-900">{template.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          template.riskLevel === 'HIGH' || template.riskLevel === 'VERY_HIGH' ? 'bg-red-100 text-red-700' :
                          template.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {template.riskLevel}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                        {template.description.length > 100 
                          ? `${template.description.substring(0, 100)}...` 
                          : template.description}
                      </p>
                      <p className="text-xs text-slate-500">{template.category}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTemplate && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </h4>
                  <p className="text-sm text-slate-600">{selectedTemplate.previewContent}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => updateFormData({ subject: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sender Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.senderName}
                    onChange={(e) => updateFormData({ senderName: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sender Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.senderEmail}
                  onChange={(e) => updateFormData({ senderEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="security@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Landing Page URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.landingPageUrl}
                  onChange={(e) => updateFormData({ landingPageUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://phishing-test.company.com"
                />
                <p className="text-sm text-slate-600 mt-1">
                  Custom landing page for clicked links (optional)
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Target Audience */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Target Audience</h2>
                <p className="text-slate-600">Add the email addresses you want to target</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Target Email Addresses *
                </label>
                <textarea
                  required
                  value={formData.targetsText}
                  onChange={(e) => updateFormData({ targetsText: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email addresses, one per line:&#10;john.doe@company.com&#10;jane.smith@company.com&#10;alex.johnson@company.com"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-slate-600">
                    Enter one email address per line
                  </p>
                  <p className="text-sm font-medium text-blue-600">
                    {formData.targetsText.split('\n').filter(e => e.trim()).length} target(s) added
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">Important Notice</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Ensure all participants have been informed about security awareness training 
                      and have consented to participate in simulated phishing tests.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Launch */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Review & Launch</h2>
                <p className="text-slate-600">Review your campaign settings before launching</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-slate-900 mb-2">Campaign Details</h3>
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                      <div><span className="font-medium">Name:</span> {formData.name}</div>
                      {formData.description && (
                        <div><span className="font-medium">Description:</span> {formData.description}</div>
                      )}
                      {formData.scheduledAt && (
                        <div><span className="font-medium">Scheduled:</span> {new Date(formData.scheduledAt).toLocaleString()}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-900 mb-2">Email Configuration</h3>
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                      <div><span className="font-medium">Template:</span> {selectedTemplate?.name}</div>
                      <div><span className="font-medium">Subject:</span> {formData.subject}</div>
                      <div><span className="font-medium">From:</span> {formData.senderName} &lt;{formData.senderEmail}&gt;</div>
                      {formData.landingPageUrl && (
                        <div><span className="font-medium">Landing Page:</span> {formData.landingPageUrl}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Target Audience</h3>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {formData.targetsText.split('\n').filter(e => e.trim()).length}
                    </div>
                    <div className="text-sm text-slate-600">Recipients</div>
                    <div className="mt-3 max-h-32 overflow-y-auto">
                      {formData.targetsText.split('\n').filter(e => e.trim()).slice(0, 5).map((email, index) => (
                        <div key={index} className="text-sm text-slate-700">{email.trim()}</div>
                      ))}
                      {formData.targetsText.split('\n').filter(e => e.trim()).length > 5 && (
                        <div className="text-sm text-slate-500">
                          +{formData.targetsText.split('\n').filter(e => e.trim()).length - 5} more...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-8 border-t border-slate-200 mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-3">
              {currentStep === 4 ? (
                <>
                  <button
                    onClick={handleSaveDraft}
                    disabled={isCreating}
                    className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={handleLaunchCampaign}
                    disabled={isCreating || isLaunching}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    {isLaunching ? 'Launching...' : 'Launch Campaign'}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}