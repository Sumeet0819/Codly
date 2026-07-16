import { Save } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Field, inputClassName } from "../../components/ui/Field";
import { Panel } from "../../components/ui/Panel";
import { updateSettings } from "../../store/settingsSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { EditorPreferences, SupportedLanguage } from "../../types/domain";
import { languageOptions } from "../../types/languages";

export function SettingsPage() {
  const settings = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();

  const patch = (value: Partial<EditorPreferences>) => dispatch(updateSettings(value));

  return (
    <>
      <PageHeader title="Settings" description="Tune editor behavior and workspace preferences. Changes are persisted locally." />

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1fr]">
        <Panel title="Editor">
          <div className="grid gap-4">
            <Field label="Theme">
              <select className={inputClassName} value={settings.theme} onChange={(event) => patch({ theme: event.target.value as EditorPreferences["theme"] })}>
                <option value="vs-dark">VS Dark</option>
                <option value="light">Light</option>
                <option value="hc-black">High Contrast</option>
              </select>
            </Field>

            <Field label="Default Language">
              <select
                className={inputClassName}
                value={settings.defaultLanguage}
                onChange={(event) => patch({ defaultLanguage: event.target.value as SupportedLanguage })}
              >
                {languageOptions.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Font Size">
              <input
                className={inputClassName}
                type="number"
                min={11}
                max={22}
                value={settings.fontSize}
                onChange={(event) => patch({ fontSize: Number(event.target.value) })}
              />
            </Field>

            <Field label="Tab Size">
              <input
                className={inputClassName}
                type="number"
                min={2}
                max={8}
                value={settings.tabSize}
                onChange={(event) => patch({ tabSize: Number(event.target.value) })}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Workspace">
          <div className="grid gap-5">
            <label className="flex items-center justify-between gap-4 rounded-md border border-palette-border bg-palette-surfaceHover p-3 shadow-sm transition hover:border-palette-teal/50">
              <div className="flex-1">
                <span className="block text-sm font-medium text-palette-light">Autosave code</span>
                <span className="block text-xs text-palette-muted">Save editor changes per problem and language.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autosave}
                onChange={(event) => patch({ autosave: event.target.checked })}
                className="h-5 w-5 accent-accent-blue"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-md border border-palette-border bg-palette-surfaceHover p-3 shadow-sm transition hover:border-palette-teal/50">
              <div className="flex-1">
                <span className="block text-sm font-medium text-palette-light">Word wrap</span>
                <span className="block text-xs text-palette-muted">Wrap long lines in the editor.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.wordWrap === "on"}
                onChange={(event) => patch({ wordWrap: event.target.checked ? "on" : "off" })}
                className="h-5 w-5 accent-accent-blue"
              />
            </label>

            <Field label="Terminal Height">
              <input
                type="range"
                min={20}
                max={50}
                value={settings.terminalHeight}
                onChange={(event) => patch({ terminalHeight: Number(event.target.value) })}
                className="w-full accent-accent-blue"
              />
            </Field>

            <div className="rounded-md border border-palette-border bg-palette-surfaceHover p-4 text-sm text-palette-light/90 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-palette-light font-medium">
                <Settings2 className="h-4 w-4" /> Usage Limit
              </div>
              <div>Your workspace stores data locally in your browser. Clearing site data will reset these settings.</div>
            </div>

            <Button variant="primary" icon={<Save className="h-4 w-4" />}>
              Saved Automatically
            </Button>
          </div>
        </Panel>
      </div>
    </>
  );
}
