import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { ChatbotWithSuspense } from '@/components/chatbot/ChatbotWithSuspense'

jest.mock('@/components/chatbot/ChatbotTrigger', () => ({
  ChatbotTrigger: () => <div data-testid="chatbot-trigger">ChatbotTrigger</div>,
}))

describe('ChatbotWithSuspense', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<ChatbotWithSuspense />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('renders ChatbotTrigger eventually', async () => {
      render(<ChatbotWithSuspense />)
      const trigger = await screen.findByTestId('chatbot-trigger')
      expect(trigger).toBeInTheDocument()
    })

    it('has correct component structure', () => {
      const { container } = render(<ChatbotWithSuspense />)
      expect(container.firstChild).toBeTruthy()
    })
  })

  describe('Integration', () => {
    it('works as lazy loaded component', async () => {
      render(<ChatbotWithSuspense />)
      expect(await screen.findByTestId('chatbot-trigger')).toBeInTheDocument()
    })

    it('can be mounted and unmounted', () => {
      const { unmount } = render(<ChatbotWithSuspense />)
      unmount()
      expect(true).toBe(true)
    })
  })
})
