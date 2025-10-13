import { useState, useEffect } from 'react';
import { AssessmentStorage, type StoredAssessmentResult } from '../../utils/localStorage';
import { useGetOrganizationAssessmentsQuery } from '../../store/api/defendxApi';
import { FileText, Calendar, Award, Trash2, Download, AlertCircle } from 'lucide-react';

// Dummy assessment data for when API fails
const dummyAssessments: StoredAssessmentResult[] = [
  {
    assessmentId: 'dummy-001',
    score: 85,
    tier: 'B',
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    questionsCount: 45,
    responses: Array.from({ length: 45 }, (_, i) => ({
      questionId: `q-${i + 1}`,
      answer: Math.random() > 0.5 ? 'yes' : 'no'
    }))
  },
  {
    assessmentId: 'dummy-002', 
    score: 72,
    tier: 'C',
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    questionsCount: 45,
    responses: Array.from({ length: 40 }, (_, i) => ({
      questionId: `q-${i + 1}`,
      answer: Math.random() > 0.5 ? 'yes' : 'no'
    }))
  },
  {
    assessmentId: 'dummy-003',
    score: 91,
    tier: 'A',
    completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    questionsCount: 45,
    responses: Array.from({ length: 45 }, (_, i) => ({
      questionId: `q-${i + 1}`,
      answer: Math.random() > 0.5 ? 'yes' : 'no'
    }))
  }
];

export default function SavedAssessments() {
  const [savedResults, setSavedResults] = useState<StoredAssessmentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'api' | 'localStorage' | 'dummy'>('api');

  // Try to fetch assessments from API
  const { 
    data: apiAssessments, 
    error: apiError, 
    isLoading: isApiLoading 
  } = useGetOrganizationAssessmentsQuery({
    page: 1,
    limit: 50,
    status: 'COMPLETED'
  });

  useEffect(() => {
    loadAssessmentResults();
  }, [apiAssessments, apiError, isApiLoading]);

  const loadAssessmentResults = () => {
    setIsLoading(true);
    
    try {
      if (!isApiLoading) {
        if (apiError) {
          // API failed, try local storage first, then dummy data
          console.warn('API failed, falling back to local storage and dummy data:', apiError);
          const localResults = AssessmentStorage.loadAllResults();
          
          if (localResults.length > 0) {
            setSavedResults(localResults.sort((a, b) => 
              new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
            ));
            setDataSource('localStorage');
          } else {
            // No local storage data, use dummy data
            setSavedResults(dummyAssessments);
            setDataSource('dummy');
          }
        } else if (apiAssessments?.data) {
          // Convert API data to local format if needed
          const convertedResults: StoredAssessmentResult[] = apiAssessments.data.map(assessment => ({
            assessmentId: assessment.id,
            score: assessment.score || 0,
            tier: assessment.tier || 'F',
            completedAt: assessment.completedAt || assessment.updatedAt || new Date().toISOString(),
            questionsCount: 45, // Default value since API doesn't return this
            responses: assessment.responses || []
          }));
          
          setSavedResults(convertedResults.sort((a, b) => 
            new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
          ));
          setDataSource('api');
        } else {
          // API returned but no data, fall back to local storage
          const localResults = AssessmentStorage.loadAllResults();
          if (localResults.length > 0) {
            setSavedResults(localResults.sort((a, b) => 
              new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
            ));
            setDataSource('localStorage');
          } else {
            setSavedResults(dummyAssessments);
            setDataSource('dummy');
          }
        }
      }
    } catch (error) {
      console.error('Failed to load assessment results:', error);
      // Final fallback to dummy data
      setSavedResults(dummyAssessments);
      setDataSource('dummy');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllResults = () => {
    if (window.confirm('Are you sure you want to clear all saved assessment results?')) {
      if (dataSource === 'localStorage') {
        AssessmentStorage.clearAllData();
        setSavedResults([]);
      } else {
        // For API or dummy data, just clear the local display
        setSavedResults([]);
        // Optionally reload to show dummy data again
        if (dataSource === 'dummy') {
          setTimeout(() => setSavedResults(dummyAssessments), 1000);
        }
      }
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(savedResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assessment-results-${dataSource}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getDataSourceIndicator = () => {
    switch (dataSource) {
      case 'api':
        return (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Live Data
          </div>
        );
      case 'localStorage':
        return (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Local Storage
          </div>
        );
      case 'dummy':
        return (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            <AlertCircle className="w-3 h-3" />
            Demo Data
          </div>
        );
      default:
        return null;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Loading saved assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-slate-900">Saved Assessment Results</h1>
            {getDataSourceIndicator()}
          </div>
          <p className="text-slate-600">
            View your previous assessment results {dataSource === 'api' ? 'from the server' : 
            dataSource === 'localStorage' ? 'stored locally in your browser' : 
            'showing demo data due to connectivity issues'}.
          </p>
          {apiError && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-yellow-800">
                <AlertCircle className="w-4 h-4" />
                <span>Unable to load data from server. {dataSource === 'localStorage' ? 'Showing local data.' : 'Showing demo data.'}</span>
              </div>
            </div>
          )}
        </div>

        {savedResults.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Saved Results</h2>
            <p className="text-slate-600">
              {dataSource === 'api' ? 'Complete an assessment to see your results here.' :
               dataSource === 'localStorage' ? 'Complete an assessment to see your results saved locally.' :
               'Demo data temporarily unavailable.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-slate-600">
                {savedResults.length} saved result{savedResults.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={exportResults}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={clearAllResults}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {savedResults.map((result, index) => (
                <div key={result.assessmentId} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        Assessment #{savedResults.length - index}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        Completed {new Date(result.completedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getTierColor(result.tier)}`}>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        Tier {result.tier}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-900">{result.score}%</div>
                      <div className="text-sm text-blue-700">Overall Score</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-900">{result.responses.length}</div>
                      <div className="text-sm text-green-700">Questions Answered</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-900">{result.questionsCount}</div>
                      <div className="text-sm text-purple-700">Total Questions</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-2">Assessment ID:</div>
                    <div className="font-mono text-sm text-slate-800 bg-white px-3 py-1 rounded border">
                      {result.assessmentId}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Data Source Information</p>
              <p>
                {dataSource === 'api' && 'Assessment results are loaded from the server in real-time.'}
                {dataSource === 'localStorage' && 'Assessment results are saved locally in your browser. They will persist between sessions but may be cleared if you clear your browser data.'}
                {dataSource === 'dummy' && 'Currently showing demo assessment data due to server connectivity issues. Your actual results will appear when the connection is restored.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}