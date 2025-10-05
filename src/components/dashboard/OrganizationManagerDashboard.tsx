import React from 'react';
import { Link } from 'react-router-dom';
import { useGetAssessmentHistoryQuery } from '../../store/api/defendxApi';
import { useGetCampaignsQuery } from '../../store/api/defendxPlusApi';
import { useGetSubscriptionQuery } from '../../store/api/billingApi';
import { useAppSelector } from '../../store/hooks';
import { 
  Shield, 
  Mail, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Crown,
  ArrowRight,
  Target,
  Calendar,
  BarChart3,
  Play
} from 'lucide-react';

export default function OrganizationManagerDashboard() {
  const user = useAppSelector((state) => state.auth.user);
  const organizationId = user?.organizationId || 'current-org';
  
  const { data: assessments, isLoading: assessmentsLoading, error: assessmentsError } = useGetAssessmentHistoryQuery(organizationId);
    const { data: campaigns, error: campaignsError } = useGetCampaignsQuery();
  const { data: subscription, error: subscriptionError } = useGetSubscriptionQuery();

  const latestAssessment = assessments?.[0];
  
  // Handle campaigns data from paginated response
  const campaignsArray = campaigns?.data || [];
  const activeCampaigns = campaignsArray.filter(c => c.status === 'ACTIVE') || [];
  const totalCampaigns = campaignsArray.length || 0;

  // Mock data for demonstration - replace with real API calls
  const mockAlerts = 3;
  const mockAgents = 12;
  const mockLastScan = '2024-10-02';

  // Handle API errors gracefully
  const hasApiErrors = assessmentsError || campaignsError || subscriptionError;

  if (hasApiErrors) {
    console.log('📊 Dashboard API Errors:', {
      assessments: assessmentsError,
      campaigns: campaignsError,
      subscription: subscriptionError
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Organization Dashboard</h1>
          <p className="text-slate-600 mt-1">Monitor your cybersecurity posture and operations</p>
        </div>
        
        {subscription?.status === 'trial' && (
          <Link
            to="/dashboard/billing"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            <Crown className="w-4 h-4" />
            Upgrade Plan
          </Link>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<Shield className="w-6 h-6 text-blue-600" />}
          title="CSI Score"
          value={latestAssessment?.score ? `${latestAssessment.score}/100` : 'Not assessed'}
          subtitle={latestAssessment?.tier ? `Grade ${latestAssessment.tier}` : 'Take assessment'}
          color="blue"
          trend={latestAssessment?.score ? '+5 from last month' : undefined}
        />
        
        <MetricCard
          icon={<Mail className="w-6 h-6 text-green-600" />}
          title="Phishing Campaigns"
          value={totalCampaigns.toString()}
          subtitle={`${activeCampaigns.length} active`}
          color="green"
          trend={totalCampaigns > 0 ? 'Last run 2 days ago' : undefined}
        />
        
        <MetricCard
          icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
          title="Active Alerts"
          value={mockAlerts.toString()}
          subtitle="Needs attention"
          color="orange"
          trend="2 new today"
        />
        
        <MetricCard
          icon={<Activity className="w-6 h-6 text-purple-600" />}
          title="Monitored Endpoints"
          value={mockAgents.toString()}
          subtitle="Online agents"
          color="purple"
          trend="All systems operational"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            icon={<Target className="w-8 h-8 text-blue-600" />}
            title="Start Assessment"
            description="Run a new cybersecurity assessment"
            to="/dashboard/defendx/assessment/start"
            buttonText="Begin Assessment"
            color="blue"
          />
          
          <ActionCard
            icon={<Mail className="w-8 h-8 text-green-600" />}
            title="Launch Phishing Test"
            description="Create and deploy phishing simulation"
            to="/dashboard/defendxplus/phishing"
            buttonText="Create Campaign"
            color="green"
          />
          
          <ActionCard
            icon={<BarChart3 className="w-8 h-8 text-purple-600" />}
            title="View Reports"
            description="Access detailed security reports"
            to="/dashboard/defendxplus/scans"
            buttonText="View Reports"
            color="purple"
          />
        </div>
      </div>

      {/* Recent Activity & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Assessment Status</h3>
            <Link 
              to="/dashboard/defendx"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          {assessmentsLoading ? (
            <div className="text-center py-8 text-slate-500">Loading assessments...</div>
          ) : latestAssessment ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    latestAssessment.tier === 'A' ? 'bg-green-100' :
                    latestAssessment.tier === 'B' ? 'bg-blue-100' :
                    latestAssessment.tier === 'C' ? 'bg-yellow-100' :
                    latestAssessment.tier === 'D' ? 'bg-orange-100' : 'bg-red-100'
                  }`}>
                    <Shield className={`w-5 h-5 ${
                      latestAssessment.tier === 'A' ? 'text-green-600' :
                      latestAssessment.tier === 'B' ? 'text-blue-600' :
                      latestAssessment.tier === 'C' ? 'text-yellow-600' :
                      latestAssessment.tier === 'D' ? 'text-orange-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Latest Assessment</p>
                    <p className="text-sm text-slate-600">
                      Score: {latestAssessment.score}/100 • Grade {latestAssessment.tier}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/dashboard/defendx/assessment/result/${latestAssessment.id}`}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Report <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="text-center py-4">
                <Link
                  to="/dashboard/defendx/assessment/start"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Start New Assessment
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-slate-900 mb-2">No Assessments Yet</h4>
              <p className="text-slate-600 mb-4">Get started by running your first cybersecurity assessment</p>
              <Link
                to="/dashboard/defendx/assessment/start"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                Start Assessment
              </Link>
            </div>
          )}
        </div>

        {/* Security Monitoring */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Security Monitoring</h3>
            <Link 
              to="/dashboard/defendxplus/monitoring"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-slate-900">Active Alerts</p>
                  <p className="text-sm text-slate-600">{mockAlerts} require attention</p>
                </div>
              </div>
              <Link
                to="/dashboard/defendxplus/monitoring"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Review
              </Link>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-slate-900">Endpoints Online</p>
                  <p className="text-sm text-slate-600">{mockAgents} of {mockAgents} agents</p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">Last Security Scan</p>
                  <p className="text-sm text-slate-600">{mockLastScan}</p>
                </div>
              </div>
              <Link
                to="/dashboard/defendxplus/scans"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Results
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      {subscription && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Crown className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {subscription.plan} Plan
                </h3>
                <p className="text-slate-600">
                  Status: <span className={`font-medium ${
                    subscription.status === 'active' ? 'text-green-600' :
                    subscription.status === 'trial' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-slate-600">
                {subscription.status === 'trial' ? 'Trial ends' : 'Renews'}: {' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
              <Link
                to="/dashboard/billing"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Manage Subscription →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
  trend?: string;
}

function MetricCard({ icon, title, value, subtitle, color, trend }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        {icon}
        {trend && (
          <span className="text-xs text-slate-500 bg-white/60 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
      <p className="text-slate-700 font-medium text-sm">{title}</p>
      <p className="text-slate-600 text-xs mt-1">{subtitle}</p>
    </div>
  );
}

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  buttonText: string;
  color: 'blue' | 'green' | 'purple';
}

function ActionCard({ icon, title, description, to, buttonText, color }: ActionCardProps) {
  const colorClasses = {
    blue: 'hover:bg-blue-50 border-blue-100 text-blue-600',
    green: 'hover:bg-green-50 border-green-100 text-green-600', 
    purple: 'hover:bg-purple-50 border-purple-100 text-purple-600',
  };

  const buttonClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  };

  return (
    <div className={`p-6 border-2 border-dashed rounded-lg transition-colors ${colorClasses[color]}`}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-3">
          {icon}
        </div>
        <h4 className="font-medium text-slate-900 mb-2">{title}</h4>
        <p className="text-sm text-slate-600 mb-4">{description}</p>
        <Link
          to={to}
          className={`inline-block px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium ${buttonClasses[color]}`}
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}