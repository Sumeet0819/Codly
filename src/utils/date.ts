const MS_IN_DAY = 86_400_000;

export const toDayKey = (value: string | Date = new Date()): string => {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
};

export const getLastNDays = (days: number): string[] => {
  const today = new Date();
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today.getTime() - (days - index - 1) * MS_IN_DAY);
    return toDayKey(date);
  });
};

export const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0m";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const rest = mins % 60;
    return `${hours}h ${rest}m`;
  }
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

export const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
