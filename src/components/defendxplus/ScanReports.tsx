import { useState } from 'react';
import { 
  useTriggerScanMutation 
} from '../../store/api/defendxPlusApi';
import {
  Shield,
  Calendar,
  Play,
  Download,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  BarChart3,
  RefreshCw,
  Target,
  Activity,
  Zap
} from 'lucide-react';

interface ScanFilters {
  status: 'all' | 'scheduled' | 'running' | 'completed' | 'failed';
  type: 'all' | 'vulnerability' | 'compliance' | 'malware' | 'configuration';
  grade: 'all' | 'A' | 'B' | 'C' | 'D' | 'F';
  timeRange: '7d' | '30d' | '90d' | '1y';
}

interface VulnerabilityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  cvss: number;
  cve?: string;
  affected_systems: number;
  remediation: string;
  status: 'open' | 'mitigated' | 'accepted';
}

export default function ScanReports() {
  const [filters, setFilters] = useState<ScanFilters>({
    status: 'all',
    type: 'all',
    grade: 'all',
    timeRange: '30d'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'scans' | 'findings' | 'schedule'>('scans');

  // Note: Using mock data since API response structure needs clarification
  // const { data: scanResults, isLoading } = useGetScanResultsQuery({});

  const [triggerScan] = useTriggerScanMutation();

  // Mock scan data for demonstration
  const mockScans = [
    {
      id: '1',
      name: 'Q4 Vulnerability Assessment',
      type: 'vulnerability',
      status: 'completed' as const,
      grade: 'B' as const,
      startedAt: '2024-10-03T14:30:00Z',
      completedAt: '2024-10-03T18:45:00Z',
      agentId: 'agent-001',
      findings: {
        critical: 2,
        high: 8,
        medium: 15,
        low: 23
      }
    },
    {
      id: '2',
      name: 'SOC2 Compliance Check',
      type: 'compliance',
      status: 'running' as const,
      grade: null,
      startedAt: '2024-10-04T09:00:00Z',
      completedAt: null,
      agentId: 'agent-002',
      findings: null
    },
    {
      id: '3',
      name: 'Weekly Malware Scan',
      type: 'malware',
      status: 'scheduled' as const,
      grade: null,
      startedAt: null,
      completedAt: null,
      agentId: 'agent-003',
      findings: null
    }
  ];

  const mockFindings: VulnerabilityFinding[] = [
    {
      id: '1',
      severity: 'critical',
      title: 'Remote Code Execution in Apache HTTP Server',
      description: 'CVE-2024-27316: Buffer overflow vulnerability allows remote code execution',
      cvss: 9.8,
      cve: 'CVE-2024-27316',
      affected_systems: 12,
      remediation: 'Update Apache HTTP Server to version 2.4.59 or later',
      status: 'open'
    },
    {
      id: '2',
      severity: 'high',
      title: 'Privilege Escalation in Windows Kernel',
      description: 'Local privilege escalation vulnerability in Windows kernel',
      cvss: 7.8,
      cve: 'CVE-2024-26218',
      affected_systems: 45,
      remediation: 'Install Windows security update KB5037768',
      status: 'mitigated'
    },
    {
      id: '3',
      severity: 'medium',
      title: 'SQL Injection in Web Application',
      description: 'Input validation vulnerability allows SQL injection attacks',
      cvss: 6.1,
      affected_systems: 3,
      remediation: 'Implement parameterized queries and input validation',
      status: 'open'
    }
  ];

  const filteredScans = mockScans.filter(scan => {
    const matchesSearch = scan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scan.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredFindings = mockFindings.filter(finding => {
    const matchesSearch = finding.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         finding.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         finding.cve?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'running': return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'scheduled': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      running: 'bg-blue-100 text-blue-700 border-blue-200',
      scheduled: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      failed: 'bg-red-100 text-red-700 border-red-200'
    };
    return configs[status as keyof typeof configs] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getGradeBadge = (grade: string | null) => {
    if (!grade) return null;
    
    const configs = {
      A: 'bg-green-100 text-green-700 border-green-200',
      B: 'bg-blue-100 text-blue-700 border-blue-200',
      C: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      D: 'bg-orange-100 text-orange-700 border-orange-200',
      F: 'bg-red-100 text-red-700 border-red-200'
    };
    return configs[grade as keyof typeof configs];
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'low': return <AlertTriangle className="w-5 h-5 text-blue-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const configs = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return configs[severity as keyof typeof configs] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const handleTriggerScan = async (scanType: string) => {
    try {
      await triggerScan({ 
        scanType: scanType as 'vulnerability' | 'compliance' | 'malware' | 'full',
        agentIds: [] // All agents
      }).unwrap();
      // Show success message
      console.log(`${scanType} scan triggered successfully`);
    } catch (error) {
      console.error('Failed to trigger scan:', error);
    }
  };

  const totalFindings = mockFindings.length;
  const criticalFindings = mockFindings.filter(f => f.severity === 'critical').length;
  const openFindings = mockFindings.filter(f => f.status === 'open').length;
  const completedScans = mockScans.filter(s => s.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Security Scans & Reports</h1>
          <p className="text-slate-600 mt-1">Vulnerability assessments and compliance reporting</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => console.log('Schedule scan modal would open')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <Calendar className="w-4 h-4" />
            Schedule Scan
          </button>
          
          <button
            onClick={() => handleTriggerScan('vulnerability')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Play className="w-4 h-4" />
            Run Scan Now
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Findings</p>
              <p className="text-2xl font-bold text-slate-900">{totalFindings}</p>
              <p className="text-xs text-slate-500 mt-1">Across all scans</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">{criticalFindings}</p>
              <p className="text-xs text-slate-500 mt-1">Immediate attention required</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Open Issues</p>
              <p className="text-2xl font-bold text-orange-600">{openFindings}</p>
              <p className="text-xs text-slate-500 mt-1">Pending remediation</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Completed Scans</p>
              <p className="text-2xl font-bold text-green-600">{completedScans}</p>
              <p className="text-xs text-slate-500 mt-1">This month</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex">
            {[
              { id: 'scans', label: 'Scan Results', icon: BarChart3 },
              { id: 'findings', label: 'Vulnerability Findings', icon: Shield },
              { id: 'schedule', label: 'Scheduled Scans', icon: Calendar }
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
          {/* Filters and Search */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search scans and findings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="running">Running</option>
              <option value="scheduled">Scheduled</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="vulnerability">Vulnerability</option>
              <option value="compliance">Compliance</option>
              <option value="malware">Malware</option>
              <option value="configuration">Configuration</option>
            </select>

            <select
              value={filters.timeRange}
              onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>

          {/* Tab Content */}
          {selectedTab === 'scans' && (
            <div className="space-y-4">
              {filteredScans.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No scans match the current filters.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredScans.map((scan) => (
                    <div key={scan.id} className="border border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(scan.status)}
                            <h3 className="text-lg font-semibold text-slate-900">{scan.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(scan.status)}`}>
                              {scan.status.toUpperCase()}
                            </span>
                            {scan.grade && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getGradeBadge(scan.grade)}`}>
                                Grade {scan.grade}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                              <p className="text-sm text-slate-600">Scan Type</p>
                              <p className="font-medium text-slate-900 capitalize">{scan.type}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">Started At</p>
                              <p className="font-medium text-slate-900">
                                {scan.startedAt ? new Date(scan.startedAt).toLocaleString() : 'Not started'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">Duration</p>
                              <p className="font-medium text-slate-900">
                                {scan.startedAt && scan.completedAt 
                                  ? `${Math.round((new Date(scan.completedAt).getTime() - new Date(scan.startedAt).getTime()) / (1000 * 60))} minutes`
                                  : scan.startedAt 
                                    ? 'In progress'
                                    : 'Not started'
                                }
                              </p>
                            </div>
                          </div>

                          {scan.findings && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                              <h4 className="text-sm font-medium text-slate-900 mb-2">Findings Summary</h4>
                              <div className="grid grid-cols-4 gap-4">
                                <div className="text-center">
                                  <p className="text-xl font-bold text-red-600">{scan.findings.critical}</p>
                                  <p className="text-xs text-slate-600">Critical</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xl font-bold text-orange-600">{scan.findings.high}</p>
                                  <p className="text-xs text-slate-600">High</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xl font-bold text-yellow-600">{scan.findings.medium}</p>
                                  <p className="text-xs text-slate-600">Medium</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xl font-bold text-blue-600">{scan.findings.low}</p>
                                  <p className="text-xs text-slate-600">Low</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                            title="Download Report"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                            title="Settings"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'findings' && (
            <div className="space-y-4">
              {filteredFindings.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No findings match the current filters.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFindings.map((finding) => (
                    <div key={finding.id} className="border border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getSeverityIcon(finding.severity)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityBadge(finding.severity)}`}>
                                {finding.severity.toUpperCase()}
                              </span>
                              <span className="text-sm font-medium text-slate-900">
                                CVSS: {finding.cvss}
                              </span>
                              {finding.cve && (
                                <span className="text-sm text-blue-600 font-mono">
                                  {finding.cve}
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                finding.status === 'open' ? 'bg-red-100 text-red-700' :
                                finding.status === 'mitigated' ? 'bg-green-100 text-green-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {finding.status.toUpperCase()}
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">
                              {finding.title}
                            </h3>
                            
                            <p className="text-slate-600 mb-3">
                              {finding.description}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-slate-600">Affected Systems</p>
                                <p className="font-medium text-slate-900">{finding.affected_systems} systems</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-600">Remediation</p>
                                <p className="font-medium text-slate-900">{finding.remediation}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                            title="Export Finding"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'schedule' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Schedule Management</h3>
                <p className="text-slate-600 mb-4">
                  Configure automated security scans and compliance checks
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <button
                    onClick={() => handleTriggerScan('vulnerability')}
                    className="p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                  >
                    <Shield className="w-8 h-8 text-slate-400 group-hover:text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-slate-900 group-hover:text-blue-900">
                      Vulnerability Scan
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Comprehensive vulnerability assessment
                    </p>
                  </button>
                  
                  <button
                    onClick={() => handleTriggerScan('compliance')}
                    className="p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                  >
                    <CheckCircle className="w-8 h-8 text-slate-400 group-hover:text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-slate-900 group-hover:text-blue-900">
                      Compliance Check
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      SOC2, ISO27001, HIPAA compliance
                    </p>
                  </button>
                  
                  <button
                    onClick={() => handleTriggerScan('malware')}
                    className="p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                  >
                    <Zap className="w-8 h-8 text-slate-400 group-hover:text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-slate-900 group-hover:text-blue-900">
                      Malware Scan
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Deep malware and threat detection
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}