// env.d.ts
/// <reference types="vite/client" />

type AppEnvironment = 'development' | 'staging' | 'production'

interface ImportMetaEnv {
  // Environment
  readonly VITE_APP_ENV: AppEnvironment;

  // API Configuration
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_API_WS_URL: string;

  // Debug & Logging
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  readonly VITE_AUTH_FIRST_NAME: string;
  readonly VITE_AUTH_LAST_NAME: string;
  readonly VITE_AUTH_EMAIL: string;
  readonly VITE_AUTH_PASS: string;
  readonly VITE_AUTH_INSTITUTION: string;

  // Feature Flags
  readonly VITE_ENABLE_DEV_TOOLS: string;
  readonly VITE_ENABLE_MOCK_DATA: string;

  // Main process only
  readonly MAIN_VITE_DOCUMENT_SIGN_KEY: string;
  readonly MAIN_VITE_DB_HOST: string;

  // Legacy
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}