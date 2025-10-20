import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
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
import mockUserProgressService, { UserProgress, TrainingModule, ActivityItem } from '../../services/mockUserProgressService';

export default function EndUserDashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        const [progress, training, activity] = await Promise.all([
          mockUserProgressService.getUserProgress(user.id),
          mockUserProgressService.getAvailableTraining(user.id),
          mockUserProgressService.getRecentActivity(user.id)
        ]);

        setUserProgress(progress);
        setTrainingModules(training);
        setRecentActivity(activity);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  const handleStartTraining = async (training: TrainingModule) => {
    // For now, just mark as completed with a random score
    // In a real app, this would navigate to the training module
    if (user?.id) {
      const score = Math.floor(Math.random() * 20) + 80; // 80-100
      await mockUserProgressService.completeTraining(user.id, training.id, score);
      
      // Reload data
      const [progress, trainingList, activity] = await Promise.all([
        mockUserProgressService.getUserProgress(user.id),
        mockUserProgressService.getAvailableTraining(user.id),
        mockUserProgressService.getRecentActivity(user.id)
      ]);
      
      setUserProgress(progress);
      setTrainingModules(trainingList);
      setRecentActivity(activity);
    }
  };

  const handleTakeAssessment = () => {
    navigate('/assessment/anonymous');
  };

  const handleBrowseTraining = () => {
    // For now, just scroll to training section
    document.getElementById('training-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReportIncident = () => {
    // For now, show alert. In real app, open modal or navigate
    alert('Incident reporting feature coming soon!');
  };

  if (loading || !userProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center relative overflow-hidden">
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

        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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
      <div className={`flex items-center justify-between transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div>
          <h1 className="text-3xl font-bold text-white">My Security Dashboard</h1>
          <p className="text-slate-300 mt-1">Track your cybersecurity learning and progress</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-900/30 text-yellow-100 rounded-lg border border-yellow-700/50 backdrop-blur-sm">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">{userProgress.rank}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-900/30 text-blue-100 rounded-lg border border-blue-700/50 backdrop-blur-sm">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">{userProgress.streak} day streak</span>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProgressCard
          icon={<BookOpen className="w-6 h-6 text-blue-400" />}
          title="Training Progress"
          value={`${userProgress.trainingCompleted}/${userProgress.totalTraining}`}
          percentage={Math.round((userProgress.trainingCompleted / userProgress.totalTraining) * 100)}
          color="blue"
        />
        
        <ProgressCard
          icon={<Mail className="w-6 h-6 text-green-400" />}
          title="Phishing Tests"
          value={`${userProgress.phishingTestsPassed} passed`}
          percentage={Math.round((userProgress.phishingTestsPassed / (userProgress.phishingTestsPassed + userProgress.phishingTestsFailed)) * 100)}
          color="green"
        />
        
        <ProgressCard
          icon={<Shield className="w-6 h-6 text-purple-400" />}
          title="Security Score"
          value={`${userProgress.lastAssessmentScore}/100`}
          percentage={userProgress.lastAssessmentScore}
          color="purple"
        />
        
        <ProgressCard
          icon={<TrendingUp className="w-6 h-6 text-orange-400" />}
          title="Awareness Level"
          value={userProgress.securityAwareness}
          percentage={85}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Path */}
        <div className="lg:col-span-2 space-y-6">
          {/* Available Training */}
          <div id="training-section" className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Recommended Training
              </h3>
            </div>
            
            <div className="space-y-4">
              {trainingModules.map((training) => (
                <div key={training.id} className="group relative flex items-center justify-between p-4 border border-slate-600/50 rounded-lg hover:border-blue-500/50 bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  
                  <div className="relative z-10 flex items-center gap-4">
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
                  <button 
                    onClick={() => handleStartTraining(training)}
                    className="relative z-10 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                  >
                    Start Training
                  </button>
                </div>
              ))}
            </div>
            
            {trainingModules.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-white mb-2">All Caught Up!</h4>
                <p className="text-slate-300">You've completed all available training modules.</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="group relative flex items-center justify-between p-4 border border-slate-600/50 rounded-lg hover:border-green-500/50 bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10 flex items-center gap-4">
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
                  <div className="relative z-10 flex items-center gap-2">
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
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={handleTakeAssessment}
                className="w-full flex items-center gap-3 p-4 text-left bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-600/50 hover:bg-gradient-to-r hover:from-blue-900/40 hover:to-blue-800/40 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group"
              >
                <Target className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <p className="font-medium text-white group-hover:text-blue-100 transition-colors">Take Assessment</p>
                  <p className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">Quick security check</p>
                </div>
              </button>
              
              <button 
                onClick={handleBrowseTraining}
                className="w-full flex items-center gap-3 p-4 text-left bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-600/50 hover:bg-gradient-to-r hover:from-green-900/40 hover:to-green-800/40 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 group"
              >
                <BookOpen className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <p className="font-medium text-white group-hover:text-green-100 transition-colors">Browse Training</p>
                  <p className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">Learn new skills</p>
                </div>
              </button>
              
              <button 
                onClick={handleReportIncident}
                className="w-full flex items-center gap-3 p-4 text-left bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-600/50 hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-purple-800/40 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group"
              >
                <AlertTriangle className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <p className="font-medium text-white group-hover:text-purple-100 transition-colors">Report Incident</p>
                  <p className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">Security concern</p>
                </div>
              </button>
            </div>
          </div>

          {/* Achievement Highlights */}
          <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-xl rounded-2xl border border-yellow-700/50 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Achievements
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-600/50 hover:bg-gradient-to-r hover:from-green-900/30 hover:to-green-800/30 hover:border-green-500/50 transition-all duration-300 group">
                <div className="p-2 bg-green-900/30 rounded-lg group-hover:bg-green-800/50 transition-colors">
                  <CheckCircle className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <p className="font-medium text-white group-hover:text-green-100 transition-colors">Security Scholar</p>
                  <p className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">Completed 5+ training modules</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-600/50 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-blue-800/30 hover:border-blue-500/50 transition-all duration-300 group">
                <div className="p-2 bg-blue-900/30 rounded-lg group-hover:bg-blue-800/50 transition-colors">
                  <Shield className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <p className="font-medium text-white group-hover:text-blue-100 transition-colors">Phishing Detective</p>
                  <p className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">Passed 10+ phishing tests</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-600/50 hover:bg-gradient-to-r hover:from-purple-900/30 hover:to-purple-800/30 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="p-2 bg-purple-900/30 rounded-lg group-hover:bg-purple-800/50 transition-colors">
                  <Star className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <p className="font-medium text-white group-hover:text-purple-100 transition-colors">Consistent Learner</p>
                  <p className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">7-day learning streak</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
            <div className="space-y-3">
              <button 
                onClick={() => alert('Security Tips: Coming soon!')}
                className="flex items-center justify-between p-4 bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-600/50 hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 hover:border-slate-500/50 hover:shadow-lg hover:shadow-slate-500/20 transition-all duration-300 w-full text-left group"
              >
                <span className="text-white group-hover:text-slate-100 transition-colors">Security Tips</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-300 group-hover:translate-x-1 transition-all duration-300" />
              </button>
              
              <button 
                onClick={() => alert('Training Guide: Coming soon!')}
                className="flex items-center justify-between p-4 bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-600/50 hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 hover:border-slate-500/50 hover:shadow-lg hover:shadow-slate-500/20 transition-all duration-300 w-full text-left group"
              >
                <span className="text-white group-hover:text-slate-100 transition-colors">Training Guide</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-300 group-hover:translate-x-1 transition-all duration-300" />
              </button>
              
              <button 
                onClick={() => alert('Contact Support: support@cyberdefend.com')}
                className="flex items-center justify-between p-4 bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-600/50 hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 hover:border-slate-500/50 hover:shadow-lg hover:shadow-slate-500/20 transition-all duration-300 w-full text-left group"
              >
                <span className="text-white group-hover:text-slate-100 transition-colors">Contact Support</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-300 group-hover:translate-x-1 transition-all duration-300" />
              </button>
            </div>
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
      bg: 'bg-slate-800/60 backdrop-blur-xl',
      border: 'border-blue-500/50',
      progress: 'bg-gradient-to-r from-blue-400 to-blue-500',
      progressBg: 'bg-slate-700/50',
      hoverBorder: 'hover:border-blue-400/70',
      gradient: 'from-blue-500/5 to-purple-500/5'
    },
    green: {
      bg: 'bg-slate-800/60 backdrop-blur-xl',
      border: 'border-green-500/50',
      progress: 'bg-gradient-to-r from-green-400 to-green-500',
      progressBg: 'bg-slate-700/50',
      hoverBorder: 'hover:border-green-400/70',
      gradient: 'from-green-500/5 to-blue-500/5'
    },
    purple: {
      bg: 'bg-slate-800/60 backdrop-blur-xl',
      border: 'border-purple-500/50',
      progress: 'bg-gradient-to-r from-purple-400 to-purple-500',
      progressBg: 'bg-slate-700/50',
      hoverBorder: 'hover:border-purple-400/70',
      gradient: 'from-purple-500/5 to-pink-500/5'
    },
    orange: {
      bg: 'bg-slate-800/60 backdrop-blur-xl',
      border: 'border-orange-500/50',
      progress: 'bg-gradient-to-r from-orange-400 to-orange-500',
      progressBg: 'bg-slate-700/50',
      hoverBorder: 'hover:border-orange-400/70',
      gradient: 'from-orange-500/5 to-yellow-500/5'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`group relative rounded-2xl border p-6 shadow-lg overflow-hidden transition-all duration-500 transform hover:scale-105 ${classes.bg} ${classes.border} ${classes.hoverBorder}`}>
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(135deg, ${classes.gradient.split(' ')[0].replace('from-', '')} 0%, ${classes.gradient.split(' ')[1].replace('to-', '')} 100%)` }} />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
      
      <div className="relative z-10">
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
    </div>
  );
}