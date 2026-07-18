import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Submission, TestCase, SupportedLanguage } from "../types/domain";
import { commonApiService } from "../services/commonApiService";

export interface SubmissionState {
  submissions: Submission[];
  lastRunByProblem: Record<string, Submission>;
  executionStatus: "idle" | "loading" | "succeeded" | "failed";
  fetchStatus: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
}

const initialState: SubmissionState = {
  submissions: [],
  lastRunByProblem: {},
  executionStatus: "idle",
  fetchStatus: "idle",
};

const mapSubmissionId = (sub: any): Submission => ({
  ...sub,
  id: sub._id || sub.id
});

export const fetchSubmissions = createAsyncThunk(
  "submissions/fetchSubmissions",
  async (problemId?: string) => {
    const url = problemId ? `/submissions/${problemId}` : "/submissions";
    const data = await commonApiService.get<Submission[]>(url);
    return data.map(mapSubmissionId);
  }
);

interface ExecutePayload {
  problemId?: string;
  language: SupportedLanguage;
  code: string;
  customTestCases?: TestCase[];
  shouldSubmit?: boolean;
  solveTimeSeconds?: number;
  methodName?: string;
}

export const executeCode = createAsyncThunk(
  "submissions/executeCode",
  async (payload: ExecutePayload) => {
    const data = await commonApiService.post<any>("/submissions/execute", payload);
    if (data._id || data.id) {
      return { isSubmission: true as const, data: mapSubmissionId(data), shouldSubmit: payload.shouldSubmit };
    }
    return { isSubmission: false as const, data, problemId: payload.problemId };
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubmissions.pending, (state) => {
        state.fetchStatus = "loading";
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.submissions = action.payload;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(executeCode.pending, (state) => {
        state.executionStatus = "loading";
        state.error = undefined;
      })
      .addCase(executeCode.fulfilled, (state, action) => {
        state.executionStatus = "succeeded";
        const result = action.payload;
        if (result.isSubmission) {
          if (result.shouldSubmit) {
            state.submissions.unshift(result.data);
          }
          if (result.data.problemId) {
            state.lastRunByProblem[result.data.problemId] = result.data;
          }
        }
      })
      .addCase(executeCode.rejected, (state, action) => {
        state.executionStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export const { recordRun, recordSubmission } = submissionSlice.actions;
export default submissionSlice.reducer;
