/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_JSONBIN_BIN_ID: string;
  // добавь другие переменные окружения по необходимости
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
