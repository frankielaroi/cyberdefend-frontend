import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCampaignResultsQuery } from '../../store/api/defendxPlusApi';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  MousePointer, 
  Flag, 
  Shield,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  RefreshCw
} from 'lucide-react';

interface CampaignTarget {
  id: string;
  email: string;
  name?: string;
  department?: string;
  delivered: boolean;
  opened: boolean;
  clicked: boolean;
  reported: boolean;
  timestamp?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export default function CampaignDetails() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { data: campaignResults, isLoading, error } = useGetCampaignResultsQuery(campaignId!);
  
  const [selectedTab, setSelectedTab] = useState<'overview' | 'targets' | 'timeline'>('overview');
  const [filterStatus, setFilterStatus] = useState<'all' | 'delivered' | 'opened' | 'clicked' | 'reported'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration - in real app this would come from the API
  const mockTargets: CampaignTarget[] = [
    {
      id: '1',
      email: 'john.doe@company.com',
      name: 'John Doe',
      department: 'Finance',
      delivered: true,
      opened: true,
      clicked: true,
      reported: false,
      timestamp: '2024-10-04T10:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: '2',
      email: 'jane.smith@company.com',
      name: 'Jane Smith',
      department: 'HR',
      delivered: true,
      opened: true,
      clicked: false,
      reported: true,
      timestamp: '2024-10-04T11:15:00Z',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
      id: '3',
      email: 'mike.johnson@company.com',
      name: 'Mike Johnson',
      department: 'IT',
      delivered: true,
      opened: false,
      clicked: false,
      reported: false,
      timestamp: null,
      ipAddress: null,
      userAgent: null
    }
  ];

  const timelineEvents = [
    {
      id: '1',
      type: 'campaign_started',
      timestamp: '2024-10-04T09:00:00Z',
      description: 'Campaign launched',
      count: 150
    },
    {
      id: '2',
      type: 'emails_delivered',
      timestamp: '2024-10-04T09:15:00Z',
      description: 'Emails delivered',
      count: 147
    },
    {
      id: '3',
      type: 'first_open',
      timestamp: '2024-10-04T09:45:00Z',
      description: 'First email opened',
      count: 1
    },
    {
      id: '4',
      type: 'first_click',
      timestamp: '2024-10-04T10:30:00Z',
      description: 'First link clicked',
      count: 1
    },
    {
      id: '5',
      type: 'first_report',
      timestamp: '2024-10-04T11:15:00Z',
      description: 'First email reported',
      count: 1
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading campaign details...
        </div>
      </div>
    );
  }

  if (error || !campaignResults) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Campaign Not Found</h3>
        <p className="text-slate-600 mb-4">The requested campaign could not be loaded.</p>
        <button
          onClick={() => navigate('/dashboard/defendxplus/phishing')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const deliveryRate = campaignResults.targetCount > 0 ? (campaignResults.deliveredCount / campaignResults.targetCount) * 100 : 0;
  const openRate = campaignResults.deliveredCount > 0 ? (campaignResults.openedCount / campaignResults.deliveredCount) * 100 : 0;
  const clickRate = campaignResults.deliveredCount > 0 ? (campaignResults.clickedCount / campaignResults.deliveredCount) * 100 : 0;
  const reportRate = campaignResults.deliveredCount > 0 ? (campaignResults.reportedCount / campaignResults.deliveredCount) * 100 : 0;

  const filteredTargets = mockTargets.filter(target => {
    const matchesSearch = target.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         target.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         target.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filterStatus) {
      case 'delivered': return target.delivered;
      case 'opened': return target.opened;
      case 'clicked': return target.clicked;
      case 'reported': return target.reported;
      default: return true;
    }
  });

  const getStatusIcon = (target: CampaignTarget) => {
    if (target.reported) return <Shield className="w-4 h-4 text-green-600" />;
    if (target.clicked) return <MousePointer className="w-4 h-4 text-red-600" />;
    if (target.opened) return <Eye className="w-4 h-4 text-yellow-600" />;
    if (target.delivered) return <CheckCircle className="w-4 h-4 text-blue-600" />;
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  const getStatusText = (target: CampaignTarget) => {
    if (target.reported) return { text: 'Reported', class: 'text-green-600 bg-green-50' };
    if (target.clicked) return { text: 'Clicked', class: 'text-red-600 bg-red-50' };
    if (target.opened) return { text: 'Opened', class: 'text-yellow-600 bg-yellow-50' };
    if (target.delivered) return { text: 'Delivered', class: 'text-blue-600 bg-blue-50' };
    return { text: 'Pending', class: 'text-slate-600 bg-slate-50' };
  };

  const getRiskLevel = (openRate: number, clickRate: number) => {
    if (clickRate > 20) return { level: 'High', class: 'text-red-600 bg-red-50' };
    if (clickRate > 10) return { level: 'Medium', class: 'text-yellow-600 bg-yellow-50' };
    if (openRate > 50) return { level: 'Medium', class: 'text-yellow-600 bg-yellow-50' };
    return { level: 'Low', class: 'text-green-600 bg-green-50' };
  };

  const riskLevel = getRiskLevel(openRate, clickRate);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/defendxplus/phishing')}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{campaignResults.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              campaignResults.status === 'completed' ? 'bg-green-100 text-green-700' :
              campaignResults.status === 'running' ? 'bg-blue-100 text-blue-700' :
              campaignResults.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {campaignResults.status === 'completed' ? 'Completed' :
               campaignResults.status === 'running' ? 'Running' :
               campaignResults.status === 'scheduled' ? 'Scheduled' :
               'Draft'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskLevel.class}`}>
              Risk: {riskLevel.level}
            </span>
            {campaignResults.startDate && (
              <span className="text-sm text-slate-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(campaignResults.startDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Delivery Rate</p>
              <p className="text-2xl font-bold text-slate-900">{Math.round(deliveryRate)}%</p>
              <p className="text-xs text-slate-500 mt-1">
                {campaignResults.deliveredCount} of {campaignResults.targetCount}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Open Rate</p>
              <p className="text-2xl font-bold text-slate-900">{Math.round(openRate)}%</p>
              <p className="text-xs text-slate-500 mt-1">
                {campaignResults.openedCount} opened
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Eye className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Click Rate</p>
              <p className="text-2xl font-bold text-slate-900">{Math.round(clickRate)}%</p>
              <p className="text-xs text-slate-500 mt-1">
                {campaignResults.clickedCount} clicked
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <MousePointer className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Report Rate</p>
              <p className="text-2xl font-bold text-slate-900">{Math.round(reportRate)}%</p>
              <p className="text-xs text-slate-500 mt-1">
                {campaignResults.reportedCount} reported
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Flag className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'targets', label: 'Target Results', icon: Target },
              { id: 'timeline', label: 'Timeline', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Risk Assessment */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Risk Assessment</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Overall Risk Level</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${riskLevel.class}`}>
                        {riskLevel.level}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Users at Risk</span>
                      <span className="text-sm font-medium text-slate-900">
                        {campaignResults.clickedCount} ({Math.round(clickRate)}%)
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Security Aware</span>
                      <span className="text-sm font-medium text-slate-900">
                        {campaignResults.reportedCount} ({Math.round(reportRate)}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Department Breakdown</h3>
                  
                  <div className="space-y-3">
                    {['Finance', 'HR', 'IT', 'Sales', 'Operations'].map((dept) => {
                      const deptTargets = Math.floor(Math.random() * 30) + 10;
                      const deptClicked = Math.floor(Math.random() * deptTargets * 0.3);
                      const deptRate = (deptClicked / deptTargets) * 100;
                      
                      return (
                        <div key={dept} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <span className="text-sm font-medium text-slate-900">{dept}</span>
                            <span className="text-xs text-slate-500 ml-2">({deptTargets} targets)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">{Math.round(deptRate)}%</span>
                            {deptRate > 20 ? (
                              <TrendingUp className="w-4 h-4 text-red-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">Recommendations</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• Schedule follow-up training for users who clicked the phishing link</li>
                  <li>• Recognize and reward users who reported the suspicious email</li>
                  <li>• Consider additional security awareness training for high-risk departments</li>
                  <li>• Review email security policies and technical controls</li>
                </ul>
              </div>
            </div>
          )}

          {selectedTab === 'targets' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by email, name, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="delivered">Delivered</option>
                  <option value="opened">Opened</option>
                  <option value="clicked">Clicked</option>
                  <option value="reported">Reported</option>
                </select>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Target</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Department</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Timestamp</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTargets.map((target) => {
                      const status = getStatusText(target);
                      return (
                        <tr key={target.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-slate-900">{target.name || target.email}</div>
                              {target.name && (
                                <div className="text-sm text-slate-500">{target.email}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {target.department || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(target)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
                                {status.text}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {target.timestamp ? new Date(target.timestamp).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600 font-mono">
                            {target.ipAddress || 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredTargets.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No targets match the current filters.
                </div>
              )}
            </div>
          )}

          {selectedTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Campaign Timeline</h3>
              
              <div className="space-y-4">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        event.type === 'campaign_started' ? 'bg-blue-500' :
                        event.type === 'emails_delivered' ? 'bg-green-500' :
                        event.type === 'first_open' ? 'bg-yellow-500' :
                        event.type === 'first_click' ? 'bg-red-500' :
                        'bg-purple-500'
                      }`} />
                      {index < timelineEvents.length - 1 && (
                        <div className="w-px h-8 bg-slate-200 mt-2" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">{event.description}</p>
                        <span className="text-xs text-slate-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {event.count && (
                        <p className="text-sm text-slate-600 mt-1">
                          Count: {event.count}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
