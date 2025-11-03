import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useCreateSMSCampaignMutation, 
  useLaunchSMSCampaignMutation,
  useGetSMSCampaignsQuery 
} from '../../store/api/realDefendXPlusApi';
import type { SMSCampaignTarget, CreateSMSCampaignDto, SMSCampaignFilters } from '../../types/sms-campaign';

const SMSCampaignManager: React.FC = (): React.ReactNode => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SMSCampaignFilters>({
    page: 1,
    limit: 10,
  });

  const [createCampaign] = useCreateSMSCampaignMutation();
  const [launchCampaign] = useLaunchSMSCampaignMutation();
  const { data: campaigns, isLoading } = useGetSMSCampaignsQuery(filters);

  const [formData, setFormData] = useState<Partial<CreateSMSCampaignDto>>({
    template: 'SMS_PHISHING',
  });

  const [targets, setTargets] = useState<SMSCampaignTarget[]>([]);

  const handleCreateCampaign = async () => {
    if (!formData.name || !formData.senderName || !formData.message || targets.length === 0) {
      // Show error
      return;
    }

    try {
      const campaign = await createCampaign({
        ...formData,
        targets,
        template: 'SMS_PHISHING',
      } as CreateSMSCampaignDto).unwrap();

      if (campaign.data) {
        // Optionally launch immediately
        await launchCampaign({
          campaignId: campaign.data.id,
          immediateStart: true,
        }).unwrap();

        // Navigate to campaign details
        navigate(`/defendx-plus/campaign/${campaign.data.id}`);
      }
    } catch (error) {
      // Handle error
      console.error('Failed to create campaign:', error);
    }
  };

  const handleTargetUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const rows = content.split('\\n').filter(Boolean);
          
          // Skip header row and parse CSV
          const newTargets = rows.slice(1).map(row => {
            const [phoneNumber, firstName, lastName, department] = row.split(',');
            return {
              phoneNumber: phoneNumber.trim(),
              firstName: firstName?.trim(),
              lastName: lastName?.trim(),
              department: department?.trim(),
            };
          });

          setTargets(newTargets);
        } catch (error) {
          console.error('Failed to parse CSV:', error);
          // Show error to user
        }
      };
      reader.readAsText(file);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">SMS Campaign Manager</h1>
      
      {/* Campaign Creation Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New SMS Campaign</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sender Name</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.senderName || ''}
              onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Message Content</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={4}
              value={formData.message || ''}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Targets (CSV)</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleTargetUpload}
              className="mt-1 block w-full"
            />
            <p className="mt-1 text-sm text-gray-500">
              CSV Format: phoneNumber,firstName,lastName,department
            </p>
          </div>

          {targets.length > 0 && (
            <div>
              <p className="text-sm text-gray-600">{targets.length} targets loaded</p>
            </div>
          )}

          <button
            onClick={handleCreateCampaign}
            className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Campaign
          </button>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-6 pb-4">SMS Campaigns</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Targets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicked</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns?.data.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{campaign.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{campaign.targetCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{campaign.deliveryStats.sent}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{campaign.deliveryStats.delivered}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{campaign.deliveryStats.clicked}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => navigate(`/defendx-plus/campaign/${campaign.id}`)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSCampaignManager;