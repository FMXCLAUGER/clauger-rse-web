import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChatbotModal } from '@/components/chatbot/ChatbotModal'
import { useChatbot, useCurrentPage } from '@/hooks/useChatbot'
import { trackSessionStarted } from '@/lib/analytics/tracker'
import type { UIMessage } from 'ai'

// Mock hooks
jest.mock('@/hooks/useChatbot', () => ({
  useChatbot: jest.fn(),
  useCurrentPage: jest.fn(),
}))

// Mock analytics
jest.mock('@/lib/analytics/tracker', () => ({
  trackSessionStarted: jest.fn(),
}))

// Mock child components
jest.mock('@/components/chatbot/ChatMessage', () => ({
  ChatMessage: function ChatMessage({ message, isLast }: any) {
    return (
      <div data-testid={`message-${message.id}`} data-role={message.role} data-is-last={isLast}>
        {message.content}
      </div>
    )
  },
}))

jest.mock('@/components/chatbot/ChatSkeleton', () => ({
  TypingIndicator: function TypingIndicator() {
    return <div data-testid="typing-indicator">Typing...</div>
  },
}))

jest.mock('@/components/chatbot/SuggestedQuestions', () => ({
  WelcomeScreen: function WelcomeScreen({ onSelectQuestion }: any) {
    return (
      <div data-testid="welcome-screen">
        <button onClick={() => onSelectQuestion('Test question')}>
          Test suggested question
        </button>
      </div>
    )
  },
}))

jest.mock('@/components/ui/button', () => ({
  Button: function Button({ children, onClick, disabled, title, ...props }: any) {
    return (
      <button onClick={onClick} disabled={disabled} title={title} {...props}>
        {children}
      </button>
    )
  },
}))

jest.mock('lucide-react', () => ({
  X: () => <span>X</span>,
  Send: () => <span>Send</span>,
  RotateCcw: () => <span>Restart</span>,
  Maximize2: () => <span>Maximize</span>,
  Minimize2: () => <span>Minimize</span>,
  MessageSquare: () => <span>Messages</span>,
  Bot: () => <span>Bot</span>,
  User: () => <span>User</span>,
}))

describe('ChatbotModal', () => {
  const mockHandleInputChange = jest.fn()
  const mockHandleSubmit = jest.fn()
  const mockSendSuggestedQuestion = jest.fn()
  const mockRestartConversation = jest.fn()
  const mockOnClose = jest.fn()

  const defaultChatbotState = {
    messages: [] as UIMessage[],
    input: '',
    handleInputChange: mockHandleInputChange,
    handleSubmit: mockHandleSubmit,
    isLoading: false,
    sendSuggestedQuestion: mockSendSuggestedQuestion,
    restartConversation: mockRestartConversation,
    isNewConversation: true,
    stats: {
      messageCount: 0,
      userMessages: 0,
      assistantMessages: 0,
      isNewConversation: true,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useChatbot as jest.Mock).mockReturnValue(defaultChatbotState)
    ;(useCurrentPage as jest.Mock).mockReturnValue(undefined)

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn()
  })

  describe('Rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(<ChatbotModal isOpen={false} onClose={mockOnClose} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders modal and backdrop when isOpen is true', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      // Check backdrop
      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50')
      expect(backdrop).toBeInTheDocument()

      // Check modal
      expect(screen.getByRole('heading', { name: 'Assistant RSE' })).toBeInTheDocument()
    })

    it('displays avatar icon in header', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByText('🤖')).toBeInTheDocument()
    })

    it('displays title and conversation status', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('Assistant RSE')).toBeInTheDocument()
      expect(screen.getByText('Nouvelle conversation')).toBeInTheDocument()
    })

    it('displays message count when messages exist', () => {
      const messages: UIMessage[] = [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: 'Hi there' },
      ]

      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        messages,
        isNewConversation: false,
        stats: {
          messageCount: 2,
          userMessages: 1,
          assistantMessages: 1,
          isNewConversation: false,
        },
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)
      const messageElements = screen.getAllByText(/2 messages/i)
      expect(messageElements.length).toBeGreaterThan(0)
    })

    it('displays current page when available', () => {
      ;(useCurrentPage as jest.Mock).mockReturnValue(5)

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByText(/Page 5/i)).toBeInTheDocument()
    })

    it('renders close button', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByTitle('Fermer')).toBeInTheDocument()
    })

    it('renders fullscreen toggle button', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByTitle('Plein écran')).toBeInTheDocument()
    })

    it('does not render restart button when no messages', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.queryByTitle('Nouvelle conversation')).not.toBeInTheDocument()
    })

    it('renders restart button when messages exist', () => {
      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        messages: [{ id: '1', role: 'user', content: 'Hello' }],
        stats: {
          messageCount: 1,
          userMessages: 1,
          assistantMessages: 0,
          isNewConversation: false,
        },
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByTitle('Nouvelle conversation')).toBeInTheDocument()
    })

    it('renders welcome screen for new conversation', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByTestId('welcome-screen')).toBeInTheDocument()
    })

    it('renders messages when conversation exists', () => {
      const messages: UIMessage[] = [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: 'Hi there' },
      ]

      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        messages,
        isNewConversation: false,
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByTestId('message-1')).toBeInTheDocument()
      expect(screen.getByTestId('message-2')).toBeInTheDocument()
      expect(screen.queryByTestId('welcome-screen')).not.toBeInTheDocument()
    })

    it('renders typing indicator when loading', () => {
      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        messages: [{ id: '1', role: 'user', content: 'Hello' }],
        isNewConversation: false,
        isLoading: true,
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
    })

    it('renders input textarea with placeholder', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByPlaceholderText(/Posez votre question sur le rapport RSE/i)).toBeInTheDocument()
    })

    it('renders submit button', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)
      const submitButton = screen.getByRole('button', { name: /send/i })
      expect(submitButton).toBeInTheDocument()
    })

    it('renders footer text', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByText('Propulsé par Claude Sonnet 4.5')).toBeInTheDocument()
      expect(screen.getByText(/Entrée pour envoyer/i)).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onClose when close button clicked', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const closeButton = screen.getByTitle('Fermer')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop clicked', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50') as HTMLElement
      fireEvent.click(backdrop)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when Escape key pressed', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      fireEvent.keyDown(window, { key: 'Escape' })

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when Escape pressed and modal closed', () => {
      render(<ChatbotModal isOpen={false} onClose={mockOnClose} />)

      fireEvent.keyDown(window, { key: 'Escape' })

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('toggles fullscreen mode', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const fullscreenButton = screen.getByTitle('Plein écran')
      fireEvent.click(fullscreenButton)

      expect(screen.getByTitle('Mode fenêtre')).toBeInTheDocument()
    })

    it('calls restartConversation when restart button clicked', () => {
      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        messages: [{ id: '1', role: 'user', content: 'Hello' }],
        stats: { messageCount: 1, userMessages: 1, assistantMessages: 0, isNewConversation: false },
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const restartButton = screen.getByTitle('Nouvelle conversation')
      fireEvent.click(restartButton)

      expect(mockRestartConversation).toHaveBeenCalledTimes(1)
    })

    it('updates input when typing in textarea', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText(/Posez votre question/i)
      fireEvent.change(textarea, { target: { value: 'Test message' } })

      expect(mockHandleInputChange).toHaveBeenCalled()
    })

    it('submits form when submit button clicked', () => {
      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        input: 'Test message',
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const form = screen.getByRole('button', { name: /send/i }).closest('form')!
      fireEvent.submit(form)

      expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })

    it('does not submit when input is empty', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const form = screen.getByRole('button', { name: /send/i }).closest('form')!
      fireEvent.submit(form)

      expect(mockHandleSubmit).not.toHaveBeenCalled()
    })

    it('does not submit when input is only whitespace', () => {
      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        input: '   ',
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const form = screen.getByRole('button', { name: /send/i }).closest('form')!
      fireEvent.submit(form)

      expect(mockHandleSubmit).not.toHaveBeenCalled()
    })

    it('does not submit when loading', () => {
      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        input: 'Test message',
        isLoading: true,
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const form = screen.getByRole('button', { name: /send/i }).closest('form')!
      fireEvent.submit(form)

      expect(mockHandleSubmit).not.toHaveBeenCalled()
    })

    it('submits on Enter key press', () => {
      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        input: 'Test message',
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText(/Posez votre question/i)
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })

      expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })

    it('does not submit on Shift+Enter (allows new line)', () => {
      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        input: 'Test message',
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText(/Posez votre question/i)
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })

      expect(mockHandleSubmit).not.toHaveBeenCalled()
    })

    it('calls sendSuggestedQuestion when suggestion clicked', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const suggestionButton = screen.getByText('Test suggested question')
      fireEvent.click(suggestionButton)

      expect(mockSendSuggestedQuestion).toHaveBeenCalledWith('Test question')
    })
  })

  describe('Accessibility', () => {
    it('has proper button titles', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByTitle('Fermer')).toBeInTheDocument()
      expect(screen.getByTitle('Plein écran')).toBeInTheDocument()
    })

    it('has descriptive placeholder text', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText(/Posez votre question sur le rapport RSE/i)
      expect(textarea).toBeInTheDocument()
    })

    it('disables textarea when loading', () => {
      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        isLoading: true,
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText(/Posez votre question/i)
      expect(textarea).toBeDisabled()
    })

    it('disables submit button when input is empty', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const submitButton = screen.getByRole('button', { name: /send/i })
      expect(submitButton).toBeDisabled()
    })

    it('disables submit button when loading', () => {
      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        input: 'Test message',
        isLoading: true,
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const submitButton = screen.getByRole('button', { name: /send/i })
      expect(submitButton).toBeDisabled()
    })

    it('enables submit button when input is valid', () => {
      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        input: 'Test message',
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const submitButton = screen.getByRole('button', { name: /send/i })
      expect(submitButton).not.toBeDisabled()
    })

    it('disables restart button when loading', () => {
      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        messages: [{ id: '1', role: 'user', content: 'Hello' }],
        stats: { messageCount: 1, userMessages: 1, assistantMessages: 0, isNewConversation: false },
        isLoading: true,
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const restartButton = screen.getByTitle('Nouvelle conversation')
      expect(restartButton).toBeDisabled()
    })
  })

  describe('Modal Styles', () => {
    it('applies windowed mode styles by default', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const modal = screen.getByRole('heading', { name: 'Assistant RSE' }).closest('div.fixed.z-50')
      expect(modal).toHaveClass('bottom-4')
      expect(modal).toHaveClass('right-4')
      expect(modal).toHaveClass('rounded-xl')
    })

    it('applies fullscreen styles when toggled', () => {
      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const fullscreenButton = screen.getByTitle('Plein écran')
      fireEvent.click(fullscreenButton)

      const modal = screen.getByRole('heading', { name: 'Assistant RSE' }).closest('div.fixed.z-50')
      expect(modal).toHaveClass('inset-0')
      expect(modal).toHaveClass('rounded-none')
    })
  })

  describe('Analytics', () => {
    it('tracks session started when modal opens', () => {
      ;(useCurrentPage as jest.Mock).mockReturnValue(5)

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      expect(trackSessionStarted).toHaveBeenCalledWith(
        expect.objectContaining({
          currentPage: 5,
        })
      )
    })

    it('does not track when modal is closed', () => {
      render(<ChatbotModal isOpen={false} onClose={mockOnClose} />)

      expect(trackSessionStarted).not.toHaveBeenCalled()
    })
  })

  describe('Message Display', () => {
    it('marks last message correctly', () => {
      const messages: UIMessage[] = [
        { id: '1', role: 'user', content: 'First message' },
        { id: '2', role: 'assistant', content: 'Second message' },
        { id: '3', role: 'user', content: 'Third message' },
      ]

      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        messages,
        isNewConversation: false,
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      const message3 = screen.getByTestId('message-3')
      expect(message3).toHaveAttribute('data-is-last', 'true')

      const message1 = screen.getByTestId('message-1')
      expect(message1).toHaveAttribute('data-is-last', 'false')
    })

    it('renders all messages in order', () => {
      const messages: UIMessage[] = [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: 'Hi there' },
        { id: '3', role: 'user', content: 'How are you?' },
      ]

      ;(useChatbot as jest.Mock).mockReturnValue({
        ...defaultChatbotState,
        messages,
        isNewConversation: false,
      })

      render(<ChatbotModal isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('Hello')).toBeInTheDocument()
      expect(screen.getByText('Hi there')).toBeInTheDocument()
      expect(screen.getByText('How are you?')).toBeInTheDocument()
    })
  })
})
