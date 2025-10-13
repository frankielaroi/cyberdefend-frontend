import { useState } from 'react';
import { 
  Cog6ToothIcon, 
  ShieldCheckIcon, 
  BellIcon, 
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function OrganizationSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState({
    // Security Settings
    enforceSSO: false,
    require2FA: false,
    passwordPolicy: 'standard',
    sessionTimeout: '8',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    securityAlerts: true,
    
    // Assessment Settings
    assessmentReminders: true,
    autoAssignAssessments: false,
    assessmentFrequency: 'quarterly',
    
    // Integration Settings
    apiAccess: false,
    webhookUrl: '',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  });

  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleSelectChange = (setting: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement API call to save organization settings
    console.log('Saving organization settings:', settings);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset settings to original values
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Cog6ToothIcon className="h-10 w-10 text-gray-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Organization Settings
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Configure security, notifications, and system preferences.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Settings
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Security Settings
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Single Sign-On (SSO)</label>
                <p className="text-sm text-gray-500">Require SSO authentication for all users</p>
              </div>
              <button
                onClick={() => isEditing && handleToggle('enforceSSO')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.enforceSSO ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.enforceSSO ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                <p className="text-sm text-gray-500">Require 2FA for all organization members</p>
              </div>
              <button
                onClick={() => isEditing && handleToggle('require2FA')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.require2FA ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.require2FA ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Password Policy</label>
                <p className="text-sm text-gray-500">Set minimum password requirements</p>
              </div>
              <select
                value={settings.passwordPolicy}
                onChange={(e) => isEditing && handleSelectChange('passwordPolicy', e.target.value)}
                disabled={!isEditing}
                className="mt-1 block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:opacity-50"
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="strict">Strict</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Session Timeout</label>
                <p className="text-sm text-gray-500">Automatic logout after inactivity (hours)</p>
              </div>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => isEditing && handleSelectChange('sessionTimeout', e.target.value)}
                disabled={!isEditing}
                className="mt-1 block w-20 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:opacity-50"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="8">8</option>
                <option value="24">24</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <BellIcon className="h-6 w-6 text-yellow-500 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Notification Settings
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
              <button
                onClick={() => isEditing && handleToggle('emailNotifications')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Weekly Reports</label>
                <p className="text-sm text-gray-500">Automated weekly security reports</p>
              </div>
              <button
                onClick={() => isEditing && handleToggle('weeklyReports')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.weeklyReports ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.weeklyReports ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Security Alerts</label>
                <p className="text-sm text-gray-500">Immediate alerts for security events</p>
              </div>
              <button
                onClick={() => isEditing && handleToggle('securityAlerts')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.securityAlerts ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.securityAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <ClockIcon className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Assessment Settings
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Assessment Frequency</label>
                <p className="text-sm text-gray-500">How often to conduct assessments</p>
              </div>
              <select
                value={settings.assessmentFrequency}
                onChange={(e) => isEditing && handleSelectChange('assessmentFrequency', e.target.value)}
                disabled={!isEditing}
                className="mt-1 block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:opacity-50"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="biannual">Bi-annual</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Assessment Reminders</label>
                <p className="text-sm text-gray-500">Send reminders for upcoming assessments</p>
              </div>
              <button
                onClick={() => isEditing && handleToggle('assessmentReminders')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.assessmentReminders ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.assessmentReminders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}