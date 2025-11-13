export interface ValidationResult {
  isValid: boolean
  sanitizedInput?: string
  error?: string
  detectedPattern?: string
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
}

export type PIIPattern =
  | 'email'
  | 'phoneFR'
  | 'phoneIntl'
  | 'anthropicKey'
  | 'openaiKey'
  | 'genericKey'
  | 'siret'
  | 'siren'
  | 'secu'
  | 'creditCard'
  | 'ipv4'
  | 'urlWithToken'
