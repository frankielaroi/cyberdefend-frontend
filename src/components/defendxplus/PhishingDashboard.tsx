import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCampaignsQuery } from '../../store/api/realDefendXPlusApi';
import { PhishingCampaign } from '../../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  Users,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail
} from 'lucide-react';

interface CampaignFilters {
  status: string;
  department: string;
  dateRange: string;
  search: string;
}

export default function PhishingDashboard() {
  const navigate = useNavigate();
  const { data: campaignsResponse, isLoading, error } = useGetCampaignsQuery({});
  
  // Extract campaigns array from response structure
  const campaigns = campaignsResponse?.campaigns || [];
  
  const [filters, setFilters] = useState<CampaignFilters>({
    status: '',
    department: '',
    dateRange: '',
    search: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { color: 'bg-gray-900/30 text-gray-100', icon: Clock },
      'SCHEDULED': { color: 'bg-blue-900/30 text-blue-100', icon: Calendar },
      'ACTIVE': { color: 'bg-green-900/30 text-green-100', icon: Target },
      'PAUSED': { color: 'bg-yellow-900/30 text-yellow-100', icon: AlertTriangle },
      'COMPLETED': { color: 'bg-purple-900/30 text-purple-100', icon: CheckCircle },
      'CANCELLED': { color: 'bg-red-900/30 text-red-100', icon: AlertTriangle },
      // Legacy support
      'draft': { color: 'bg-gray-900/30 text-gray-100', icon: Clock },
      'scheduled': { color: 'bg-blue-900/30 text-blue-100', icon: Calendar },
      'active': { color: 'bg-green-900/30 text-green-100', icon: Target },
      'running': { color: 'bg-green-900/30 text-green-100', icon: Target },
      'completed': { color: 'bg-purple-900/30 text-purple-100', icon: CheckCircle },
      'failed': { color: 'bg-red-900/30 text-red-100', icon: AlertTriangle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const getRiskLevel = (clickRate: number) => {
    if (clickRate >= 20) return { level: 'High', color: 'text-red-600' };
    if (clickRate >= 10) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-green-600' };
  };

  const filteredCampaigns = campaigns.filter((campaign: PhishingCampaign) => {
    if (filters.search && !campaign.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status && campaign.status !== filters.status) {
      return false;
    }
    // Add more filter logic as needed
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Phishing Campaigns</h1>
          <p className="text-slate-300 mt-1">
            Manage and monitor phishing simulation campaigns
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-slate-300 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          <button
            onClick={() => navigate('/dashboard/defendxplus/campaigns/create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Campaign
          </button>
          
          <button
            onClick={() => navigate('/dashboard/defendxplus/templates')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Template Manager
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Total Campaigns</p>
              <p className="text-2xl font-bold text-white">{campaigns.length}</p>
            </div>
            <div className="p-3 bg-blue-900/50 rounded-lg">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Active Campaigns</p>
              <p className="text-2xl font-bold text-white">
                {campaigns.filter((c: PhishingCampaign) => c.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="p-3 bg-green-900/50 rounded-lg">
              <Target className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Avg Click Rate</p>
              <p className="text-2xl font-bold text-white">
                {campaigns.length > 0 
                  ? Math.round(campaigns.reduce((acc: number, c: PhishingCampaign) => acc + (c.targetCount > 0 ? (c.linksClicked / c.targetCount) * 100 : 0), 0) / campaigns.length)
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-yellow-900/50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Total Targets</p>
              <p className="text-2xl font-bold text-white">
                {campaigns.reduce((acc: number, c: PhishingCampaign) => acc + (c.targetCount || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-900/50 rounded-lg">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Search Campaigns
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Campaign name..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Departments</option>
                <option value="it">IT</option>
                <option value="hr">HR</option>
                <option value="finance">Finance</option>
                <option value="marketing">Marketing</option>
                <option value="operations">Operations</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Time</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setFilters({ status: '', department: '', dateRange: '', search: '' })}
              className="text-slate-300 hover:text-slate-100 text-sm"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Campaigns Table */}
      <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">
            Campaign History ({filteredCampaigns.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Targets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Open Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Click Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                      <span className="ml-2 text-slate-300">Loading campaigns...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-red-400">
                    Error loading campaigns
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="text-slate-400">
                      <Mail className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                      <p className="text-lg font-medium mb-2 text-white">No campaigns found</p>
                      <p className="text-sm">Get started by creating your first phishing campaign</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign: PhishingCampaign) => {
                  const clickRate = campaign.targetCount > 0 ? (campaign.linksClicked / campaign.targetCount) * 100 : 0;
                  const openRate = campaign.targetCount > 0 ? (campaign.emailsOpened / campaign.targetCount) * 100 : 0;
                  const riskLevel = getRiskLevel(clickRate);
                  return (
                    <tr key={campaign.id} className="hover:bg-slate-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {campaign.name}
                          </div>
                          <div className="text-sm text-slate-300">
                            Subject: {campaign.subject}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(campaign.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'Not set'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {campaign.targetCount || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {Math.round(openRate)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {Math.round(clickRate)}%
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${riskLevel.color}`}>
                          {riskLevel.level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/defendxplus/campaigns/${campaign.id}`)}
                            className="p-2 text-slate-300 hover:text-blue-400 hover:bg-blue-900/50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-slate-300 hover:text-green-400 hover:bg-green-900/50 rounded-lg transition-colors"
                            title="Download Report"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}