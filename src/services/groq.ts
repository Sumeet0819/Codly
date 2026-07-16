import type { GenerateProblemRequest, Problem } from "../types/domain";
import { createFallbackProblem, defaultStarterCode } from "../utils/problemFactory";
import { createId } from "../utils/id";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const extractJson = (content: string): unknown => {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? content;
  const first = candidate.indexOf("{");
  const last = candidate.lastIndexOf("}");
  if (first < 0 || last < first) throw new Error("AI response did not contain JSON");
  return JSON.parse(candidate.slice(first, last + 1));
};

const normalizeProblem = (raw: unknown, request: GenerateProblemRequest): Problem => {
  const data = raw as Partial<Problem>;
  return {
    ...createFallbackProblem(request),
    ...data,
    id: createId("problem"),
    difficulty: request.difficulty,
    topic: request.topic,
    starterCode: { ...defaultStarterCode, ...(data.starterCode ?? {}) },
    publicTestCases: (data.publicTestCases ?? []).map((test) => ({ ...test, id: test.id || createId("tc") })),
    hiddenTestCases: (data.hiddenTestCases ?? []).map((test) => ({ ...test, id: test.id || createId("tc"), hidden: true })),
    createdAt: new Date().toISOString(),
    source: "ai",
  };
};

export const generateProblemWithGroq = async (request: GenerateProblemRequest): Promise<Problem> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  if (!apiKey) return createFallbackProblem(request);

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: import.meta.env.VITE_GROQ_MODEL || "llama-3.1-70b-versatile",
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content:
            "You create rigorous DSA coding problems. Return only strict JSON matching the requested schema. Do not include markdown.",
        },
        {
          role: "user",
          content: `Create a ${request.difficulty} ${request.topic} DSA problem for ${request.language}.
Custom prompt: ${request.customPrompt || "No custom prompt"}
Schema: {
  "title": string,
  "description": string,
  "examples": [{"input": string, "output": string, "explanation": string}],
  "constraints": string[],
  "notes": string,
  "starterCode": {"javascript": string, "typescript": string, "python": string, "java": string, "cpp": string, "c": string, "csharp": string, "go": string, "kotlin": string, "rust": string},
  "publicTestCases": [{"input": string, "expectedOutput": string}],
  "hiddenTestCases": [{"input": string, "expectedOutput": string}],
  "solution": string,
  "explanation": string,
  "complexity": {"time": string, "space": string},
  "tags": string[]
}`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Groq request failed with ${response.status}`);
  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq response was empty");
  return normalizeProblem(extractJson(content), request);
};

export const generateHintWithGroq = async (problem: Problem, level: number): Promise<string> => {
  const fallbackHints = [
    `Focus on the ${problem.topic.toLowerCase()} pattern before writing code.`,
    "Define the state you need to track while scanning the input.",
    "Prove why each element is processed only the necessary number of times.",
    "Sketch pseudocode with input parsing, core transition, and output formatting.",
  ];

  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  if (!apiKey) return fallbackHints[level - 1] ?? fallbackHints[0];

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: import.meta.env.VITE_GROQ_MODEL || "llama-3.1-70b-versatile",
      temperature: 0.25,
      messages: [
        {
          role: "system",
          content:
            "Create progressive DSA hints. Do not reveal full code or the complete final answer. Keep it concise.",
        },
        {
          role: "user",
          content: `Problem: ${problem.title}\n${problem.description}\nHint level ${level}.`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Groq hint failed with ${response.status}`);
  const json = await response.json();
  return json.choices?.[0]?.message?.content?.trim() || fallbackHints[level - 1] || fallbackHints[0];
};
