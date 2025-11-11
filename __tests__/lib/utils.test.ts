import { cn } from '@/lib/utils'

describe('cn (className merger)', () => {
  it('should merge single class', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('should merge multiple classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    expect(cn('foo', true && 'bar')).toBe('foo bar')
  })

  it('should merge Tailwind classes correctly', () => {
    // twMerge should deduplicate conflicting Tailwind classes
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('should handle objects', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo')
  })

  it('should handle undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('should handle empty input', () => {
    expect(cn()).toBe('')
  })

  it('should handle complex mixed inputs', () => {
    const result = cn(
      'base-class',
      { active: true, disabled: false },
      ['array-class'],
      undefined,
      'final-class'
    )
    expect(result).toContain('base-class')
    expect(result).toContain('active')
    expect(result).not.toContain('disabled')
    expect(result).toContain('array-class')
    expect(result).toContain('final-class')
  })
})
