import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCampaignMutation, useLaunchCampaignMutation } from '../../store/api/defendxPlusApi';
import { 
  ArrowLeft, 
  Upload, 
  Calendar, 
  Users, 
  AlertTriangle,
  Info,
  FileText,
  Play,
  Save
} from 'lucide-react';

interface CampaignFormData {
  name: string;
  description: string;
  template: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  landingPageUrl: string;
  targets: string;
  scheduleDate: string;
  scheduleTime: string;
}

const phishingTemplates = [
  {
    id: 'hr-update',
    name: 'HR Update',
    description: 'Urgent HR policy update requiring immediate action',
    category: 'HR',
    riskLevel: 'Medium'
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    description: 'Security alert requesting password reset',
    category: 'Security',
    riskLevel: 'High'
  },
  {
    id: 'payroll-info',
    name: 'Payroll Information',
    description: 'Request to update payroll or banking information',
    category: 'Finance',
    riskLevel: 'High'
  },
  {
    id: 'it-support',
    name: 'IT Support',
    description: 'Fake IT support ticket or system maintenance',
    category: 'IT',
    riskLevel: 'Medium'
  },
  {
    id: 'ceo-fraud',
    name: 'CEO Fraud',
    description: 'Executive impersonation requesting urgent action',
    category: 'Executive',
    riskLevel: 'Very High'
  },
  {
    id: 'invoice-payment',
    name: 'Invoice Payment',
    description: 'Fake invoice or payment request',
    category: 'Finance',
    riskLevel: 'High'
  }
];

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const [createCampaign, { isLoading: isCreating }] = useCreateCampaignMutation();
  const [launchCampaign, { isLoading: isLaunching }] = useLaunchCampaignMutation();
  
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    template: 'PASSWORD_RESET',
    subject: '',
    senderName: '',
    senderEmail: '',
    landingPageUrl: '',
    targets: '',
    scheduleDate: '',
    scheduleTime: '',
  });

  const [errors, setErrors] = useState<Partial<CampaignFormData>>({});
  const [step, setStep] = useState(1);
  const [targetsFile, setTargetsFile] = useState<File | null>(null);

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Partial<CampaignFormData> = {};

    if (stepNumber === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Campaign name is required';
      }
      if (!formData.template) {
        newErrors.template = 'Please select a template';
      }
      if (!formData.subject.trim()) {
        newErrors.subject = 'Email subject is required';
      }
      if (!formData.senderName.trim()) {
        newErrors.senderName = 'Sender name is required';
      }
      if (!formData.senderEmail.trim()) {
        newErrors.senderEmail = 'Sender email is required';
      }
    }

    if (stepNumber === 2) {
      if (!formData.targets.trim() && !targetsFile) {
        newErrors.targets = 'Please provide target email addresses';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTargetsFile(file);
      // You would typically parse the CSV file here
      // For now, we'll just clear the textarea
      setFormData({ ...formData, targets: '' });
    }
  };

  const getTargetCount = (): number => {
    if (targetsFile) {
      // In a real implementation, you'd parse the CSV file
      return 25; // Mock count
    }
    
    return formData.targets
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'))
      .length;
  };

  const handleSaveDraft = async () => {
    try {
      const targetEmails = targetsFile 
        ? [] // Would be parsed from file
        : formData.targets.split('\n').map(e => e.trim()).filter(Boolean);
      
      const targets = targetEmails.map(email => ({ email }));

      await createCampaign({
        name: formData.name,
        description: formData.description,
        template: formData.template as any,
        subject: formData.subject,
        senderName: formData.senderName,
        senderEmail: formData.senderEmail,
        landingPageUrl: formData.landingPageUrl || undefined,
        targets,
        scheduledAt: formData.scheduleDate ? `${formData.scheduleDate}T${formData.scheduleTime || '09:00'}` : undefined,
      }).unwrap();

      navigate('/dashboard/defendxplus/phishing');
    } catch (error) {
      console.error('Failed to save campaign:', error);
    }
  };

  const handleLaunch = async (immediately: boolean = false) => {
    try {
      const targetEmails = targetsFile 
        ? [] // Would be parsed from file
        : formData.targets.split('\n').map(e => e.trim()).filter(Boolean);

      const targets = targetEmails.map(email => ({ email }));

      // First create the campaign
      const campaign = await createCampaign({
        name: formData.name,
        description: formData.description,
        template: formData.template as any,
        subject: formData.subject,
        senderName: formData.senderName,
        senderEmail: formData.senderEmail,
        landingPageUrl: formData.landingPageUrl || undefined,
        targets,
        scheduledAt: immediately ? undefined : (formData.scheduleDate ? `${formData.scheduleDate}T${formData.scheduleTime || '09:00'}` : undefined),
      }).unwrap();

      // Then launch it
      await launchCampaign({
        campaignId: campaign.id,
        launchType: immediately ? 'NOW' : 'SCHEDULED',
        scheduledAt: immediately ? undefined : (formData.scheduleDate ? `${formData.scheduleDate}T${formData.scheduleTime || '09:00'}` : undefined),
      }).unwrap();

      navigate('/dashboard/defendxplus/phishing');
    } catch (error) {
      console.error('Failed to launch campaign:', error);
    }
  };

  const selectedTemplate = phishingTemplates.find(t => t.id === formData.template);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/defendxplus/phishing')}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create Phishing Campaign</h1>
          <p className="text-slate-600 mt-1">Set up a new phishing simulation to test your team</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {stepNumber}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  step >= stepNumber ? 'text-blue-600' : 'text-slate-600'
                }`}>
                  {stepNumber === 1 && 'Campaign Details'}
                  {stepNumber === 2 && 'Target Selection'}
                  {stepNumber === 3 && 'Schedule & Launch'}
                </p>
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-1 mx-4 ${
                  step > stepNumber ? 'bg-blue-600' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Campaign Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Campaign Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Q4 Security Awareness Training"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Brief description of this campaign's objectives..."
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Select Phishing Template</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phishingTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setFormData({ ...formData, template: template.id })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.template === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">{template.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        template.riskLevel === 'Very High' ? 'bg-red-100 text-red-700' :
                        template.riskLevel === 'High' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {template.riskLevel}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {template.category}
                    </span>
                  </div>
                ))}
              </div>
              
              {errors.template && (
                <p className="mt-2 text-sm text-red-600">{errors.template}</p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Target Selection</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Manual Entry</h3>
                  <textarea
                    value={formData.targets}
                    onChange={(e) => setFormData({ ...formData, targets: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.targets ? 'border-red-300' : 'border-slate-300'
                    }`}
                    rows={8}
                    placeholder="Enter email addresses, one per line:&#10;&#10;john.doe@company.com&#10;jane.smith@company.com&#10;mike.johnson@company.com"
                    disabled={!!targetsFile}
                  />
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-3">CSV Upload</h3>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <div>
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                          Choose CSV file
                        </span>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-slate-500 mt-1">
                        Or drag and drop
                      </p>
                    </div>
                    {targetsFile && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm font-medium">{targetsFile.name}</span>
                        </div>
                        <button
                          onClick={() => {
                            setTargetsFile(null);
                            setFormData({ ...formData, targets: '' });
                          }}
                          className="text-sm text-red-600 hover:text-red-700 mt-1"
                        >
                          Remove file
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">CSV Format Requirements:</p>
                        <ul className="space-y-1">
                          <li>• First column: Email addresses</li>
                          <li>• Optional: Name, Department columns</li>
                          <li>• No header row required</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {errors.targets && (
                <p className="mt-2 text-sm text-red-600">{errors.targets}</p>
              )}

              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2 text-slate-700">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">
                    Target Count: {getTargetCount()} recipients
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Schedule & Launch</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Campaign Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Campaign Name:</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Template:</span>
                      <span className="font-medium">{selectedTemplate?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Target Count:</span>
                      <span className="font-medium">{getTargetCount()} recipients</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Risk Level:</span>
                      <span className={`font-medium ${
                        selectedTemplate?.riskLevel === 'Very High' ? 'text-red-600' :
                        selectedTemplate?.riskLevel === 'High' ? 'text-orange-600' :
                        'text-yellow-600'
                      }`}>
                        {selectedTemplate?.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Schedule Options</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Launch Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.scheduleDate}
                        onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {formData.scheduleDate && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Launch Time
                        </label>
                        <input
                          type="time"
                          value={formData.scheduleTime}
                          onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-700">
                          <p className="font-medium mb-1">Important Reminder:</p>
                          <p>
                            This campaign will send {getTargetCount()} phishing emails to your team. 
                            Ensure you have proper authorization and training materials ready.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div>
            {step > 1 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step === 3 && (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={isCreating}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
                
                <button
                  onClick={() => handleLaunch(true)}
                  disabled={isCreating || isLaunching}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  Launch Now
                </button>
                
                {formData.scheduleDate && (
                  <button
                    onClick={() => handleLaunch(false)}
                    disabled={isCreating || isLaunching}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Launch
                  </button>
                )}
              </>
            )}
            
            {step < 3 && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}