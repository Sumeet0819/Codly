import type { ReactNode } from "react";

interface MetricProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
}

export function Metric({ label, value, icon }: MetricProps) {
  return (
    <div className="group flex h-full flex-col justify-between rounded-xl bg-palette-surfaceHover p-8 opacity-90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:opacity-100 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between text-palette-muted transition-colors group-hover:text-palette-teal">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">{label}</span>
        <div className="text-palette-muted opacity-80">{icon}</div>
      </div>
      <div className="text-4xl font-heading font-bold tracking-tight text-palette-light">{value}</div>
    </div>
  );
}
