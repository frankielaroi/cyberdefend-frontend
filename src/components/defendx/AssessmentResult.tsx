import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  useGetAssessmentResultQuery,
  useLazyDownloadAssessmentReportQuery,
  useLazyDownloadComprehensiveReportQuery
} from '../../store/api/defendxApi';
import { useGetPlansQuery } from '../../store/api/billingApi';
import { 
  Download, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Crown,
  Star,
  ArrowRight,
  BarChart3,
  Users,
  MapPin,
  Building2,
  RefreshCw
} from 'lucide-react';

export default function AssessmentResult() {
  const { id } = useParams<{ id: string }>();
  const { data: response, isLoading, error } = useGetAssessmentResultQuery(id!);
  const { data: plans = [] } = useGetPlansQuery();
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'benchmark' | 'recommendations'>('overview');

  // Download hooks for reports
  const [downloadStandardReport] = useLazyDownloadAssessmentReportQuery();
  const [downloadComprehensiveReport] = useLazyDownloadComprehensiveReportQuery();

  // Extract the actual result data from the API response
  const result = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Results Not Found</h2>
          <p className="text-slate-600 mb-4">The assessment results could not be loaded.</p>
          <Link to="/defendx" className="text-blue-600 hover:text-blue-700 font-medium">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Low Risk', color: 'green', icon: CheckCircle };
    if (score >= 60) return { level: 'Medium Risk', color: 'yellow', icon: AlertTriangle };
    return { level: 'High Risk', color: 'red', icon: AlertTriangle };
  };

  const getRecommendedPlans = () => {
    if (!result?.score) return [];
    
    if (result.score < 60) {
      return plans.filter((plan: any) => plan.name.includes('Premium') || plan.name.includes('Enterprise')).slice(0, 2);
    } else if (result.score < 80) {
      return plans.filter((plan: any) => plan.name.includes('Standard') || plan.name.includes('Professional')).slice(0, 2);
    }
    return plans.filter((plan: any) => plan.name.includes('Basic') || plan.name.includes('Starter')).slice(0, 2);
  };

  const downloadReport = async (format: 'pdf' | 'html' = 'pdf', comprehensive = false) => {
    if (!id) return;
    
    try {
      // Use the appropriate RTK Query hook
      const downloadQuery = comprehensive ? downloadComprehensiveReport : downloadStandardReport;
      
      // Execute the download query
      const result = await downloadQuery({
        assessmentId: id,
        format
      }).unwrap();
      
      // Create a blob URL and trigger download
      const blob = new Blob([result], { 
        type: format === 'pdf' ? 'application/pdf' : format === 'html' ? 'text/html' : 'application/json'
      });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      const reportType = comprehensive ? 'comprehensive' : 'standard';
      link.download = `csi-${reportType}-report-${id}-${new Date().toISOString().split('T')[0]}.${format}`;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  if (!result) {
    return null; // Return early if no result data
  }

  const riskLevel = getRiskLevel(result.score);
  const RiskIcon = riskLevel.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Assessment Results</h1>
              <p className="text-slate-600 mt-1">
                Completed on {new Date(result.completedAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => downloadReport('pdf', false)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Standard Report
              </button>
              <button
                onClick={() => downloadReport('pdf', true)}
                className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                Comprehensive Report
              </button>
              <Link
                to="/defendx"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* CSI Score Gauge Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Score Display */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="text-center">
              <div className="relative w-64 h-64 mx-auto mb-6">
                {/* Circular gauge implementation */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="20"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={
                      result.score >= 80 ? '#10b981' :
                      result.score >= 60 ? '#f59e0b' :
                      '#ef4444'
                    }
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeDasharray={`${(result.score / 100) * 502.655} 502.655`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-slate-900">{result.score}</div>
                  <div className="text-lg text-slate-600">CSI Score</div>
                </div>
              </div>
              
              <div className={`inline-block px-6 py-2 rounded-full text-xl font-bold ${
                result.tier === 'A' ? 'bg-green-100 text-green-700' :
                result.tier === 'B' ? 'bg-blue-100 text-blue-700' :
                result.tier === 'C' ? 'bg-yellow-100 text-yellow-700' :
                result.tier === 'D' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                Tier {result.tier}
              </div>
            </div>
          </div>

          {/* Risk Level & Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <RiskIcon className={`w-6 h-6 ${
                  riskLevel.color === 'green' ? 'text-green-600' :
                  riskLevel.color === 'yellow' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
                <h3 className="text-lg font-bold text-slate-900">Risk Assessment</h3>
              </div>
              <div className={`text-2xl font-bold ${
                riskLevel.color === 'green' ? 'text-green-600' :
                riskLevel.color === 'yellow' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {riskLevel.level}
              </div>
              <p className="text-slate-600 text-sm mt-2">
                Based on your cybersecurity readiness assessment
              </p>
            </div>

            {result.categoryBreakdown && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Category Scores</h3>
                <div className="space-y-3">
                  {Object.entries(result.categoryBreakdown).slice(0, 4).map(([category, score]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 capitalize">{category.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(score as number / 100) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 w-8">{score as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <div className="flex">
              {[
                { id: 'overview', label: 'Overview', icon: Shield },
                { id: 'breakdown', label: 'Category Breakdown', icon: BarChart3 },
                { id: 'benchmark', label: 'Compare with Others', icon: Users },
                { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Top 5 Vulnerabilities */}
                {result.vulnerabilities && result.vulnerabilities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Top Vulnerabilities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.vulnerabilities.slice(0, 5).map((vulnerability: any, index: number) => (
                        <div key={index} className="border border-red-200 bg-red-50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-red-100 text-red-600 rounded-full p-2">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-red-900 mb-1">{vulnerability.title}</h4>
                              <p className="text-red-700 text-sm">{vulnerability.description}</p>
                              <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                                vulnerability.severity === 'high' ? 'bg-red-100 text-red-700' :
                                vulnerability.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {vulnerability.severity} Risk
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Actions */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Recommended Actions</h3>
                    <div className="space-y-3">
                      {result.recommendations.slice(0, 5).map((recommendation: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-1">{recommendation.title}</h4>
                            <p className="text-blue-700 text-sm">{recommendation.description}</p>
                            {recommendation.priority && (
                              <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                                recommendation.priority === 'high' ? 'bg-red-100 text-red-700' :
                                recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {recommendation.priority} Priority
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'breakdown' && result.categoryBreakdown && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Category Performance</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.entries(result.categoryBreakdown).map(([category, score]) => (
                    <div key={category} className="border border-slate-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-slate-900 capitalize">
                          {category.replace('_', ' ')}
                        </h4>
                        <span className="text-2xl font-bold text-blue-600">{score as number}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 mb-3">
                        <div 
                          className={`h-3 rounded-full ${
                            (score as number) >= 80 ? 'bg-green-500' :
                            (score as number) >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${(score as number)}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-600">
                        {(score as number) >= 80 ? 'Excellent security posture' :
                         (score as number) >= 60 ? 'Good with room for improvement' :
                         'Needs immediate attention'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'benchmark' && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Benchmark Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {result.benchmark && Object.entries(result.benchmark).map(([key, data]) => (
                    <div key={key} className="bg-slate-50 rounded-lg p-6 text-center">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        {key === 'national' && <MapPin className="w-5 h-5 text-slate-600" />}
                        {key === 'sector' && <Building2 className="w-5 h-5 text-slate-600" />}
                        {key === 'region' && <Users className="w-5 h-5 text-slate-600" />}
                        {key === 'size' && <BarChart3 className="w-5 h-5 text-slate-600" />}
                        <h4 className="text-lg font-semibold text-slate-900 capitalize">
                          {key === 'national' ? 'National Average' :
                           key === 'sector' ? 'Your Sector' :
                           key === 'region' ? 'Your Region' :
                           'Your Size Category'}
                        </h4>
                      </div>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {(data as any)?.average || 'N/A'}
                      </div>
                      {(data as any)?.percentile && (
                        <p className="text-sm text-slate-600">
                          You're in the {(data as any).percentile}th percentile
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Upgrade Recommendations</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getRecommendedPlans().map((plan: any) => (
                    <div key={plan.id} className="border border-slate-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        {plan.popular && <Crown className="w-6 h-6 text-yellow-500" />}
                        <h4 className="text-xl font-bold text-slate-900">{plan.name}</h4>
                        {plan.popular && (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-slate-900">
                          ${plan.price}
                          <span className="text-lg font-normal text-slate-600">
                            /{plan.interval || plan.billingCycle}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 mb-4">{plan.description}</p>
                      <ul className="space-y-2 mb-6">
                        {plan.features?.slice(0, 5).map((feature: any, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {getRecommendedPlans().length === 0 && (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h4 className="text-xl font-semibold text-slate-700 mb-2">Excellent Security Posture!</h4>
                    <p className="text-slate-600">
                      Your CSI score indicates strong cybersecurity readiness. Continue monitoring with our maintenance plans.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}