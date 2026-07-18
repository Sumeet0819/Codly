import Editor from "@monaco-editor/react";
import { BookOpen, Check, Lightbulb, Loader2, Play, Plus, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useParams, useLocation } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Button } from "../../components/ui/Button";
import { Field, inputClassName } from "../../components/ui/Field";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { addHint, addCustomTestCase, getCodeKey, removeCustomTestCase, setActiveProblem, updateCode, updateCustomTestCase } from "../../store/workspaceSlice";
import { ingestSubmission } from "../../store/dashboardSlice";
import { markProblemSolved, fetchProblems, deleteProblem } from "../../store/problemSlice";
import { executeCode, recordRun } from "../../store/submissionSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { ExecutionResult, Problem, Submission, SubmissionStatus, SupportedLanguage, TestCase } from "../../types/domain";
import { getLanguage, languageOptions } from "../../types/languages";
import { formatDateTime, formatDuration } from "../../utils/date";
import { createId } from "../../utils/id";
import { generateHintWithGroq } from "../../services/groq";

type MobileTab = "problem" | "editor" | "terminal";

function ProblemPanel({ problem, onHint, hintLoading }: { problem: Problem; onHint: () => void; hintLoading: boolean }) {
  const hints = useAppSelector((state) => state.workspace.hintsByProblem[problem.id] ?? []);
  const attempts = useAppSelector((state) => state.submissions.submissions.filter((item) => item.problemId === problem.id).slice(0, 6));

  return (
    <div className="h-full overflow-y-auto px-5 py-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-xl font-bold text-palette-light">{problem.title}</h1>
        {problem.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-palette-surface px-2.5 py-1 text-xs text-palette-muted">
            {tag}
          </span>
        ))}
      </div>

      <div className="prose prose-sm max-w-none prose-p:text-palette-light/90 prose-li:text-palette-light/90">
        <ReactMarkdown>{problem.description}</ReactMarkdown>
      </div>

      <div className="mt-6 grid gap-4">
        {problem.examples.map((example, index) => (
          <section key={`${example.input}-${index}`} className="rounded-lg bg-palette-surfaceHover border border-palette-border p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-palette-light">Example {index + 1}:</h2>
            <div className="text-sm text-palette-light font-mono">
              <span className="font-bold text-palette-teal">Input: </span>{example.input}
            </div>
            <div className="mt-2 text-sm text-palette-light font-mono">
              <span className="font-bold text-palette-teal">Output: </span>{example.output}
            </div>
            {example.explanation ? (
              <p className="mt-3 text-sm text-palette-muted">
                <span className="font-bold text-palette-light">Explanation: </span>
                {example.explanation}
              </p>
            ) : null}
          </section>
        ))}
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-bold text-palette-light">Constraints</h2>
        <ul className="grid gap-2 text-sm text-palette-light/90">
          {problem.constraints.map((constraint) => (
            <li key={constraint} className="rounded-lg bg-palette-surfaceHover px-3 py-2 font-mono text-xs shadow-sm">
              {constraint}
            </li>
          ))}
        </ul>
      </section>

      {problem.notes ? (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold text-palette-light">Notes</h2>
          <p className="text-sm text-palette-muted">{problem.notes}</p>
        </section>
      ) : null}

      <section className="mt-6">
        <Button onClick={onHint} disabled={hintLoading || hints.length >= 4} icon={hintLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}>
          {hints.length >= 4 ? "All Hints Shown" : `Hint ${hints.length + 1}`}
        </Button>
        <div className="mt-3 grid gap-3">
          {hints.map((hint, index) => (
            <div key={`${hint}-${index}`} className="rounded-md border border-accent-blue/30 bg-accent-blue/10 p-3 text-sm text-blue-100">
              <span className="mb-1 block text-xs font-semibold text-accent-blue">Hint {index + 1}</span>
              {hint}
            </div>
          ))}
        </div>
      </section>

      {problem.solvedAt ? (
        <section className="mt-6 rounded-lg bg-accent-green/10 p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-100">
            <BookOpen className="h-4 w-4" /> Editorial
          </h2>
          <div className="prose prose-invert prose-sm max-w-none prose-p:text-green-50/90">
            <ReactMarkdown>{problem.explanation ?? problem.solution ?? "No editorial was provided."}</ReactMarkdown>
          </div>
          {problem.complexity ? (
            <p className="mt-3 font-mono text-xs text-green-100/80">
              Time {problem.complexity.time} · Space {problem.complexity.space}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-bold text-palette-light">Previous Attempts</h2>
        {attempts.length === 0 ? (
          <p className="text-sm text-palette-muted">No submissions for this problem yet.</p>
        ) : (
          <div className="grid gap-2">
            {attempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between gap-3 rounded-lg bg-palette-surfaceHover p-3 shadow-sm">
                <div>
                  <div className="text-xs text-palette-muted">{formatDateTime(attempt.createdAt)}</div>
                  <div className="text-sm text-palette-light/90">{attempt.language} · {formatDuration(attempt.solveTimeSeconds)}</div>
                </div>
                <StatusBadge value={attempt.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TerminalPanel({
  publicTests,
  customTests,
  results,
  running,
  onAddCustom,
  onUpdateCustom,
  onRemoveCustom,
  onRunTest,
}: {
  publicTests: TestCase[];
  customTests: TestCase[];
  results?: Submission;
  running: boolean;
  onAddCustom: () => void;
  onUpdateCustom: (testCaseId: string, patch: Partial<TestCase>) => void;
  onRemoveCustom: (testCaseId: string) => void;
  onRunTest: (testCase: TestCase) => void;
}) {
  const [tab, setTab] = useState<"public" | "custom" | "output">("public");
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);

  const shownTests = tab === "public" ? publicTests : customTests;
  const activeTestIdx = Math.max(0, Math.min(activeTestCaseIndex, shownTests.length - 1));
  const activeOutputIdx = results ? Math.max(0, Math.min(activeTestCaseIndex, results.results.length - 1)) : 0;

  return (
    <div className="flex h-full flex-col bg-palette-terminal">
      <div className="flex min-h-12 items-center justify-between px-4 bg-palette-terminal border-b border-palette-terminalBorder">
        <div className="flex gap-6">
          {(["public", "custom", "output"] as const).map((item) => (
            <button
              key={item}
              onClick={() => {
                setTab(item);
                setActiveTestCaseIndex(0);
              }}
              className={`relative h-12 text-sm capitalize font-semibold transition-colors ${tab === item ? "text-palette-light" : "text-palette-muted hover:text-palette-light"}`}
            >
              {item === "public" ? "Testcases" : item === "custom" ? "Custom Cases" : "Test Result"}
              {tab === item && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-palette-teal rounded-t-full" />
              )}
            </button>
          ))}
        </div>
        {tab === "custom" ? (
          <Button variant="terminal" className="min-h-8 px-2" onClick={onAddCustom} icon={<Plus className="h-4 w-4" />}>
            Add
          </Button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === "output" ? (
          <div className="grid gap-3">
            {!results ? <p className="text-sm text-palette-muted">Run code to see console output, status, runtime, and errors.</p> : (
              <>
                <div className="flex gap-3 pb-2 pt-1 overflow-x-auto mt-2">
                  {results.results.map((r, i) => (
                    <button
                      key={r.testCaseId}
                      onClick={() => setActiveTestCaseIndex(i)}
                      className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors font-medium ${activeOutputIdx === i ? 'bg-palette-teal/10 text-palette-teal border border-palette-teal' : 'text-palette-muted hover:text-palette-light hover:bg-palette-terminalSurface border border-transparent'}`}
                    >
                      Case {i + 1}
                    </button>
                  ))}
                </div>
                {results.results[activeOutputIdx] && (() => {
                  const result = results.results[activeOutputIdx];
                  return (
                    <div className="mt-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex gap-4 text-xs font-medium text-palette-muted">
                          <span>Runtime: <span className="text-palette-terminalLight">{result.runtimeMs ?? 0}ms</span></span>
                          <span>Memory: <span className="text-palette-terminalLight">{result.memoryKb ?? 0}KB</span></span>
                        </div>
                        <StatusBadge value={result.status} />
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="grid gap-2">
                          <span className="text-[11px] font-bold text-palette-muted uppercase tracking-wider">Input</span>
                          <pre className="min-h-12 w-full rounded-md bg-[#2a2a2a] px-4 py-3 text-[13px] font-mono text-palette-terminalLight overflow-auto">{result.input}</pre>
                        </div>
                        <div className="grid gap-2">
                          <span className="text-[11px] font-bold text-palette-muted uppercase tracking-wider">Expected Output</span>
                          <pre className="min-h-12 w-full rounded-md bg-[#2a2a2a] px-4 py-3 text-[13px] font-mono text-palette-terminalLight overflow-auto">{result.expectedOutput}</pre>
                        </div>
                        {result.error ? (
                          <div className="grid gap-2 col-span-1 md:col-span-3">
                            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Console Error</span>
                            <pre className="min-h-12 w-full rounded-md bg-[#2a1a1a] border border-red-900/50 px-4 py-3 text-[13px] font-mono text-red-400 overflow-auto whitespace-pre-wrap">{result.error}</pre>
                          </div>
                        ) : (
                          <div className="grid gap-2">
                            <span className="text-[11px] font-bold text-palette-muted uppercase tracking-wider">Actual Output</span>
                            <pre className="min-h-12 w-full rounded-md bg-[#2a2a2a] px-4 py-3 text-[13px] font-mono text-palette-terminalLight overflow-auto">{result.actualOutput || "No output"}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {shownTests.length === 0 ? (
              <p className="rounded-lg bg-palette-terminalSurface p-4 text-sm text-palette-muted">No custom test cases yet.</p>
            ) : (
              <>
                <div className="flex gap-3 pb-2 pt-1 overflow-x-auto mt-2">
                  {shownTests.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTestCaseIndex(i)}
                      className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors font-medium ${activeTestIdx === i ? 'bg-palette-teal/10 text-palette-teal border border-palette-teal' : 'text-palette-muted hover:text-palette-light hover:bg-palette-terminalSurface border border-transparent'}`}
                    >
                      Case {i + 1}
                    </button>
                  ))}
                </div>
                {shownTests[activeTestIdx] && (() => {
                  const testCase = shownTests[activeTestIdx];
                  return (
                    <div className="mt-4">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm font-semibold text-palette-light">
                          {tab === "public" ? "Read-Only Test Case" : "Custom Test Case"}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="terminal" className="min-h-8 px-3 bg-palette-terminalSurface hover:bg-palette-terminalBorder text-palette-light font-medium rounded border-none transition-colors" onClick={() => onRunTest(testCase)} disabled={running} icon={<Play className="h-4 w-4" />}>
                            Run Case
                          </Button>
                          {tab === "custom" ? (
                            <Button className="min-h-8 px-3" variant="danger" onClick={() => {
                              onRemoveCustom(testCase.id);
                              setActiveTestCaseIndex(0);
                            }} icon={<Trash2 className="h-4 w-4" />} aria-label="Remove test case">
                              Delete
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-1">
                        <div className="grid gap-2">
                          <span className="text-[11px] font-bold text-palette-muted uppercase tracking-wider">Input</span>
                          {tab === "public" ? (
                            <pre className="min-h-12 w-full rounded-md bg-[#2a2a2a] px-4 py-3 text-[13px] font-mono text-palette-terminalLight overflow-auto">
                              {testCase.input}
                            </pre>
                          ) : (
                            <textarea
                              className="min-h-12 w-full rounded-md bg-[#2a2a2a] px-4 py-3 text-[13px] font-mono text-palette-terminalLight placeholder:text-palette-terminalLight/50 transition ring-0 focus-visible:ring-1 focus-visible:ring-palette-teal outline-none resize-y"
                              value={testCase.input}
                              onChange={(event) => onUpdateCustom(testCase.id, { input: event.target.value })}
                              placeholder="Enter test case input..."
                            />
                          )}
                        </div>
                        <div className="grid gap-2 mt-2">
                          <span className="text-[11px] font-bold text-palette-muted uppercase tracking-wider">Expected Output</span>
                          {tab === "public" ? (
                            <pre className="min-h-12 w-full rounded-md bg-[#2a2a2a] px-4 py-3 text-[13px] font-mono text-palette-terminalLight overflow-auto">
                              {testCase.expectedOutput}
                            </pre>
                          ) : (
                            <textarea
                              className="min-h-12 w-full rounded-md bg-[#2a2a2a] px-4 py-3 text-[13px] font-mono text-palette-terminalLight placeholder:text-palette-terminalLight/50 transition ring-0 focus-visible:ring-1 focus-visible:ring-palette-teal outline-none resize-y"
                              value={testCase.expectedOutput}
                              onChange={(event) => onUpdateCustom(testCase.id, { expectedOutput: event.target.value })}
                              placeholder="Optional expected output..."
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProblemWorkspacePage() {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const problems = useAppSelector((state) => state.problems.problems);
  const status = useAppSelector((state) => state.problems.status);
  const problem = problems.find((item) => item.id === id);
  const settings = useAppSelector((state) => state.settings);
  const workspace = useAppSelector((state) => state.workspace);
  const lastRun = useAppSelector((state) => (id ? state.submissions.lastRunByProblem[id] : undefined));
  const [language, setLanguage] = useState<SupportedLanguage>(
    (location.state as any)?.language ?? settings.defaultLanguage
  );
  const [running, setRunning] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("editor");

  useEffect(() => {
    if (problem) dispatch(setActiveProblem(problem.id));
  }, [dispatch, problem]);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProblems());
    }
  }, [dispatch, status]);

  const code = useMemo(() => {
    if (!problem) return "";
    return workspace.codeByProblemLanguage[getCodeKey(problem.id, language)] ?? problem.starterCode[language] ?? "";
  }, [language, problem, workspace.codeByProblemLanguage]);

  if (!problem) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 h-[calc(100vh-2.5rem)] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-palette-light">Problem Library</h1>
            <p className="mt-1 text-sm text-palette-muted">Select a problem to start coding.</p>
          </div>
          <Link to="/generate">
            <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
              Generate Problem
            </Button>
          </Link>
        </div>
        
        {problems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-palette-border/50 py-12 text-center opacity-70 bg-palette-surface mt-8">
            <BookOpen className="mb-3 h-8 w-8 text-palette-muted" />
            <p className="text-sm font-medium text-palette-light">No problems available.</p>
            <p className="mt-1 text-xs text-palette-muted">Generate a new problem to start practicing.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-palette-border bg-palette-surface overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-palette-muted">
              <thead className="bg-palette-surfaceHover/50 border-b border-palette-border text-xs font-semibold text-palette-light uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Topic</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-palette-border/50 bg-palette-surface">
                {problems.map((prob) => (
                  <tr key={prob.id} className="hover:bg-palette-surfaceHover/30 transition-colors group">
                    <td className="px-6 py-4">
                      <Link to={`/problem/${prob.id}`} className="font-heading font-medium text-palette-light group-hover:text-accent-amber transition-colors line-clamp-1 text-base">
                        {prob.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-palette-surfaceHover/50 px-2.5 py-1 text-xs font-medium text-palette-light/90 border border-palette-border/50 shadow-sm">
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-palette-surfaceHover/50 px-2.5 py-1 text-xs font-medium text-palette-light/90 border border-palette-border/50 shadow-sm">
                        {prob.topic}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {prob.solvedAt ? <StatusBadge value="Accepted" /> : <span className="text-palette-muted/50 text-xs italic">Unsolved</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          dispatch(deleteProblem(prob.id));
                        }}
                        className="p-2 text-palette-muted hover:text-accent-red hover:bg-accent-red/10 rounded-md transition-all inline-flex opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Problem"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  const customTests = workspace.customTestCasesByProblem[problem.id] ?? [];
  const solveStartedAt = workspace.solveStartedAtByProblem[problem.id];
  const solveTimeSeconds = solveStartedAt ? Math.max(1, Math.round((Date.now() - new Date(solveStartedAt).getTime()) / 1000)) : 1;

  const runTests = async (testCases: TestCase[], shouldSubmit = false) => {
    setRunning(true);
    dispatch(updateCode({ problemId: problem.id, language, code }));
    try {
      const result = await dispatch(
        executeCode({
          problemId: problem.id,
          language,
          code,
          customTestCases: testCases,
          shouldSubmit,
          solveTimeSeconds,
          methodName: problem.methodName,
        }),
      ).unwrap();

      if (result.isSubmission) {
        if (shouldSubmit) {
          if (result.data.status !== "Pending") {
            dispatch(ingestSubmission(result.data));
          }
          if (result.data.status === "Accepted") {
            dispatch(markProblemSolved({ problemId: problem.id, solvedAt: result.data.createdAt }));
          }
        } else {
          dispatch(recordRun(result.data));
        }
      }
    } catch (error) {
      console.error("Run tests failed:", error);
    } finally {
      setRunning(false);
    }
  };

  const handleHint = async () => {
    const currentLevel = (workspace.hintsByProblem[problem.id] ?? []).length + 1;
    if (currentLevel > 4) return;
    setHintLoading(true);
    try {
      const hint = await generateHintWithGroq(problem, currentLevel);
      dispatch(addHint({ problemId: problem.id, hint }));
    } finally {
      setHintLoading(false);
    }
  };

  const editor = (
    <div className="flex h-full flex-col bg-palette-terminal">
      <div className="flex min-h-12 items-center justify-between gap-3 px-3">
        <select 
          className="h-9 min-h-9 max-w-44 rounded-md bg-palette-terminalSurface px-3 text-sm text-palette-terminalLight transition ring-1 ring-palette-terminalBorder hover:ring-palette-teal/50 focus-visible:ring-2 focus-visible:ring-palette-teal outline-none" 
          value={language} 
          onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
        >
          {languageOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button variant="terminal" className="min-h-9" onClick={() => runTests(problem.publicTestCases)} disabled={running} icon={running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}>
            Run
          </Button>
          <Button className="min-h-9" variant="primary" onClick={() => runTests(problem.hiddenTestCases, true)} disabled={running} icon={<Send className="h-4 w-4" />}>
            Submit
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <Editor
          theme={settings.theme}
          language={getLanguage(language).monacoLanguage}
          value={code}
          options={{
            fontSize: settings.fontSize,
            tabSize: settings.tabSize,
            wordWrap: settings.wordWrap,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
          }}
          onChange={(value) => {
            if (settings.autosave) dispatch(updateCode({ problemId: problem.id, language, code: value ?? "" }));
          }}
        />
      </div>
    </div>
  );

  const terminal = (
    <TerminalPanel
      publicTests={problem.publicTestCases}
      customTests={customTests}
      results={lastRun}
      running={running}
      onAddCustom={() => dispatch(addCustomTestCase({ problemId: problem.id }))}
      onUpdateCustom={(testCaseId, patch) => dispatch(updateCustomTestCase({ problemId: problem.id, testCaseId, patch }))}
      onRemoveCustom={(testCaseId) => dispatch(removeCustomTestCase({ problemId: problem.id, testCaseId }))}
      onRunTest={(testCase) => runTests([testCase])}
    />
  );

  return (
    <div className="h-[calc(100vh-2.5rem)] overflow-hidden rounded-xl bg-palette-surface shadow-lg">
      <div className="flex min-h-12 items-center justify-between px-3 lg:hidden">
        {(["problem", "editor", "terminal"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`h-9 rounded-md px-3 text-sm capitalize font-medium ${mobileTab === tab ? "bg-palette-surfaceHover text-palette-teal" : "text-palette-muted"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="hidden h-full lg:block">
        <PanelGroup direction="horizontal">
          <Panel minSize={24} defaultSize={34}>
            <ProblemPanel problem={problem} onHint={handleHint} hintLoading={hintLoading} />
          </Panel>
          <PanelResizeHandle className="resize-handle w-1 bg-transparent hover:bg-palette-border/50 focus-visible:bg-palette-teal transition" />
          <Panel minSize={36}>
            <PanelGroup direction="vertical">
              <Panel minSize={44}>{editor}</Panel>
              <PanelResizeHandle className="resize-handle h-1 bg-transparent hover:bg-palette-terminalBorder/50 focus-visible:bg-palette-teal transition" />
              <Panel minSize={20} defaultSize={settings.terminalHeight}>
                {terminal}
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      <div className="h-[calc(100%-3rem)] lg:hidden">
        {mobileTab === "problem" ? <ProblemPanel problem={problem} onHint={handleHint} hintLoading={hintLoading} /> : null}
        {mobileTab === "editor" ? editor : null}
        {mobileTab === "terminal" ? terminal : null}
      </div>

      {lastRun?.status === "Accepted" ? (
        <div className="pointer-events-none fixed bottom-5 right-5 hidden items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-md lg:flex">
          <Check className="h-4 w-4" /> Accepted
        </div>
      ) : null}
    </div>
  );
}
