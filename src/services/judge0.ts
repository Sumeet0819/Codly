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

const wrapCode = (language: SupportedLanguage, userCode: string): string => {
  // If the user manually includes the main method or wrapper, don't double-wrap
  if (userCode.includes("main(") || userCode.includes("sys.stdin") || userCode.includes("fs.readFileSync")) {
    return userCode;
  }

  switch (language) {
    case "javascript":
    case "typescript":
      return `${userCode}\n\nconst inputStr = require('fs').readFileSync(0, 'utf8').trim();\nlet parsedInput;\ntry { parsedInput = JSON.parse(inputStr); } catch(e) { parsedInput = inputStr; }\nconsole.log(solve(parsedInput));`;
    case "python":
      return `import sys\nimport ast\n\n${userCode}\n\nif __name__ == '__main__':\n    raw_input = sys.stdin.read().strip()\n    try:\n        parsed_input = ast.literal_eval(raw_input)\n    except (ValueError, SyntaxError):\n        parsed_input = raw_input\n    print(solve(parsed_input))`;
    case "java":
      return `import java.io.*;\nimport java.util.*;\n\npublic class Main {\n  public static void main(String[] args) throws Exception {\n    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n    StringBuilder input = new StringBuilder();\n    for (String line; (line = br.readLine()) != null;) input.append(line).append('\\n');\n    System.out.print(solve(input.toString().trim()));\n  }\n\n${userCode}\n}`;
    case "cpp":
      return `#include <bits/stdc++.h>\nusing namespace std;\n\n${userCode}\n\nint main() {\n  ios::sync_with_stdio(false);\n  cin.tie(nullptr);\n  string input((istreambuf_iterator<char>(cin)), istreambuf_iterator<char>());\n  cout << solve(input);\n  return 0;\n}`;
    case "c":
      return userCode;
    case "csharp":
      return `using System;\n\npublic class Program {\n  public static void Main() {\n    var input = Console.In.ReadToEnd();\n    Console.Write(Solve(input));\n  }\n\n${userCode}\n}`;
    case "go":
      return `package main\n\nimport (\n  "fmt"\n  "io"\n  "os"\n)\n\n${userCode}\n\nfunc main() {\n  data, _ := io.ReadAll(os.Stdin)\n  fmt.Print(solve(string(data)))\n}`;
    case "kotlin":
      return `import java.io.BufferedInputStream\n\n${userCode}\n\nfun main() {\n  val input = BufferedInputStream(System.\`in\`).readBytes().toString(Charsets.UTF_8)\n  print(solve(input))\n}`;
    case "rust":
      return `use std::io::{self, Read};\n\n${userCode}\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    print!("{}", solve(&input));\n}`;
    default:
      return userCode;
  }
};

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
    const payload = {
      source_code: wrapCode(language, code),
      language_id: langConfig.judge0Id,
      stdin: testCase.input || "",
      expected_output: testCase.expectedOutput || "",
    };
    console.log(`[Judge0 Request] Language: ${language}, TestCase: ${testCase.id}`);
    console.log(`[Judge0 Payload]:`, JSON.stringify(payload, null, 2));

    const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[Judge0 Error] Code execution request failed with status: ${response.status}`);
      const text = await response.text();
      console.error(`[Judge0 Error] Response text: ${text}`);
      throw new Error(`Code execution request failed with ${response.status}`);
    }
    const { token } = (await response.json()) as Judge0SubmissionResponse;
    console.log(`[Judge0 Submission] Token received: ${token}`);
    
    const result = await pollResult(token);
    console.log(`[Judge0 Result] Polled response for token ${token}:`, JSON.stringify(result, null, 2));
    
    const status = mapStatus(result, testCase.expectedOutput);
    console.log(`[Judge0 Status] Mapped status: ${status}, Expected: ${testCase.expectedOutput}, Actual: ${result.stdout}`);
    
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
    console.error(`[Judge0 Error] Exception during runSingle:`, error);
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
