import { Wand2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Field, inputClassName } from "../../components/ui/Field";
import { Panel } from "../../components/ui/Panel";
import { persistProblem, setGenerationStatus } from "../../store/problemSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { Difficulty, SupportedLanguage, Topic } from "../../types/domain";
import { languageOptions } from "../../types/languages";
import { difficulties, topics } from "../../types/topics";
import { generateProblemWithGroq } from "../../services/groq";

export function GeneratorPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const settings = useAppSelector((state) => state.settings);
  const generationStatus = useAppSelector((state) => state.problems.generationStatus);
  const generationError = useAppSelector((state) => state.problems.generationError);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [topic, setTopic] = useState<Topic>("Arrays");
  const [language, setLanguage] = useState<SupportedLanguage>(settings.defaultLanguage);
  const [customPrompt, setCustomPrompt] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    dispatch(setGenerationStatus({ status: "loading" }));
    try {
      const problem = await generateProblemWithGroq({ difficulty, topic, language, customPrompt });
      const savedProblem = await dispatch(persistProblem(problem)).unwrap();
      navigate(`/problem/${savedProblem.id}`, { state: { language } });
    } catch (error) {
      dispatch(setGenerationStatus({ status: "failed", error: error instanceof Error ? error.message : "Problem generation failed" }));
    }
  };

  return (
    <>
      <PageHeader
        title="AI Problem Generator"
        description="Create focused practice problems with starter code, tests, explanations, and hidden cases saved locally."
      />

      <div className="grid gap-4 xl:grid-cols-[0.7fr_1fr]">
        <Panel title="Prompt">
          <form className="grid gap-4" onSubmit={onSubmit}>
            <Field label="Difficulty">
              <select className={inputClassName} value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
                {difficulties.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>

            <Field label="Topic">
              <select className={inputClassName} value={topic} onChange={(event) => setTopic(event.target.value as Topic)}>
                {topics.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>

            <Field label="Programming Language">
              <select
                className={inputClassName}
                value={language}
                onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
              >
                {languageOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Custom Prompt" hint="Optional constraints, theme, edge cases, or interview style.">
              <textarea
                className={`${inputClassName} min-h-40 resize-y`}
                value={customPrompt}
                onChange={(event) => setCustomPrompt(event.target.value)}
                placeholder="Example: Make it about sliding windows with tricky duplicate handling."
              />
            </Field>

            {generationError ? <p className="rounded-md border border-accent-red/40 bg-accent-red/10 p-3 text-sm text-red-200">{generationError}</p> : null}

            <Button variant="primary" type="submit" disabled={generationStatus === "loading"} icon={<Wand2 className="h-4 w-4" />}>
              {generationStatus === "loading" ? "Generating..." : "Generate Problem"}
            </Button>
          </form>
        </Panel>

        <Panel title="Generation Contract">
          <div className="grid gap-4 text-sm text-palette-light/90">
            <p>
              Generated problems are stored in local storage immediately and include public tests for running, hidden tests for submission,
              starter code for every supported language, and an editorial payload for review after solving.
            </p>
            <div className="grid gap-2 rounded-md border border-palette-border bg-palette-surfaceHover p-4 font-mono text-xs text-palette-muted shadow-sm">
              <span>GROQ API: {import.meta.env.VITE_GROQ_API_KEY ? "configured" : "fallback mode"}</span>
              <span>Persistence: localStorage</span>
              <span>Execution: Judge0 CE</span>
              <span>Frontend only: no custom backend</span>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
