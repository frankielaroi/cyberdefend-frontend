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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [filters, setFilters] = useState<AlertFilters>({
    severity: 'all',
    status: 'all',
    type: 'all',
    timeRange: '24h'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useGetAlertsQuery({
    severity: filters.severity !== 'all' ? filters.severity : undefined,
    acknowledged:
      filters.status === 'all'
        ? undefined
        : filters.status === 'open'
        ? false
        : filters.status === 'acknowledged'
        ? true
        : undefined
  });

  const [acknowledgeAlert] = useAcknowledgeAlertMutation();
  const [closeAlert] = useCloseAlertMutation();

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
      case 'healthy': return 'bg-green-500/20';
      case 'warning': return 'bg-yellow-500/20';
      case 'critical': return 'bg-red-500/20';
      default: return 'bg-slate-500/20';
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
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'low': return <AlertTriangle className="w-5 h-5 text-blue-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-400/50';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-400/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
      case 'low': return 'bg-blue-500/20 text-blue-300 border-blue-400/50';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-400/50';
    }
  };

  const getStatusBadge = (acknowledged: boolean) => {
    return acknowledged 
      ? 'bg-green-500/20 text-green-300 border-green-400/50'
      : 'bg-orange-500/20 text-orange-300 border-orange-400/50';
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const result = await acknowledgeAlert(alertId);
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
        alertId, 
        resolution: 'Alert closed from monitoring dashboard' 
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
    const searchTermLower = (searchTerm || '').toLowerCase();
    const matchesSearch = ((alert.message?.toLowerCase() || '').includes(searchTermLower)) ||
                         ((alert.type?.toLowerCase() || '').includes(searchTermLower));
    return matchesSearch;
  });

  // Calculate alert counts
  const criticalAlerts = alertsList.filter((alert: any) => alert.severity === 'critical').length;
  const highAlerts = alertsList.filter((alert: any) => alert.severity === 'high').length;
  const openAlerts = alertsList.filter((alert: any) => !alert.acknowledged).length;  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${mousePosition.x * 0.02}%`,
            top: `${mousePosition.y * 0.02}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div 
          className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            right: `${mousePosition.x * 0.01}%`,
            bottom: `${mousePosition.y * 0.01}%`,
            transform: 'translate(50%, 50%)',
            animationDelay: '2s'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Security Monitoring</h1>
            <p className="text-slate-300 text-lg">Real-time security alerts and system health</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all duration-300 backdrop-blur-sm ${
                autoRefresh 
                  ? 'bg-green-500/20 border-green-400/50 text-green-300 hover:bg-green-500/30' 
                  : 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/20'
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </button>
            
            <button
              onClick={() => refetchAlerts()}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Now
            </button>
          </div>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-medium">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-400 mt-1">{criticalAlerts}</p>
              <p className="text-xs text-slate-400 mt-2">Immediate attention required</p>
            </div>
            <div className="p-4 bg-red-500/20 rounded-xl">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-medium">High Priority</p>
              <p className="text-3xl font-bold text-orange-400 mt-1">{highAlerts}</p>
              <p className="text-xs text-slate-400 mt-2">Requires investigation</p>
            </div>
            <div className="p-4 bg-orange-500/20 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-medium">Open Alerts</p>
              <p className="text-3xl font-bold text-blue-400 mt-1">{openAlerts}</p>
              <p className="text-xs text-slate-400 mt-2">Unacknowledged alerts</p>
            </div>
            <div className="p-4 bg-blue-500/20 rounded-xl">
              <Bell className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-medium">System Health</p>
              <p className="text-3xl font-bold text-green-400 mt-1">Good</p>
              <p className="text-xs text-slate-400 mt-2">All systems operational</p>
            </div>
            <div className="p-4 bg-green-500/20 rounded-xl">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">System Metrics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemMetrics.map((metric) => (
            <div key={metric.id} className="backdrop-blur-sm bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${getMetricColor(metric.status)}`}>
                  {getMetricIcon(metric.id)}
                </div>
                <div className="flex items-center gap-2">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  ) : (
                    <div className="w-5 h-5" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-400' : 
                    metric.trend === 'down' ? 'text-red-400' : 
                    'text-slate-400'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {metric.value}{metric.unit}
                </p>
                <p className="text-slate-300 text-sm">{metric.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Alerts List */}
        <div className="xl:col-span-2 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl">
          <div className="p-8 border-b border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Security Alerts</h2>
              <span className="text-sm text-slate-300">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
                  />
                </div>
              </div>

              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value as any })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
              >
                <option value="all" className="bg-slate-800">All Severities</option>
                <option value="critical" className="bg-slate-800">Critical</option>
                <option value="high" className="bg-slate-800">High</option>
                <option value="medium" className="bg-slate-800">Medium</option>
                <option value="low" className="bg-slate-800">Low</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
              >
                <option value="all" className="bg-slate-800">All Status</option>
                <option value="open" className="bg-slate-800">Open</option>
                <option value="acknowledged" className="bg-slate-800">Acknowledged</option>
                <option value="closed" className="bg-slate-800">Closed</option>
              </select>

              <select
                value={filters.timeRange}
                onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
              >
                <option value="1h" className="bg-slate-800">Last Hour</option>
                <option value="6h" className="bg-slate-800">Last 6 Hours</option>
                <option value="24h" className="bg-slate-800">Last 24 Hours</option>
                <option value="7d" className="bg-slate-800">Last 7 Days</option>
                <option value="30d" className="bg-slate-800">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {alertsLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No alerts match the current filters.
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredAlerts.map((alert: any) => (
                  <div key={alert.id} className="p-6 hover:bg-white/5 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityBadge(alert.severity)}`}>
                              {alert.severity?.toUpperCase() || 'UNKNOWN'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(alert.acknowledged)}`}>
                              {alert.acknowledged ? 'Acknowledged' : 'Open'}
                            </span>
                          </div>
                          <p className="text-white text-base font-medium mb-2">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-6 text-sm text-slate-300">
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                            <span>{alert.type}</span>
                            {alert.sourceAgent && (
                              <span className="flex items-center gap-2">
                                <Server className="w-4 h-4" />
                                {alert.sourceAgent}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-6">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-300"
                            title="Acknowledge"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => console.log('View alert details:', alert.id)}
                          className="p-2 text-slate-400 hover:text-slate-300 hover:bg-white/10 rounded-lg transition-all duration-300"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleCloseAlert(alert.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                          title="Close"
                        >
                          <X className="w-5 h-5" />
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
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Recent Events</h3>
          
          <div className="space-y-6">
            {mockRecentEvents.map((event, index) => (
              <div key={event.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${
                    event.severity === 'critical' ? 'bg-red-400' :
                    event.severity === 'high' ? 'bg-orange-400' :
                    event.severity === 'medium' ? 'bg-yellow-400' :
                    'bg-blue-400'
                  }`} />
                  {index < mockRecentEvents.length - 1 && (
                    <div className="w-px h-10 bg-white/20 mt-3" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium mb-2">
                    {event.message}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{event.source}</span>
                    <span>{event.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <button className="w-full text-center text-sm text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300">
              View All Events
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
