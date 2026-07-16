import type { ReactNode } from "react";

interface ProgressBarProps {
  label: ReactNode;
  value: number;
  max: number;
  colorClass?: string;
  bgColorClass?: string;
}

export function ProgressBar({ label, value, max, colorClass = "bg-palette-teal", bgColorClass = "bg-palette-border/30" }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="group grid gap-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-palette-light flex items-center gap-2">{label}</span>
        <span className="font-mono text-[11px] text-palette-muted tracking-widest">
          {value}/{max}
        </span>
      </div>
      <div className={`h-[2px] overflow-hidden rounded-full ${bgColorClass}`} aria-label={`${percent}%`}>
        <div className={`h-full rounded-full ${colorClass} transition-all duration-500 ease-out`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
