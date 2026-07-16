import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { EditorPreferences, SupportedLanguage } from "../types/domain";

export const defaultSettings: EditorPreferences = {
  theme: "vs-dark",
  fontSize: 14,
  tabSize: 2,
  wordWrap: "on",
  autosave: true,
  terminalHeight: 34,
  defaultLanguage: "javascript",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState: defaultSettings,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<EditorPreferences>>) => ({
      ...state,
      ...action.payload,
    }),
    setDefaultLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      state.defaultLanguage = action.payload;
    },
  },
});

export const { updateSettings, setDefaultLanguage } = settingsSlice.actions;
export default settingsSlice.reducer;
