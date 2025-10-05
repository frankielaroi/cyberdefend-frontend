import { useGetDashboardStatsQuery } from '../../store/api/adminApi';
import { Users, FileCheck, TrendingUp, DollarSign, MapPin, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

// Mock data for demo purposes
const mockStats = {
  totalOrganizations: 150,
  activeSubscriptions: 120,
  completedAssessments: 380,
  activeCampaigns: 45,
  totalUsers: 850,
  byRegion: {
    'North America': 65,
    'Europe': 45,
    'Asia Pacific': 25,
    'Africa': 15
  },
  bySector: {
    'Banking': 30,
    'Healthcare': 25,
    'Technology': 35,
    'Government': 20,
    'Education': 15,
    'Manufacturing': 25
  },
  trends: [
    { date: '2024-09-01', assessments: 25, campaigns: 8, alerts: 12, newUsers: 15 },
    { date: '2024-09-08', assessments: 30, campaigns: 10, alerts: 8, newUsers: 22 },
    { date: '2024-09-15', assessments: 28, campaigns: 12, alerts: 15, newUsers: 18 },
    { date: '2024-09-22', assessments: 35, campaigns: 9, alerts: 10, newUsers: 25 },
    { date: '2024-09-29', assessments: 32, campaigns: 11, alerts: 7, newUsers: 20 },
  ],
  recentActivity: []
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStatsQuery({});

  // Use mock data if API fails or is loading
  const finalStats = stats || mockStats;

  if (isLoading) {
    return <div className="p-8 text-center">Loading dashboard stats...</div>;
  }

  const regionData = Object.entries(finalStats?.byRegion || {}).map(([name, value]) => ({
    name,
    organizations: value,
  }));

  const sectorData = Object.entries(finalStats?.bySector || {}).map(([name, value]) => ({
    name,
    organizations: value,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">System-wide analytics and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Organizations"
          value={(finalStats?.totalOrganizations || 0).toString()}
          color="blue"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Active Subscriptions"
          value={(finalStats?.activeSubscriptions || 0).toString()}
          color="green"
        />
        <StatCard
          icon={<FileCheck className="w-6 h-6" />}
          title="Assessments"
          value={(finalStats?.completedAssessments || 0).toString()}
          color="slate"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Total Users"
          value={(finalStats?.totalUsers || 0).toString()}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Organizations by Region</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="organizations" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-slate-900">Organizations by Sector</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="organizations" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Activity Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={finalStats?.trends || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <Legend />
            <Line type="monotone" dataKey="assessments" stroke="#3b82f6" name="Assessments" />
            <Line type="monotone" dataKey="alerts" stroke="#f59e0b" name="Alerts" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    slate: 'bg-slate-50 text-slate-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-slate-600 mt-1">{title}</div>
    </div>
  );
}
