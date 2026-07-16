import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Submission } from "../types/domain";

export interface SubmissionState {
  submissions: Submission[];
  lastRunByProblem: Record<string, Submission>;
}

const initialState: SubmissionState = {
  submissions: [],
  lastRunByProblem: {},
};

const submissionSlice = createSlice({
  name: "submissions",
  initialState,
  reducers: {
    recordRun: (state, action: PayloadAction<Submission>) => {
      state.lastRunByProblem[action.payload.problemId] = action.payload;
    },
    recordSubmission: (state, action: PayloadAction<Submission>) => {
      state.submissions.unshift(action.payload);
      state.lastRunByProblem[action.payload.problemId] = action.payload;
    },
  },
});

export const { recordRun, recordSubmission } = submissionSlice.actions;
export default submissionSlice.reducer;
