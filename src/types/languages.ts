import type { SupportedLanguage } from "./domain";

export interface LanguageOption {
  id: SupportedLanguage;
  label: string;
  monacoLanguage: string;
  judge0Id: number;
  extension: string;
}

export const languageOptions: LanguageOption[] = [
  { id: "javascript", label: "JavaScript", monacoLanguage: "javascript", judge0Id: 63, extension: "js" },
  { id: "typescript", label: "TypeScript", monacoLanguage: "typescript", judge0Id: 74, extension: "ts" },
  { id: "python", label: "Python", monacoLanguage: "python", judge0Id: 71, extension: "py" },
  { id: "java", label: "Java", monacoLanguage: "java", judge0Id: 62, extension: "java" },
  { id: "cpp", label: "C++", monacoLanguage: "cpp", judge0Id: 54, extension: "cpp" },
  { id: "c", label: "C", monacoLanguage: "c", judge0Id: 50, extension: "c" },
  { id: "csharp", label: "C#", monacoLanguage: "csharp", judge0Id: 51, extension: "cs" },
  { id: "go", label: "Go", monacoLanguage: "go", judge0Id: 60, extension: "go" },
  { id: "kotlin", label: "Kotlin", monacoLanguage: "kotlin", judge0Id: 78, extension: "kt" },
  { id: "rust", label: "Rust", monacoLanguage: "rust", judge0Id: 73, extension: "rs" },
];

export const getLanguage = (language: SupportedLanguage): LanguageOption =>
  languageOptions.find((option) => option.id === language) ?? languageOptions[0];
