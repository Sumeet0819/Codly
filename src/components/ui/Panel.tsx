import type { ReactNode } from "react";

interface PanelProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, action, children, className = "" }: PanelProps) {
  return (
    <section className={`rounded-xl bg-palette-surfaceHover p-8 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}>
      {title || action ? (
        <div className="flex items-center justify-between mb-8">
          {title ? <h3 className="text-xl font-heading font-bold text-palette-light">{title}</h3> : <span />}
          {action}
        </div>
      ) : null}
      <div>{children}</div>
    </section>
  );
}
