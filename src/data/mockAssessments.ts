import type { Assessment } from '../types';

export const createMockAssessment = (): Assessment => ({
  id: `mock-assessment-${Date.now()}`,
  organizationId: 'mock-org-001',
  status: 'in_progress',
  startedAt: new Date().toISOString(),
});

export const mockAssessmentResult = {
  calculateScore: (answeredQuestions: number, totalQuestions: number): number => {
    return Math.round((answeredQuestions / totalQuestions) * 100);
  },
  
  getTier: (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B'; 
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  },
  
  simulateApiDelay: (ms: number = 2000): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};