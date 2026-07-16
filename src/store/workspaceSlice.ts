import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SupportedLanguage, TestCase, WorkspaceState } from "../types/domain";
import { createId } from "../utils/id";

const initialState: WorkspaceState = {
  codeByProblemLanguage: {},
  customTestCasesByProblem: {},
  hintsByProblem: {},
  solveStartedAtByProblem: {},
};

const codeKey = (problemId: string, language: SupportedLanguage) => `${problemId}:${language}`;

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setActiveProblem: (state, action: PayloadAction<string>) => {
      state.activeProblemId = action.payload;
      state.solveStartedAtByProblem[action.payload] ??= new Date().toISOString();
    },
    updateCode: (
      state,
      action: PayloadAction<{ problemId: string; language: SupportedLanguage; code: string }>,
    ) => {
      state.codeByProblemLanguage[codeKey(action.payload.problemId, action.payload.language)] = action.payload.code;
    },
    addCustomTestCase: (state, action: PayloadAction<{ problemId: string }>) => {
      const list = state.customTestCasesByProblem[action.payload.problemId] ?? [];
      list.push({ id: createId("custom"), input: "", expectedOutput: "" });
      state.customTestCasesByProblem[action.payload.problemId] = list;
    },
    updateCustomTestCase: (
      state,
      action: PayloadAction<{ problemId: string; testCaseId: string; patch: Partial<TestCase> }>,
    ) => {
      const list = state.customTestCasesByProblem[action.payload.problemId] ?? [];
      const testCase = list.find((item) => item.id === action.payload.testCaseId);
      if (testCase) Object.assign(testCase, action.payload.patch);
    },
    removeCustomTestCase: (
      state,
      action: PayloadAction<{ problemId: string; testCaseId: string }>,
    ) => {
      state.customTestCasesByProblem[action.payload.problemId] = (
        state.customTestCasesByProblem[action.payload.problemId] ?? []
      ).filter((item) => item.id !== action.payload.testCaseId);
    },
    addHint: (state, action: PayloadAction<{ problemId: string; hint: string }>) => {
      const list = state.hintsByProblem[action.payload.problemId] ?? [];
      if (list.length < 4) list.push(action.payload.hint);
      state.hintsByProblem[action.payload.problemId] = list;
    },
  },
});

export const {
  setActiveProblem,
  updateCode,
  addCustomTestCase,
  updateCustomTestCase,
  removeCustomTestCase,
  addHint,
} = workspaceSlice.actions;
export const getCodeKey = codeKey;
export default workspaceSlice.reducer;
