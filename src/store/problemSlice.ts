import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Problem } from "../types/domain";
import { seedProblems } from "../services/seedProblems";

export interface ProblemState {
  problems: Problem[];
  generationStatus: "idle" | "loading" | "succeeded" | "failed";
  generationError?: string;
}

const initialState: ProblemState = {
  problems: seedProblems,
  generationStatus: "idle",
};

const problemSlice = createSlice({
  name: "problems",
  initialState,
  reducers: {
    addProblem: (state, action: PayloadAction<Problem>) => {
      state.problems.unshift(action.payload);
      state.generationStatus = "succeeded";
      state.generationError = undefined;
    },
    markProblemSolved: (state, action: PayloadAction<{ problemId: string; solvedAt: string }>) => {
      const problem = state.problems.find((item) => item.id === action.payload.problemId);
      if (problem && !problem.solvedAt) {
        problem.solvedAt = action.payload.solvedAt;
      }
    },
    setGenerationStatus: (
      state,
      action: PayloadAction<{ status: ProblemState["generationStatus"]; error?: string }>,
    ) => {
      state.generationStatus = action.payload.status;
      state.generationError = action.payload.error;
    },
  },
});

export const { addProblem, markProblemSolved, setGenerationStatus } = problemSlice.actions;
export default problemSlice.reducer;
