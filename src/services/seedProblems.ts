import type { Problem } from "../types/domain";
import { defaultStarterCode } from "../utils/problemFactory";

export const seedProblems: Problem[] = [
  {
    id: "seed_two_sum",
    title: "Pair Sum Index",
    difficulty: "Easy",
    topic: "Arrays",
    tags: ["Hash Map", "Arrays", "One Pass"],
    description:
      "Given an array of integers and a target value, return the indices of two distinct elements whose sum is equal to the target. The input format is: n, then n integers, then the target.",
    examples: [
      {
        input: "4\n2 7 11 15\n9",
        output: "0 1",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9.",
      },
      {
        input: "3\n3 2 4\n6",
        output: "1 2",
        explanation: "nums[1] + nums[2] = 6.",
      },
    ],
    constraints: ["2 <= n <= 100000", "-10^9 <= nums[i], target <= 10^9", "Exactly one valid answer exists"],
    notes: "Return the smaller index first.",
    starterCode: {
      ...defaultStarterCode,
      javascript:
        "function solve(input) {\n  const lines = input.trim().split(/\\n/);\n  const nums = lines[1].trim().split(/\\s+/).map(Number);\n  const target = Number(lines[2]);\n  // Write your solution here\n  return \"\";\n}\n\nconsole.log(solve(require('fs').readFileSync(0, 'utf8')));",
      python:
        "import sys\n\ndef solve(data: str) -> str:\n    lines = data.strip().splitlines()\n    nums = list(map(int, lines[1].split()))\n    target = int(lines[2])\n    # Write your solution here\n    return \"\"\n\nprint(solve(sys.stdin.read()))",
    },
    publicTestCases: [
      { id: "seed_two_sum_public_1", input: "4\n2 7 11 15\n9", expectedOutput: "0 1" },
      { id: "seed_two_sum_public_2", input: "3\n3 2 4\n6", expectedOutput: "1 2" },
    ],
    hiddenTestCases: [
      { id: "seed_two_sum_hidden_1", input: "5\n1 5 8 12 15\n20", expectedOutput: "2 3", hidden: true },
      { id: "seed_two_sum_hidden_2", input: "2\n-3 4\n1", expectedOutput: "0 1", hidden: true },
    ],
    solution: "Store each seen value with its index. For each current value, check whether target - value has already appeared.",
    explanation:
      "A hash map converts the complement lookup from linear time to constant average time, so the array is scanned once.",
    complexity: { time: "O(n)", space: "O(n)" },
    createdAt: new Date().toISOString(),
    source: "seed",
  },
];
