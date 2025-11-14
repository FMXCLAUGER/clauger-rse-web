import { describe, it, expect, jest } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import { ZoomControls } from '@/components/viewer/ZoomControls'
import { CLAUGER_COLORS, ZOOM_LEVELS } from '@/lib/design/clauger-colors'

// Helper to convert hex to RGB for color comparisons
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

jest.mock('lucide-react', () => ({
  ZoomOut: () => <span data-testid="zoom-out-icon">ZoomOut</span>,
  ZoomIn: () => <span data-testid="zoom-in-icon">ZoomIn</span>,
}))

describe('ZoomControls', () => {
  const mockOnZoomIn = jest.fn()
  const mockOnZoomOut = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders all three elements', () => {
      render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      expect(screen.getByLabelText('Zoom arrière')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
      expect(screen.getByLabelText('Zoom avant')).toBeInTheDocument()
    })

    it('renders zoom level display', () => {
      render(
        <ZoomControls
          zoomLevel={125}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      expect(screen.getByText('125%')).toBeInTheDocument()
    })
  })

  describe('Disable State Logic', () => {
    it('canZoomOut is false when zoomLevel equals ZOOM_LEVELS[0] (75%)', () => {
      const { container } = render(
        <ZoomControls
          zoomLevel={75}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomOutButton = screen.getByLabelText('Zoom arrière')
      expect(zoomOutButton).toBeDisabled()
    })

    it('canZoomOut is true when zoomLevel > ZOOM_LEVELS[0]', () => {
      render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomOutButton = screen.getByLabelText('Zoom arrière')
      expect(zoomOutButton).not.toBeDisabled()
    })

    it('canZoomIn is false when zoomLevel equals ZOOM_LEVELS[last] (200%)', () => {
      const maxZoom = ZOOM_LEVELS[ZOOM_LEVELS.length - 1]
      render(
        <ZoomControls
          zoomLevel={maxZoom}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomInButton = screen.getByLabelText('Zoom avant')
      expect(zoomInButton).toBeDisabled()
    })

    it('canZoomIn is true when zoomLevel < ZOOM_LEVELS[last]', () => {
      render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomInButton = screen.getByLabelText('Zoom avant')
      expect(zoomInButton).not.toBeDisabled()
    })
  })

  describe('Button Disabled States', () => {
    it('zoom out button disabled at minimum zoom (75%)', () => {
      render(
        <ZoomControls
          zoomLevel={75}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomOutButton = screen.getByLabelText('Zoom arrière')
      expect(zoomOutButton).toBeDisabled()
    })

    it('zoom out button enabled above minimum', () => {
      render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomOutButton = screen.getByLabelText('Zoom arrière')
      expect(zoomOutButton).not.toBeDisabled()
    })

    it('zoom in button disabled at maximum zoom (200%)', () => {
      render(
        <ZoomControls
          zoomLevel={200}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomInButton = screen.getByLabelText('Zoom avant')
      expect(zoomInButton).toBeDisabled()
    })

    it('zoom in button enabled below maximum', () => {
      render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomInButton = screen.getByLabelText('Zoom avant')
      expect(zoomInButton).not.toBeDisabled()
    })

    it('opacity 0.3 when disabled', () => {
      render(
        <ZoomControls
          zoomLevel={75}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomOutButton = screen.getByLabelText('Zoom arrière') as HTMLButtonElement
      expect(zoomOutButton.style.opacity).toBe('0.3')
    })

    it('opacity 1 when enabled', () => {
      render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomOutButton = screen.getByLabelText('Zoom arrière') as HTMLButtonElement
      expect(zoomOutButton.style.opacity).toBe('1')
    })

    it('cursor-not-allowed class applied', () => {
      render(
        <ZoomControls
          zoomLevel={75}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomOutButton = screen.getByLabelText('Zoom arrière')
      expect(zoomOutButton.className).toContain('disabled:cursor-not-allowed')
    })
  })

  describe('Click Handlers', () => {
    it('calls onZoomOut when zoom out button clicked', () => {
      render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomOutButton = screen.getByLabelText('Zoom arrière')
      fireEvent.click(zoomOutButton)

      expect(mockOnZoomOut).toHaveBeenCalledTimes(1)
    })

    it('calls onZoomIn when zoom in button clicked', () => {
      render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomInButton = screen.getByLabelText('Zoom avant')
      fireEvent.click(zoomInButton)

      expect(mockOnZoomIn).toHaveBeenCalledTimes(1)
    })

    it('disabled zoom out button does not trigger callback', () => {
      render(
        <ZoomControls
          zoomLevel={75}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomOutButton = screen.getByLabelText('Zoom arrière')
      fireEvent.click(zoomOutButton)

      expect(mockOnZoomOut).not.toHaveBeenCalled()
    })

    it('disabled zoom in button does not trigger callback', () => {
      render(
        <ZoomControls
          zoomLevel={200}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomInButton = screen.getByLabelText('Zoom avant')
      fireEvent.click(zoomInButton)

      expect(mockOnZoomIn).not.toHaveBeenCalled()
    })
  })

  describe('Display', () => {
    it('displays zoom level as percentage (100%)', () => {
      render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('updates zoom level when prop changes', () => {
      const { rerender } = render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      expect(screen.getByText('100%')).toBeInTheDocument()

      rerender(
        <ZoomControls
          zoomLevel={150}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      expect(screen.getByText('150%')).toBeInTheDocument()
    })

    it('display text color uses interactive.primary', () => {
      const { container } = render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const display = screen.getByText('100%').closest('div') as HTMLElement
      expect(display.style.color).toBe(hexToRgb(CLAUGER_COLORS.interactive.primary))
    })
  })

  describe('Container Styling', () => {
    it('has border class', () => {
      const { container } = render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('border')
    })

    it('has rounded-lg class', () => {
      const { container } = render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('rounded-lg')
    })

    it('has overflow-hidden class', () => {
      const { container } = render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('overflow-hidden')
    })

    it('has border color from CLAUGER_COLORS', () => {
      const { container } = render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.style.borderColor).toBe(hexToRgb(CLAUGER_COLORS.sidebar.border))
    })
  })

  describe('Accessibility', () => {
    it('zoom out button has aria-label', () => {
      render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      expect(screen.getByLabelText('Zoom arrière')).toBeInTheDocument()
    })

    it('zoom in button has aria-label', () => {
      render(
        <ZoomControls
          zoomLevel={100}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      expect(screen.getByLabelText('Zoom avant')).toBeInTheDocument()
    })

    it('disabled attribute set correctly on zoom out', () => {
      render(
        <ZoomControls
          zoomLevel={75}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomOutButton = screen.getByLabelText('Zoom arrière')
      expect(zoomOutButton).toHaveAttribute('disabled')
    })

    it('disabled attribute set correctly on zoom in', () => {
      render(
        <ZoomControls
          zoomLevel={200}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      const zoomInButton = screen.getByLabelText('Zoom avant')
      expect(zoomInButton).toHaveAttribute('disabled')
    })
  })

  describe('Edge Cases', () => {
    it('handles all ZOOM_LEVELS values (75, 100, 125, 150, 200)', () => {
      ZOOM_LEVELS.forEach(zoomLevel => {
        const { rerender } = render(
          <ZoomControls
            zoomLevel={zoomLevel}
            onZoomIn={mockOnZoomIn}
            onZoomOut={mockOnZoomOut}
          />
        )

        expect(screen.getByText(`${zoomLevel}%`)).toBeInTheDocument()

        rerender(<div />)
      })
    })

    it('intermediate zoom level 125 works correctly', () => {
      render(
        <ZoomControls
          zoomLevel={125}
          onZoomIn={mockOnZoomIn}
          onZoomOut={mockOnZoomOut}
        />
      )

      expect(screen.getByText('125%')).toBeInTheDocument()
      expect(screen.getByLabelText('Zoom arrière')).not.toBeDisabled()
      expect(screen.getByLabelText('Zoom avant')).not.toBeDisabled()
    })
  })
})
