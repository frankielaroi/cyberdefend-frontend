import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCampaignsQuery, useLaunchCampaignMutation, useDeleteCampaignMutation } from '../../store/api/realDefendXPlusApi';
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
  Mail,
  Play,
  Trash2
} from 'lucide-react';

interface CampaignFilters {
  status: string;
  department: string;
  dateRange: string;
  search: string;
}

export default function PhishingDashboard() {
  const navigate = useNavigate();
  const { data: campaignsResponse, isLoading, error, refetch } = useGetCampaignsQuery({});
  const [launchCampaign] = useLaunchCampaignMutation();
  const [deleteCampaign] = useDeleteCampaignMutation();
  
  // Extract campaigns array from response structure
  const campaigns = campaignsResponse?.campaigns || [];
  
  const [filters, setFilters] = useState<CampaignFilters>({
    status: '',
    department: '',
    dateRange: '',
    search: '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [launchingCampaignId, setLaunchingCampaignId] = useState<string | null>(null);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [selectedCampaignForLaunch, setSelectedCampaignForLaunch] = useState<PhishingCampaign | null>(null);
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCampaignForDelete, setSelectedCampaignForDelete] = useState<PhishingCampaign | null>(null);

  // Landing page style animations
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  const handleLaunchCampaign = async (campaign: PhishingCampaign) => {
    // If campaign has a schedule, show modal to choose
    if (campaign.scheduledAt) {
      setSelectedCampaignForLaunch(campaign);
      setShowLaunchModal(true);
    } else {
      // No schedule, launch immediately with confirmation
      if (confirm('Are you sure you want to launch this campaign? Phishing emails will be sent to all targets immediately.')) {
        await executeLaunch(campaign.id, 'NOW');
      }
    }
  };

  const executeLaunch = async (campaignId: string, launchType: 'NOW' | 'SCHEDULED', scheduledAt?: string) => {
    try {
      setLaunchingCampaignId(campaignId);
      await launchCampaign({
        campaignId,
        launchType,
        scheduledAt
      }).unwrap();
      
      // Refresh campaigns list
      refetch();
      
      const message = launchType === 'SCHEDULED' && scheduledAt
        ? `Campaign scheduled for ${new Date(scheduledAt).toLocaleString()}!`
        : 'Campaign launched successfully!';
      alert(message);
      
      setShowLaunchModal(false);
      setSelectedCampaignForLaunch(null);
    } catch (error) {
      console.error('Failed to launch campaign:', error);
      alert('Failed to launch campaign. Please try again.');
    } finally {
      setLaunchingCampaignId(null);
    }
  };

  const handleDeleteCampaign = (campaign: PhishingCampaign) => {
    setSelectedCampaignForDelete(campaign);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!selectedCampaignForDelete) return;

    try {
      setDeletingCampaignId(selectedCampaignForDelete.id);
      await deleteCampaign(selectedCampaignForDelete.id).unwrap();
      
      // Refresh campaigns list
      refetch();
      
      alert('Campaign deleted successfully!');
      
      setShowDeleteModal(false);
      setSelectedCampaignForDelete(null);
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      alert('Failed to delete campaign. Please try again.');
    } finally {
      setDeletingCampaignId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        />
        
        {/* Floating Particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 space-y-6 p-6">
      {/* Header */}
      <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div>
          <h1 className="text-3xl font-bold text-white">Phishing Campaigns</h1>
          <p className="text-slate-300 mt-1">
            Manage and monitor phishing simulation campaigns
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-slate-300 bg-slate-800/80 backdrop-blur-xl border border-slate-600 rounded-lg hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          <button
            onClick={() => navigate('/dashboard/defendxplus/campaigns/create')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            Create New Campaign
          </button>
          
          <button
            onClick={() => navigate('/dashboard/defendxplus/templates')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
          >
            <Mail className="w-4 h-4" />
            Template Manager
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all duration-500 transform hover:scale-105 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-300 text-sm">Total Campaigns</p>
              <p className="text-2xl font-bold text-white">{campaigns.length}</p>
            </div>
            <div className="p-3 bg-blue-900/50 rounded-lg">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="group relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-green-500/50 transition-all duration-500 transform hover:scale-105 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
          
          <div className="flex items-center justify-between relative z-10">
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
        
        <div className="group relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-yellow-500/50 transition-all duration-500 transform hover:scale-105 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
          
          <div className="flex items-center justify-between relative z-10">
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
        
        <div className="group relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
          
          <div className="flex items-center justify-between relative z-10">
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
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
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
      <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
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
                          {campaign.status === 'DRAFT' && (
                            <button
                              onClick={() => handleLaunchCampaign(campaign)}
                              disabled={launchingCampaignId === campaign.id}
                              className="p-2 text-slate-300 hover:text-green-400 hover:bg-green-900/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={campaign.scheduledAt ? "Launch or Schedule Campaign" : "Launch Campaign"}
                            >
                              {launchingCampaignId === campaign.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                          )}
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
                          <button
                            onClick={() => handleDeleteCampaign(campaign)}
                            disabled={deletingCampaignId === campaign.id}
                            className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-900/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Campaign"
                          >
                            {deletingCampaignId === campaign.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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

      {/* Launch Options Modal */}
      {showLaunchModal && selectedCampaignForLaunch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-slate-700/50">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Launch Campaign</h3>
              
              <div className="mb-6">
                <p className="text-slate-300 mb-4">
                  Campaign: <span className="font-semibold text-white">{selectedCampaignForLaunch.name}</span>
                </p>
                
                {selectedCampaignForLaunch.scheduledAt && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-300 mb-1">Scheduled Launch Time</p>
                        <p className="text-white font-semibold">
                          {new Date(selectedCampaignForLaunch.scheduledAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-slate-400">
                  Choose when to launch this campaign:
                </p>
              </div>

              <div className="space-y-3">
                {selectedCampaignForLaunch.scheduledAt && (
                  <button
                    onClick={() => executeLaunch(
                      selectedCampaignForLaunch.id, 
                      'SCHEDULED', 
                      selectedCampaignForLaunch.scheduledAt
                    )}
                    disabled={launchingCampaignId === selectedCampaignForLaunch.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                    {launchingCampaignId === selectedCampaignForLaunch.id ? 'Scheduling...' : 'Use Scheduled Time'}
                  </button>
                )}
                
                <button
                  onClick={() => executeLaunch(selectedCampaignForLaunch.id, 'NOW')}
                  disabled={launchingCampaignId === selectedCampaignForLaunch.id}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  <Play className="w-5 h-5" />
                  {launchingCampaignId === selectedCampaignForLaunch.id ? 'Launching...' : 'Launch Immediately'}
                </button>
                
                <button
                  onClick={() => {
                    setShowLaunchModal(false);
                    setSelectedCampaignForLaunch(null);
                  }}
                  disabled={launchingCampaignId === selectedCampaignForLaunch.id}
                  className="w-full px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCampaignForDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-slate-700/50">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Delete Campaign</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-slate-300 mb-4">
                  Are you sure you want to delete the campaign{' '}
                  <span className="font-semibold text-white">"{selectedCampaignForDelete.name}"</span>?
                </p>
                
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                  <p className="text-sm text-red-300">
                    <strong>Warning:</strong> This action cannot be undone. All campaign data, including results and analytics, will be permanently deleted.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={executeDelete}
                  disabled={deletingCampaignId === selectedCampaignForDelete.id}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  {deletingCampaignId === selectedCampaignForDelete.id ? 'Deleting...' : 'Delete Campaign'}
                </button>
                
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCampaignForDelete(null);
                  }}
                  disabled={deletingCampaignId === selectedCampaignForDelete.id}
                  className="w-full px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}