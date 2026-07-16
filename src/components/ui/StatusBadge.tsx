import type { Difficulty, SubmissionStatus } from "../../types/domain";

const statusClass: Record<SubmissionStatus, string> = {
  Accepted: "border-green-200 bg-green-50 text-green-700",
  "Wrong Answer": "border-orange-200 bg-orange-50 text-orange-700",
  "Runtime Error": "border-red-200 bg-red-50 text-red-700",
  "Compilation Error": "border-red-200 bg-red-50 text-red-700",
  Pending: "border-palette-border bg-palette-surfaceHover text-palette-muted",
};

const difficultyClass: Record<Difficulty, string> = {
  Easy: "border-green-200 bg-green-50 text-green-700",
  Medium: "border-orange-200 bg-orange-50 text-orange-700",
  Hard: "border-red-200 bg-red-50 text-red-700",
};

export function StatusBadge({ value }: { value: SubmissionStatus | Difficulty }) {
  const classes = value in statusClass ? statusClass[value as SubmissionStatus] : difficultyClass[value as Difficulty];
  return (
    <span className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium ${classes}`}>
      {value}
    </span>
  );
}
