import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Shield, 
  TrendingUp, 
  Target,
  Mail,
  CheckCircle,
  AlertTriangle,
  Play,
  Clock,
  Star,
  Trophy,
  ArrowRight,
  Activity
} from 'lucide-react';

export default function EndUserDashboard() {
  // Mock data for demonstration - replace with real API calls
  const mockUserProgress = {
    trainingCompleted: 8,
    totalTraining: 12,
    phishingTestsPassed: 15,
    phishingTestsFailed: 3,
    lastAssessmentScore: 78,
    securityAwareness: 'Good',
    streak: 7,
    rank: 'Security Champion'
  };

  const mockRecentActivity = [
    {
      id: 1,
      type: 'training',
      title: 'Password Security Training',
      completed: true,
      date: '2024-10-03',
      score: 95
    },
    {
      id: 2,
      type: 'phishing',
      title: 'Fake Banking Email Test',
      completed: true,
      date: '2024-10-02',
      passed: true
    },
    {
      id: 3,
      type: 'assessment',
      title: 'Monthly Security Check',
      completed: true,
      date: '2024-09-30',
      score: 78
    }
  ];

  const mockUpcomingTraining = [
    {
      id: 1,
      title: 'Social Engineering Awareness',
      duration: '15 min',
      type: 'Interactive',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Safe Email Practices',
      duration: '10 min',
      type: 'Video',
      priority: 'medium'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Security Dashboard</h1>
          <p className="text-slate-300 mt-1">Track your cybersecurity learning and progress</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-900/30 text-yellow-100 rounded-lg border border-yellow-700">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">{mockUserProgress.rank}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-900/30 text-blue-100 rounded-lg border border-blue-700">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">{mockUserProgress.streak} day streak</span>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProgressCard
          icon={<BookOpen className="w-6 h-6 text-blue-400" />}
          title="Training Progress"
          value={`${mockUserProgress.trainingCompleted}/${mockUserProgress.totalTraining}`}
          percentage={Math.round((mockUserProgress.trainingCompleted / mockUserProgress.totalTraining) * 100)}
          color="blue"
        />
        
        <ProgressCard
          icon={<Mail className="w-6 h-6 text-green-400" />}
          title="Phishing Tests"
          value={`${mockUserProgress.phishingTestsPassed} passed`}
          percentage={Math.round((mockUserProgress.phishingTestsPassed / (mockUserProgress.phishingTestsPassed + mockUserProgress.phishingTestsFailed)) * 100)}
          color="green"
        />
        
        <ProgressCard
          icon={<Shield className="w-6 h-6 text-purple-400" />}
          title="Security Score"
          value={`${mockUserProgress.lastAssessmentScore}/100`}
          percentage={mockUserProgress.lastAssessmentScore}
          color="purple"
        />
        
        <ProgressCard
          icon={<TrendingUp className="w-6 h-6 text-orange-400" />}
          title="Awareness Level"
          value={mockUserProgress.securityAwareness}
          percentage={85}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Path */}
        <div className="lg:col-span-2 space-y-6">
          {/* Available Training */}
          <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Recommended Training
              </h3>
            </div>
            
            <div className="space-y-4">
              {mockUpcomingTraining.map((training) => (
                <div key={training.id} className="flex items-center justify-between p-4 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      training.priority === 'high' ? 'bg-red-900/30' :
                      training.priority === 'medium' ? 'bg-yellow-900/30' : 'bg-green-900/30'
                    }`}>
                      <Play className={`w-4 h-4 ${
                        training.priority === 'high' ? 'text-red-400' :
                        training.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{training.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-300 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {training.duration}
                        </span>
                        <span>{training.type}</span>
                        {training.priority === 'high' && (
                          <span className="text-red-400 font-medium">Priority</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors">
                    Start Training
                  </button>
                </div>
              ))}
            </div>
            
            {mockUpcomingTraining.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-white mb-2">All Caught Up!</h4>
                <p className="text-slate-300">You've completed all available training modules.</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 border border-slate-600 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'training' ? 'bg-blue-900/30' :
                      activity.type === 'phishing' ? 'bg-green-900/30' : 'bg-purple-900/30'
                    }`}>
                      {activity.type === 'training' && <BookOpen className="w-4 h-4 text-blue-400" />}
                      {activity.type === 'phishing' && <Mail className="w-4 h-4 text-green-400" />}
                      {activity.type === 'assessment' && <Shield className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{activity.title}</h4>
                      <p className="text-sm text-slate-300">{activity.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.score && (
                      <span className="text-sm font-medium text-white">{activity.score}%</span>
                    )}
                    {activity.type === 'phishing' && (
                      <span className={`text-sm font-medium ${activity.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {activity.passed ? 'Passed' : 'Failed'}
                      </span>
                    )}
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-blue-900/30 rounded-lg transition-colors border border-blue-700">
                <Target className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium text-white">Take Assessment</p>
                  <p className="text-sm text-slate-300">Quick security check</p>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-green-900/30 rounded-lg transition-colors border border-green-700">
                <BookOpen className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-medium text-white">Browse Training</p>
                  <p className="text-sm text-slate-300">Learn new skills</p>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-purple-900/30 rounded-lg transition-colors border border-purple-700">
                <AlertTriangle className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="font-medium text-white">Report Incident</p>
                  <p className="text-sm text-slate-300">Security concern</p>
                </div>
              </button>
            </div>
          </div>

          {/* Achievement Highlights */}
          <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl border border-yellow-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Achievements
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-700/60 rounded-lg">
                <div className="p-2 bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Security Scholar</p>
                  <p className="text-sm text-slate-300">Completed 5+ training modules</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-700/60 rounded-lg">
                <div className="p-2 bg-blue-900/30 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Phishing Detective</p>
                  <p className="text-sm text-slate-300">Passed 10+ phishing tests</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-700/60 rounded-lg">
                <div className="p-2 bg-purple-900/30 rounded-lg">
                  <Star className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Consistent Learner</p>
                  <p className="text-sm text-slate-300">7-day learning streak</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
            <div className="space-y-3">
              <Link 
                to="/help/security-tips"
                className="flex items-center justify-between p-3 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="text-white">Security Tips</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              
              <Link 
                to="/help/training-guide"
                className="flex items-center justify-between p-3 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="text-white">Training Guide</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              
              <Link 
                to="/help/contact"
                className="flex items-center justify-between p-3 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="text-white">Contact Support</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProgressCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  percentage: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function ProgressCard({ icon, title, value, percentage, color }: ProgressCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-slate-800',
      border: 'border-blue-700',
      progress: 'bg-blue-400',
      progressBg: 'bg-slate-700'
    },
    green: {
      bg: 'bg-slate-800',
      border: 'border-green-700',
      progress: 'bg-green-400',
      progressBg: 'bg-slate-700'
    },
    purple: {
      bg: 'bg-slate-800',
      border: 'border-purple-700',
      progress: 'bg-purple-400',
      progressBg: 'bg-slate-700'
    },
    orange: {
      bg: 'bg-slate-800',
      border: 'border-orange-700',
      progress: 'bg-orange-400',
      progressBg: 'bg-slate-700'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`rounded-xl border p-6 shadow-lg ${classes.bg} ${classes.border}`}>
      <div className="flex items-center justify-between mb-3">
        {icon}
        <span className="text-sm font-medium text-slate-300">{percentage}%</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-1">{value}</h3>
      <p className="text-slate-300 font-medium text-sm mb-3">{title}</p>
      
      {/* Progress Bar */}
      <div className={`w-full ${classes.progressBg} rounded-full h-2`}>
        <div 
          className={`h-2 ${classes.progress} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}