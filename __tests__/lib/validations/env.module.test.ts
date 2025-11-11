/**
 * Tests for the actual env module import
 * This tests the real module execution
 */

describe('env module import', () => {
  const originalEnv = process.env

  beforeAll(() => {
    // Set a valid URL before importing the module
    process.env.NEXT_PUBLIC_SITE_URL = 'https://test.example.com'
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should successfully import env module with valid environment', async () => {
    // This will execute the module code
    const { env } = await import('@/lib/validations/env')

    expect(env).toBeDefined()
    expect(env.NEXT_PUBLIC_SITE_URL).toBeDefined()
    expect(typeof env.NEXT_PUBLIC_SITE_URL).toBe('string')
  })

  it('should have a valid URL in the exported env', async () => {
    const { env } = await import('@/lib/validations/env')

    // The URL should be valid (either from process.env or default)
    expect(env.NEXT_PUBLIC_SITE_URL).toMatch(/^https?:\/\/.+/)
  })

  it('should use process.env value when set', async () => {
    // Clear module cache to force re-import
    jest.resetModules()
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-url.com'

    const { env } = await import('@/lib/validations/env')
    expect(env.NEXT_PUBLIC_SITE_URL).toBe('https://custom-url.com')
  })

  it('should use default URL when process.env is not set', async () => {
    // Clear module cache to force re-import
    jest.resetModules()
    delete process.env.NEXT_PUBLIC_SITE_URL

    const { env } = await import('@/lib/validations/env')
    expect(env.NEXT_PUBLIC_SITE_URL).toBe('https://rse.clauger.com')
  })

  it('should throw error with invalid URL in process.env', async () => {
    // Clear module cache
    jest.resetModules()
    process.env.NEXT_PUBLIC_SITE_URL = 'not-a-valid-url'

    // Mock console.error to avoid noise in test output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    await expect(async () => {
      await import('@/lib/validations/env')
    }).rejects.toThrow("Variables d'environnement invalides")

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("❌ Variables d'environnement invalides"),
      expect.any(String)
    )

    consoleErrorSpy.mockRestore()
  })

  it('should log formatted errors when validation fails', async () => {
    jest.resetModules()
    process.env.NEXT_PUBLIC_SITE_URL = 'invalid'

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    try {
      await import('@/lib/validations/env')
    } catch (error) {
      // Expected to throw
    }

    expect(consoleErrorSpy).toHaveBeenCalled()
    const firstCallArgs = consoleErrorSpy.mock.calls[0]
    expect(firstCallArgs[0]).toContain("❌ Variables d'environnement invalides")

    consoleErrorSpy.mockRestore()
  })
})
