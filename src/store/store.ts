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

const preloadedState = loadJson<Partial<RootState>>(STORAGE_KEY, {});

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

store.subscribe(() => {
  saveJson(STORAGE_KEY, store.getState());
});

export type AppDispatch = typeof store.dispatch;
