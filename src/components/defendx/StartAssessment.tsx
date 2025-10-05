import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { answerQuestion, nextQuestion, previousQuestion, clearAssessment, startAssessment } from '../../store/slices/defendxSlice';
import { mockQuestions } from '../../data/mockQuestions';
import { createMockAssessment, mockAssessmentResult } from '../../data/mockAssessments';
import { AssessmentStorage } from '../../utils/localStorage';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Shield,
  ArrowLeft,
  Save
} from 'lucide-react';

interface Props {
  onComplete: (results: any) => void;
}

export default function StartAssessment({ onComplete }: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentAssessment, currentQuestions, responses, currentQuestionIndex } = useAppSelector(
    (state) => state.defendx
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [previousSession, setPreviousSession] = useState<ReturnType<typeof AssessmentStorage.getSessionSummary>>(null);

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const currentResponse = responses.find((r) => r.questionId === currentQuestion?.id);
  const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
  const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
  const answeredQuestions = responses.length;

  // Check for previous session on mount
  useEffect(() => {
    if (!currentAssessment && AssessmentStorage.isAvailable()) {
      if (AssessmentStorage.hasPreviousSession()) {
        const sessionSummary = AssessmentStorage.getSessionSummary();
        setPreviousSession(sessionSummary);
        setShowResumeDialog(true);
      } else {
        startNewAssessment();
      }
    }
  }, [dispatch, currentAssessment]);

  // Start a new assessment
  const startNewAssessment = () => {
    const mockAssessment = createMockAssessment();
    const questions = mockQuestions.slice(0, 20); // Use first 20 questions for demo
    
    dispatch(startAssessment({
      assessment: mockAssessment,
      questions
    }));
    
    // Save to local storage
    AssessmentStorage.saveCurrentAssessment(mockAssessment);
    AssessmentStorage.saveProgress(mockAssessment.id, [], 0, questions.length);
  };

  // Resume previous assessment
  const resumePreviousAssessment = () => {
    const savedAssessment = AssessmentStorage.loadCurrentAssessment();
    const savedProgress = AssessmentStorage.loadProgress();
    
    if (savedAssessment && savedProgress) {
      const questions = mockQuestions.slice(0, savedProgress.questionsCount);
      
      dispatch(startAssessment({
        assessment: savedAssessment,
        questions
      }));
      
      // Restore responses
      savedProgress.responses.forEach(response => {
        dispatch(answerQuestion(response));
      });
      
      // Set current question index
      if (savedProgress.currentQuestionIndex < questions.length) {
        for (let i = 0; i < savedProgress.currentQuestionIndex; i++) {
          dispatch(nextQuestion());
        }
      }
    }
    
    setShowResumeDialog(false);
  };

  const handleAnswer = (answer: string | number) => {
    if (currentQuestion && currentAssessment) {
      const response = { questionId: currentQuestion.id, answer };
      dispatch(answerQuestion(response));
      
      // Save progress to local storage
      const updatedResponses = [...responses];
      const existingIndex = updatedResponses.findIndex(r => r.questionId === currentQuestion.id);
      if (existingIndex >= 0) {
        updatedResponses[existingIndex] = response;
      } else {
        updatedResponses.push(response);
      }
      
      AssessmentStorage.saveProgress(
        currentAssessment.id,
        updatedResponses,
        currentQuestionIndex,
        currentQuestions.length
      );
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      dispatch(nextQuestion());
      
      // Save current position to local storage
      if (currentAssessment) {
        AssessmentStorage.saveProgress(
          currentAssessment.id,
          responses,
          currentQuestionIndex + 1,
          currentQuestions.length
        );
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      dispatch(previousQuestion());
      
      // Save current position to local storage
      if (currentAssessment) {
        AssessmentStorage.saveProgress(
          currentAssessment.id,
          responses,
          currentQuestionIndex - 1,
          currentQuestions.length
        );
      }
    }
  };

  const handleSubmit = async () => {
    if (!currentAssessment) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API delay
      await mockAssessmentResult.simulateApiDelay();
      
      // Calculate score using mock utility
      const totalQuestions = currentQuestions.length;
      const score = mockAssessmentResult.calculateScore(responses.length, totalQuestions);
      const tier = mockAssessmentResult.getTier(score);
      
      const mockResult = {
        assessmentId: currentAssessment.id,
        score,
        tier,
        completedAt: new Date().toISOString(),
        responses,
        questionsCount: totalQuestions
      };
      
      // Save result to local storage
      AssessmentStorage.saveResult(mockResult);
      
      // Clear current session since it's completed
      AssessmentStorage.clearCurrentSession();
      
      // Navigate to results page or call onComplete
      onComplete(mockResult);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExit = () => {
    if (responses.length > 0) {
      setShowConfirmExit(true);
    } else {
      dispatch(clearAssessment());
      AssessmentStorage.clearCurrentSession();
      navigate('/dashboard/defendx');
    }
  };

  const confirmExit = () => {
    dispatch(clearAssessment());
    AssessmentStorage.clearCurrentSession();
    navigate('/dashboard/defendx');
  };

  // Auto-save progress periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (responses.length > 0) {
        // Auto-save logic would go here
        console.log('Auto-saving progress...');
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [responses]);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600">Loading assessment questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with progress */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleExit}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Exit Assessment
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">
                Question {currentQuestionIndex + 1} of {currentQuestions.length}
              </span>
              <span className="text-sm text-slate-600">
                {answeredQuestions} answered
              </span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Started</span>
            <span>{Math.round(progress)}% Complete</span>
            <span>Finish</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          {/* Question category badge */}
          <div className="mb-6">
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {currentQuestion.category}
            </span>
          </div>

          {/* Question text */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">
              {currentQuestion.text}
            </h2>
            {currentQuestion.followUp && currentQuestion.followUp.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium mb-2">Additional Context:</p>
                    <ul className="text-blue-700 text-sm space-y-1">
                      {currentQuestion.followUp.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Answer options */}
          <div className="mb-8">
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                      currentResponse?.answer === option
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        currentResponse?.answer === option
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-300'
                      }`}>
                        {currentResponse?.answer === option && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : currentQuestion.type === 'yes_no' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Yes', 'Partial', 'No', 'N/A'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`p-4 border-2 rounded-lg font-medium transition-all ${
                      currentResponse?.answer === option
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-6 h-6 rounded-full border-2 mx-auto mb-2 ${
                        currentResponse?.answer === option
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-300'
                      }`}>
                        {currentResponse?.answer === option && (
                          <CheckCircle className="w-6 h-6 text-white" />
                        )}
                      </div>
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            ) : currentQuestion.type === 'rating' ? (
              <div className="space-y-4">
                <p className="text-slate-600 mb-4">Rate from 1 (Poor) to 5 (Excellent)</p>
                <div className="flex gap-3 justify-center">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleAnswer(rating)}
                      className={`w-12 h-12 rounded-full border-2 font-bold transition-all ${
                        currentResponse?.answer === rating
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-slate-500 mt-2">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                title="Progress is automatically saved to your browser's local storage"
              >
                <Save className="w-4 h-4" />
                Saved Locally
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  disabled={!currentResponse || isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Assessment
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!currentResponse}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question progress indicator */}
        <div className="mt-6 grid grid-cols-10 gap-2">
          {currentQuestions.map((_, index) => {
            const isAnswered = responses.some(r => r.questionId === currentQuestions[index].id);
            const isCurrent = index === currentQuestionIndex;
            
            return (
              <div
                key={index}
                className={`h-2 rounded-full ${
                  isCurrent ? 'bg-blue-600' :
                  isAnswered ? 'bg-green-500' :
                  'bg-slate-200'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Resume previous session modal */}
      {showResumeDialog && previousSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-bold text-slate-900">Resume Previous Assessment?</h3>
            </div>
            <p className="text-slate-600 mb-4">
              We found a previous assessment session with:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-blue-800">
                <p><strong>Questions answered:</strong> {previousSession.questionsAnswered} of {previousSession.totalQuestions}</p>
                <p><strong>Progress:</strong> {Math.round((previousSession.questionsAnswered / previousSession.totalQuestions) * 100)}%</p>
                <p><strong>Last updated:</strong> {new Date(previousSession.lastUpdated).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResumeDialog(false);
                  startNewAssessment();
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Start New Assessment
              </button>
              <button
                onClick={resumePreviousAssessment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Resume Previous
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm exit modal */}
      {showConfirmExit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-bold text-slate-900">Exit Assessment?</h3>
            </div>
            <p className="text-slate-600 mb-6">
              You have answered {answeredQuestions} questions. Your progress will be lost if you exit now.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmExit(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Continue Assessment
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Exit & Lose Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}