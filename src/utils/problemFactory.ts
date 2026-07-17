import type { GenerateProblemRequest, Problem, StarterCodeMap } from "../types/domain";
import { createId } from "./id";

export const defaultStarterCode: StarterCodeMap = {
  javascript: "function solve(input) {\n  // Write your solution here\n  return \"\";\n}",
  typescript: "function solve(input: string): string {\n  // Write your solution here\n  return \"\";\n}",
  python: "def solve(data: str) -> str:\n    # Write your solution here\n    return \"\"",
  java: "static String solve(String input) {\n  // Write your solution here\n  return \"\";\n}",
  cpp: "string solve(const string& input) {\n  // Write your solution here\n  return \"\";\n}",
  c: "#include <stdio.h>\n\nint main(void) {\n  // Write your solution here\n  return 0;\n}",
  csharp: "static string Solve(string input) {\n  // Write your solution here\n  return \"\";\n}",
  go: "func solve(input string) string {\n  // Write your solution here\n  return \"\"\n}",
  kotlin: "fun solve(input: String): String {\n  // Write your solution here\n  return \"\"\n}",
  rust: "fn solve(input: &str) -> String {\n  // Write your solution here\n  String::new()\n}",
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
