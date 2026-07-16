import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RecentActivity, Submission, UserStats } from "../types/domain";
import { toDayKey } from "../utils/date";

export interface DashboardState {
  stats: UserStats;
  recentActivity: RecentActivity[];
}

const initialState: DashboardState = {
  stats: {
    questionsSolved: 0,
    totalAttempts: 0,
    acceptedSubmissions: 0,
    failedSubmissions: 0,
    accuracy: 0,
    dailyStreak: 0,
    longestStreak: 0,
    averageSolveTimeSeconds: 0,
    favoriteLanguage: "javascript",
    activityByDay: {},
  },
  recentActivity: [],
};

const recomputeStreak = (activityByDay: Record<string, number>): { dailyStreak: number; longestStreak: number } => {
  const days = Object.keys(activityByDay).sort();
  let longestStreak = 0;
  let rolling = 0;
  let previous = "";

  for (const day of days) {
    const diff = previous ? (new Date(day).getTime() - new Date(previous).getTime()) / 86_400_000 : 1;
    rolling = diff === 1 ? rolling + 1 : 1;
    longestStreak = Math.max(longestStreak, rolling);
    previous = day;
  }

  let dailyStreak = 0;
  const cursor = new Date();
  while (activityByDay[toDayKey(cursor)] > 0) {
    dailyStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { dailyStreak, longestStreak };
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    ingestSubmission: (state, action: PayloadAction<Submission>) => {
      const submission = action.payload;
      state.stats.totalAttempts += 1;
      if (submission.status === "Accepted") {
        state.stats.acceptedSubmissions += 1;
        if (!state.recentActivity.some((item) => item.problemId === submission.problemId && item.status === "Accepted")) {
          state.stats.questionsSolved += 1;
        }
      } else {
        state.stats.failedSubmissions += 1;
      }

      state.stats.accuracy = Math.round((state.stats.acceptedSubmissions / state.stats.totalAttempts) * 100);
      state.stats.averageSolveTimeSeconds = Math.round(
        (state.stats.averageSolveTimeSeconds * (state.stats.totalAttempts - 1) + submission.solveTimeSeconds) /
          state.stats.totalAttempts,
      );

      const day = toDayKey(submission.createdAt);
      state.stats.activityByDay[day] = (state.stats.activityByDay[day] ?? 0) + 1;
      Object.assign(state.stats, recomputeStreak(state.stats.activityByDay));

      const languageCounts = state.recentActivity.reduce<Record<string, number>>((acc, item) => {
        acc[item.language] = (acc[item.language] ?? 0) + 1;
        return acc;
      }, {});
      languageCounts[submission.language] = (languageCounts[submission.language] ?? 0) + 1;
      state.stats.favoriteLanguage = Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0][0] as UserStats["favoriteLanguage"];

      state.recentActivity.unshift({
        id: submission.id,
        problemId: submission.problemId,
        title: submission.problemTitle,
        status: submission.status,
        solveTimeSeconds: submission.solveTimeSeconds,
        language: submission.language,
        createdAt: submission.createdAt,
      });
      state.recentActivity = state.recentActivity.slice(0, 12);
    },
  },
});

export const { ingestSubmission } = dashboardSlice.actions;
export default dashboardSlice.reducer;
