import type { GenerateProblemRequest, Problem, StarterCodeMap } from "../types/domain";
import { createId } from "./id";

export const defaultStarterCode: StarterCodeMap = {
  javascript: "function solve(input) {\n  // Write your solution here\n  return \"\";\n}\n\nconsole.log(solve(require('fs').readFileSync(0, 'utf8')));",
  typescript: "function solve(input: string): string {\n  // Write your solution here\n  return \"\";\n}\n\nconsole.log(solve(require('fs').readFileSync(0, 'utf8')));",
  python: "import sys\n\ndef solve(data: str) -> str:\n    # Write your solution here\n    return \"\"\n\nprint(solve(sys.stdin.read()))",
  java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n  public static void main(String[] args) throws Exception {\n    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n    StringBuilder input = new StringBuilder();\n    for (String line; (line = br.readLine()) != null;) input.append(line).append('\\n');\n    System.out.print(solve(input.toString()));\n  }\n\n  static String solve(String input) {\n    return \"\";\n  }\n}",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nstring solve(const string& input) {\n  return \"\";\n}\n\nint main() {\n  ios::sync_with_stdio(false);\n  cin.tie(nullptr);\n  string input((istreambuf_iterator<char>(cin)), istreambuf_iterator<char>());\n  cout << solve(input);\n  return 0;\n}",
  c: "#include <stdio.h>\n\nint main(void) {\n  // Write your solution here\n  return 0;\n}",
  csharp: "using System;\n\npublic class Program {\n  public static void Main() {\n    var input = Console.In.ReadToEnd();\n    Console.Write(Solve(input));\n  }\n\n  static string Solve(string input) => \"\";\n}",
  go: "package main\n\nimport (\n  \"fmt\"\n  \"io\"\n  \"os\"\n)\n\nfunc solve(input string) string {\n  return \"\"\n}\n\nfunc main() {\n  data, _ := io.ReadAll(os.Stdin)\n  fmt.Print(solve(string(data)))\n}",
  kotlin: "import java.io.BufferedInputStream\n\nfun solve(input: String): String = \"\"\n\nfun main() {\n  val input = BufferedInputStream(System.`in`).readBytes().toString(Charsets.UTF_8)\n  print(solve(input))\n}",
  rust: "use std::io::{self, Read};\n\nfn solve(input: &str) -> String {\n    String::new()\n}\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    print!(\"{}\", solve(&input));\n}",
};

export const createFallbackProblem = (request: GenerateProblemRequest): Problem => {
  const id = createId("problem");
  return {
    id,
    title: `${request.topic} Pattern Challenge`,
    difficulty: request.difficulty,
    topic: request.topic,
    tags: [request.topic, request.difficulty, "Generated Draft"],
    description:
      request.customPrompt.trim() ||
      `Given an input stream, design an efficient algorithm using ${request.topic.toLowerCase()} techniques. Return the requested value for each case.`,
    examples: [
      {
        input: "5\n1 2 3 4 5",
        output: "15",
        explanation: "The sample expects the aggregate value from the provided sequence.",
      },
    ],
    constraints: ["1 <= n <= 10^5", "Input values fit in 32-bit signed integers", "Target O(n log n) or better"],
    notes: "This local fallback was created because the AI response was unavailable or malformed.",
    starterCode: defaultStarterCode,
    publicTestCases: [
      { id: createId("tc"), input: "5\n1 2 3 4 5", expectedOutput: "15" },
      { id: createId("tc"), input: "3\n10 -4 8", expectedOutput: "14" },
    ],
    hiddenTestCases: [
      { id: createId("tc"), input: "1\n42", expectedOutput: "42", hidden: true },
      { id: createId("tc"), input: "4\n0 0 0 0", expectedOutput: "0", hidden: true },
    ],
    solution: "Parse the sequence and compute the requested aggregate in a single pass.",
    explanation: "Use the input constraints to select a linear or near-linear algorithm and avoid unnecessary nested loops.",
    complexity: { time: "O(n)", space: "O(1)" },
    createdAt: new Date().toISOString(),
    source: "ai",
  };
};
