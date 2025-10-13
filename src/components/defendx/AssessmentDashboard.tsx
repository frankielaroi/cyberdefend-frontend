import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetLatestCSIResultQuery, 
  useCreateAssessmentMutation, 
  useStartAssessmentMutation,
  useGetOrganizationAssessmentsQuery 
} from '../../store/api/defendxApi';
import { useGetPlansQuery } from '../../store/api/billingApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCurrentAssessment } from '../../store/slices/defendxSlice';
import { FileText, TrendingUp, Award, Clock, Shield, AlertTriangle, CheckCircle, ArrowRight, Star, Eye } from 'lucide-react';
import AssessmentQuestionnaire from './AssessmentQuestionnaire';

export default function AssessmentDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { data: latestResult, error: latestResultError } = useGetLatestCSIResultQuery();
  const { data: plans = [] } = useGetPlansQuery();
  
  // New API hooks for the updated flow
  const [createAssessment] = useCreateAssessmentMutation();
  const [startAssessment] = useStartAssessmentMutation();
  
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);

  console.log('AssessmentDashboard render', { 
    latestResult, 
    latestResultError,
    plans, 
    showQuestionnaire, 
    currentAssessmentId, 
    user: user?.organizationId,
    isStarting 
  });

  // Real assessment history with proper query parameters
  const { 
    data: assessmentHistory, 
    isLoading: isLoadingHistory, 
    error: historyError 
  } = useGetOrganizationAssessmentsQuery({
    page: 1,
    limit: 10,
    status: 'COMPLETED' // Only show completed assessments in history
  });

  // Use real history data if available, fallback to mock for development
  const history = assessmentHistory?.data || [
    { id: '1', status: 'COMPLETED', score: 85, tier: 'A', startedAt: '2024-09-15', completedAt: '2024-09-15', reportUrl: '/mock-report-1.pdf' },
    { id: '2', status: 'COMPLETED', score: 72, tier: 'B', startedAt: '2024-08-20', completedAt: '2024-08-20', reportUrl: '/mock-report-2.pdf' },
    { id: '3', status: 'IN_PROGRESS', startedAt: '2024-10-01' },
  ];

  const handleStartAssessment = async () => {
    try {
      setIsStarting(true);
      console.log('Starting assessment creation process...');
      
      // Validate user has organization
      if (!user?.organizationId) {
        console.error('User organization ID is required to start assessment');
        alert('Unable to start assessment: Organization not found. Please contact support.');
        return;
      }
      
      console.log('Creating assessment with organizationId:', user.organizationId);
      
      // Step 1: Create assessment
      const createResult = await createAssessment({
        title: 'Cyber Safety Index Assessment',
        description: 'Comprehensive cybersecurity readiness evaluation',
        type: 'CSI_ASSESSMENT',
        organizationId: user.organizationId
      }).unwrap();
      
      console.log('Assessment created successfully:', createResult);
      
      // The createResult contains the assessment data directly (no ApiResponse wrapper)
      if (createResult?.id) {
        console.log('Starting assessment with ID:', createResult.id);
        
        // Step 2: Start the assessment (now returns simple status update)
        const startResult = await startAssessment(createResult.id).unwrap();
        
        console.log('Assessment started successfully:', startResult);
        
        // Navigate to questionnaire with the assessment ID
        if (startResult?.id || createResult.id) {
          const assessmentId = startResult?.id || createResult.id;
          console.log('Setting up questionnaire with assessment ID:', assessmentId);
          
          // Set local state to show questionnaire
          setCurrentAssessmentId(assessmentId);
          setShowQuestionnaire(true);
          
          console.log('State updated - showQuestionnaire:', true, 'assessmentId:', assessmentId);
        } else {
          console.error('Start result ID is missing', startResult);
          alert('Failed to start assessment. Assessment ID is missing from start response.');
        }
      } else {
        console.error('Create result ID is missing', createResult);
        alert('Failed to create assessment. Assessment ID is missing from create response.');
      }
      
    } catch (error: any) {
      console.error('Failed to start assessment:', error);
      // Show user-friendly error message
      if (error?.data?.message) {
        alert(`Failed to start assessment: ${Array.isArray(error.data.message) ? error.data.message.join(', ') : error.data.message}`);
      } else {
        alert('Failed to start assessment. Please try again.');
      }
    } finally {
      setIsStarting(false);
    }
  };

  const isLoading = isLoadingHistory;

  console.log('Render state:', { showQuestionnaire, currentAssessmentId, user: user?.organizationId });

  if (showQuestionnaire && currentAssessmentId) {
    console.log('Rendering questionnaire with assessmentId:', currentAssessmentId);
    return (
      <AssessmentQuestionnaire 
        assessmentId={currentAssessmentId}
        onComplete={() => {
          console.log('Questionnaire completed, returning to dashboard');
          setShowQuestionnaire(false);
          setCurrentAssessmentId(null);
        }} 
      />
    );
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
    // If there's an error (like 404) or no score data, return default plans
    if (latestResultError || !latestResult?.score) return plans.slice(0, 2);
    
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
          <h1 className="text-3xl font-bold text-white">DefendX Dashboard</h1>
          <p className="text-slate-300 mt-1">Your cybersecurity readiness overview</p>
        </div>
        <button
          onClick={handleStartAssessment}
          disabled={isStarting || !user?.organizationId}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 disabled:opacity-50 font-medium transition-colors flex items-center gap-2"
        >
          <Award className="w-5 h-5" />
          {isStarting ? 'Starting...' : 'Start New Assessment'}
          {!user?.organizationId && (
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded ml-2">
              No Org
            </span>
          )}
        </button>
      </div>

      {/* Overall CSI Score & Risk Tier */}
      {latestResult?.score ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CSI Score Card */}
          <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl p-8 border border-blue-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-8 h-8 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">Current CSI Score</h2>
                </div>
                <p className="text-slate-300">Last updated: {new Date(latestResult.completedAt || Date.now()).toLocaleDateString()}</p>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-400">{latestResult.score}</div>
                <div className="text-xl font-semibold text-slate-300 mt-2">out of 100</div>
                <div className={`inline-block px-4 py-1 rounded-full mt-2 font-bold ${
                  latestResult.tier === 'A' ? 'bg-green-900/30 text-green-100 border border-green-700' :
                  latestResult.tier === 'B' ? 'bg-blue-900/30 text-blue-100 border border-blue-700' :
                  latestResult.tier === 'C' ? 'bg-yellow-900/30 text-yellow-100 border border-yellow-700' :
                  latestResult.tier === 'D' ? 'bg-orange-900/30 text-orange-100 border border-orange-700' :
                  'bg-red-900/30 text-red-100 border border-red-700'
                }`}>
                  Tier {latestResult.tier}
                </div>
              </div>
            </div>
            
            {/* View Results Button */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  // Navigate to the latest assessment result
                  if (assessmentHistory?.data && assessmentHistory.data.length > 0) {
                    const latestAssessment = assessmentHistory.data[0];
                    navigate(`/dashboard/defendx/assessment/result/${latestAssessment.id}`);
                  }
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors font-medium inline-flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Detailed Results
              </button>
            </div>
          </div>

          {/* Risk Tier Card */}
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-lg">
            {(() => {
              const riskTier = getRiskTier(latestResult.score);
              const IconComponent = riskTier.icon;
              return (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent className={`w-8 h-8 ${
                        riskTier.color === 'green' ? 'text-green-400' :
                        riskTier.color === 'yellow' ? 'text-yellow-400' :
                        'text-red-400'
                      }`} />
                      <h2 className="text-2xl font-bold text-white">Risk Level</h2>
                    </div>
                    <p className="text-slate-300">Based on your current CSI score</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${
                      riskTier.color === 'green' ? 'text-green-400' :
                      riskTier.color === 'yellow' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {riskTier.level}
                    </div>
                    <div className="text-lg font-semibold text-slate-300 mt-1">Risk</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl p-8 border border-blue-700">
          <div className="text-center">
            <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Start Your Cybersecurity Journey</h2>
            <p className="text-slate-300 mb-6">Take your first Cyber Safety Index assessment to understand your organization's cybersecurity readiness and get personalized recommendations.</p>
            <button
              onClick={handleStartAssessment}
              disabled={isStarting || !user?.organizationId}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 disabled:opacity-50 font-medium transition-colors inline-flex items-center gap-2"
            >
              <Award className="w-5 h-5" />
              {isStarting ? 'Starting...' : 'Start Your First Assessment'}
            </button>
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
          value={history.filter(a => a.status === 'COMPLETED').length.toString()}
          color="green"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          title="In Progress"
          value={history.filter(a => a.status === 'IN_PROGRESS').length.toString()}
          color="orange"
        />
      </div>

      {/* Recent Assessments Table */}
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Recent Assessments</h2>
          <p className="text-slate-300 text-sm mt-1">Track your cybersecurity improvement over time</p>
        </div>
        <div className="divide-y divide-slate-700">
          {isLoading ? (
            <div className="p-8 text-center text-slate-300">Loading assessments...</div>
          ) : historyError ? (
            <div className="p-8 text-center text-red-400">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-semibold text-red-300 mb-2">Failed to load assessments</h3>
              <p className="text-sm">Unable to fetch assessment history. Please try again later.</p>
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-slate-300">
              <Award className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold text-white mb-2">No assessments yet</h3>
              <p className="text-sm">Start your first assessment to measure your cybersecurity readiness and get personalized recommendations.</p>
            </div>
          ) : (
            history.slice(0, 5).map((assessment) => (
              <div key={assessment.id} className="p-6 hover:bg-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        assessment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {assessment.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
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
                    {assessment.status === 'COMPLETED' && assessment.score !== undefined && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-white">{assessment.score}</span>
                          <span className="text-slate-300">CSI Score</span>
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
                    {assessment.status === 'COMPLETED' && assessment.reportUrl && (
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
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Recommended Plans</h2>
          <p className="text-slate-300 text-sm mt-1">
            {latestResult?.score 
              ? `Based on your CSI score of ${latestResult.score}, here are our recommendations to improve your cybersecurity posture`
              : 'Start your first assessment to get personalized recommendations for improving your cybersecurity posture'
            }
          </p>
        </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getRecommendedPlans().slice(0, 3).map((plan: any) => (
                <div key={plan.id} className="border border-slate-600 bg-slate-700 rounded-lg p-6 hover:border-blue-400 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  </div>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-white">
                      ${plan.price}
                      <span className="text-lg font-normal text-slate-300">
                        /month
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features?.slice(0, 4).map((feature: any, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors font-medium">
                    Get Started
                  </button>
                </div>
              ))}
            </div>
            {getRecommendedPlans().length === 0 && (
              <div className="text-center py-8 text-slate-300">
                <Star className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold text-white mb-2">Great Security Posture!</h3>
                <p className="text-sm">Your CSI score indicates excellent cybersecurity readiness. Continue monitoring with our maintenance plans.</p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-900/30 text-blue-400',
    green: 'bg-green-900/30 text-green-400',
    orange: 'bg-orange-900/30 text-orange-400',
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-slate-300 mt-1">{title}</div>
    </div>
  );
}
