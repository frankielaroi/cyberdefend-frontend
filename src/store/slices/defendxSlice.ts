import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Assessment, Question, AssessmentResponse } from '../../types';

interface DefendXState {
  currentAssessment: Assessment | null;
  currentQuestions: Question[];
  responses: AssessmentResponse[];
  currentQuestionIndex: number;
  isSubmitting: boolean;
  assessmentStarted: boolean;
  lastSavedAt?: string;
  autoSaveEnabled: boolean;
}

const initialState: DefendXState = {
  currentAssessment: null,
  currentQuestions: [],
  responses: [],
  currentQuestionIndex: 0,
  isSubmitting: false,
  assessmentStarted: false,
  autoSaveEnabled: true,
};

const defendxSlice = createSlice({
  name: 'defendx',
  initialState,
  reducers: {
    // Set current assessment (after creating or fetching)
    setCurrentAssessment: (state, action: PayloadAction<Assessment>) => {
      state.currentAssessment = action.payload;
      state.assessmentStarted = action.payload.status === 'IN_PROGRESS';
    },
    
    // Load assessment with questions (new flow)
    loadAssessmentWithQuestions: (state, action: PayloadAction<{ 
      assessment: Assessment; 
      questions: Question[];
      existingResponses?: AssessmentResponse[];
    }>) => {
      state.currentAssessment = action.payload.assessment;
      state.currentQuestions = action.payload.questions;
      state.responses = action.payload.existingResponses || [];
      state.assessmentStarted = action.payload.assessment.status === 'IN_PROGRESS';
      // Set current question index to first unanswered question
      const answeredQuestionIds = new Set(state.responses.map(r => r.questionId));
      state.currentQuestionIndex = state.currentQuestions.findIndex(q => !answeredQuestionIds.has(q.id));
      if (state.currentQuestionIndex === -1) {
        state.currentQuestionIndex = state.currentQuestions.length - 1;
      }
    },

    // Legacy support - kept for backward compatibility
    startAssessment: (state, action: PayloadAction<{ assessment: Assessment; questions: Question[] }>) => {
      state.currentAssessment = action.payload.assessment;
      state.currentQuestions = action.payload.questions;
      state.responses = [];
      state.currentQuestionIndex = 0;
      state.assessmentStarted = true;
    },

    answerQuestion: (state, action: PayloadAction<AssessmentResponse>) => {
      const existingIndex = state.responses.findIndex(
        (r) => r.questionId === action.payload.questionId
      );
      if (existingIndex >= 0) {
        state.responses[existingIndex] = action.payload;
      } else {
        state.responses.push(action.payload);
      }
    },

    // Bulk update responses (for when loading saved progress)
    updateResponses: (state, action: PayloadAction<AssessmentResponse[]>) => {
      state.responses = action.payload;
    },

    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.currentQuestions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },

    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },

    setQuestionIndex: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },

    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },

    // New actions for assessment lifecycle
    markAssessmentStarted: (state) => {
      state.assessmentStarted = true;
      if (state.currentAssessment) {
        state.currentAssessment.status = 'IN_PROGRESS';
      }
    },

    markAssessmentCompleted: (state) => {
      if (state.currentAssessment) {
        state.currentAssessment.status = 'COMPLETED';
        state.currentAssessment.completedAt = new Date().toISOString();
      }
    },

    setAutoSave: (state, action: PayloadAction<boolean>) => {
      state.autoSaveEnabled = action.payload;
    },

    markLastSaved: (state) => {
      state.lastSavedAt = new Date().toISOString();
    },

    clearAssessment: (state) => {
      state.currentAssessment = null;
      state.currentQuestions = [];
      state.responses = [];
      state.currentQuestionIndex = 0;
      state.isSubmitting = false;
      state.assessmentStarted = false;
      state.lastSavedAt = undefined;
    },
  },
});

export const {
  setCurrentAssessment,
  loadAssessmentWithQuestions,
  startAssessment,
  answerQuestion,
  updateResponses,
  nextQuestion,
  previousQuestion,
  setQuestionIndex,
  setSubmitting,
  markAssessmentStarted,
  markAssessmentCompleted,
  setAutoSave,
  markLastSaved,
  clearAssessment,
} = defendxSlice.actions;

export default defendxSlice.reducer;
