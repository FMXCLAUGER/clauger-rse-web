import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { ChatSkeleton, TypingIndicator, ChatLoadingSkeleton } from '@/components/chatbot/ChatSkeleton'

jest.mock('lucide-react', () => ({
  Loader2: (props: any) => <div data-testid="loader2" {...props}>Loader2</div>,
}))

describe('ChatSkeleton', () => {
  describe('ChatSkeleton Component', () => {
    it('renders without crashing', () => {
      const { container } = render(<ChatSkeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it.skip('displays Loader2 icon', () => {
      render(<ChatSkeleton />)
      expect(screen.getByTestId('loader2')).toBeInTheDocument()
    })

    it('displays "Chargement du chatbot RSE..." text', () => {
      render(<ChatSkeleton />)
      expect(screen.getByText('Chargement du chatbot RSE...')).toBeInTheDocument()
    })

    it('has centered layout', () => {
      const { container } = render(<ChatSkeleton />)
      const wrapper = container.querySelector('.flex.items-center.justify-center')
      expect(wrapper).toBeInTheDocument()
    })

    it('has padding', () => {
      const { container } = render(<ChatSkeleton />)
      const wrapper = container.querySelector('.p-8')
      expect(wrapper).toBeInTheDocument()
    })

    it('has flex column layout for content', () => {
      const { container } = render(<ChatSkeleton />)
      const content = container.querySelector('.flex-col')
      expect(content).toBeInTheDocument()
    })

    it('has gap between elements', () => {
      const { container } = render(<ChatSkeleton />)
      const content = container.querySelector('.gap-3')
      expect(content).toBeInTheDocument()
    })

    it.skip('loader has spin animation', () => {
      const { getByTestId } = render(<ChatSkeleton />)
      const loader = getByTestId('loader2')
      expect(loader.className).toContain('animate-spin')
    })

    it.skip('loader has primary color', () => {
      const { getByTestId } = render(<ChatSkeleton />)
      const loader = getByTestId('loader2')
      expect(loader.className).toContain('text-primary')
    })

    it('text has muted foreground color', () => {
      const { container } = render(<ChatSkeleton />)
      const text = container.querySelector('.text-muted-foreground')
      expect(text).toBeInTheDocument()
    })

    it('text has small size', () => {
      const { container } = render(<ChatSkeleton />)
      const text = container.querySelector('.text-sm')
      expect(text).toBeInTheDocument()
    })
  })

  describe('TypingIndicator Component', () => {
    it('renders without crashing', () => {
      const { container } = render(<TypingIndicator />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it.skip('displays Loader2 icon in avatar', () => {
      render(<TypingIndicator />)
      expect(screen.getByTestId('loader2')).toBeInTheDocument()
    })

    it('displays "L\'assistant analyse votre question..." text', () => {
      render(<TypingIndicator />)
      expect(screen.getByText("L'assistant analyse votre question...")).toBeInTheDocument()
    })

    it('has three bouncing dots', () => {
      const { container } = render(<TypingIndicator />)
      const dots = container.querySelectorAll('.animate-bounce')
      expect(dots.length).toBe(3)
    })

    it('has rounded avatar', () => {
      const { container } = render(<TypingIndicator />)
      const avatar = container.querySelector('.rounded-full.bg-secondary')
      expect(avatar).toBeInTheDocument()
    })

    it('avatar has correct size', () => {
      const { container } = render(<TypingIndicator />)
      const avatar = container.querySelector('.w-8.h-8')
      expect(avatar).toBeInTheDocument()
    })

    it('has fade-in animation', () => {
      const { container } = render(<TypingIndicator />)
      const wrapper = container.querySelector('.animate-in.fade-in')
      expect(wrapper).toBeInTheDocument()
    })

    it('has slide-in-from-bottom animation', () => {
      const { container } = render(<TypingIndicator />)
      const wrapper = container.querySelector('.slide-in-from-bottom-2')
      expect(wrapper).toBeInTheDocument()
    })

    it('has secondary background', () => {
      const { container } = render(<TypingIndicator />)
      const wrapper = container.querySelector('.bg-secondary\\/10')
      expect(wrapper).toBeInTheDocument()
    })

    it('is aligned to left (mr-auto)', () => {
      const { container } = render(<TypingIndicator />)
      const wrapper = container.querySelector('.mr-auto')
      expect(wrapper).toBeInTheDocument()
    })

    it('has max width constraint', () => {
      const { container } = render(<TypingIndicator />)
      const wrapper = container.querySelector('.max-w-\\[90\\%\\]')
      expect(wrapper).toBeInTheDocument()
    })

    it('dots are rounded', () => {
      const { container } = render(<TypingIndicator />)
      const dot = container.querySelector('.rounded-full.bg-muted-foreground\\/50')
      expect(dot).toBeInTheDocument()
    })

    it('dots have correct size', () => {
      const { container } = render(<TypingIndicator />)
      const dot = container.querySelector('.w-2.h-2')
      expect(dot).toBeInTheDocument()
    })
  })

  describe('ChatLoadingSkeleton Component', () => {
    it('renders without crashing', () => {
      const { container } = render(<ChatLoadingSkeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('has two message skeletons', () => {
      const { container } = render(<ChatLoadingSkeleton />)
      const messages = container.querySelectorAll('.rounded-lg')
      expect(messages.length).toBeGreaterThanOrEqual(2)
    })

    it('has spacing between messages', () => {
      const { container } = render(<ChatLoadingSkeleton />)
      const wrapper = container.querySelector('.space-y-4')
      expect(wrapper).toBeInTheDocument()
    })

    it('has padding', () => {
      const { container } = render(<ChatLoadingSkeleton />)
      const wrapper = container.querySelector('.p-4')
      expect(wrapper).toBeInTheDocument()
    })

    it('has user message with primary background', () => {
      const { container } = render(<ChatLoadingSkeleton />)
      const userMessage = container.querySelector('.bg-primary\\/10')
      expect(userMessage).toBeInTheDocument()
    })

    it('user message is aligned to right (ml-auto)', () => {
      const { container } = render(<ChatLoadingSkeleton />)
      const userMessage = container.querySelector('.ml-auto')
      expect(userMessage).toBeInTheDocument()
    })

    it('user message has max width constraint', () => {
      const { container } = render(<ChatLoadingSkeleton />)
      const userMessage = container.querySelector('.max-w-\\[85\\%\\]')
      expect(userMessage).toBeInTheDocument()
    })

    it('has assistant message with secondary background', () => {
      const { container } = render(<ChatLoadingSkeleton />)
      const assistantMessage = container.querySelector('.bg-secondary\\/10')
      expect(assistantMessage).toBeInTheDocument()
    })

    it('assistant message is aligned to left (mr-auto)', () => {
      const { container } = render(<ChatLoadingSkeleton />)
      const assistantMessage = container.querySelector('.mr-auto')
      expect(assistantMessage).toBeInTheDocument()
    })

    it('assistant message has max width constraint', () => {
      const { container } = render(<ChatLoadingSkeleton />)
      const assistantMessage = container.querySelector('.max-w-\\[90\\%\\]')
      expect(assistantMessage).toBeInTheDocument()
    })

    it('has avatar skeletons', () => {
      const { container } = render(<ChatLoadingSkeleton />)
      const avatars = container.querySelectorAll('.rounded-full.animate-pulse')
      expect(avatars.length).toBeGreaterThanOrEqual(2)
    })

    it('avatars have correct size', () => {
      const { container } = render(<ChatLoadingSkeleton />)
      const avatar = container.querySelector('.w-8.h-8.rounded-full')
      expect(avatar).toBeInTheDocument()
    })

    it('has content placeholders with pulse animation', () => {
      const { container } = render(<ChatLoadingSkeleton />)
      const placeholders = container.querySelectorAll('.animate-pulse')
      expect(placeholders.length).toBeGreaterThan(2)
    })

    it('content has spacing between lines', () => {
      const { container } = render(<ChatLoadingSkeleton />)
      const content = container.querySelector('.space-y-2')
      expect(content).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('all three components can be rendered together', () => {
      const { container } = render(
        <>
          <ChatSkeleton />
          <TypingIndicator />
          <ChatLoadingSkeleton />
        </>
      )
      expect(container.children.length).toBe(3)
    })

    it('ChatSkeleton works as fallback for Suspense', () => {
      const { container } = render(<ChatSkeleton />)
      expect(container.textContent).toContain('Chargement')
    })

    it('TypingIndicator shows loading state during message generation', () => {
      const { container } = render(<TypingIndicator />)
      const dots = container.querySelectorAll('.animate-bounce')
      expect(dots.length).toBe(3)
    })

    it('ChatLoadingSkeleton shows initial loading state', () => {
      const { container } = render(<ChatLoadingSkeleton />)
      const messages = container.querySelectorAll('.animate-pulse')
      expect(messages.length).toBeGreaterThan(0)
    })
  })
})
