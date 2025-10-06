import { useState, useEffect } from 'react';
import { 
  useGetAlertsQuery, 
  useAcknowledgeAlertMutation, 
  useCloseAlertMutation
} from '../../store/api/defendxPlusApi';
import { 
  AlertTriangle, 
  Shield, 
  Activity, 
  Server, 
  Clock,
  CheckCircle,
  X,
  Eye,
  Search,
  RefreshCw,
  Bell,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';

type AcknowledgeAlertMutationResult = [
  (params: { id: string; data: any }) => Promise<{ data: any }>,
  { isLoading: boolean; error: any; reset: () => void }
];

type CloseAlertMutationResult = [
  (params: { id: string; data: any }) => Promise<{ data: any }>,
  { isLoading: boolean; error: any; reset: () => void }
];

interface AlertFilters {
  severity: 'all' | 'low' | 'medium' | 'high' | 'critical';
  status: 'all' | 'open' | 'acknowledged' | 'closed';
  type: 'all' | 'malware' | 'intrusion' | 'phishing' | 'anomaly' | 'policy_violation';
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
}

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export default function MonitoringDashboard() {
  const [filters, setFilters] = useState<AlertFilters>({
    severity: 'all',
    status: 'all',
    type: 'all',
    timeRange: '24h'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useGetAlertsQuery({
    severity: filters.severity !== 'all' ? filters.severity : undefined,
    status: filters.status !== 'all' ? filters.status : undefined
  });

  const [acknowledgeAlert] = useAcknowledgeAlertMutation() as AcknowledgeAlertMutationResult;
  const [closeAlert] = useCloseAlertMutation() as CloseAlertMutationResult;

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetchAlerts();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetchAlerts]);

  // Mock system metrics for demo
  const systemMetrics: SystemMetric[] = [
    {
      id: 'agents',
      name: 'Active Agents',
      value: 247,
      unit: '',
      status: 'healthy',
      trend: 'up',
      change: 3
    },
    {
      id: 'threats',
      name: 'Threats Blocked',
      value: 1453,
      unit: '/day',
      status: 'healthy',
      trend: 'down',
      change: -12
    },
    {
      id: 'bandwidth',
      name: 'Network Usage',
      value: 67,
      unit: '%',
      status: 'warning',
      trend: 'up',
      change: 8
    },
    {
      id: 'storage',
      name: 'Log Storage',
      value: 23,
      unit: 'GB',
      status: 'healthy',
      trend: 'up',
      change: 2
    }
  ];

  const mockRecentEvents = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'malware_detected',
      message: 'Malware detected on DESKTOP-ABC123',
      severity: 'high' as const,
      source: 'Endpoint Agent'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      type: 'login_anomaly',
      message: 'Unusual login pattern detected for user john.doe',
      severity: 'medium' as const,
      source: 'SIEM Engine'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      type: 'policy_violation',
      message: 'USB device blocked on LAPTOP-XYZ789',
      severity: 'low' as const,
      source: 'Policy Engine'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      type: 'network_intrusion',
      message: 'Suspicious network activity from 192.168.1.100',
      severity: 'critical' as const,
      source: 'Network Monitor'
    }
  ];

  // Utility functions for rendering
  const getMetricColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100';
      case 'warning': return 'bg-yellow-100';
      case 'critical': return 'bg-red-100';
      default: return 'bg-slate-100';
    }
  };

  const getMetricIcon = (metricId: string) => {
    switch (metricId) {
      case 'agents': return <Activity className="w-5 h-5" />;
      case 'threats': return <Shield className="w-5 h-5" />;
      case 'bandwidth': return <TrendingUp className="w-5 h-5" />;
      case 'storage': return <Server className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'low': return <AlertTriangle className="w-5 h-5 text-blue-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (acknowledged: boolean) => {
    return acknowledged 
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-orange-100 text-orange-700 border-orange-200';
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const result = await acknowledgeAlert({ 
        id: alertId,
        data: {
          alertId, 
          acknowledgedBy: 'current_user', // In real app, get from auth context
          notes: 'Alert acknowledged from monitoring dashboard' 
        }
      });
      
      if (result.data) {
        refetchAlerts();
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleCloseAlert = async (alertId: string) => {
    try {
      const result = await closeAlert({ 
        id: alertId,
        data: {
          alertId, 
          closedBy: 'current_user', // In real app, get from auth context
          resolution: 'Alert closed from monitoring dashboard' 
        }
      });
      
      if (result.data) {
        refetchAlerts();
      }
    } catch (error) {
      console.error('Failed to close alert:', error);
    }
  };

  const alertsList = alerts?.data || [];
  const filteredAlerts = alertsList.filter((alert: any) => {
    const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate alert counts
  const criticalAlerts = alertsList.filter((alert: any) => alert.severity === 'critical').length;
  const highAlerts = alertsList.filter((alert: any) => alert.severity === 'high').length;
  const openAlerts = alertsList.filter((alert: any) => !alert.acknowledged).length;  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Security Monitoring</h1>
          <p className="text-slate-600 mt-1">Real-time security alerts and system health</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              autoRefresh 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </button>
          
          <button
            onClick={() => refetchAlerts()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Now
          </button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">{criticalAlerts}</p>
              <p className="text-xs text-slate-500 mt-1">Immediate attention required</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">High Priority</p>
              <p className="text-2xl font-bold text-orange-600">{highAlerts}</p>
              <p className="text-xs text-slate-500 mt-1">Requires investigation</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Open Alerts</p>
              <p className="text-2xl font-bold text-slate-900">{openAlerts}</p>
              <p className="text-xs text-slate-500 mt-1">Unacknowledged alerts</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">System Health</p>
              <p className="text-2xl font-bold text-green-600">Good</p>
              <p className="text-xs text-slate-500 mt-1">All systems operational</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">System Metrics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemMetrics.map((metric) => (
            <div key={metric.id} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${getMetricColor(metric.status)}`}>
                  {getMetricIcon(metric.id)}
                </div>
                <div className="flex items-center gap-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                  <span className={`text-xs ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 
                    'text-slate-600'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {metric.value}{metric.unit}
                </p>
                <p className="text-sm text-slate-600">{metric.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Security Alerts</h2>
              <span className="text-sm text-slate-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value as any })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={filters.timeRange}
                onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {alertsLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No alerts match the current filters.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredAlerts.map((alert: any) => (
                  <div key={alert.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityBadge(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(alert.acknowledged)}`}>
                              {alert.acknowledged ? 'Acknowledged' : 'Open'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-900 mb-1">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                            <span>{alert.type}</span>
                            {alert.sourceAgent && (
                              <span className="flex items-center gap-1">
                                <Server className="w-3 h-3" />
                                {alert.sourceAgent}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Acknowledge"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => console.log('View alert details:', alert.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCloseAlert(alert.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Close"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Events Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Events</h3>
          
          <div className="space-y-4">
            {mockRecentEvents.map((event, index) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    event.severity === 'critical' ? 'bg-red-500' :
                    event.severity === 'high' ? 'bg-orange-500' :
                    event.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  {index < mockRecentEvents.length - 1 && (
                    <div className="w-px h-8 bg-slate-200 mt-2" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    {event.message}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{event.source}</span>
                    <span>{event.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
