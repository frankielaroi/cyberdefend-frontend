import {
  Assessment,
  Question,
  CreateAssessmentDto,
  RegionalStats,
  SectoralStats,
  AssessmentSubmitDto,
  AssessmentResponse
} from '../types';
import { localStorageService } from './localStorageService';
import { 
  mockAssessments,
  mockQuestions,
  generateMockAssessment
} from '../data/mockData';

// DefendX specific types
interface AssessmentResultDto {
  assessment: Assessment;
  score: number;
  tier: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    category: string;
    score: number;
    maxScore: number;
    percentage: number;
  }[];
  recommendations: string[];
  benchmarks: {
    sector: number;
    region: number;
    global: number;
  };
  reportUrl?: string;
}

interface StartAssessmentResponse {
  assessment: Assessment;
  questions: Question[];
}

interface DefendXDashboard {
  currentAssessment?: Assessment;
  lastCompletedScore?: number;
  lastCompletedTier?: 'A' | 'B' | 'C' | 'D' | 'F';
  assessmentHistory: Assessment[];
  averageScore: number;
  improvementTrend: number;
  nextAssessmentDue?: string;
  recommendations: string[];
}

// Mock data generators
const generateMockRegionalStats = (): RegionalStats[] => [
  {
    region: 'North America',
    averageScore: 78.5,
    organizationCount: 1234,
    distribution: { A: 15, B: 25, C: 35, D: 20, F: 5 }
  },
  {
    region: 'Europe',
    averageScore: 82.3,
    organizationCount: 987,
    distribution: { A: 18, B: 28, C: 32, D: 18, F: 4 }
  },
  {
    region: 'Asia Pacific',
    averageScore: 75.1,
    organizationCount: 654,
    distribution: { A: 12, B: 22, C: 38, D: 23, F: 5 }
  },
  {
    region: 'Latin America',
    averageScore: 71.8,
    organizationCount: 321,
    distribution: { A: 8, B: 18, C: 42, D: 27, F: 5 }
  },
  {
    region: 'Africa',
    averageScore: 68.4,
    organizationCount: 156,
    distribution: { A: 6, B: 15, C: 38, D: 31, F: 10 }
  }
];

const generateMockSectoralStats = (): SectoralStats[] => [
  {
    sector: 'Banking',
    averageScore: 85.2,
    organizationCount: 234,
    distribution: { A: 22, B: 31, C: 28, D: 15, F: 4 }
  },
  {
    sector: 'Healthcare',
    averageScore: 79.8,
    organizationCount: 189,
    distribution: { A: 16, B: 26, C: 34, D: 20, F: 4 }
  },
  {
    sector: 'Technology',
    averageScore: 83.1,
    organizationCount: 167,
    distribution: { A: 19, B: 29, C: 31, D: 17, F: 4 }
  },
  {
    sector: 'Government',
    averageScore: 76.4,
    organizationCount: 145,
    distribution: { A: 14, B: 23, C: 36, D: 22, F: 5 }
  },
  {
    sector: 'Education',
    averageScore: 73.9,
    organizationCount: 123,
    distribution: { A: 11, B: 21, C: 39, D: 24, F: 5 }
  },
  {
    sector: 'Manufacturing',
    averageScore: 72.6,
    organizationCount: 98,
    distribution: { A: 9, B: 19, C: 41, D: 26, F: 5 }
  }
];

// Simulate network delay
const simulateDelay = (ms = 400): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Calculate assessment score based on responses
const calculateAssessmentScore = (responses: AssessmentResponse[], questions: Question[]): number => {
  let totalScore = 0;
  let maxScore = 0;

  responses.forEach(response => {
    const question = questions.find(q => q.id === response.questionId);
    if (!question) return;

    maxScore += question.weight || 0;

    if (question.type === 'yes_no') {
      totalScore += response.answer === 'yes' ? (question.weight || 0) : 0;
    } else if (question.type === 'rating') {
      const rating = Number(response.answer);
      totalScore += (rating / 5) * (question.weight || 0);
    } else if (question.type === 'multiple_choice' && question.options) {
      // Simple scoring: first option = full points, last option = no points
      let optionIndex = -1;
      if (Array.isArray(question.options) && typeof question.options[0] === 'string') {
        // String array
        optionIndex = (question.options as string[]).indexOf(response.answer as string);
      } else if (Array.isArray(question.options) && typeof question.options[0] === 'object') {
        // Object array - find by value or text
        const optionObj = (question.options as Array<{id: string, text: string, value: string}>)
          .find(opt => opt.value === response.answer || opt.text === response.answer);
        if (optionObj) {
          optionIndex = (question.options as Array<{id: string, text: string, value: string}>)
            .indexOf(optionObj);
        }
      }
      
      if (optionIndex !== -1) {
        const optionScore = (question.options.length - optionIndex - 1) / (question.options.length - 1);
        totalScore += optionScore * (question.weight || 0);
      }
    }
  });

  return Math.round((totalScore / maxScore) * 100);
};

// Get tier from score
const getScoreTier = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

// Generate assessment breakdown by category
const generateAssessmentBreakdown = (responses: AssessmentResponse[], questions: Question[]) => {
  const categories = [...new Set(questions.map(q => typeof q.category === 'string' ? q.category : q.category.name))];
  
  return categories.map(category => {
    const categoryQuestions = questions.filter(q => q.category === category);
    const categoryResponses = responses.filter(r => 
      categoryQuestions.some(q => q.id === r.questionId)
    );

    let categoryScore = 0;
    let maxCategoryScore = 0;

    categoryResponses.forEach(response => {
      const question = categoryQuestions.find(q => q.id === response.questionId);
      if (!question) return;

      maxCategoryScore += question.weight || 0;

      if (question.type === 'yes_no') {
        categoryScore += response.answer === 'yes' ? (question.weight || 0) : 0;
      } else if (question.type === 'rating') {
        const rating = Number(response.answer);
        categoryScore += (rating / 5) * (question.weight || 0);
      } else if (question.type === 'multiple_choice' && question.options) {
        // Handle both string arrays and object arrays
        let optionIndex = -1;
        if (Array.isArray(question.options) && typeof question.options[0] === 'string') {
          // String array
          optionIndex = (question.options as string[]).indexOf(response.answer as string);
        } else if (Array.isArray(question.options) && typeof question.options[0] === 'object') {
          // Object array - find by value or text
          const optionObj = (question.options as Array<{id: string, text: string, value: string}>)
            .find(opt => opt.value === response.answer || opt.text === response.answer);
          if (optionObj) {
            optionIndex = (question.options as Array<{id: string, text: string, value: string}>)
              .indexOf(optionObj);
          }
        }
        
        if (optionIndex !== -1) {
          const optionScore = (question.options.length - optionIndex - 1) / (question.options.length - 1);
          categoryScore += optionScore * (question.weight || 0);
        }
      }
    });

    const percentage = maxCategoryScore > 0 ? Math.round((categoryScore / maxCategoryScore) * 100) : 0;

    return {
      category,
      score: Math.round(categoryScore),
      maxScore: maxCategoryScore,
      percentage
    };
  });
};

// Generate recommendations based on score and breakdown
const generateRecommendations = (score: number, breakdown: any[]) => {
  const recommendations: Array<{title: string, description: string, priority: 'high' | 'medium' | 'low'}> = [];

  if (score < 70) {
    recommendations.push({
      title: 'Comprehensive Security Audit',
      description: 'Consider conducting a comprehensive security audit to identify critical vulnerabilities.',
      priority: 'high'
    });
  }
  
  if (score < 80) {
    recommendations.push({
      title: 'Incident Response Plan',
      description: 'Implement a formal incident response plan and conduct regular drills.',
      priority: 'high'
    });
    recommendations.push({
      title: 'Employee Training Enhancement',
      description: 'Enhance employee cybersecurity awareness training programs.',
      priority: 'medium'
    });
  }

  // Category-specific recommendations
  breakdown.forEach(cat => {
    if (cat.percentage < 70) {
      switch (typeof cat.category === 'string' ? cat.category.toLowerCase() : cat.category.name.toLowerCase()) {
        case 'network security':
          recommendations.push({
            title: 'Network Security Controls',
            description: 'Strengthen network security controls including firewalls and intrusion detection systems.',
            priority: 'high'
          });
          break;
        case 'data protection':
          recommendations.push({
            title: 'Data Protection Measures',
            description: 'Implement data encryption and improve backup procedures.',
            priority: 'high'
          });
          break;
        case 'access control':
          recommendations.push({
            title: 'Access Control Enhancement',
            description: 'Enforce multi-factor authentication and review user access privileges.',
            priority: 'medium'
          });
          break;
        case 'employee training':
        case 'security training':
          recommendations.push({
            title: 'Training Program Improvement',
            description: 'Increase frequency and scope of cybersecurity awareness training.',
            priority: 'medium'
          });
          break;
        case 'incident response':
          recommendations.push({
            title: 'Incident Response Development',
            description: 'Develop and test incident response procedures.',
            priority: 'high'
          });
          break;
      }
    }
  });

  return recommendations.slice(0, 5); // Limit to 5 recommendations
};

export class MockDefendXService {
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    localStorageService.initializeWithMockData({
      assessments: mockAssessments,
      questions: mockQuestions,
      regionalStats: generateMockRegionalStats(),
      sectoralStats: generateMockSectoralStats()
    });
  }

  // Dashboard
  async getDashboard(): Promise<DefendXDashboard> {
    await simulateDelay();

    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new Error('User organization not found');
    }

    const assessments = localStorageService.getAssessmentsByOrganization(currentUser.organizationId);
    const completedAssessments = assessments.filter(a => a.status === 'COMPLETED');
    const currentAssessment = assessments.find(a => a.status === 'IN_PROGRESS');

    const lastCompleted = completedAssessments[completedAssessments.length - 1];
    const averageScore = completedAssessments.reduce((sum, a) => sum + (a.score || 0), 0) / (completedAssessments.length || 1);

    return {
      currentAssessment,
      lastCompletedScore: lastCompleted?.score,
      lastCompletedTier: lastCompleted?.tier,
      assessmentHistory: completedAssessments.slice(-5),
      averageScore: Math.round(averageScore),
      improvementTrend: 5.2, // Mock improvement trend
      nextAssessmentDue: new Date(Date.now() + 90 * 24 * 3600000).toISOString(), // 90 days from now
      recommendations: [
        'Schedule quarterly security assessments',
        'Update incident response procedures',
        'Enhance employee training programs'
      ]
    };
  }

  // Statistics
  async getRegionalStats(): Promise<RegionalStats[]> {
    await simulateDelay();
    return localStorageService.getItems<RegionalStats>('cyberdefend_regionalStats');
  }

  async getSectoralStats(): Promise<SectoralStats[]> {
    await simulateDelay();
    return localStorageService.getItems<SectoralStats>('cyberdefend_sectoralStats');
  }

  // Assessment lifecycle
  async startAssessment(_assessmentData: CreateAssessmentDto): Promise<StartAssessmentResponse> {
    await simulateDelay();

    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new Error('User organization not found');
    }

    // Create new assessment
    const assessment = generateMockAssessment(currentUser.organizationId, 'in_progress');
    assessment.startedAt = new Date().toISOString();

    // Save assessment
    localStorageService.addAssessment(assessment);

    // Get questions for the assessment
    const questions = localStorageService.getItems<Question>('cyberdefend_questions');

    return {
      assessment,
      questions
    };
  }

  async submitAssessment(data: AssessmentSubmitDto): Promise<AssessmentResultDto> {
    await simulateDelay();

    const assessment = localStorageService.getItemById<Assessment>('cyberdefend_assessments', data.assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    const questions = localStorageService.getItems<Question>('cyberdefend_questions');
    const score = calculateAssessmentScore(data.responses, questions);
    const tier = getScoreTier(score);
    const breakdown = generateAssessmentBreakdown(data.responses, questions);
    const recommendations = generateRecommendations(score, breakdown);

    // Update assessment
    const updatedAssessment = {
      ...assessment,
      status: 'COMPLETED' as const,
      score,
      tier,
      completedAt: new Date().toISOString(),
      reportUrl: `/reports/${assessment.id}.pdf`
    };

    localStorageService.updateAssessment(assessment.id, updatedAssessment);

    return {
      assessment: updatedAssessment,
      score,
      tier,
      breakdown,
      recommendations: recommendations.map(r => r.title),
      benchmarks: {
        sector: 75.8,
        region: 78.2,
        global: 76.4
      },
      reportUrl: updatedAssessment.reportUrl
    };
  }

  async completeAssessment(assessmentId: string): Promise<AssessmentResultDto> {
    await simulateDelay();

    const assessment = localStorageService.getItemById<Assessment>('cyberdefend_assessments', assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    if (assessment.status !== 'COMPLETED') {
      throw new Error('Assessment is not completed');
    }

    const breakdown = generateAssessmentBreakdown([], []); // Mock breakdown
    const recommendations = generateRecommendations(assessment.score || 0, breakdown);

    return {
      assessment,
      score: assessment.score || 0,
      tier: assessment.tier || 'F',
      breakdown,
      recommendations: recommendations.map(r => r.title),
      benchmarks: {
        sector: 75.8,
        region: 78.2,
        global: 76.4
      },
      reportUrl: assessment.reportUrl
    };
  }

  async getAssessmentResult(id: string): Promise<AssessmentResultDto> {
    await simulateDelay();

    const assessment = localStorageService.getItemById<Assessment>('cyberdefend_assessments', id);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    if (assessment.status !== 'COMPLETED') {
      throw new Error('Assessment is not completed');
    }

    return this.completeAssessment(id);
  }

  async getLatestCSIResult(): Promise<AssessmentResultDto> {
    await simulateDelay();

    const currentUser = localStorageService.getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new Error('User organization not found');
    }

    const assessments = localStorageService.getAssessmentsByOrganization(currentUser.organizationId);
    const completedAssessments = assessments.filter(a => a.status === 'COMPLETED');
    
    if (completedAssessments.length === 0) {
      throw new Error('No completed assessments found');
    }

    const latestAssessment = completedAssessments[completedAssessments.length - 1];
    return this.getAssessmentResult(latestAssessment.id);
  }

  async getOrganizationAssessments(organizationId: string): Promise<Assessment[]> {
    await simulateDelay();

    return localStorageService.getAssessmentsByOrganization(organizationId);
  }

  async downloadAssessmentReport(id: string, format: 'pdf' | 'html' | 'json' = 'pdf'): Promise<Blob> {
    await simulateDelay();

    const assessment = localStorageService.getItemById<Assessment>('cyberdefend_assessments', id);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Generate mock report content
    const reportContent = `Mock Assessment Report
Assessment ID: ${id}
Score: ${assessment.score || 'N/A'}
Tier: ${assessment.tier || 'N/A'}
Completed: ${assessment.completedAt || 'N/A'}
Format: ${format}`;

    const mimeType = format === 'pdf' ? 'application/pdf' : 
                    format === 'html' ? 'text/html' : 'application/json';

    return new Blob([reportContent], { type: mimeType });
  }
}

export const mockDefendXService = new MockDefendXService();
export default mockDefendXService;