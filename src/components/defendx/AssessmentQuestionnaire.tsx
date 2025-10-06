import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { answerQuestion, nextQuestion, previousQuestion, clearAssessment } from '../../store/slices/defendxSlice';
import { useSubmitAssessmentMutation } from '../../store/api/defendxApi';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

type SubmitAssessmentMutationResult = [
  (params: any) => Promise<{ data: any }>,
  { isLoading: boolean; error: any; reset: () => void }
];

interface Props {
  onComplete: () => void;
}

export default function AssessmentQuestionnaire({ onComplete }: Props) {
  const dispatch = useAppDispatch();
  const { currentAssessment, currentQuestions, responses, currentQuestionIndex } = useAppSelector(
    (state) => state.defendx
  );
  const [submitAssessment, { isLoading: isSubmitting }] = useSubmitAssessmentMutation() as SubmitAssessmentMutationResult;
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const currentResponse = responses.find((r) => r.questionId === currentQuestion?.id);
  const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;

  const handleAnswer = (answer: string | number) => {
    if (currentQuestion) {
      dispatch(answerQuestion({ questionId: currentQuestion.id, answer }));
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
    if (!currentAssessment) return;

    try {
      const result = await submitAssessment({
        assessmentId: currentAssessment.id,
        responses,
      });
      
      if (result.data) {
        setResults(result.data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    }
  };

  const handleFinish = () => {
    dispatch(clearAssessment());
    onComplete();
  };

  if (!currentQuestion) {
    return <div>Loading...</div>;
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
              <div className="text-7xl font-bold text-blue-600 mb-2">{results.score}</div>
              <div className="text-2xl font-semibold text-slate-700 mb-4">Cyber Safety Index Score</div>
              <div className={`inline-block px-6 py-2 rounded-full text-xl font-bold ${
                results.tier === 'A' ? 'bg-green-100 text-green-700' :
                results.tier === 'B' ? 'bg-blue-100 text-blue-700' :
                results.tier === 'C' ? 'bg-yellow-100 text-yellow-700' :
                results.tier === 'D' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                Tier {results.tier}
              </div>
            </div>
          </div>

          {results.benchmark && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <BenchmarkCard title="National Average" value={results.benchmark.national?.average} percentile={results.benchmark.national?.percentile} />
              <BenchmarkCard title="Your Sector" value={results.benchmark.sector?.average} percentile={results.benchmark.sector?.percentile} />
              <BenchmarkCard title="Your Region" value={results.benchmark.region?.average} percentile={results.benchmark.region?.percentile} />
              <BenchmarkCard title="Your Size" value={results.benchmark.size?.average} percentile={results.benchmark.size?.percentile} />
            </div>
          )}

          {results.recommendations && results.recommendations.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Recommendations</h2>
              <div className="space-y-3">
                {results.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-slate-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {results.reportUrl && (
              <a
                href={results.reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-center font-medium transition-colors"
              >
                Download Report
              </a>
            )}
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

  const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
  const canProceed = currentResponse !== undefined;

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
              <span className="text-sm font-medium text-blue-600">{Math.round(progress)}% Complete</span>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
              {currentQuestion.category}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-6">{currentQuestion.text}</h2>

          <div className="space-y-3 mb-8">
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  currentResponse?.answer === option
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <span className="font-medium text-slate-900">{option}</span>
              </button>
            ))}

            {currentQuestion.type === 'yes_no' && (
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

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
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
