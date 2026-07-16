import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "terminal";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "bg-palette-teal text-white hover:opacity-90 shadow-sm",
  secondary: "bg-palette-surface text-palette-light hover:bg-palette-surfaceHover border border-palette-border shadow-sm",
  ghost: "bg-transparent text-palette-muted hover:bg-palette-surfaceHover hover:text-palette-light",
  danger: "bg-red-50 text-red-600 hover:bg-red-100",
  terminal: "bg-palette-terminalSurface text-palette-terminalLight hover:bg-palette-terminalBorder border border-palette-terminalBorder shadow-sm",
};

export function Button({ variant = "secondary", icon, className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 hover:scale-[1.03] ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
