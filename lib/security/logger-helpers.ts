import { logger } from './secure-logger'
import { loggerConfig } from './logger-config'

export const logError = (message: string, error: unknown, context?: Record<string, any>) => {
  const errorContext = {
    ...context,
    errorMessage: error instanceof Error ? error.message : String(error),
    errorStack: error instanceof Error ? error.stack : undefined,
  }
  logger.error(message, errorContext)
}

export const logStorageError = (operation: string, error: unknown, key?: string) => {
  logger.error(`localStorage ${operation} failed`, {
    operation,
    key,
    error: error instanceof Error ? error.message : String(error),
  })
}

export const logPerformance = (operation: string, durationMs: number, context?: Record<string, any>) => {
  if (loggerConfig.logPerformance) {
    logger.info(`Performance: ${operation}`, {
      ...context,
      durationMs,
      operation,
    })
  }
}
