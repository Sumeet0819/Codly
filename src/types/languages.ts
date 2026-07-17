import type { SupportedLanguage } from "./domain";

export interface LanguageOption {
  id: SupportedLanguage;
  label: string;
  monacoLanguage: string;
  wandboxId: string;
  extension: string;
}

export const languageOptions: LanguageOption[] = [
  { id: "javascript", label: "JavaScript", monacoLanguage: "javascript", wandboxId: "nodejs-20.17.0", extension: "js" },
  { id: "typescript", label: "TypeScript", monacoLanguage: "typescript", wandboxId: "typescript-5.6.2", extension: "ts" },
  { id: "python", label: "Python", monacoLanguage: "python", wandboxId: "cpython-3.14.0", extension: "py" },
  { id: "java", label: "Java", monacoLanguage: "java", wandboxId: "openjdk-jdk-22+36", extension: "java" },
  { id: "cpp", label: "C++", monacoLanguage: "cpp", wandboxId: "gcc-13.2.0", extension: "cpp" },
  { id: "c", label: "C", monacoLanguage: "c", wandboxId: "gcc-13.2.0-c", extension: "c" },
  { id: "csharp", label: "C#", monacoLanguage: "csharp", wandboxId: "mono-6.12.0.199", extension: "cs" },
  { id: "go", label: "Go", monacoLanguage: "go", wandboxId: "go-1.23.2", extension: "go" },
  { id: "kotlin", label: "Kotlin", monacoLanguage: "kotlin", wandboxId: "", extension: "kt" },
  { id: "rust", label: "Rust", monacoLanguage: "rust", wandboxId: "rust-1.82.0", extension: "rs" },
];

export const getLanguage = (language: SupportedLanguage): LanguageOption =>
  languageOptions.find((option) => option.id === language) ?? languageOptions[0];
