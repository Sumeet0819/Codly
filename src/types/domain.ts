export type Difficulty = "Easy" | "Medium" | "Hard";

export type Topic =
  | "Arrays"
  | "Strings"
  | "Linked Lists"
  | "Trees"
  | "Graphs"
  | "Heap"
  | "Stack"
  | "Queue"
  | "Binary Search"
  | "Dynamic Programming"
  | "Backtracking"
  | "Greedy";

export type SupportedLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "c"
  | "csharp"
  | "go"
  | "kotlin"
  | "rust";

export type SubmissionStatus =
  | "Accepted"
  | "Wrong Answer"
  | "Runtime Error"
  | "Compilation Error"
  | "Pending";

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  id: string;
  _id?: string;
  input: string;
  expectedOutput: string;
  hidden?: boolean;
}

export interface StarterCodeMap {
  [language: string]: string;
}

export interface Problem {
  id: string;
  _id?: string;
  title: string;
  difficulty: Difficulty;
  topic: Topic;
  tags: string[];
  description: string;
  examples: Example[];
  constraints: string[];
  notes?: string;
  methodName?: string;
  starterCode: StarterCodeMap;
  publicTestCases: TestCase[];
  hiddenTestCases: TestCase[];
  solution?: string;
  explanation?: string;
  complexity?: {
    time: string;
    space: string;
  };
  createdAt: string;
  solvedAt?: string;
  source: "ai" | "seed";
}

export interface ExecutionResult {
  testCaseId: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  status: SubmissionStatus;
  runtimeMs?: number;
  memoryKb?: number;
  error?: string;
}

export interface Submission {
  id: string;
  _id?: string;
  problemId: string;
  problemTitle: string;
  language: SupportedLanguage;
  status: SubmissionStatus;
  code: string;
  results: ExecutionResult[];
  runtimeMs?: number;
  memoryKb?: number;
  solveTimeSeconds: number;
  createdAt: string;
}

export interface RecentActivity {
  id: string;
  problemId: string;
  title: string;
  status: SubmissionStatus;
  solveTimeSeconds: number;
  language: SupportedLanguage;
  createdAt: string;
}

export interface UserStats {
  questionsSolved: number;
  totalAttempts: number;
  acceptedSubmissions: number;
  failedSubmissions: number;
  accuracy: number;
  dailyStreak: number;
  longestStreak: number;
  averageSolveTimeSeconds: number;
  favoriteLanguage: SupportedLanguage;
  activityByDay: Record<string, number>;
}

export interface EditorPreferences {
  theme: "vs-dark" | "light" | "hc-black";
  fontSize: number;
  tabSize: number;
  wordWrap: "on" | "off";
  autosave: boolean;
  terminalHeight: number;
  defaultLanguage: SupportedLanguage;
}

export interface WorkspaceState {
  activeProblemId?: string;
  codeByProblemLanguage: Record<string, string>;
  customTestCasesByProblem: Record<string, TestCase[]>;
  hintsByProblem: Record<string, string[]>;
  solveStartedAtByProblem: Record<string, string>;
}

export interface GenerateProblemRequest {
  difficulty: Difficulty;
  topic: Topic;
  language: SupportedLanguage;
  customPrompt: string;
}
