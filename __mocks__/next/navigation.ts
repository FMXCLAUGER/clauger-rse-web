export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}))

export const usePathname = jest.fn(() => '/rapport')

export const useSearchParams = jest.fn(() => ({
  get: jest.fn((key: string) => null),
  getAll: jest.fn((key: string) => []),
  has: jest.fn((key: string) => false),
  keys: jest.fn(() => []),
  values: jest.fn(() => []),
  entries: jest.fn(() => []),
  forEach: jest.fn(),
  toString: jest.fn(() => ''),
}))

export const useParams = jest.fn(() => ({}))

export const notFound = jest.fn()

export const redirect = jest.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT: ${url}`)
})
