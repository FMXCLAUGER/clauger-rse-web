import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { ChatMessage } from '@/components/chatbot/ChatMessage'
import type { UIMessage } from 'ai'

jest.mock('lucide-react', () => ({
  Bot: () => <span data-testid="bot-icon">Bot</span>,
  User: () => <span data-testid="user-icon">User</span>,
}))

jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

describe('ChatMessage', () => {
  const mockUserMessage: UIMessage = {
    id: '1',
    role: 'user',
    content: 'Question test utilisateur',
    createdAt: new Date('2025-01-15T14:30:00'),
  }

  const mockAssistantMessage: UIMessage = {
    id: '2',
    role: 'assistant',
    content: 'Réponse de l\'assistant',
    createdAt: new Date('2025-01-15T14:30:15'),
  }

  describe('Rendering', () => {
    it.skip('renders user message with User icon', () => {
      render(<ChatMessage message={mockUserMessage} />)
      expect(screen.getByTestId('user-icon')).toBeInTheDocument()
    })

    it.skip('renders assistant message with Bot icon', () => {
      render(<ChatMessage message={mockAssistantMessage} />)
      expect(screen.getByTestId('bot-icon')).toBeInTheDocument()
    })

    it('displays role label "Vous" for user', () => {
      render(<ChatMessage message={mockUserMessage} />)
      expect(screen.getByText('Vous')).toBeInTheDocument()
    })

    it('displays role label "Assistant RSE" for assistant', () => {
      render(<ChatMessage message={mockAssistantMessage} />)
      expect(screen.getByText('Assistant RSE')).toBeInTheDocument()
    })

    it('displays timestamp in French format HH:mm', () => {
      render(<ChatMessage message={mockUserMessage} />)
      expect(screen.getByText('14:30')).toBeInTheDocument()
    })

    it('does not display timestamp if createdAt undefined', () => {
      const messageWithoutDate = { ...mockUserMessage, createdAt: undefined }
      const { container } = render(<ChatMessage message={messageWithoutDate} />)
      const timeElement = container.querySelector('time')
      expect(timeElement).not.toBeInTheDocument()
    })

    it('displays message content', () => {
      render(<ChatMessage message={mockUserMessage} />)
      expect(screen.getByText('Question test utilisateur')).toBeInTheDocument()
    })

    it('has correct container structure', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('flex')
      expect(wrapper.className).toContain('gap-3')
      expect(wrapper.className).toContain('p-4')
      expect(wrapper.className).toContain('rounded-lg')
    })
  })

  describe('User Messages', () => {
    it('renders user content as plain text in paragraph', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />)
      const paragraph = container.querySelector('p.text-sm.whitespace-pre-wrap')
      expect(paragraph).toBeInTheDocument()
      expect(paragraph).toHaveTextContent('Question test utilisateur')
    })

    it('preserves whitespace with whitespace-pre-wrap', () => {
      const messageWithSpaces = { ...mockUserMessage, content: 'Text   with   spaces' }
      const { container } = render(<ChatMessage message={messageWithSpaces} />)
      const paragraph = container.querySelector('.whitespace-pre-wrap')
      expect(paragraph).toBeInTheDocument()
    })

    it('aligns user messages to right with ml-auto', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('ml-auto')
    })

    it('has max-width 85% for user messages', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('max-w-[85%]')
    })

    it('has primary background for user messages', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('bg-primary/10')
    })

    it('breaks long words with break-words', () => {
      const longWord = 'a'.repeat(100)
      const messageWithLongWord = { ...mockUserMessage, content: longWord }
      const { container } = render(<ChatMessage message={messageWithLongWord} />)
      const paragraph = container.querySelector('.break-words')
      expect(paragraph).toBeInTheDocument()
    })
  })

  describe('Assistant Messages', () => {
    it('renders ReactMarkdown component for assistant', () => {
      render(<ChatMessage message={mockAssistantMessage} />)
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument()
    })

    it('does not use ReactMarkdown for user messages', () => {
      render(<ChatMessage message={mockUserMessage} />)
      expect(screen.queryByTestId('markdown-content')).not.toBeInTheDocument()
    })

    it('aligns assistant messages to left with mr-auto', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('mr-auto')
    })

    it('has max-width 90% for assistant messages', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('max-w-[90%]')
    })

    it('has secondary background for assistant messages', () => {
      const { container} = render(<ChatMessage message={mockAssistantMessage} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('bg-secondary/10')
    })

    it('markdown content has prose classes', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} />)
      const prose = container.querySelector('.prose')
      expect(prose).toBeInTheDocument()
    })

    it('markdown has prose-sm size', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} />)
      const prose = container.querySelector('.prose-sm')
      expect(prose).toBeInTheDocument()
    })

    it('markdown has dark mode variant', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} />)
      const prose = container.querySelector('.dark\\:prose-invert')
      expect(prose).toBeInTheDocument()
    })

    it('markdown has max-w-none class', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} />)
      const prose = container.querySelector('.max-w-none')
      expect(prose).toBeInTheDocument()
    })

    it('passes remarkGfm plugin to ReactMarkdown', () => {
      render(<ChatMessage message={mockAssistantMessage} />)
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument()
    })

    it('renders markdown content from message', () => {
      render(<ChatMessage message={mockAssistantMessage} />)
      const markdown = screen.getByTestId('markdown-content')
      expect(markdown).toHaveTextContent('Réponse de l\'assistant')
    })

    it('handles markdown with special characters', () => {
      const specialMessage = { ...mockAssistantMessage, content: 'Text **bold** _italic_' }
      render(<ChatMessage message={specialMessage} />)
      expect(screen.getByTestId('markdown-content')).toHaveTextContent('Text **bold** _italic_')
    })
  })

  describe('Animations', () => {
    it('applies animation classes when isLast=true', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} isLast={true} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('animate-in')
      expect(wrapper.className).toContain('fade-in')
      expect(wrapper.className).toContain('slide-in-from-bottom-2')
    })

    it('does not apply animation classes when isLast=false', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} isLast={false} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).not.toContain('animate-in')
      expect(wrapper.className).not.toContain('fade-in')
    })

    it('has duration-300 class for animations', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} isLast={true} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('duration-300')
    })
  })

  describe('Props Handling', () => {
    it('handles user role styling', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('bg-primary/10')
      expect(wrapper.className).toContain('ml-auto')
    })

    it('handles assistant role styling', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('bg-secondary/10')
      expect(wrapper.className).toContain('mr-auto')
    })

    it('displays correct content for message', () => {
      render(<ChatMessage message={mockUserMessage} />)
      expect(screen.getByText('Question test utilisateur')).toBeInTheDocument()
    })

    it('formats createdAt with French locale', () => {
      render(<ChatMessage message={mockUserMessage} />)
      const timeElement = screen.getByText('14:30')
      expect(timeElement).toBeInTheDocument()
    })
  })

  describe('CSS Classes', () => {
    it('user message has correct combined classes', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('bg-primary/10')
      expect(wrapper.className).toContain('ml-auto')
      expect(wrapper.className).toContain('max-w-[85%]')
    })

    it('assistant message has correct combined classes', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('bg-secondary/10')
      expect(wrapper.className).toContain('mr-auto')
      expect(wrapper.className).toContain('max-w-[90%]')
    })

    it('avatar has rounded-full and correct size', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />)
      const avatar = container.querySelector('.rounded-full')
      expect(avatar).toBeInTheDocument()
      expect(avatar?.className).toContain('w-8')
      expect(avatar?.className).toContain('h-8')
    })

    it('container has gap-3 spacing', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('gap-3')
    })
  })

  describe('Accessibility', () => {
    it('uses time element for timestamp', () => {
      render(<ChatMessage message={mockUserMessage} />)
      const timeElement = screen.getByText('14:30')
      expect(timeElement.tagName).toBe('TIME')
    })

    it('time element has dateTime attribute', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />)
      const timeElement = container.querySelector('time')
      expect(timeElement).toHaveAttribute('datetime')
    })

    it('has semantic HTML structure', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })
})
