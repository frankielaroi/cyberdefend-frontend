import { useParams, useNavigate } from 'react-router-dom';
import { useGetAssessmentResultQuery } from '../../store/api/defendxApi';
import { AlertTriangle, Award, Download, User } from 'lucide-react';
import type { AssessmentResultsDisplay, CategoryChartData, ComplianceAlert } from '../../types';
import { mockAssessmentResult } from '../../data/mockAssessmentResults';

export default function AssessmentResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    data: resultData, 
    isLoading, 
    error 
  } = useGetAssessmentResultQuery(id || '', {
    skip: !id
  });

  // Transform API data to display format
  const transformResultData = (data: any): AssessmentResultsDisplay | null => {
    // Use mock data for demonstration if no real data is available
    const result = data?.data || mockAssessmentResult;
    
    if (!result) return null;
    
    // Calculate chart data from category breakdown
    const chartData: CategoryChartData[] = result.breakdown?.map((category: any, index: number) => ({
      category: category.category,
      value: category.score,
      percentage: category.percentage,
      color: getChartColor(index)
    })) || [];

    // Create compliance alerts based on score and tier
    const alerts: ComplianceAlert[] = [];
    if (result.tier === 'F' || result.tier === 'D') {
      alerts.push({
        type: 'CSA_DATA_PROTECTION',
        title: 'CSA & Data Protection Alert',
        description: 'Your score indicates a potential non-compliance with the Cyber Security Act, 2020.',
        severity: 'critical',
        year: 2020
      });
    }

    return {
      scoreData: {
        score: result.score || 0,
        totalQuestions: 30, // Based on the UI showing X/30
        tier: result.tier || 'F',
        percentage: Math.round((result.score / 30) * 100)
      },
      chartData,
      alerts,
      recommendations: result.recommendations || [],
      actionPlanUrl: result.reportUrl
    };
  };

  const getChartColor = (index: number): string => {
    const colors = ['#10B981', '#EF4444', '#6366F1', '#F59E0B', '#8B5CF6'];
    return colors[index % colors.length];
  };

  const displayData = transformResultData(resultData);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Results</h2>
          <p className="text-gray-400 mb-4">Unable to load assessment results.</p>
          <button
            onClick={() => navigate('/dashboard/defendx')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { scoreData, chartData, alerts } = displayData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-2 sm:p-4 lg:p-6 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8 animate-slideDown">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-slate-900 rounded"></div>
            </div>
            <span className="text-white text-lg sm:text-xl font-bold">DefendX</span>
          </div>
          <button className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-700 rounded-lg flex items-center justify-center text-white hover:bg-slate-600 transition-all duration-300 hover:shadow-lg">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Circular Gauge */}
          <div className="flex flex-col items-center justify-center order-2 lg:order-1 animate-slideLeft">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 mb-4 sm:mb-6 lg:mb-8">
              {/* Circular Progress Background */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeWidth="4"
                />
                
                {/* Main progress circle based on overall score */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={
                    scoreData.tier === 'A' ? '#10B981' :
                    scoreData.tier === 'B' ? '#F59E0B' :
                    scoreData.tier === 'C' ? '#EF4444' :
                    '#DC2626'
                  }
                  strokeWidth="6"
                  strokeDasharray={`${(scoreData.percentage / 100) * 314} 314`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="transition-all duration-2000 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 8px ${
                      scoreData.tier === 'A' ? 'rgba(16, 185, 129, 0.4)' :
                      scoreData.tier === 'B' ? 'rgba(245, 158, 11, 0.4)' :
                      scoreData.tier === 'C' ? 'rgba(239, 68, 68, 0.4)' :
                      'rgba(220, 38, 38, 0.4)'
                    })`
                  }}
                />
                
                {/* Inner segments for different categories */}
                {chartData.slice(0, 3).map((item, index) => (
                  <circle
                    key={index}
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="2"
                    strokeDasharray={`${(item.percentage / 100) * 264} 264`}
                    strokeDashoffset={`-${chartData.slice(0, index).reduce((acc, curr) => acc + (curr.percentage / 100) * 264, 0)}`}
                    className="transition-all duration-1500 ease-out"
                    style={{ animationDelay: `${(index + 1) * 300}ms` }}
                    opacity="0.7"
                  />
                ))}
                
                {/* Animated dots around the circle */}
                {Array.from({ length: 40 }).map((_, i) => {
                  const angle = (i / 40) * 2 * Math.PI;
                  const x = 60 + 45 * Math.cos(angle);
                  const y = 60 + 45 * Math.sin(angle);
                  const delay = i * 50;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="1"
                      fill="rgba(148, 163, 184, 0.4)"
                      className="animate-pulse"
                      style={{
                        animationDelay: `${delay}ms`,
                        animationDuration: '2s'
                      }}
                    />
                  );
                })}
              </svg>
              
              {/* Center content with animation */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white animate-scaleIn delay-1000">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 opacity-90">
                  {scoreData.tier === 'A' ? 'EXCELLENT' :
                   scoreData.tier === 'B' ? 'GOOD' :
                   scoreData.tier === 'C' ? 'NEEDS WORK' :
                   'CRITICAL'}
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1">
                  <span className="animate-countUp">{scoreData.score}</span>
                  <span className="text-2xl sm:text-3xl lg:text-4xl opacity-70">/{scoreData.totalQuestions}</span>
                </div>
                <div className="text-sm sm:text-base opacity-70">
                  {scoreData.percentage}% Complete
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Score Results */}
          <div className="text-white order-1 lg:order-2 animate-slideRight">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Score Results</h2>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 lg:mb-8 animate-fadeIn delay-500">
              {scoreData.percentage}%
            </div>
            
            {/* Category Scores List */}
            <div className="mb-4 sm:mb-6 lg:mb-8 space-y-3">
              <h3 className="text-lg font-semibold mb-4 opacity-90">Category Breakdown</h3>
              {chartData.map((item, index) => (
                <div 
                  key={item.category} 
                  className="animate-slideUp"
                  style={{ animationDelay: `${(index + 1) * 200}ms` }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                        animationDelay: `${(index + 1) * 300}ms`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Assessment Stats */}
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4 sm:mb-6 lg:mb-8 animate-fadeIn delay-1000">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{scoreData.score}/{scoreData.totalQuestions}</div>
                  <div className="text-xs text-slate-300">Questions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">100%</div>
                  <div className="text-xs text-slate-300">Complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Alert */}
        {alerts.length > 0 && (
          <div className="mt-4 sm:mt-6 lg:mt-8">
            {alerts.map((alert, index) => (
              <div 
                key={index} 
                className={`${
                  alert.severity === 'critical' 
                    ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500' 
                    : alert.severity === 'warning'
                    ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500'
                    : 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-2 border-green-500'
                } rounded-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 animate-pulse delay-1500`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    alert.severity === 'critical' ? 'bg-red-500' : 
                    alert.severity === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                  } rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                    <span className="text-white text-xs sm:text-sm font-bold">
                      {alert.severity === 'critical' ? '!' : 
                       alert.severity === 'warning' ? '⚠' : '✓'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">{alert.title}</h3>
                    <p className="text-xs sm:text-sm opacity-90">{alert.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 sm:mt-6 lg:mt-8 text-center animate-slideUp delay-2000">
          <div className="space-y-3 sm:space-y-4 max-w-md mx-auto">
            <button 
              onClick={() => {
                if (displayData.actionPlanUrl) {
                  window.open(displayData.actionPlanUrl, '_blank');
                }
              }}
              className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Get My Secure Badge & Full Action Plan
            </button>

            <button
              onClick={() => navigate('/dashboard/defendx')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}