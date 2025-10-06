import { useState } from 'react';
import { useGetLatestCSIResultQuery } from '../../store/api/defendxApi';
import { useGetPlansQuery } from '../../store/api/billingApi';
import { useAppDispatch } from '../../store/hooks';
import { startAssessment } from '../../store/slices/defendxSlice';
import { mockQuestions, mockAssessment } from '../../data/mockQuestions';
import { FileText, TrendingUp, Award, Clock, Shield, AlertTriangle, CheckCircle, ArrowRight, Star } from 'lucide-react';
import AssessmentQuestionnaire from './AssessmentQuestionnaire';

export default function AssessmentDashboard() {
  const dispatch = useAppDispatch();
  const { data: latestResult } = useGetLatestCSIResultQuery();
  const { data: plans = [] } = useGetPlansQuery();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Mock data for assessments history
  const mockHistory = [
    { id: '1', status: 'completed', score: 85, tier: 'A', startedAt: '2024-09-15', completedAt: '2024-09-15', reportUrl: '/mock-report-1.pdf' },
    { id: '2', status: 'completed', score: 72, tier: 'B', startedAt: '2024-08-20', completedAt: '2024-08-20', reportUrl: '/mock-report-2.pdf' },
    { id: '3', status: 'in_progress', startedAt: '2024-10-01' },
  ];

  const handleStartAssessment = async () => {
    try {
      setIsStarting(true);
      // Use mock data instead of API call
      const result = {
        assessment: mockAssessment,
        questions: mockQuestions
      };
      
      dispatch(startAssessment(result));
      setShowQuestionnaire(true);
    } catch (error) {
      console.error('Failed to start assessment:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const history = mockHistory;
  const isLoading = false;

  if (showQuestionnaire) {
    return <AssessmentQuestionnaire onComplete={() => setShowQuestionnaire(false)} />;
  }
  
  // Determine risk tier based on CSI score
  const getRiskTier = (score: number) => {
    if (score >= 80) return { level: 'Low', color: 'green', icon: CheckCircle };
    if (score >= 60) return { level: 'Medium', color: 'yellow', icon: AlertTriangle };
    return { level: 'High', color: 'red', icon: AlertTriangle };
  };

  // Get recommended plans based on current CSI score
  const getRecommendedPlans = () => {
    if (!plans) return [];
    if (!latestResult?.score) return plans.slice(0, 2);
    
    if (latestResult.score >= 80) {
      return plans.filter((plan: any) => plan.name.includes('Premium') || plan.name.includes('Enterprise'));
    } else if (latestResult.score >= 60) {
      return plans.filter((plan: any) => plan.name.includes('Standard') || plan.name.includes('Professional'));
    }
    return plans.filter((plan: any) => plan.name.includes('Basic') || plan.name.includes('Starter'));
  };  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">DefendX Dashboard</h1>
          <p className="text-slate-600 mt-1">Your cybersecurity readiness overview</p>
        </div>
        <button
          onClick={handleStartAssessment}
          disabled={isStarting}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors flex items-center gap-2"
        >
          <Award className="w-5 h-5" />
          {isStarting ? 'Starting...' : 'Start New Assessment'}
        </button>
      </div>

      {/* Overall CSI Score & Risk Tier */}
      {latestResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CSI Score Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Current CSI Score</h2>
                </div>
                <p className="text-slate-600">Last updated: {new Date((latestResult as any).completedAt || Date.now()).toLocaleDateString()}</p>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600">{latestResult.score}</div>
                <div className="text-xl font-semibold text-slate-700 mt-2">out of 100</div>
                <div className={`inline-block px-4 py-1 rounded-full mt-2 font-bold ${
                  latestResult.tier === 'A' ? 'bg-green-100 text-green-700' :
                  latestResult.tier === 'B' ? 'bg-blue-100 text-blue-700' :
                  latestResult.tier === 'C' ? 'bg-yellow-100 text-yellow-700' :
                  latestResult.tier === 'D' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  Tier {latestResult.tier}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Tier Card */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            {(() => {
              const riskTier = getRiskTier(latestResult.score);
              const IconComponent = riskTier.icon;
              return (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent className={`w-8 h-8 ${
                        riskTier.color === 'green' ? 'text-green-600' :
                        riskTier.color === 'yellow' ? 'text-yellow-600' :
                        'text-red-600'
                      }`} />
                      <h2 className="text-2xl font-bold text-slate-900">Risk Level</h2>
                    </div>
                    <p className="text-slate-600">Based on your current CSI score</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${
                      riskTier.color === 'green' ? 'text-green-600' :
                      riskTier.color === 'yellow' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {riskTier.level}
                    </div>
                    <div className="text-lg font-semibold text-slate-700 mt-1">Risk</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Quick Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          title="Total Assessments"
          value={history.length.toString()}
          color="blue"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Completed"
          value={history.filter(a => a.status === 'completed').length.toString()}
          color="green"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          title="In Progress"
          value={history.filter(a => a.status === 'in_progress').length.toString()}
          color="orange"
        />
      </div>

      {/* Recent Assessments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Recent Assessments</h2>
          <p className="text-slate-600 text-sm mt-1">Track your cybersecurity improvement over time</p>
        </div>
        <div className="divide-y divide-slate-200">
          {isLoading ? (
            <div className="p-8 text-center text-slate-600">Loading assessments...</div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-slate-600">
              <Award className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No assessments yet</h3>
              <p className="text-sm">Start your first assessment to measure your cybersecurity readiness and get personalized recommendations.</p>
            </div>
          ) : (
            history.slice(0, 5).map((assessment) => (
              <div key={assessment.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        assessment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {assessment.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                      <span className="text-sm text-slate-600">
                        Started: {new Date(assessment.startedAt).toLocaleDateString()}
                      </span>
                      {assessment.completedAt && (
                        <span className="text-sm text-slate-600">
                          • Completed: {new Date(assessment.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {assessment.status === 'completed' && assessment.score !== undefined && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-slate-900">{assessment.score}</span>
                          <span className="text-slate-600">CSI Score</span>
                        </div>
                        {assessment.tier && (
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            assessment.tier === 'A' ? 'bg-green-100 text-green-700' :
                            assessment.tier === 'B' ? 'bg-blue-100 text-blue-700' :
                            assessment.tier === 'C' ? 'bg-yellow-100 text-yellow-700' :
                            assessment.tier === 'D' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            Tier {assessment.tier}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {assessment.status === 'completed' && assessment.reportUrl && (
                      <a
                        href={assessment.reportUrl}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Report
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {history.length > 5 && (
          <div className="p-4 border-t border-slate-200 text-center">
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All Assessments
            </button>
          </div>
        )}
      </div>

      {/* Recommended Plans Section */}
      {latestResult && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Recommended Plans</h2>
            <p className="text-slate-600 text-sm mt-1">
              Based on your CSI score of {latestResult.score}, here are our recommendations to improve your cybersecurity posture
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getRecommendedPlans().slice(0, 3).map((plan: any) => (
                <div key={plan.id} className="border border-slate-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  </div>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-slate-900">
                      ${plan.price}
                      <span className="text-lg font-normal text-slate-600">
                        /month
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features?.slice(0, 4).map((feature: any, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Get Started
                  </button>
                </div>
              ))}
            </div>
            {getRecommendedPlans().length === 0 && (
              <div className="text-center py-8 text-slate-600">
                <Star className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Great Security Posture!</h3>
                <p className="text-sm">Your CSI score indicates excellent cybersecurity readiness. Continue monitoring with our maintenance plans.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
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
