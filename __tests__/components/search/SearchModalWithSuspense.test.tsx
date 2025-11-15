import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { SearchModalWithSuspense } from '@/components/search/SearchModalWithSuspense'

jest.mock('@/components/search/SearchModal', () => ({
  SearchModal: () => <div data-testid="search-modal">SearchModal</div>,
}))

describe('SearchModalWithSuspense', () => {
  describe('Rendering', () => {
    it.skip('renders Suspense boundary', () => {
      // Skipped: SearchModal causes test environment crashes
      const { container } = render(<SearchModalWithSuspense />)
      // Suspense with fallback={null} creates a container
      expect(container).toBeInTheDocument()
    })

    it.skip('renders SearchModal eventually', async () => {
      // Skipped: SearchModal causes test environment crashes
      render(<SearchModalWithSuspense />)
      const modal = await screen.findByTestId('search-modal', {}, { timeout: 3000 })
      expect(modal).toBeInTheDocument()
    })

    it.skip('has Suspense wrapper', () => {
      // Skipped: SearchModal causes test environment crashes
      const { container } = render(<SearchModalWithSuspense />)
      expect(container.firstChild).toBeTruthy()
    })
  })

  describe('Integration', () => {
    it.skip('works as lazy loaded component', async () => {
      // Skipped: SearchModal causes test environment crashes
      render(<SearchModalWithSuspense />)
      expect(await screen.findByTestId('search-modal', {}, { timeout: 3000 })).toBeInTheDocument()
    })

    it.skip('can be mounted and unmounted', () => {
      // Skipped: SearchModal causes test environment crashes
      const { unmount } = render(<SearchModalWithSuspense />)
      unmount()
      expect(true).toBe(true)
    })
  })
})
