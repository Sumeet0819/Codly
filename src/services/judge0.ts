import type { ExecutionResult, SubmissionStatus, SupportedLanguage, TestCase } from "../types/domain";
import { getLanguage } from "../types/languages";

interface Judge0SubmissionResponse {
  token: string;
}

interface Judge0ResultResponse {
  stdout: string | null;
  time: string | null;
  memory: number | null;
  stderr: string | null;
  token: string;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
}

const normalizeOutput = (value: string): string => value.replace(/\r\n/g, "\n").trim();

const mapStatus = (result: Judge0ResultResponse, expectedOutput: string): SubmissionStatus => {
  // Judge0 status IDs:
  // 3: Accepted, 4: Wrong Answer, 5: Time Limit Exceeded, 6: Compilation Error, 7-12: Runtime Errors
  if (result.status.id === 6) return "Compilation Error";
  if (result.status.id > 4) return "Runtime Error";
  
  const actualOutput = result.stdout || "";
  return normalizeOutput(actualOutput) === normalizeOutput(expectedOutput) ? "Accepted" : "Wrong Answer";
};

const pollResult = async (token: string): Promise<Judge0ResultResponse> => {
  const maxAttempts = 15;
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`https://ce.judge0.com/submissions/${token}?base64_encoded=false`);
    if (!response.ok) throw new Error(`Failed to fetch result with ${response.status}`);
    const result = (await response.json()) as Judge0ResultResponse;
    
    // Status 1: In Queue, 2: Processing
    if (result.status.id > 2) {
      return result;
    }
    
    // Wait before polling again
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("Execution timed out");
};

const runSingle = async (
  language: SupportedLanguage,
  code: string,
  testCase: TestCase,
): Promise<ExecutionResult> => {
  const langConfig = getLanguage(language);

  try {
    const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_code: code,
        language_id: langConfig.judge0Id,
        stdin: testCase.input || "",
        expected_output: testCase.expectedOutput || "",
      }),
    });

    if (!response.ok) throw new Error(`Code execution request failed with ${response.status}`);
    const { token } = (await response.json()) as Judge0SubmissionResponse;
    
    const result = await pollResult(token);
    const status = mapStatus(result, testCase.expectedOutput);
    
    return {
      testCaseId: testCase.id,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: result.stdout || "",
      status,
      runtimeMs: result.time ? Math.floor(parseFloat(result.time) * 1000) : undefined,
      memoryKb: result.memory || undefined,
      error: result.stderr || result.compile_output || result.message || undefined,
    };
  } catch (error: any) {
    return {
      testCaseId: testCase.id,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: "",
      status: "Runtime Error",
      error: error.message || "Unknown error",
    };
  }
};

export const runCode = async (
  language: SupportedLanguage,
  code: string,
  testCases: TestCase[],
): Promise<ExecutionResult[]> => {
  // Process sequentially to avoid rate limiting from Judge0 CE
  const results: ExecutionResult[] = [];
  for (const testCase of testCases) {
    results.push(await runSingle(language, code, testCase));
    await new Promise((r) => setTimeout(r, 500));
  }
  return results;
};
