import { useGetDashboardStatsQuery } from '../../store/api/adminApi';
import { Users, FileCheck, TrendingUp, Building2, AlertTriangle, Activity, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useEffect } from 'react';

const RISK_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  CRITICAL: '#991b1b',
};

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useGetDashboardStatsQuery({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">Loading dashboard stats...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="p-8 text-center text-red-400">
          <p>Failed to load dashboard statistics</p>
          <p className="text-sm mt-2">{error ? 'Error loading data' : 'No data available'}</p>
        </div>
      </div>
    );
  }

  const { overview, nationalCSI, sectorBreakdown, growth } = stats;

  // Prepare sector breakdown data for chart
  const sectorData = sectorBreakdown.map(sector => ({
    name: sector.sector,
    score: sector.averageScore,
    organizations: sector.organizationCount,
    riskLevel: sector.riskLevel,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: `${100 - mousePosition.x}%`,
            top: `${100 - mousePosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <div className="relative z-10 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-300 mt-1">System-wide analytics and management</p>
          <p className="text-xs text-slate-400 mt-1">Last updated: {new Date(stats.generatedAt).toLocaleString()}</p>
        </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Building2 className="w-6 h-6" />}
          title="Total Organizations"
          value={overview.totalOrganizations.toString()}
          subtitle={`${overview.activeOrganizations} active`}
          color="blue"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Total Users"
          value={overview.totalUsers.toString()}
          subtitle={`${growth.newUsersThisMonth} new this month`}
          color="green"
        />
        <StatCard
          icon={<FileCheck className="w-6 h-6" />}
          title="Assessments"
          value={overview.completedAssessments.toString()}
          subtitle={`${overview.activeAssessments} in progress`}
          color="purple"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Phishing Campaigns"
          value={overview.phishingCampaigns.toString()}
          subtitle={`${overview.totalAlerts} alerts`}
          color="orange"
        />
      </div>

      {/* National CSI & Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">National CSI</h2>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-3xl font-bold text-blue-100">
                {nationalCSI.averageScore.toFixed(1)}
              </div>
              <div className="text-sm text-slate-300">Average Score</div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-600/50">
              <div>
                <div className="text-lg font-semibold text-white">{nationalCSI.participatingOrgs}</div>
                <div className="text-xs text-slate-400">Participating Orgs</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-white">{nationalCSI.participationRate}%</div>
                <div className="text-xs text-slate-400">Participation Rate</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-bold text-white">Growth This Month</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">New Organizations</span>
              <span className="text-lg font-semibold text-green-100">+{growth.newOrganizationsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">New Users</span>
              <span className="text-lg font-semibold text-green-100">+{growth.newUsersThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Assessments</span>
              <span className="text-lg font-semibold text-green-100">+{growth.assessmentsThisMonth}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">System Status</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Active Agents</span>
              <span className="text-lg font-semibold text-white">{overview.activeAgents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Total Alerts</span>
              <span className="text-lg font-semibold text-white">{overview.totalAlerts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Inactive Orgs</span>
              <span className="text-lg font-semibold text-white">{overview.inactiveOrganizations}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Breakdown */}
      <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Sector Breakdown</h2>
        </div>
        
        {sectorData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="score" fill="#3b82f6" name="Average Score" />
                <Bar yAxisId="right" dataKey="organizations" fill="#10b981" name="Organizations" />
              </BarChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {sectorData.map((sector, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-600/50 hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 hover:border-slate-500/50 transition-all duration-300 group">
                  <div className="flex-1">
                    <div className="font-semibold text-white group-hover:text-slate-100 transition-colors">{sector.name}</div>
                    <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                      {sector.organizations} organization{sector.organizations !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: RISK_COLORS[sector.riskLevel] }}>
                      {sector.score.toFixed(1)}
                    </div>
                    <div 
                      className="text-xs font-medium px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: `${RISK_COLORS[sector.riskLevel]}20`,
                        color: RISK_COLORS[sector.riskLevel]
                      }}
                    >
                      {sector.riskLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 py-8">
            No sector data available
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  title, 
  value, 
  subtitle,
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  subtitle?: string;
  color: string;
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-slate-800/60 backdrop-blur-xl',
      border: 'border-blue-500/50',
      iconBg: 'bg-blue-900/30',
      iconColor: 'text-blue-400',
      valueColor: 'text-blue-100',
      titleColor: 'text-slate-300',
      subtitleColor: 'text-slate-400',
      hoverBorder: 'hover:border-blue-400/70',
      gradient: 'from-blue-500/5 to-purple-500/5'
    },
    green: {
      bg: 'bg-slate-800/60 backdrop-blur-xl',
      border: 'border-green-500/50',
      iconBg: 'bg-green-900/30',
      iconColor: 'text-green-400',
      valueColor: 'text-green-100',
      titleColor: 'text-slate-300',
      subtitleColor: 'text-slate-400',
      hoverBorder: 'hover:border-green-400/70',
      gradient: 'from-green-500/5 to-blue-500/5'
    },
    purple: {
      bg: 'bg-slate-800/60 backdrop-blur-xl',
      border: 'border-purple-500/50',
      iconBg: 'bg-purple-900/30',
      iconColor: 'text-purple-400',
      valueColor: 'text-purple-100',
      titleColor: 'text-slate-300',
      subtitleColor: 'text-slate-400',
      hoverBorder: 'hover:border-purple-400/70',
      gradient: 'from-purple-500/5 to-pink-500/5'
    },
    orange: {
      bg: 'bg-slate-800/60 backdrop-blur-xl',
      border: 'border-orange-500/50',
      iconBg: 'bg-orange-900/30',
      iconColor: 'text-orange-400',
      valueColor: 'text-orange-100',
      titleColor: 'text-slate-300',
      subtitleColor: 'text-slate-400',
      hoverBorder: 'hover:border-orange-400/70',
      gradient: 'from-orange-500/5 to-yellow-500/5'
    }
  };

  const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className={`group relative rounded-2xl border p-6 shadow-lg overflow-hidden transition-all duration-500 transform hover:scale-105 ${classes.bg} ${classes.border} ${classes.hoverBorder}`}>
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(135deg, ${classes.gradient?.split(' ')[0]?.replace('from-', '') || '#3b82f620'} 0%, ${classes.gradient?.split(' ')[2]?.replace('to-', '') || '#1e293b20'} 100%)` }} />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
      
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-lg ${classes.iconBg} flex items-center justify-center mb-4`}>
          <div className={classes.iconColor}>
            {icon}
          </div>
        </div>
        <div className={`text-3xl font-bold ${classes.valueColor}`}>{value}</div>
        <div className={`${classes.titleColor} mt-1`}>{title}</div>
        {subtitle && (
          <div className={`text-sm ${classes.subtitleColor} mt-1`}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}
