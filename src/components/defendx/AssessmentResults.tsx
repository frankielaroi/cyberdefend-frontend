import { useParams, useNavigate } from 'react-router-dom';
import { useGetAssessmentResultQuery } from '../../store/api/defendxApi';
import type { AssessmentResultsDisplay, ComplianceAlert } from '../../types';
import { mockAssessmentResult } from '../../data/mockAssessmentResults';

export default function AssessmentResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    data: resultData, 
    isLoading  } = useGetAssessmentResultQuery(id || '', {
    skip: !id
  });

  // Transform API data to display format
  const transformResultData = (data: any): AssessmentResultsDisplay | null => {
    // Use mock data for demonstration if no real data is available
    const result = data?.data || mockAssessmentResult;
    
    if (!result) return null;

    const score = result.score || 42; // Default to 42 if no score available
    
    // Create compliance alerts based on score
    const alerts: ComplianceAlert[] = [];
    if (score < 60) {
      alerts.push({
        type: 'CSA_DATA_PROTECTION',
        title: 'CSA & Data Protection Alert',
        description: 'Based on CSA 2023 Cyber Policy Enforcement Framework, your organization may face regulatory fines or data protection penalties if audited.',
        severity: 'critical',
        year: 2023
      });
    }

    return {
      scoreData: {
        score,
        totalQuestions: 100, // Based on the /100 score in the image
        tier: score >= 80 ? 'A' : score >= 60 ? 'B' : 'C',
        percentage: score
      },
      chartData: [], // We're not using the chart in the new design
      alerts,
      recommendations: [
        {
          title: 'Cyber Risk Assessment',
          description: 'You are vulnerable to phishing attacks, customer data loss, and CSA penalties of up to GHS 30.000.',
          priority: 'high'
        }
      ],
      actionPlanUrl: '/subscribe'
    };
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

  const { scoreData } = displayData;
  
  // Get risk level based on score

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src="/defendx-logo.svg" alt="DefendX" className="h-10" />
            <span className="text-white text-xl font-bold">DefendX</span>
          </div>
          <div className="flex items-center">
            <button className="text-white hover:bg-slate-700 p-2 rounded">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center text-white space-y-6">
          {/* Title */}
          <h1 className="text-2xl font-bold mb-8">CYBER READINESS SCORE</h1>

          {/* Score Display */}
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="#EF4444"
                strokeWidth="12"
                strokeDasharray={`${(scoreData.score / 100) * 552} 552`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{scoreData.score}</span>
              <span className="text-lg">/100</span>
            </div>
          </div>

          {/* Risk Level Badge */}
          <div className="inline-block bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
            HIGH RISK
          </div>

          {/* Score Description */}
          <div className="space-y-4">
            <p className="text-lg">
              Your Cyber Readiness Score: {scoreData.score}/100 — HIGH RISK
            </p>
            <p className="text-sm opacity-90">
              Based on CSA 2023 Cyber Policy Enforcement Framework, your organization may face regulatory fines or data protection penalties if audited.
            </p>
            <p className="text-sm font-medium">
              You are vulnerable to phishing attacks, customer data loss, and CSA penalties of up to GHS 30.000.
            </p>
          </div>

          {/* CSA Policy Section */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold">CSA POLICY TRIGGER</h2>
            <p className="text-sm opacity-90">
              CSA 2023 Cyber Policy Enforcement Framework Ghana Cybersecurity Act 2020 Sections 3 & 7
            </p>
          </div>

          {/* CTA Button */}
          <div className="mt-8">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg text-lg font-bold transition-all duration-300">
              SUBSCRIBE TO DEFENDX & GET PROTECTED
            </button>
            <p className="text-sm mt-4">
              Earn your CSA-aligned DefendX certification today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}