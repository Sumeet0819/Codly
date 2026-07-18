import { Request, Response } from 'express';
import { Problem } from '../models/Problem';
import { Submission } from '../models/Submission';
import axios from 'axios';

const LANGUAGE_MAP: Record<string, number> = {
  javascript: 102,
  typescript: 101,
  python: 113,
  java: 91,
  cpp: 105,
  c: 103,
  csharp: 51,
  go: 107,
  kotlin: 111,
  rust: 108
};

const wrapCode = (language: string, userCode: string): string => {
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

const pollJudge0 = async (token: string) => {
  for (let i = 0; i < 15; i++) {
    const { data } = await axios.get(`https://ce.judge0.com/submissions/${token}?base64_encoded=false`);
    if (data.status.id > 2) return data;
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error("Execution timed out");
};

export const executeCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId, language, code, customTestCases, shouldSubmit, solveTimeSeconds } = req.body;
    
    let testCases = customTestCases || [];
    let problemTitle = "Custom Run";

    if (problemId) {
      const problem = await Problem.findById(problemId);
      if (!problem) { res.status(404).json({ error: 'Problem not found' }); return; }
      problemTitle = problem.title;
      if (!customTestCases || customTestCases.length === 0) {
        testCases = shouldSubmit ? [...problem.publicTestCases, ...problem.hiddenTestCases] : problem.publicTestCases;
      }
    }

    const languageId = LANGUAGE_MAP[language] || 113; // default python
    const wrappedCode = wrapCode(language, code);
    const results = [];

    for (const tc of testCases) {
      const payload = {
        source_code: wrappedCode,
        language_id: languageId,
        stdin: tc.input || "",
        expected_output: tc.expectedOutput || ""
      };

      const { data: { token } } = await axios.post("https://ce.judge0.com/submissions?base64_encoded=false", payload);
      const result = await pollJudge0(token);
      
      let status = "Runtime Error";
      if (result.status.id === 6) status = "Compilation Error";
      else if (result.status.id === 3) status = "Accepted"; // Judge0 accepted, but we do manual diff
      
      const actualOutput = result.stdout || "";
      if (result.status.id <= 4) {
        status = normalizeOutput(actualOutput) === normalizeOutput(tc.expectedOutput || "") ? "Accepted" : "Wrong Answer";
      }

      results.push({
        testCaseId: tc.id || tc._id || "custom",
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput,
        status,
        runtimeMs: result.time ? Math.floor(parseFloat(result.time) * 1000) : 0,
        memoryKb: result.memory || 0,
        error: result.stderr || result.compile_output || result.message || ""
      });
      
      await new Promise(r => setTimeout(r, 500)); // rate limit protection
    }

    const aggregateStatus = results.length === 0 ? "Pending" 
      : results.every(r => r.status === "Accepted") ? "Accepted" 
      : results.find(r => r.status !== "Accepted")?.status || "Wrong Answer";

    let savedSubmission = null;
    if (problemId) {
      const maxRuntime = Math.max(...results.map(r => r.runtimeMs), 0);
      const maxMemory = Math.max(...results.map(r => r.memoryKb), 0);
      
      const submission = new Submission({
        problemId,
        problemTitle,
        language,
        status: aggregateStatus,
        code,
        results,
        runtimeMs: maxRuntime,
        memoryKb: maxMemory,
        solveTimeSeconds: solveTimeSeconds || 0
      });
      savedSubmission = await submission.save();

      if (shouldSubmit && aggregateStatus === "Accepted") {
        await Problem.findByIdAndUpdate(problemId, { solvedAt: new Date() });
      }
    }

    res.json(savedSubmission || { status: aggregateStatus, results });
  } catch (err: any) {
    console.error("Execution error:", err);
    res.status(500).json({ error: err.message || "Failed to execute code" });
  }
};

export const getSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissions = await Submission.find({ problemId: req.params.problemId }).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
