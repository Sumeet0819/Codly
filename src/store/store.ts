import { combineReducers, configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./dashboardSlice";
import problemReducer from "./problemSlice";
import settingsReducer from "./settingsSlice";
import submissionReducer from "./submissionSlice";
import workspaceReducer from "./workspaceSlice";
import { loadJson, saveJson } from "../utils/storage";

const STORAGE_KEY = "dsa-studio-ai-state";

const rootReducer = combineReducers({
  dashboard: dashboardReducer,
  problems: problemReducer,
  settings: settingsReducer,
  submissions: submissionReducer,
  workspace: workspaceReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const savedState = loadJson<Partial<RootState>>(STORAGE_KEY, {});
const preloadedState = {
  ...savedState,
  problems: undefined,
  submissions: undefined,
};

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: preloadedState as any,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

store.subscribe(() => {
  const state = store.getState();
  saveJson(STORAGE_KEY, {
    dashboard: state.dashboard,
    settings: state.settings,
    workspace: state.workspace,
  });
});

export type AppDispatch = typeof store.dispatch;
