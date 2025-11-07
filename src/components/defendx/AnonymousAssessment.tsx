import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Shield,
  Loader2
} from 'lucide-react';
import {
  useCreateAnonymousAssessmentMutation,
  useSubmitAnonymousResponsesMutation,
  useCompleteAnonymousAssessmentMutation,
  useGetQuestionsQuery,
  useLazyCheckAnonymousSessionQuery
} from '../../store/api/realDefendXApi';
import type { Question } from '../../types';
import {
  getOrCreateSessionId,
  storeAnonymousAssessmentId,
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
  const [checkSession] = useLazyCheckAnonymousSessionQuery();

  // Fetch questions from backend (public endpoint - no auth needed)
  const { data: questionsData, isLoading: isLoadingQuestions } = useGetQuestionsQuery();

  interface Category {
    category: string;
    questions: Question[];
  }

  // Get questions with their categories
  const questions = questionsData?.categories
    ? questionsData.categories.flatMap((cat: Category) => 
        cat.questions.map((q) => ({
          ...q,
          category: cat.category
        }))
      )
    : [];
  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = currentQuestion ? responses.find((r) => r.questionId === currentQuestion.id) : undefined;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  interface QuestionOption {
    value: string;
    text: string;
  }

  // Generate options based on question type
  const getQuestionOptions = (question: Question | undefined): QuestionOption[] => {
    if (!question) return [];

    // If question already has options, use them
    if (question.options && question.options.length > 0) {
      if (Array.isArray(question.options) && typeof question.options[0] === 'string') {
        // Convert string array to QuestionOption array
        return (question.options as string[]).map(opt => ({
          value: opt,
          text: opt
        }));
      } else if (Array.isArray(question.options) && typeof question.options[0] === 'object') {
        // Already in correct format or needs id/text mapping
        return (question.options as Array<{ id?: string; value: string; text: string }>).map(opt => ({
          value: opt.value || opt.id || opt.text,
          text: opt.text
        }));
      }
    }

    // Generate options based on question type
    switch (question.type) {
      case 'yes_no':
        return [
          { value: 'Yes', text: 'Yes' },
          { value: 'No', text: 'No' }
        ];
      case 'rating':
        return [
          { value: '1', text: '1 - Poor' },
          { value: '2', text: '2 - Fair' },
          { value: '3', text: '3 - Good' },
          { value: '4', text: '4 - Very Good' },
          { value: '5', text: '5 - Excellent' }
        ];
      case 'multiple_choice':
        // Fallback if options are missing
        return [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' },
          { value: '3', text: 'Option 3' },
          { value: '4', text: 'Option 4' }
        ];
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
        
        // First check if there's a valid session
        const { data: sessionCheck } = await checkSession(sid);
        
        if (sessionCheck?.valid && sessionCheck.assessmentId) {
          // Resume existing assessment
          setAssessmentId(sessionCheck.assessmentId);
          const existingResponses = getAnonymousResponses();
          setResponses(existingResponses);
          setCurrentQuestionIndex(existingResponses.length);
        } else {
          // Create new anonymous assessment
          const result = await createAnonymousAssessment({ 
            sessionId: sid,
            type: 'CSI_ASSESSMENT' 
          }).unwrap();
          setAssessmentId(result.id);
          storeAnonymousAssessmentId(result.id);
        }
      } catch (error) {
        console.error('Failed to initialize anonymous assessment:', error);
        navigate('/error', { 
          state: { message: 'Failed to initialize assessment. Please try again.' } 
        });
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

  // Navigate to next question and submit response
  const handleNext = async () => {
    if (!currentResponse) return;

    // Submit the response to backend
    try {
      await submitAnonymousResponses({
        assessmentId,
        sessionId,
        responses: [{
          questionId: currentResponse.questionId,
          answer: currentResponse.answer,
          timeSpent: currentResponse.timeSpent,
        }],
      }).unwrap();
    } catch (error) {
      console.error('Failed to submit response:', error);
      // Continue anyway - we'll resubmit all on completion
      
      // Show error toast but allow continuing
      // TODO: Add better error handling UI
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
      // Submit any remaining responses first
      if (responses.length > 0) {
        try {
          await submitAnonymousResponses({
            assessmentId,
            sessionId,
            responses: responses.map(r => ({
              questionId: r.questionId,
              answer: r.answer,
              timeSpent: r.timeSpent
            })),
          }).unwrap();
        } catch (submitError) {
          console.error('Failed to submit final responses:', submitError);
          // Show error toast but continue with completion attempt
        }
      }

      // Complete the assessment
      const result = await completeAnonymousAssessment({
        assessmentId,
        sessionId,
      }).unwrap();

      // Store result for transfer after registration/login
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
    if (!assessmentResult) return;
    
    // Store required data in session storage for transfer after auth
    const transferData = {
      ...assessmentResult,
      sessionId,
      responseCount: responses.length,
      totalQuestions: questions.length
    };
    storeAnonymousAssessmentResult(transferData);
    
    // Navigate to registration page with transfer intent
    navigate('/register', { 
      state: { 
        fromAnonymousAssessment: true,
        sessionId,
        assessmentId
      } 
    });
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
    // Get risk level based on score
    const getRiskLevel = (score: number) => {
      if (score >= 80) return 'LOW RISK';
      if (score >= 60) return 'MEDIUM RISK';
      return 'HIGHRISK';
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-2xl w-full bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 md:p-12">
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
                  strokeDasharray={`${(assessmentResult.score / 100) * 552} 552`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{assessmentResult.score}</span>
                <span className="text-lg">/100</span>
              </div>
            </div>

            {/* Risk Level Badge */}
            <div className="inline-block bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              {getRiskLevel(assessmentResult.score)}
            </div>

            {/* Score Description */}
            <div className="space-y-4">
              <p className="text-lg">
                Your Cyber Readiness Score: {assessmentResult.score}/100 — {getRiskLevel(assessmentResult.score)}
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
              <button
                onClick={handleAuthenticateAndView}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg text-lg font-bold transition-all duration-300"
              >
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
              {currentQuestion.category || 'General'}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white leading-relaxed">
            {currentQuestion.text}
          </h2>

          {/* Answer Options */}
          <div className="space-y-4 mb-12">
            {questionOptions.map((option: string | { value: string; text: string }, index: number) => {
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
