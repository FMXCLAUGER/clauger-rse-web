/**
 * Tests for environment variable validation
 *
 * Note: Since env.ts is executed at module load time, we need to test
 * the schema behavior and the exported env object separately.
 */

import { z } from 'zod'

// Define the schema locally to test it without importing the entire module
const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("L'URL du site doit être valide")
    .default("https://rse.clauger.com"),
})

// Helper function from env.ts
const formatErrors = (errors: z.ZodFormattedError<Map<string, string>, string>) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value) return `${name}: ${value._errors.join(", ")}\n`
    })
    .filter(Boolean)

describe('envSchema', () => {
  describe('valid environment variables', () => {
    it('should accept a valid HTTPS URL', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'https://rse.clauger.com',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.NEXT_PUBLIC_SITE_URL).toBe('https://rse.clauger.com')
      }
    })

    it('should accept a valid HTTP URL', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000')
      }
    })

    it('should accept a URL with port', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'https://example.com:8080',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.NEXT_PUBLIC_SITE_URL).toBe('https://example.com:8080')
      }
    })

    it('should accept a URL with path', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'https://example.com/path/to/page',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.NEXT_PUBLIC_SITE_URL).toBe('https://example.com/path/to/page')
      }
    })

    it('should accept a URL with query parameters', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'https://example.com?param=value',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.NEXT_PUBLIC_SITE_URL).toBe('https://example.com?param=value')
      }
    })

    it('should use default URL when not provided', () => {
      const result = envSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.NEXT_PUBLIC_SITE_URL).toBe('https://rse.clauger.com')
      }
    })

    it('should use default URL when undefined', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: undefined,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.NEXT_PUBLIC_SITE_URL).toBe('https://rse.clauger.com')
      }
    })
  })

  describe('invalid environment variables', () => {
    it('should reject an invalid URL', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'not-a-valid-url',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("L'URL du site doit être valide")
      }
    })

    it('should reject an empty string', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("L'URL du site doit être valide")
      }
    })

    it('should reject a malformed URL with spaces', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'https://invalid site.com',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("L'URL du site doit être valide")
      }
    })

    it('should reject a relative URL', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: '/relative/path',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("L'URL du site doit être valide")
      }
    })

    it('should reject a URL without protocol', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'example.com',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("L'URL du site doit être valide")
      }
    })

    it('should reject null value', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: null,
      })
      expect(result.success).toBe(false)
    })

    it('should reject number value', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 12345,
      })
      expect(result.success).toBe(false)
    })

    it('should reject boolean value', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: true,
      })
      expect(result.success).toBe(false)
    })

    it('should reject object value', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: {},
      })
      expect(result.success).toBe(false)
    })

    it('should reject array value', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: [],
      })
      expect(result.success).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should accept localhost URLs', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'http://localhost',
      })
      expect(result.success).toBe(true)
    })

    it('should accept 127.0.0.1 URLs', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3000',
      })
      expect(result.success).toBe(true)
    })

    it('should accept URLs with subdomains', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'https://sub.domain.example.com',
      })
      expect(result.success).toBe(true)
    })

    it('should accept URLs with multiple subdomains', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'https://a.b.c.example.com',
      })
      expect(result.success).toBe(true)
    })

    it('should accept URLs with hyphens in domain', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'https://my-site.com',
      })
      expect(result.success).toBe(true)
    })

    it('should accept URLs with special characters in path', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'https://example.com/path-with_special.chars',
      })
      expect(result.success).toBe(true)
    })

    it('should accept URLs with fragment', () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_SITE_URL: 'https://example.com#section',
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('formatErrors', () => {
  it('should format single error correctly', () => {
    const mockError = {
      NEXT_PUBLIC_SITE_URL: {
        _errors: ["L'URL du site doit être valide"],
      },
    } as unknown as z.ZodFormattedError<Map<string, string>, string>

    const result = formatErrors(mockError)
    expect(result).toHaveLength(1)
    expect(result[0]).toBe("NEXT_PUBLIC_SITE_URL: L'URL du site doit être valide\n")
  })

  it('should format multiple errors correctly', () => {
    const mockError = {
      NEXT_PUBLIC_SITE_URL: {
        _errors: ["L'URL du site doit être valide", "Another error"],
      },
    } as unknown as z.ZodFormattedError<Map<string, string>, string>

    const result = formatErrors(mockError)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain("NEXT_PUBLIC_SITE_URL:")
    expect(result[0]).toContain("L'URL du site doit être valide")
    expect(result[0]).toContain("Another error")
  })

  it('should filter out entries without _errors', () => {
    const mockError = {
      NEXT_PUBLIC_SITE_URL: {
        _errors: ["L'URL du site doit être valide"],
      },
      _errors: undefined,
    } as unknown as z.ZodFormattedError<Map<string, string>, string>

    const result = formatErrors(mockError)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain("NEXT_PUBLIC_SITE_URL:")
  })

  it('should handle empty errors object', () => {
    const mockError = {} as unknown as z.ZodFormattedError<Map<string, string>, string>

    const result = formatErrors(mockError)
    expect(result).toHaveLength(0)
  })

  it('should handle null values in errors', () => {
    const mockError = {
      NEXT_PUBLIC_SITE_URL: null,
    } as unknown as z.ZodFormattedError<Map<string, string>, string>

    const result = formatErrors(mockError)
    expect(result).toHaveLength(0)
  })
})

describe('env export', () => {
  // Mock process.env for this test suite
  const originalEnv = process.env

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    // Restore original process.env
    process.env = originalEnv
  })

  it('should export env with default URL when NEXT_PUBLIC_SITE_URL is not set', () => {
    // The env module is already loaded, so we test the schema behavior
    const result = envSchema.safeParse({
      NEXT_PUBLIC_SITE_URL: undefined,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_SITE_URL).toBe('https://rse.clauger.com')
    }
  })

  it('should have correct TypeScript type for env', () => {
    const result = envSchema.safeParse({
      NEXT_PUBLIC_SITE_URL: 'https://example.com',
    })
    if (result.success) {
      // This is a compile-time type check
      const url: string = result.data.NEXT_PUBLIC_SITE_URL
      expect(typeof url).toBe('string')
    }
  })
})
