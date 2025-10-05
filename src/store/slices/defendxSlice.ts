import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Assessment, Question, AssessmentResponse } from '../../types';

interface DefendXState {
  currentAssessment: Assessment | null;
  currentQuestions: Question[];
  responses: AssessmentResponse[];
  currentQuestionIndex: number;
  isSubmitting: boolean;
}

const initialState: DefendXState = {
  currentAssessment: null,
  currentQuestions: [],
  responses: [],
  currentQuestionIndex: 0,
  isSubmitting: false,
};

const defendxSlice = createSlice({
  name: 'defendx',
  initialState,
  reducers: {
    startAssessment: (state, action: PayloadAction<{ assessment: Assessment; questions: Question[] }>) => {
      state.currentAssessment = action.payload.assessment;
      state.currentQuestions = action.payload.questions;
      state.responses = [];
      state.currentQuestionIndex = 0;
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
    clearAssessment: (state) => {
      state.currentAssessment = null;
      state.currentQuestions = [];
      state.responses = [];
      state.currentQuestionIndex = 0;
      state.isSubmitting = false;
    },
  },
});

export const {
  startAssessment,
  answerQuestion,
  nextQuestion,
  previousQuestion,
  setQuestionIndex,
  setSubmitting,
  clearAssessment,
} = defendxSlice.actions;

export default defendxSlice.reducer;
