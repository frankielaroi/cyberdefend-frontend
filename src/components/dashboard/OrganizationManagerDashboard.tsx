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
  Crown,
  ArrowRight,
  Target,
  Plus,
  BarChart3,
  Play
} from 'lucide-react';

export default function OrganizationManagerDashboard() {
  const user = useAppSelector((state) => state.auth.user);
  
  const { data: assessments, isLoading: assessmentsLoading, error: assessmentsError } = useGetAssessmentHistoryQuery({});
  const { data: campaigns, isLoading: campaignsLoading, error: campaignsError } = useGetCampaignsQuery({});
  const { data: subscription, error: subscriptionError } = useGetSubscriptionQuery();

  // Handle assessments data from paginated response
  const assessmentsArray = assessments?.data || [];
  const latestAssessment = assessmentsArray[0];
  
  // Handle campaigns data from new response structure
  const campaignsArray = campaigns?.campaigns || [];
  const activeCampaigns = campaignsArray.filter(c => c.status === 'ACTIVE') || [];
  const totalCampaigns = campaignsArray.length || 0;

  // Mock data for demonstration - replace with real API calls
  const mockAlerts = 3;
  const mockAgents = 12;

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
          <h1 className="text-3xl font-bold text-white">Organization Dashboard</h1>
          <p className="text-slate-300 mt-1">Monitor your cybersecurity posture and operations</p>
        </div>
        
        {(subscription as any)?.status === 'trial' && (
          <Link
            to="/dashboard/billing"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all"
          >
            <Crown className="w-4 h-4" />
            Upgrade Plan
          </Link>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<Shield className="w-6 h-6" />}
          title="CSI Score"
          value={latestAssessment?.score ? `${latestAssessment.score}/100` : 'Not assessed'}
          subtitle={latestAssessment?.tier ? `Grade ${latestAssessment.tier}` : 'Take assessment'}
          color="blue"
          trend={latestAssessment?.score ? '+5 from last month' : undefined}
        />
        
        <MetricCard
          icon={<Mail className="w-6 h-6" />}
          title="Phishing Campaigns"
          value={totalCampaigns.toString()}
          subtitle={`${activeCampaigns.length} active`}
          color="green"
          trend={totalCampaigns > 0 ? 'Last run 2 days ago' : undefined}
        />
        
        <MetricCard
          icon={<AlertTriangle className="w-6 h-6" />}
          title="Active Alerts"
          value={mockAlerts.toString()}
          subtitle="Needs attention"
          color="orange"
          trend="2 new today"
        />
        
        <MetricCard
          icon={<Activity className="w-6 h-6" />}
          title="Monitored Endpoints"
          value={mockAgents.toString()}
          subtitle="Online agents"
          color="purple"
          trend="All systems operational"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            icon={<Target className="w-8 h-8" />}
            title="Start Assessment"
            description="Run a new cybersecurity assessment"
            to="/dashboard/defendx/assessment/start"
            buttonText="Begin Assessment"
            color="blue"
          />
          
          <ActionCard
            icon={<Mail className="w-8 h-8" />}
            title="Launch Phishing Test"
            description="Create and deploy phishing simulation"
            to="/dashboard/defendxplus/phishing"
            buttonText="Create Campaign"
            color="green"
          />
          
          <ActionCard
            icon={<BarChart3 className="w-8 h-8" />}
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
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Assessment Status</h3>
            <Link 
              to="/dashboard/defendx"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          {assessmentsLoading ? (
            <div className="text-center py-8 text-slate-400">Loading assessments...</div>
          ) : latestAssessment ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
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
                    <p className="font-medium text-white">Latest Assessment</p>
                    <p className="text-sm text-slate-300">
                      Score: {latestAssessment.score}/100 • Grade {latestAssessment.tier}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/dashboard/defendx/assessment/result/${latestAssessment.id}`}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  View Report <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="text-center py-4">
                <Link
                  to="/dashboard/defendx/assessment/start"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Start New Assessment
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-white mb-2">No Assessments Yet</h4>
              <p className="text-slate-300 mb-4">Get started by running your first cybersecurity assessment</p>
              <Link
                to="/dashboard/defendx/assessment/start"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                <Play className="w-4 h-4" />
                Start Assessment
              </Link>
            </div>
          )}
        </div>

        {/* Phishing Campaigns */}
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Phishing Campaigns</h3>
            <Link 
              to="/dashboard/defendxplus/phishing"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          {campaignsLoading ? (
            <div className="text-center py-8 text-slate-400">Loading campaigns...</div>
          ) : activeCampaigns.length > 0 ? (
            <div className="space-y-4">
              {activeCampaigns.slice(0, 3).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      campaign.status === 'ACTIVE' ? 'bg-green-900/50' :
                      campaign.status === 'SCHEDULED' ? 'bg-blue-900/50' :
                      'bg-slate-600'
                    }`}>
                      <Mail className={`w-5 h-5 ${
                        campaign.status === 'ACTIVE' ? 'text-green-400' :
                        campaign.status === 'SCHEDULED' ? 'text-blue-400' :
                        'text-slate-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{campaign.name}</p>
                      <p className="text-sm text-slate-300">
                        {campaign.targetCount} targets • {campaign.status}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/dashboard/defendxplus/phishing/campaigns/${campaign.id}`}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    View <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
              
              <div className="text-center py-4">
                <Link
                  to="/dashboard/defendxplus/phishing/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Campaign
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-white mb-2">No Campaigns Yet</h4>
              <p className="text-slate-300 mb-4">Create your first phishing simulation campaign</p>
              <Link
                to="/dashboard/defendxplus/phishing/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Campaign
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Status */}
      {subscription && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl border border-slate-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/50 rounded-lg">
                <Crown className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {(subscription as any).plan || 'Free'} Plan
                </h3>
                <p className="text-slate-300">
                  Status: <span className={`font-medium ${
                    (subscription as any).status === 'active' ? 'text-green-400' :
                    (subscription as any).status === 'trial' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {(subscription as any).status ? (subscription as any).status.charAt(0).toUpperCase() + (subscription as any).status.slice(1) : 'Unknown'}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-slate-300">
                {(subscription as any).status === 'trial' ? 'Trial ends' : 'Renews'}: {' '}
                {(subscription as any).currentPeriodEnd ? new Date((subscription as any).currentPeriodEnd).toLocaleDateString() : 'N/A'}
              </p>
              <Link
                to="/dashboard/billing"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
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
    blue: 'bg-slate-800 border-blue-500/20',
    green: 'bg-slate-800 border-green-500/20',
    orange: 'bg-slate-800 border-orange-500/20',
    purple: 'bg-slate-800 border-purple-500/20',
  };

  const iconColors = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
  };

  return (
    <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={iconColors[color]}>{icon}</div>
        {trend && (
          <span className="text-xs text-slate-300 bg-slate-700/60 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-slate-200 font-medium text-sm">{title}</p>
      <p className="text-slate-400 text-xs mt-1">{subtitle}</p>
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
    blue: 'hover:bg-slate-700 border-blue-500/30 text-blue-400',
    green: 'hover:bg-slate-700 border-green-500/30 text-green-400', 
    purple: 'hover:bg-slate-700 border-purple-500/30 text-purple-400',
  };

  const buttonClasses = {
    blue: 'bg-blue-600 hover:bg-blue-500',
    green: 'bg-green-600 hover:bg-green-500',
    purple: 'bg-purple-600 hover:bg-purple-500',
  };

  return (
    <div className={`p-6 border-2 border-dashed rounded-lg transition-colors bg-slate-800 ${colorClasses[color]}`}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-3">
          {icon}
        </div>
        <h4 className="font-medium text-white mb-2">{title}</h4>
        <p className="text-sm text-slate-300 mb-4">{description}</p>
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