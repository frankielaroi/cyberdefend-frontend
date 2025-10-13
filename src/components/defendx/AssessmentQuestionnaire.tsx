import { 
  useSubmitBulkResponsesMutation,
  useCompleteAssessmentMutation 
} from '../../store/api/realDefendXApi';
import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { 
  answerQuestion, 
  nextQuestion, 
  previousQuestion, 
  clearAssessment, 
  loadAssessmentWithQuestions,
  setSubmitting 
} from '../../store/slices/defendxSlice';
import { 
  useGetAssessmentQuery,
  useSubmitSingleResponseMutation,
  useLazyDownloadAssessmentReportQuery
} from '../../store/api/defendxApi';
import { ChevronLeft, ChevronRight, CheckCircle, Save, Download } from 'lucide-react';

interface Props {
  assessmentId: string;
  onComplete: () => void;
}

export default function AssessmentQuestionnaire({ assessmentId, onComplete }: Props) {
  const dispatch = useAppDispatch();
  const { currentAssessment, currentQuestions, responses, currentQuestionIndex, autoSaveEnabled, isSubmitting } = useAppSelector(
    (state) => state.defendx
  );
  console.log('AssessmentQuestionnaire render', { currentAssessment, currentQuestions, responses, currentQuestionIndex });
  
  // API hooks for the new flow
  const { data: assessmentData, isLoading: isLoadingAssessment } = useGetAssessmentQuery(assessmentId);
  const [submitSingleResponse] = useSubmitSingleResponseMutation();
  const [submitBulkResponses] = useSubmitBulkResponsesMutation();
  const [completeAssessment] = useCompleteAssessmentMutation();
  const [downloadReportQuery] = useLazyDownloadAssessmentReportQuery();
  
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [lastSavedIndex, setLastSavedIndex] = useState(-1);

  // Load assessment with questions when component mounts
  useEffect(() => {
    if (assessmentData && (!currentAssessment || currentQuestions.length === 0)) {
      // assessmentData now contains the assessment and questions directly
      dispatch(loadAssessmentWithQuestions({
        assessment: assessmentData,
        questions: assessmentData.questions || [],
        existingResponses: assessmentData.responses || []
      }));
    }
  }, [assessmentData, currentAssessment, currentQuestions.length, dispatch]);

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const currentResponse = responses.find((r) => r.questionId === currentQuestion?.id);
  const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;

  const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
  const canProceed = currentResponse !== undefined;
  const canSubmit = responses.length > 0; // Only need responses to submit

  const handleAnswer = async (answer: string | number) => {
    if (currentQuestion) {
      const responseData = { 
        questionId: currentQuestion.id, 
        answer,
        timeSpent: 30 // You can track actual time if needed
      };
      
      // Update local state immediately for better UX
      dispatch(answerQuestion(responseData));
      
      // Auto-save individual response if enabled
      if (autoSaveEnabled) {
        try {
          await submitSingleResponse({
            assessmentId,
            ...responseData
          }).unwrap();
          setLastSavedIndex(currentQuestionIndex);
        } catch (error) {
          console.error('Failed to save response:', error);
          // Could show a toast notification here
        }
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      dispatch(nextQuestion());
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      dispatch(previousQuestion());
    }
  };

  const handleSubmit = async () => {
    if (!currentAssessment) {
      console.error('Missing assessment');
      return;
    }

    try {
      dispatch(setSubmitting(true));
      
      // Step 4: Submit all responses in bulk
      await submitBulkResponses({
        assessmentId: currentAssessment.id,
        responses: responses.map(r => ({
          questionId: r.questionId,
          answer: r.answer,
          timeSpent: r.timeSpent || 30
        }))
      }).unwrap();
      
      console.log('All responses submitted successfully');
      
      // Step 5: Complete the assessment (this calculates scores and generates results)
      const completionResult = await completeAssessment(currentAssessment.id).unwrap();
      
      console.log('Assessment completed successfully:', completionResult);
      
      // Display the results from the completion
      setResults(completionResult);
      setShowResults(true);
    } catch (error: any) {
      console.error('Failed to submit and complete assessment:', error);
      // Error will be shown by RTK Query error state
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  // Manual save progress function
  const handleSaveProgress = async () => {
    if (!currentAssessment) return;
    
    try {
      await submitBulkResponses({
        assessmentId: currentAssessment.id,
        responses: responses.map(r => ({
          questionId: r.questionId,
          answer: r.answer,
          timeSpent: r.timeSpent || 30
        }))
      }).unwrap();
      setLastSavedIndex(currentQuestionIndex);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleFinish = () => {
    dispatch(clearAssessment());
    onComplete();
  };

  const downloadReport = async (format: 'pdf' | 'html' = 'pdf') => {
    if (!currentAssessment?.id) return;
    
    try {
      // Execute the download query
      const result = await downloadReportQuery({
        assessmentId: currentAssessment.id,
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
      link.download = `csi-assessment-report-${currentAssessment.id}-${new Date().toISOString().split('T')[0]}.${format}`;
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

  if (!currentQuestion || isLoadingAssessment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    // Parse the actual API response structure
    const assessment = results.assessment || results;
    const result = results.result;
    
    const overallScore = result?.overallScore || assessment?.score || 57.53;
    const overallPercentage = result?.overallPercentage || assessment?.score || 57.53;
    const tier = result?.tier || assessment?.riskTier || 'FOUNDATIONAL';
    const riskLevel = assessment?.riskTier || 'HIGH';
    
    // Parse category scores from the API response
    const categoryScoresString = result?.categoryScores || result?.sectionScores;
    let categoryScores: Record<string, number> = {};
    
    if (categoryScoresString) {
      try {
        categoryScores = JSON.parse(categoryScoresString) as Record<string, number>;
      } catch (e) {
        console.error('Failed to parse category scores:', e);
        categoryScores = {};
      }
    }
    
    // Extract main security categories for the circular chart
    const scoreBreakdown = {
      governance: categoryScores['Governance & Policy'] || 0,
      dataProtection: categoryScores['Data Protection'] || 0,
      accessControl: categoryScores['Access & Authentication'] || 0,
      staffTraining: categoryScores['Staff Awareness & Training'] || 0,
      incidentResponse: categoryScores['Incident Response & Recovery'] || 0,
      compliance: categoryScores['Compliance & Audit'] || 0,
      technology: categoryScores['Technology & Innovation Readiness'] || 0
    };

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
                      riskLevel === 'LOW' ? '#10B981' :
                      riskLevel === 'MEDIUM' ? '#F59E0B' :
                      riskLevel === 'HIGH' ? '#EF4444' :
                      '#DC2626'
                    }
                    strokeWidth="6"
                    strokeDasharray={`${(overallPercentage / 100) * 314} 314`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className="transition-all duration-2000 ease-out"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))'
                    }}
                  />
                  
                  {/* Inner segments for different categories */}
                  <circle
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray={`${(scoreBreakdown.governance / 100) * 264} 264`}
                    strokeDashoffset="0"
                    className="transition-all duration-1500 delay-500 ease-out"
                    opacity="0.7"
                  />
                  
                  <circle
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="2"
                    strokeDasharray={`${(scoreBreakdown.dataProtection / 100) * 264} 264`}
                    strokeDashoffset={`-${(scoreBreakdown.governance / 100) * 264}`}
                    className="transition-all duration-1500 delay-700 ease-out"
                    opacity="0.7"
                  />
                  
                  <circle
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray={`${(scoreBreakdown.accessControl / 100) * 264} 264`}
                    strokeDashoffset={`-${((scoreBreakdown.governance + scoreBreakdown.dataProtection) / 100) * 264}`}
                    className="transition-all duration-1500 delay-900 ease-out"
                    opacity="0.7"
                  />
                  
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
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 opacity-90">{tier}</div>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1">
                    <span className="animate-countUp">{overallScore.toFixed(1)}</span>
                    <span className="text-2xl sm:text-3xl lg:text-4xl opacity-70">/5.0</span>
                  </div>
                  <div className="text-sm sm:text-base opacity-70">
                    {overallPercentage.toFixed(1)}% Complete
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Score Results */}
            <div className="text-white order-1 lg:order-2 animate-slideRight">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Score Results</h2>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 lg:mb-8 animate-fadeIn delay-500">
                {overallPercentage.toFixed(1)}%
              </div>
              
              {/* Category Scores List */}
              <div className="mb-4 sm:mb-6 lg:mb-8 space-y-3">
                <h3 className="text-lg font-semibold mb-4 opacity-90">Category Breakdown</h3>
                {Object.entries(categoryScores).map(([category, score], index) => (
                  <div 
                    key={category} 
                    className="animate-slideUp"
                    style={{ animationDelay: `${(index + 1) * 200}ms` }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm font-bold">{score.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${score}%`,
                          backgroundColor: 
                            score >= 80 ? '#10B981' :
                            score >= 60 ? '#F59E0B' :
                            score >= 40 ? '#EF4444' :
                            '#DC2626',
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
                    <div className="text-2xl font-bold text-blue-400">{result?.questionsAnswered || 0}/{result?.totalQuestions || 0}</div>
                    <div className="text-xs text-slate-300">Questions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{result?.totalTimeMinutes || 0}m</div>
                    <div className="text-xs text-slate-300">Duration</div>
                  </div>
                </div>
              </div>

              {/* Alert Box */}
              <div className={`${
                riskLevel === 'HIGH' || riskLevel === 'CRITICAL' 
                  ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500' 
                  : riskLevel === 'MEDIUM'
                  ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500'
                  : 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-2 border-green-500'
              } rounded-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 animate-pulse delay-1500`}>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? 'bg-red-500' : 
                    riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                  } rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                    <span className="text-white text-xs sm:text-sm font-bold">
                      {riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? '!' : 
                       riskLevel === 'MEDIUM' ? '⚠' : '✓'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">
                      {riskLevel === 'HIGH' || riskLevel === 'CRITICAL' 
                        ? 'High Risk Assessment Alert' 
                        : riskLevel === 'MEDIUM'
                        ? 'Medium Risk Assessment'
                        : 'Good Security Posture'}
                    </h3>
                    <p className="text-xs sm:text-sm opacity-90">
                      {riskLevel === 'HIGH' || riskLevel === 'CRITICAL'
                        ? 'Your score indicates significant cybersecurity vulnerabilities that need immediate attention.'
                        : riskLevel === 'MEDIUM'
                        ? 'Your cybersecurity posture shows room for improvement in several areas.'
                        : 'Your organization demonstrates strong cybersecurity practices.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4 animate-slideUp delay-2000">
                <button
                  onClick={() => downloadReport('pdf')}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Get My Secure Badge & Full Action Plan
                </button>

                <button
                  onClick={handleFinish}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 h-2">
          <div className="bg-blue-800 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600">
                Question {currentQuestionIndex + 1} of {currentQuestions.length}
              </span>
              <div className="flex items-center gap-4">
                {autoSaveEnabled && lastSavedIndex >= 0 && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Auto-saved
                  </span>
                )}
                <span className="text-sm font-medium text-blue-600">{Math.round(progress)}% Complete</span>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
              {typeof currentQuestion.category === 'string' 
                ? currentQuestion.category 
                : currentQuestion.category?.name || 'Unknown Category'}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-6">{currentQuestion.text}</h2>

          <div className="space-y-3 mb-8">
            {(currentQuestion.type === 'SINGLE_CHOICE' || currentQuestion.type === 'multiple_choice') && currentQuestion.options?.map((option) => (
              <button
                key={typeof option === 'string' ? option : option.id}
                onClick={() => handleAnswer(typeof option === 'string' ? option : option.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  currentResponse?.answer === (typeof option === 'string' ? option : option.value)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <span className="font-medium text-slate-900">
                  {typeof option === 'string' ? option : option.text}
                </span>
              </button>
            ))}

            {(currentQuestion.type === 'YES_NO' || currentQuestion.type === 'yes_no') && (
              <>
                <button
                  onClick={() => handleAnswer('yes')}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    currentResponse?.answer === 'yes'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <span className="font-medium text-slate-900">Yes</span>
                </button>
                <button
                  onClick={() => handleAnswer('no')}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    currentResponse?.answer === 'no'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <span className="font-medium text-slate-900">No</span>
                </button>
              </>
            )}

            {currentQuestion.type === 'rating' && (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleAnswer(rating)}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      currentResponse?.answer === rating
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="font-bold text-slate-900">{rating}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex gap-3">
              {/* Save Progress Button */}
              {!autoSaveEnabled && (
                <button
                  onClick={handleSaveProgress}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                  title="Save your progress"
                >
                  <Save className="w-4 h-4" />
                  Save Progress
                </button>
              )}

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                  <CheckCircle className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


