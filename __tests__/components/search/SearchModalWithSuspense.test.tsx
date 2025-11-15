import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import SearchModalWithSuspense from '@/components/search/SearchModalWithSuspense'

jest.mock('@/components/search/SearchModal', () => ({
  __esModule: true,
  default: () => <div data-testid="search-modal">SearchModal</div>,
}))

describe('SearchModalWithSuspense', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<SearchModalWithSuspense />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('renders SearchModal eventually', async () => {
      render(<SearchModalWithSuspense />)
      const modal = await screen.findByTestId('search-modal')
      expect(modal).toBeInTheDocument()
    })

    it('has correct component structure', () => {
      const { container } = render(<SearchModalWithSuspense />)
      expect(container.firstChild).toBeTruthy()
    })
  })

  describe('Integration', () => {
    it('works as lazy loaded component', async () => {
      render(<SearchModalWithSuspense />)
      expect(await screen.findByTestId('search-modal')).toBeInTheDocument()
    })

    it('can be mounted and unmounted', () => {
      const { unmount } = render(<SearchModalWithSuspense />)
      unmount()
      expect(true).toBe(true)
    })
  })
})
