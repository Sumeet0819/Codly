import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Problem } from "../types/domain";
import { commonApiService } from "../services/commonApiService";

export interface ProblemState {
  problems: Problem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  generationStatus: "idle" | "loading" | "succeeded" | "failed";
  generationError?: string;
}

const initialState: ProblemState = {
  problems: [],
  status: "idle",
  generationStatus: "idle",
};

const mapProblemId = (problem: any): Problem => {
  return {
    ...problem,
    id: problem._id || problem.id
  };
}

export const fetchProblems = createAsyncThunk("problems/fetchProblems", async () => {
  const data = await commonApiService.get<Problem[]>("/problems");
  return data.map(mapProblemId);
});

export const fetchProblemById = createAsyncThunk("problems/fetchProblemById", async (id: string) => {
  const data = await commonApiService.get<Problem>(`/problems/${id}`);
  return mapProblemId(data);
});

export const persistProblem = createAsyncThunk("problems/persistProblem", async (problem: Partial<Problem>) => {
  const data = await commonApiService.post<Problem>("/problems", problem);
  return mapProblemId(data);
});

export const deleteProblem = createAsyncThunk("problems/deleteProblem", async (id: string) => {
  await commonApiService.delete(`/problems/${id}`);
  return id;
});

const problemSlice = createSlice({
  name: "problems",
  initialState,
  reducers: {
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchProblems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.problems = action.payload;
      })
      .addCase(fetchProblems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchProblemById.fulfilled, (state, action) => {
        const index = state.problems.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.problems[index] = action.payload;
        } else {
          state.problems.push(action.payload);
        }
      })
      .addCase(persistProblem.pending, (state) => {
        state.generationStatus = "loading";
        state.generationError = undefined;
      })
      .addCase(persistProblem.fulfilled, (state, action) => {
        state.generationStatus = "succeeded";
        state.problems.unshift(action.payload);
      })
      .addCase(persistProblem.rejected, (state, action) => {
        state.generationStatus = "failed";
        state.generationError = action.error.message;
      })
      .addCase(deleteProblem.fulfilled, (state, action) => {
        state.problems = state.problems.filter((p) => p.id !== action.payload);
      });
  },
});

export const { markProblemSolved, setGenerationStatus } = problemSlice.actions;
export default problemSlice.reducer;
