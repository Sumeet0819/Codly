import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm text-palette-light/90">
      <span className="font-medium text-palette-light">{label}</span>
      {children}
      {hint ? <span className="text-xs text-palette-muted">{hint}</span> : null}
    </label>
  );
}

export const inputClassName =
  "min-h-10 w-full rounded-md border border-palette-border bg-palette-surface px-3 py-2 text-sm text-palette-light placeholder:text-palette-muted transition hover:border-palette-teal/50 focus-visible:border-palette-teal focus-visible:ring-1 focus-visible:ring-palette-teal";
