import { createHash } from 'crypto'
import type { LogLevel, LogEntry, PIIPattern } from './types'

const PII_PATTERNS: Record<PIIPattern, RegExp> = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phoneFR: /\b0[1-9](?:\s?\d{2}){4}\b/g,
  phoneIntl: /\+33\s?[1-9](?:\s?\d{2}){4}\b/g,
  anthropicKey: /sk-ant-api03-[a-zA-Z0-9_-]{95}/g,
  openaiKey: /sk-[a-zA-Z0-9]{48}/g,
  genericKey: /[a-zA-Z0-9_-]{32,}/g,
  siret: /\b\d{14}\b/g,
  siren: /\b\d{9}\b/g,
  secu: /\b[12]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  urlWithToken: /https?:\/\/[^\s]+[?&](token|key|secret|password)=[^\s&]+/gi,
}

const PII_REPLACEMENTS: Record<PIIPattern, string> = {
  email: '[EMAIL_REDACTED]',
  phoneFR: '[PHONE_REDACTED]',
  phoneIntl: '[PHONE_REDACTED]',
  anthropicKey: '[ANTHROPIC_KEY_REDACTED]',
  openaiKey: '[OPENAI_KEY_REDACTED]',
  genericKey: '[API_KEY_REDACTED]',
  siret: '[SIRET_REDACTED]',
  siren: '[SIREN_REDACTED]',
  secu: '[SECU_REDACTED]',
  creditCard: '[CARD_REDACTED]',
  ipv4: '[IP_REDACTED]',
  urlWithToken: '[URL_WITH_SECRET_REDACTED]',
}

export class SecureLogger {
  private static instance: SecureLogger

  static getInstance(): SecureLogger {
    if (!SecureLogger.instance) {
      SecureLogger.instance = new SecureLogger()
    }
    return SecureLogger.instance
  }

  redactPII(text: string): string {
    let redacted = text

    for (const [key, pattern] of Object.entries(PII_PATTERNS)) {
      const replacement = PII_REPLACEMENTS[key as PIIPattern]
      redacted = redacted.replace(pattern, replacement)
    }

    return redacted
  }

  hashUserId(userId: string): string {
    return createHash('sha256').update(userId).digest('hex').slice(0, 8)
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): LogEntry {
    const safeMessage = this.redactPII(message)

    const safeContext: Record<string, any> = {}
    if (context) {
      for (const [key, value] of Object.entries(context)) {
        if (
          key === 'apiKey' ||
          key === 'password' ||
          key === 'secret' ||
          key === 'token'
        ) {
          continue
        }

        if (key === 'userId' && typeof value === 'string') {
          safeContext['userHash'] = this.hashUserId(value)
        } else if (typeof value === 'string') {
          safeContext[key] = this.redactPII(value)
        } else {
          safeContext[key] = value
        }
      }
    }

    return {
      timestamp: new Date().toISOString(),
      level,
      message: safeMessage,
      context: Object.keys(safeContext).length > 0 ? safeContext : undefined,
    }
  }

  private write(entry: LogEntry): void {
    const logString = JSON.stringify(entry)

    switch (entry.level) {
      case 'DEBUG':
        if (process.env.NODE_ENV === 'development') {
          console.debug(logString)
        }
        break
      case 'INFO':
        console.log(logString)
        break
      case 'WARN':
        console.warn(logString)
        break
      case 'ERROR':
      case 'CRITICAL':
        console.error(logString)
        break
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.write(this.createLogEntry('DEBUG', message, context))
  }

  info(message: string, context?: Record<string, any>): void {
    this.write(this.createLogEntry('INFO', message, context))
  }

  warn(message: string, context?: Record<string, any>): void {
    this.write(this.createLogEntry('WARN', message, context))
  }

  error(message: string, context?: Record<string, any>): void {
    this.write(this.createLogEntry('ERROR', message, context))
  }

  critical(message: string, context?: Record<string, any>): void {
    this.write(this.createLogEntry('CRITICAL', message, context))
  }
}

export const logger = SecureLogger.getInstance()
