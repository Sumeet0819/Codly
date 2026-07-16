/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GROQ_API_KEY?: string;
  readonly VITE_GROQ_MODEL?: string;
  readonly VITE_JUDGE0_API_URL?: string;
  readonly VITE_JUDGE0_API_KEY?: string;
  readonly VITE_JUDGE0_RAPIDAPI_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
