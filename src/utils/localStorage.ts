import type { Assessment, AssessmentResponse } from '../types';

// Local storage keys
const STORAGE_KEYS = {
  CURRENT_ASSESSMENT: 'defendx_current_assessment',
  ASSESSMENT_RESPONSES: 'defendx_assessment_responses',
  ASSESSMENT_RESULTS: 'defendx_assessment_results',
  ASSESSMENT_PROGRESS: 'defendx_assessment_progress',
} as const;

// Types for stored data
export interface StoredAssessmentProgress {
  assessmentId: string;
  currentQuestionIndex: number;
  responses: AssessmentResponse[];
  lastUpdated: string;
  questionsCount: number;
}

export interface StoredAssessmentResult {
  assessmentId: string;
  score: number;
  tier: 'A' | 'B' | 'C' | 'D' | 'F';
  completedAt: string;
  responses: AssessmentResponse[];
  questionsCount: number;
}

// Assessment Local Storage Utilities
export class AssessmentStorage {
  // Save current assessment data
  static saveCurrentAssessment(assessment: Assessment): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ASSESSMENT, JSON.stringify(assessment));
    } catch (error) {
      console.error('Failed to save current assessment to localStorage:', error);
    }
  }

  // Load current assessment data
  static loadCurrentAssessment(): Assessment | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_ASSESSMENT);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load current assessment from localStorage:', error);
      return null;
    }
  }

  // Save assessment progress (responses and current question)
  static saveProgress(assessmentId: string, responses: AssessmentResponse[], currentQuestionIndex: number, questionsCount: number): void {
    try {
      const progress: StoredAssessmentProgress = {
        assessmentId,
        currentQuestionIndex,
        responses,
        lastUpdated: new Date().toISOString(),
        questionsCount,
      };
      localStorage.setItem(STORAGE_KEYS.ASSESSMENT_PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save assessment progress to localStorage:', error);
    }
  }

  // Load assessment progress
  static loadProgress(): StoredAssessmentProgress | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ASSESSMENT_PROGRESS);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load assessment progress from localStorage:', error);
      return null;
    }
  }

  // Save completed assessment result
  static saveResult(result: StoredAssessmentResult): void {
    try {
      const existingResults = this.loadAllResults();
      const updatedResults = existingResults.filter(r => r.assessmentId !== result.assessmentId);
      updatedResults.push(result);
      
      // Keep only the last 10 results to prevent storage bloat
      const limitedResults = updatedResults.slice(-10);
      
      localStorage.setItem(STORAGE_KEYS.ASSESSMENT_RESULTS, JSON.stringify(limitedResults));
    } catch (error) {
      console.error('Failed to save assessment result to localStorage:', error);
    }
  }

  // Load a specific assessment result
  static loadResult(assessmentId: string): StoredAssessmentResult | null {
    try {
      const results = this.loadAllResults();
      return results.find(r => r.assessmentId === assessmentId) || null;
    } catch (error) {
      console.error('Failed to load assessment result from localStorage:', error);
      return null;
    }
  }

  // Load all assessment results
  static loadAllResults(): StoredAssessmentResult[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ASSESSMENT_RESULTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load assessment results from localStorage:', error);
      return [];
    }
  }

  // Clear current assessment data
  static clearCurrentSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ASSESSMENT);
      localStorage.removeItem(STORAGE_KEYS.ASSESSMENT_PROGRESS);
    } catch (error) {
      console.error('Failed to clear current session from localStorage:', error);
    }
  }

  // Clear all assessment data
  static clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear all assessment data from localStorage:', error);
    }
  }

  // Check if there's a previous session
  static hasPreviousSession(): boolean {
    const progress = this.loadProgress();
    return progress !== null && progress.responses.length > 0;
  }

  // Get session summary for resume prompt
  static getSessionSummary(): { questionsAnswered: number; totalQuestions: number; lastUpdated: string } | null {
    const progress = this.loadProgress();
    if (!progress) return null;

    return {
      questionsAnswered: progress.responses.length,
      totalQuestions: progress.questionsCount,
      lastUpdated: progress.lastUpdated,
    };
  }

  // Check if localStorage is available
  static isAvailable(): boolean {
    try {
      const test = 'localStorage_test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Hook-like utilities for easier integration
export const useAssessmentStorage = () => {
  return {
    saveCurrentAssessment: AssessmentStorage.saveCurrentAssessment,
    loadCurrentAssessment: AssessmentStorage.loadCurrentAssessment,
    saveProgress: AssessmentStorage.saveProgress,
    loadProgress: AssessmentStorage.loadProgress,
    saveResult: AssessmentStorage.saveResult,
    loadResult: AssessmentStorage.loadResult,
    loadAllResults: AssessmentStorage.loadAllResults,
    clearCurrentSession: AssessmentStorage.clearCurrentSession,
    clearAllData: AssessmentStorage.clearAllData,
    hasPreviousSession: AssessmentStorage.hasPreviousSession,
    getSessionSummary: AssessmentStorage.getSessionSummary,
    isAvailable: AssessmentStorage.isAvailable,
  };
};