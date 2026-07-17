import type { ExecutionResult, SubmissionStatus, SupportedLanguage, TestCase } from "../types/domain";
import { getLanguage } from "../types/languages";

interface WandboxResponse {
  status: string;
  signal: string;
  compiler_output: string;
  compiler_error: string;
  compiler_message: string;
  program_output: string;
  program_error: string;
  program_message: string;
  permlink: string;
  url: string;
}

const normalizeOutput = (value: string): string => value.replace(/\r\n/g, "\n").trim();

const mapStatus = (result: WandboxResponse, expectedOutput: string): SubmissionStatus => {
  if (result.compiler_error) return "Compilation Error";
  if (result.program_error || result.status !== "0") return "Runtime Error";
  return normalizeOutput(result.program_output ?? "") === normalizeOutput(expectedOutput) ? "Accepted" : "Wrong Answer";
};

const runSingle = async (
  language: SupportedLanguage,
  code: string,
  testCase: TestCase,
): Promise<ExecutionResult> => {
  const langConfig = getLanguage(language);
  
  // fallback for unsupported languages (like Kotlin which we removed compiler ID for)
  if (!langConfig.wandboxId) {
    return {
      testCaseId: testCase.id,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: "",
      status: "Compilation Error",
      error: `Language ${langConfig.label} is currently not supported by the free execution engine.`,
    };
  }

  const response = await fetch("https://wandbox.org/api/compile.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      compiler: langConfig.wandboxId,
      code: code,
      stdin: testCase.input || "",
    }),
  });

  if (!response.ok) throw new Error(`Code execution request failed with ${response.status}`);
  const result = (await response.json()) as WandboxResponse;
  
  const status = mapStatus(result, testCase.expectedOutput);
  
  return {
    testCaseId: testCase.id,
    input: testCase.input,
    expectedOutput: testCase.expectedOutput,
    actualOutput: result.program_output ?? "",
    status,
    runtimeMs: undefined, // Wandbox doesn't return exact runtime in ms in this endpoint
    memoryKb: undefined,
    error: result.compiler_error || result.program_error || undefined,
  };
};

export const runCode = async (
  language: SupportedLanguage,
  code: string,
  testCases: TestCase[],
): Promise<ExecutionResult[]> => Promise.all(testCases.map((testCase) => runSingle(language, code, testCase)));
