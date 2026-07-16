import type { ExecutionResult, SubmissionStatus, SupportedLanguage, TestCase } from "../types/domain";
import { getLanguage } from "../types/languages";

interface Judge0Response {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  time?: string | null;
  memory?: number | null;
  status?: {
    id: number;
    description: string;
  };
}

const normalizeOutput = (value: string): string => value.replace(/\r\n/g, "\n").trim();

const mapStatus = (result: Judge0Response, expectedOutput: string): SubmissionStatus => {
  if (result.compile_output) return "Compilation Error";
  if (result.stderr || (result.status?.id && result.status.id > 4)) return "Runtime Error";
  return normalizeOutput(result.stdout ?? "") === normalizeOutput(expectedOutput) ? "Accepted" : "Wrong Answer";
};

const runSingle = async (
  language: SupportedLanguage,
  code: string,
  testCase: TestCase,
): Promise<ExecutionResult> => {
  const apiUrl = (import.meta.env.VITE_JUDGE0_API_URL as string | undefined) || "https://judge0-ce.p.rapidapi.com";
  const apiKey = import.meta.env.VITE_JUDGE0_API_KEY as string | undefined;
  const host = (import.meta.env.VITE_JUDGE0_RAPIDAPI_HOST as string | undefined) || "judge0-ce.p.rapidapi.com";

  if (!apiKey) {
    return {
      testCaseId: testCase.id,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: "",
      status: "Pending",
      error: "Judge0 API key is not configured. Add VITE_JUDGE0_API_KEY to .env to run remote code.",
    };
  }

  const response = await fetch(`${apiUrl}/submissions?base64_encoded=false&wait=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": host,
    },
    body: JSON.stringify({
      source_code: code,
      language_id: getLanguage(language).judge0Id,
      stdin: testCase.input,
      expected_output: testCase.expectedOutput,
    }),
  });

  if (!response.ok) throw new Error(`Judge0 request failed with ${response.status}`);
  const result = (await response.json()) as Judge0Response;
  const status = mapStatus(result, testCase.expectedOutput);
  return {
    testCaseId: testCase.id,
    input: testCase.input,
    expectedOutput: testCase.expectedOutput,
    actualOutput: result.stdout ?? "",
    status,
    runtimeMs: result.time ? Math.round(Number(result.time) * 1000) : undefined,
    memoryKb: result.memory ?? undefined,
    error: result.compile_output ?? result.stderr ?? undefined,
  };
};

export const runCode = async (
  language: SupportedLanguage,
  code: string,
  testCases: TestCase[],
): Promise<ExecutionResult[]> => Promise.all(testCases.map((testCase) => runSingle(language, code, testCase)));
