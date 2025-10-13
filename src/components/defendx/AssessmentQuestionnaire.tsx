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
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Assessment Complete!</h1>
            <p className="text-slate-600">Your cybersecurity readiness has been evaluated</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 mb-6 border border-blue-100">
            <div className="text-center">
              <div className="text-7xl font-bold text-blue-600 mb-2">{results.result?.csiScore || results.score}</div>
              <div className="text-2xl font-semibold text-slate-700 mb-4">Cyber Safety Index Score</div>
              <div className={`inline-block px-6 py-2 rounded-full text-xl font-bold ${
                (results.result?.tier || results.riskTier) === 'A' ? 'bg-green-100 text-green-700' :
                (results.result?.tier || results.riskTier) === 'B' ? 'bg-blue-100 text-blue-700' :
                (results.result?.tier || results.riskTier) === 'C' ? 'bg-yellow-100 text-yellow-700' :
                (results.result?.tier || results.riskTier) === 'D' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                Tier {results.result?.tier || results.riskTier}
              </div>
            </div>
          </div>

          {results.result?.benchmarks && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <BenchmarkCard title="Regional Average" value={results.result.benchmarks.regional?.average} percentile={results.result.benchmarks.regional?.position} />
              <BenchmarkCard title="Your Sector" value={results.result.benchmarks.sectoral?.average} percentile={results.result.benchmarks.sectoral?.position} />
              <BenchmarkCard title="Your Size" value={results.result.benchmarks.sizeCategory?.average} percentile={results.result.benchmarks.sizeCategory?.position} />
            </div>
          )}

          {results.result?.recommendations && results.result.recommendations.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Recommendations</h2>
              <div className="space-y-3">
                {results.result.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-slate-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => downloadReport('pdf')}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700 font-medium transition-colors"
            >
              Back to Dashboard
            </button>
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

function BenchmarkCard({ title, value, percentile }: { title: string; value?: number; percentile?: number }) {
  if (value === undefined) return null;

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      <div className="text-sm text-slate-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {percentile !== undefined && (
        <div className="text-sm text-slate-600 mt-1">
          {percentile}th percentile
        </div>
      )}
    </div>
  );
}
