import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { SecureLogger, logger } from '@/lib/security/secure-logger'

describe('SecureLogger', () => {
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>
  let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>
  let consoleDebugSpy: jest.SpiedFunction<typeof console.debug>

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = SecureLogger.getInstance()
      const instance2 = SecureLogger.getInstance()
      expect(instance1).toBe(instance2)
    })

    it('should match exported logger', () => {
      const instance = SecureLogger.getInstance()
      expect(logger).toBe(instance)
    })
  })

  describe('PII Redaction', () => {
    it('should redact email addresses', () => {
      const text = 'Contact: user@example.com pour plus d\'infos'
      const redacted = logger.redactPII(text)
      expect(redacted).not.toContain('user@example.com')
      expect(redacted).toContain('[EMAIL_REDACTED]')
    })

    it('should redact multiple emails', () => {
      const text = 'Emails: user1@test.com and user2@test.fr'
      const redacted = logger.redactPII(text)
      expect(redacted).not.toContain('@')
      expect(redacted).toMatch(/\[EMAIL_REDACTED\].*\[EMAIL_REDACTED\]/)
    })

    it('should redact French phone numbers', () => {
      const text = 'Appelez le 01 23 45 67 89'
      const redacted = logger.redactPII(text)
      expect(redacted).not.toContain('01 23 45 67 89')
      expect(redacted).toContain('[PHONE_REDACTED]')
    })

    it('should redact international phone numbers', () => {
      const text = 'Call +33 1 23 45 67 89'
      const redacted = logger.redactPII(text)
      expect(redacted).not.toContain('+33')
      expect(redacted).toContain('[PHONE_REDACTED]')
    })

    it('should redact Anthropic API keys', () => {
      const text = 'Key: sk-ant-api03-' + 'a'.repeat(95)
      const redacted = logger.redactPII(text)
      expect(redacted).toContain('[ANTHROPIC_KEY_REDACTED]')
    })

    it('should redact OpenAI API keys', () => {
      const text = 'Key: sk-' + 'a'.repeat(48)
      const redacted = logger.redactPII(text)
      expect(redacted).toContain('[OPENAI_KEY_REDACTED]')
    })

    it('should redact SIRET numbers', () => {
      const text = 'SIRET: 12345678901234'
      const redacted = logger.redactPII(text)
      expect(redacted).not.toContain('12345678901234')
      expect(redacted).toContain('[SIRET_REDACTED]')
    })

    it('should redact SIREN numbers', () => {
      const text = 'SIREN: 123456789'
      const redacted = logger.redactPII(text)
      expect(redacted).not.toContain('123456789')
      expect(redacted).toContain('[SIREN_REDACTED]')
    })

    it('should redact credit card numbers', () => {
      const text = 'Card: 1234 5678 9012 3456'
      const redacted = logger.redactPII(text)
      expect(redacted).not.toContain('1234 5678')
      expect(redacted).toContain('[CARD_REDACTED]')
    })

    it('should redact IP addresses', () => {
      const text = 'From IP: 192.168.1.1'
      const redacted = logger.redactPII(text)
      expect(redacted).not.toContain('192.168.1.1')
      expect(redacted).toContain('[IP_REDACTED]')
    })

    it('should redact URLs with tokens', () => {
      const text = 'API: https://api.example.com?token=secret123'
      const redacted = logger.redactPII(text)
      expect(redacted).not.toContain('secret123')
      expect(redacted).toContain('[URL_WITH_SECRET_REDACTED]')
    })

    it('should redact French social security numbers', () => {
      const text = 'Sécurité sociale: 1 23 45 67 890 123 45'
      const redacted = logger.redactPII(text)
      expect(redacted).not.toContain('1 23 45 67 890 123 45')
      expect(redacted).toContain('[SECU_REDACTED]')
    })
  })

  describe('User ID Hashing', () => {
    it('should hash user IDs consistently', () => {
      const userId = 'user123'
      const hash1 = logger.hashUserId(userId)
      const hash2 = logger.hashUserId(userId)

      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(8)
      expect(hash1).not.toBe(userId)
    })

    it('should produce different hashes for different IDs', () => {
      const hash1 = logger.hashUserId('user1')
      const hash2 = logger.hashUserId('user2')

      expect(hash1).not.toBe(hash2)
    })

    it('should produce hexadecimal output', () => {
      const hash = logger.hashUserId('test')
      expect(hash).toMatch(/^[0-9a-f]{8}$/)
    })
  })

  describe('Log Levels', () => {
    it('should log INFO to console.log', () => {
      logger.info('Test message')

      expect(consoleLogSpy).toHaveBeenCalledTimes(1)
      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0] as string)
      expect(loggedData.level).toBe('INFO')
      expect(loggedData.message).toBe('Test message')
    })

    it('should log ERROR to console.error', () => {
      logger.error('Error message')

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0] as string)
      expect(loggedData.level).toBe('ERROR')
    })

    it('should log WARN to console.warn', () => {
      logger.warn('Warning message')

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      const loggedData = JSON.parse(consoleWarnSpy.mock.calls[0][0] as string)
      expect(loggedData.level).toBe('WARN')
    })

    it('should log CRITICAL to console.error', () => {
      logger.critical('Critical message')

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0] as string)
      expect(loggedData.level).toBe('CRITICAL')
    })

    it('should only log DEBUG in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      logger.debug('Debug message')
      expect(consoleDebugSpy).not.toHaveBeenCalled()

      process.env.NODE_ENV = 'development'
      logger.debug('Debug message')
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1)

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Structured Logging', () => {
    it('should include timestamp in ISO format', () => {
      logger.info('Test')

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0] as string)
      expect(loggedData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should include context when provided', () => {
      logger.info('Test', { key: 'value' })

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0] as string)
      expect(loggedData.context).toBeDefined()
      expect(loggedData.context.key).toBe('value')
    })

    it('should not include context when empty', () => {
      logger.info('Test', {})

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0] as string)
      expect(loggedData.context).toBeUndefined()
    })
  })

  describe('Context Sanitization', () => {
    it('should redact PII in string context values', () => {
      logger.info('Test', { email: 'user@test.com' })

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0] as string)
      expect(loggedData.context.email).toContain('[EMAIL_REDACTED]')
    })

    it('should hash userId in context', () => {
      logger.info('Test', { userId: 'user123' })

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0] as string)
      expect(loggedData.context.userHash).toBeDefined()
      expect(loggedData.context.userId).toBeUndefined()
    })

    it('should exclude sensitive keys', () => {
      logger.info('Test', {
        apiKey: 'secret',
        password: 'pass123',
        secret: 'secret',
        token: 'token123',
        normalKey: 'value',
      })

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0] as string)
      expect(loggedData.context.apiKey).toBeUndefined()
      expect(loggedData.context.password).toBeUndefined()
      expect(loggedData.context.secret).toBeUndefined()
      expect(loggedData.context.token).toBeUndefined()
      expect(loggedData.context.normalKey).toBe('value')
    })

    it('should preserve numbers and booleans', () => {
      logger.info('Test', {
        count: 42,
        isActive: true,
      })

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0] as string)
      expect(loggedData.context.count).toBe(42)
      expect(loggedData.context.isActive).toBe(true)
    })
  })

  describe('Message Sanitization', () => {
    it('should redact PII in log messages', () => {
      logger.info('User email is user@test.com')

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0] as string)
      expect(loggedData.message).not.toContain('user@test.com')
      expect(loggedData.message).toContain('[EMAIL_REDACTED]')
    })

    it('should handle messages with multiple PII types', () => {
      logger.info('Contact user@test.com at 01 23 45 67 89')

      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0] as string)
      expect(loggedData.message).toContain('[EMAIL_REDACTED]')
      expect(loggedData.message).toContain('[PHONE_REDACTED]')
    })
  })
})
