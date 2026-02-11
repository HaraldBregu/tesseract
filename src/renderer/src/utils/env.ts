/**
 * Environment configuration helper
 * Provides type-safe access to environment variables
 */

type AppEnvironment = 'development' | 'staging' | 'production'

interface EnvConfig {
  appEnv: AppEnvironment
  apiBaseUrl: string
  apiTimeout: number
  debugMode: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  enableDevTools: boolean
  enableMockData: boolean
}

function parseBoolean(value: string | undefined, defaultValue = false): boolean {
  if (!value) return defaultValue
  return value.toLowerCase() === 'true'
}

function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? defaultValue : parsed
}

export function getEnvConfig(): EnvConfig {
  return {
    appEnv: (import.meta.env.VITE_APP_ENV as AppEnvironment) || 'development',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    apiTimeout: parseNumber(import.meta.env.VITE_API_TIMEOUT, 30000),
    debugMode: parseBoolean(import.meta.env.VITE_DEBUG_MODE, false),
    logLevel: (import.meta.env.VITE_LOG_LEVEL as EnvConfig['logLevel']) || 'info',
    enableDevTools: parseBoolean(import.meta.env.VITE_ENABLE_DEV_TOOLS, false),
    enableMockData: parseBoolean(import.meta.env.VITE_ENABLE_MOCK_DATA, false),
  }
}

export function isDevelopment(): boolean {
  return getEnvConfig().appEnv === 'development'
}

export function isStaging(): boolean {
  return getEnvConfig().appEnv === 'staging'
}

export function isProduction(): boolean {
  return getEnvConfig().appEnv === 'production'
}

export function isDebugMode(): boolean {
  return getEnvConfig().debugMode
}

// Singleton instance for quick access
export const env = getEnvConfig()
