import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Shield,
  Loader2
} from 'lucide-react';
import {
  useCreateAnonymousAssessmentMutation,
  useSubmitAnonymousResponsesMutation,
  useCompleteAnonymousAssessmentMutation,
  useGetQuestionsQuery,
} from '../../store/api/realDefendXApi';
import {
  getOrCreateSessionId,
  storeAnonymousAssessmentId,
  getAnonymousAssessmentId,
  storeAnonymousResponses,
  getAnonymousResponses,
  storeAnonymousAssessmentResult,
} from '../../utils/anonymousSession';

interface AnonymousResponse {
  questionId: string;
  answer: string | number;
  timeSpent?: number;
}

interface AssessmentResult {
  assessmentId: string;
  score: number;
  tier: 'A' | 'B' | 'C' | 'D' | 'F';
  completedAt: string;
  responses: number;
  questionsCount: number;
}

export default function AnonymousAssessment() {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<AnonymousResponse[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  
  const [createAnonymousAssessment, { isLoading: isCreating }] = useCreateAnonymousAssessmentMutation();
  const [submitAnonymousResponses, { isLoading: isSubmitting }] = useSubmitAnonymousResponsesMutation();
  const [completeAnonymousAssessment, { isLoading: isCompleting }] = useCompleteAnonymousAssessmentMutation();

  // Fetch questions from backend (public endpoint - no auth needed)
  const { data: questionsData, isLoading: isLoadingQuestions } = useGetQuestionsQuery();

  // Flatten questions from categories structure and preserve category info
  const questions = questionsData?.categories
    ? questionsData.categories.flatMap((cat) => 
        cat.questions.map(q => ({
          ...q,
          category: q.category || cat.category // Ensure category is set
        }))
      )
    : [];
  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = currentQuestion ? responses.find((r) => r.questionId === currentQuestion.id) : undefined;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Generate options based on question type
  const getQuestionOptions = (question: typeof currentQuestion) => {
    if (!question) return [];

    // If question already has options, use them
    if (question.options && question.options.length > 0) {
      return question.options;
    }

    // Generate options based on question type
    switch (question.type) {
      case 'yes_no':
        return ['Yes', 'No'];
      case 'rating':
        return ['1 - Poor', '2 - Fair', '3 - Good', '4 - Very Good', '5 - Excellent'];
      case 'multiple_choice':
        // Fallback if options are missing
        return ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
      default:
        return [];
    }
  };

  const questionOptions = getQuestionOptions(currentQuestion);

  // Initialize anonymous assessment
  useEffect(() => {
    const initializeAssessment = async () => {
      try {
        // Get or create session ID
        const sid = getOrCreateSessionId();
        setSessionId(sid);

        // Check if there's an existing assessment in progress
        const existingAssessmentId = getAnonymousAssessmentId();
        const existingResponses = getAnonymousResponses();

        if (existingAssessmentId && existingResponses.length > 0) {
          // Resume existing assessment
          setAssessmentId(existingAssessmentId);
          setResponses(existingResponses);
          setCurrentQuestionIndex(existingResponses.length);
        } else {
          // Create new anonymous assessment
          const result = await createAnonymousAssessment({ sessionId: sid }).unwrap();
          setAssessmentId(result.id);
          storeAnonymousAssessmentId(result.id);
        }
      } catch (error) {
        console.error('Failed to initialize anonymous assessment:', error);
      }
    };

    initializeAssessment();
  }, []);

  // Handle answer selection
  const handleAnswer = (answer: string | number) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    const newResponse: AnonymousResponse = {
      questionId: currentQuestion.id,
      answer,
      timeSpent,
    };

    const updatedResponses = [
      ...responses.filter(r => r.questionId !== currentQuestion.id),
      newResponse,
    ];

    setResponses(updatedResponses);
    storeAnonymousResponses(updatedResponses);
    setQuestionStartTime(Date.now());
  };

  // Navigate to next question
  const handleNext = async () => {
    if (!currentResponse) return;

    // Submit response to backend (don't block on single response submission)
    try {
      await submitAnonymousResponses({
        assessmentId,
        sessionId,
        responses: [currentResponse],
      }).unwrap();
    } catch (error) {
      console.error('Failed to submit response:', error);
      // Continue anyway - we'll resubmit all on completion
    }

    if (isLastQuestion) {
      await handleComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  // Complete assessment
  const handleComplete = async () => {
    try {
      // Submit all responses first if any are pending
      if (responses.length > 0) {
        try {
          await submitAnonymousResponses({
            assessmentId,
            sessionId,
            responses: responses,
          }).unwrap();
        } catch (submitError) {
          console.error('Failed to submit final responses:', submitError);
        }
      }

      // Now complete the assessment
      const result = await completeAnonymousAssessment({
        assessmentId,
        sessionId,
      }).unwrap();

      // Save the completed assessment result to session storage
      storeAnonymousAssessmentResult({
        sessionId,
        ...result
      });

      setAssessmentResult(result);
    } catch (error) {
      console.error('Failed to complete assessment:', error);
    }
  };

  // Handle authentication and transfer
  const handleAuthenticateAndView = () => {
    // Store the session data for transfer after authentication
    navigate('/register', { state: { fromAnonymousAssessment: true, sessionId, assessmentId } });
  };

  const handleSignInAndView = () => {
    // Store the session data for transfer after authentication
    navigate('/login', { state: { fromAnonymousAssessment: true, sessionId, assessmentId } });
  };

  // Tier color mapping
  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      A: 'text-green-400',
      B: 'text-blue-400',
      C: 'text-yellow-400',
      D: 'text-orange-400',
      F: 'text-red-400',
    };
    return colors[tier] || 'text-gray-400';
  };

  const getTierBgColor = (tier: string) => {
    const colors: Record<string, string> = {
      A: 'bg-green-500/20 border-green-500',
      B: 'bg-blue-500/20 border-blue-500',
      C: 'bg-yellow-500/20 border-yellow-500',
      D: 'bg-orange-500/20 border-orange-500',
      F: 'bg-red-500/20 border-red-500',
    };
    return colors[tier] || 'bg-gray-500/20 border-gray-500';
  };

  if (isCreating || isLoadingQuestions || !assessmentId || !currentQuestion || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-lg">
            {isCreating ? 'Preparing your assessment...' : 'Loading questions...'}
          </p>
        </div>
      </div>
    );
  }

  // Show results screen
  if (assessmentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-400 mr-3" />
              <h1 className="text-2xl font-bold">DefendX Assessment</h1>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 md:p-12">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Assessment Complete!</h2>
              <p className="text-slate-300">You've successfully completed the cybersecurity assessment</p>
            </div>

            {/* Score Display */}
            <div className="text-center mb-12">
              <div className={`inline-block px-8 py-4 rounded-2xl border-2 ${getTierBgColor(assessmentResult.tier)} mb-4`}>
                <div className="text-6xl font-bold mb-2">{assessmentResult.score}</div>
                <div className="text-xl text-slate-300">out of 100</div>
              </div>
              <div className={`text-3xl font-bold ${getTierColor(assessmentResult.tier)} mb-2`}>
                Tier {assessmentResult.tier}
              </div>
            </div>

            {/* Call to Action */}
            <div className="border-t border-slate-700 pt-8">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4 mb-6">
                  <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Create an Account to View Detailed Results</h3>
                    <p className="text-slate-300 mb-4">
                      To access your comprehensive security report, personalized recommendations, 
                      and track your progress over time, please create a free account or sign in.
                    </p>
                    <ul className="text-sm text-slate-400 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Detailed category breakdown
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Personalized security recommendations
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Compare with industry benchmarks
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Track improvement over time
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAuthenticateAndView}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 transform hover:scale-105"
                >
                  Create Account & View Results
                </button>
                <button
                  onClick={handleSignInAndView}
                  className="flex-1 border-2 border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300"
                >
                  Sign In & View Results
                </button>
              </div>

              <button
                onClick={() => navigate('/')}
                className="w-full mt-4 text-slate-400 hover:text-white text-sm transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show questionnaire
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-400 mr-3" />
              <h1 className="text-2xl font-bold">Cybersecurity Assessment</h1>
            </div>
            <div className="text-sm text-slate-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 md:p-12">
          {/* Category Badge */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm font-medium text-blue-300">
              {typeof currentQuestion.category === 'string' 
                ? currentQuestion.category 
                : currentQuestion.category?.name || 'General'}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white leading-relaxed">
            {currentQuestion.text}
          </h2>

          {/* Answer Options */}
          <div className="space-y-4 mb-12">
            {questionOptions.map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionText = typeof option === 'string' ? option : option.text;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(optionValue)}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                    currentResponse?.answer === optionValue
                      ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-700/30 border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        currentResponse?.answer === optionValue
                          ? 'border-blue-400 bg-blue-500'
                          : 'border-slate-500'
                      }`}
                    >
                      {currentResponse?.answer === optionValue && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-lg">{optionText}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 border-2 border-slate-600 rounded-xl text-slate-300 hover:border-slate-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!currentResponse || isSubmitting || isCompleting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isCompleting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isLastQuestion ? 'Completing...' : 'Saving...'}
                </>
              ) : (
                <>
                  {isLastQuestion ? 'Complete Assessment' : 'Next Question'}
                  {!isLastQuestion && <ChevronRight className="w-5 h-5" />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
