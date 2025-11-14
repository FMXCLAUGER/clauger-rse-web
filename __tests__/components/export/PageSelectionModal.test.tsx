import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { PageSelectionModal } from '@/components/export/PageSelectionModal'
import { exportReportPagesPDF } from '@/lib/export/export-utils'
import { toast } from 'sonner'

jest.mock('@/lib/export/export-utils', () => ({
  exportReportPagesPDF: jest.fn(),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

jest.mock('lucide-react', () => ({
  X: () => <span>X</span>,
  Download: () => <span>Download</span>,
  Loader2: () => <span>Loader2</span>,
  FileDown: () => <span>FileDown</span>,
  Check: () => <span>Check</span>,
}))

jest.mock('@/lib/constants', () => ({
  PAGES: Array.from({ length: 36 }, (_, i) => ({
    id: i + 1,
    src: `/images/thumbnails/page-${i + 1}.webp`,
    alt: `Page ${i + 1}`,
    blurDataURL: `data:image/webp;base64,mockBlur${i + 1}`,
  })),
  TOTAL_PAGES: 36,
}))

jest.mock('@/lib/security/logger-helpers', () => ({
  logError: jest.fn(),
}))

describe('PageSelectionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('returns null when isOpen=false', () => {
      const { container } = render(<PageSelectionModal {...defaultProps} isOpen={false} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders modal when isOpen=true', () => {
      render(<PageSelectionModal {...defaultProps} />)
      expect(screen.getByText('Télécharger en PDF')).toBeInTheDocument()
    })

    it('renders all 36 page thumbnails', () => {
      const { container } = render(<PageSelectionModal {...defaultProps} />)
      const images = container.querySelectorAll('img')
      expect(images.length).toBe(36)
    })

    it('shows 0 pages selected initially', () => {
      render(<PageSelectionModal {...defaultProps} />)
      expect(screen.getByText('0 page sélectionnée')).toBeInTheDocument()
    })

    it('pre-selects currentPage if provided', () => {
      render(<PageSelectionModal {...defaultProps} currentPage={5} />)
      expect(screen.getByText('1 page sélectionnée')).toBeInTheDocument()
    })

    it('renders Tout sélectionner button', () => {
      render(<PageSelectionModal {...defaultProps} />)
      expect(screen.getByText('Tout sélectionner')).toBeInTheDocument()
    })

    it('renders Tout désélectionner button', () => {
      render(<PageSelectionModal {...defaultProps} />)
      expect(screen.getByText('Tout désélectionner')).toBeInTheDocument()
    })

    it('renders Annuler button', () => {
      render(<PageSelectionModal {...defaultProps} />)
      expect(screen.getByText('Annuler')).toBeInTheDocument()
    })

    it('renders Télécharger le PDF button', () => {
      render(<PageSelectionModal {...defaultProps} />)
      expect(screen.getByText('Télécharger le PDF')).toBeInTheDocument()
    })

    it('renders modal description text', () => {
      render(<PageSelectionModal {...defaultProps} />)
      expect(screen.getByText('Sélectionnez les pages à inclure dans le PDF')).toBeInTheDocument()
    })

    it('renders close button with X icon', () => {
      render(<PageSelectionModal {...defaultProps} />)
      const closeButton = screen.getByLabelText('Fermer')
      expect(closeButton).toBeInTheDocument()
    })

    it('renders all page numbers in thumbnails', () => {
      const { container } = render(<PageSelectionModal {...defaultProps} />)
      for (let i = 1; i <= 36; i++) {
        const pageImg = container.querySelector(`img[alt="Page ${i}"]`)
        expect(pageImg).toBeInTheDocument()
      }
    })
  })

  describe('Page Selection', () => {
    it('selects page when clicked', async () => {
      const user = userEvent.setup()
      const { container } = render(<PageSelectionModal {...defaultProps} />)

      const firstPage = container.querySelector('img[alt="Page 1"]')?.parentElement
      await user.click(firstPage!)

      expect(screen.getByText('1 page sélectionnée')).toBeInTheDocument()
    })

    it('deselects page when clicked again', async () => {
      const user = userEvent.setup()
      const { container } = render(<PageSelectionModal {...defaultProps} currentPage={1} />)

      expect(screen.getByText('1 page sélectionnée')).toBeInTheDocument()

      const firstPage = container.querySelector('img[alt="Page 1"]')?.parentElement
      await user.click(firstPage!)

      expect(screen.getByText('0 page sélectionnée')).toBeInTheDocument()
    })

    it('selects all pages when Tout sélectionner clicked', async () => {
      const user = userEvent.setup()
      render(<PageSelectionModal {...defaultProps} />)

      const selectAllButton = screen.getByText('Tout sélectionner')
      await user.click(selectAllButton)

      expect(screen.getByText('36 pages sélectionnées')).toBeInTheDocument()
    })

    it('deselects all pages when Tout désélectionner clicked', async () => {
      const user = userEvent.setup()
      render(<PageSelectionModal {...defaultProps} currentPage={1} />)

      expect(screen.getByText('1 page sélectionnée')).toBeInTheDocument()

      const deselectAllButton = screen.getByText('Tout désélectionner')
      await user.click(deselectAllButton)

      expect(screen.getByText('0 page sélectionnée')).toBeInTheDocument()
    })

    it('shows correct pluralization for single page', async () => {
      const user = userEvent.setup()
      const { container } = render(<PageSelectionModal {...defaultProps} />)

      const firstPage = container.querySelector('img[alt="Page 1"]')?.parentElement
      await user.click(firstPage!)

      expect(screen.getByText('1 page sélectionnée')).toBeInTheDocument()
    })

    it('shows correct pluralization for multiple pages', async () => {
      const user = userEvent.setup()
      render(<PageSelectionModal {...defaultProps} />)

      const selectAllButton = screen.getByText('Tout sélectionner')
      await user.click(selectAllButton)

      expect(screen.getByText('36 pages sélectionnées')).toBeInTheDocument()
    })

    it('selects multiple pages individually', async () => {
      const user = userEvent.setup()
      const { container } = render(<PageSelectionModal {...defaultProps} />)

      await user.click(container.querySelector('img[alt="Page 1"]')!.parentElement!)
      expect(screen.getByText('1 page sélectionnée')).toBeInTheDocument()

      await user.click(container.querySelector('img[alt="Page 5"]')!.parentElement!)
      expect(screen.getByText('2 pages sélectionnées')).toBeInTheDocument()

      await user.click(container.querySelector('img[alt="Page 10"]')!.parentElement!)
      expect(screen.getByText('3 pages sélectionnées')).toBeInTheDocument()
    })

    it('maintains sorted order when selecting pages out of order', async () => {
      const user = userEvent.setup()
      const { container } = render(<PageSelectionModal {...defaultProps} />)

      await user.click(container.querySelector('img[alt="Page 10"]')!.parentElement!)
      await user.click(container.querySelector('img[alt="Page 3"]')!.parentElement!)
      await user.click(container.querySelector('img[alt="Page 7"]')!.parentElement!)

      expect(screen.getByText(/Le PDF sera généré avec les pages suivantes: 3, 7, 10/i)).toBeInTheDocument()
    })
  })

  describe('Close Functionality', () => {
    it('calls onClose when X button clicked', async () => {
      const user = userEvent.setup()
      render(<PageSelectionModal {...defaultProps} />)

      const closeButton = screen.getByLabelText('Fermer')
      await user.click(closeButton)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onClose when Annuler clicked', async () => {
      const user = userEvent.setup()
      render(<PageSelectionModal {...defaultProps} />)

      const cancelButton = screen.getByText('Annuler')
      await user.click(cancelButton)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onClose when backdrop clicked', async () => {
      const user = userEvent.setup()
      const { container } = render(<PageSelectionModal {...defaultProps} />)

      const backdrop = container.querySelector('.backdrop-blur-sm')
      if (backdrop) {
        await user.click(backdrop as HTMLElement)
        expect(defaultProps.onClose).toHaveBeenCalled()
      }
    })
  })

  describe('PDF Export', () => {
    it('button is disabled when no pages selected', () => {
      render(<PageSelectionModal {...defaultProps} />)

      const exportButton = screen.getByText('Télécharger le PDF')
      expect(exportButton).toBeDisabled()
    })

    it('calls exportReportPagesPDF with selected pages', async () => {
      const user = userEvent.setup()
      ;(exportReportPagesPDF as jest.Mock).mockResolvedValue(undefined)

      render(<PageSelectionModal {...defaultProps} currentPage={5} />)

      const exportButton = screen.getByText('Télécharger le PDF')
      await user.click(exportButton)

      await waitFor(() => {
        expect(exportReportPagesPDF).toHaveBeenCalledWith([5])
      })
    })

    it('calls exportReportPagesPDF with multiple pages in order', async () => {
      const user = userEvent.setup()
      ;(exportReportPagesPDF as jest.Mock).mockResolvedValue(undefined)

      const { container } = render(<PageSelectionModal {...defaultProps} />)

      // Select pages 3, 1, 5 (out of order)
      await user.click(container.querySelector('img[alt="Page 3"]')!.parentElement!)
      await user.click(container.querySelector('img[alt="Page 1"]')!.parentElement!)
      await user.click(container.querySelector('img[alt="Page 5"]')!.parentElement!)

      const exportButton = screen.getByText('Télécharger le PDF')
      await user.click(exportButton)

      await waitFor(() => {
        // Should be sorted: 1, 3, 5
        expect(exportReportPagesPDF).toHaveBeenCalledWith([1, 3, 5])
      })
    })

    it('shows loading state during PDF generation', async () => {
      const user = userEvent.setup()
      ;(exportReportPagesPDF as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<PageSelectionModal {...defaultProps} currentPage={1} />)

      const exportButton = screen.getByText('Télécharger le PDF')
      await user.click(exportButton)

      expect(screen.getByText('Génération en cours...')).toBeInTheDocument()
      expect(exportButton).toBeDisabled()
    })

    it('shows success toast after PDF generation', async () => {
      const user = userEvent.setup()
      ;(exportReportPagesPDF as jest.Mock).mockResolvedValue(undefined)

      render(<PageSelectionModal {...defaultProps} currentPage={5} />)

      const exportButton = screen.getByText('Télécharger le PDF')
      await user.click(exportButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('PDF téléchargé avec succès (1 page)')
      })
    })

    it('shows correct success message for multiple pages', async () => {
      const user = userEvent.setup()
      ;(exportReportPagesPDF as jest.Mock).mockResolvedValue(undefined)

      render(<PageSelectionModal {...defaultProps} />)

      const selectAllButton = screen.getByText('Tout sélectionner')
      await user.click(selectAllButton)

      const exportButton = screen.getByText('Télécharger le PDF')
      await user.click(exportButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('PDF téléchargé avec succès (36 pages)')
      })
    })

    it('shows error toast when PDF generation fails', async () => {
      const user = userEvent.setup()
      ;(exportReportPagesPDF as jest.Mock).mockRejectedValue(new Error('Generation failed'))

      render(<PageSelectionModal {...defaultProps} currentPage={1} />)

      const exportButton = screen.getByText('Télécharger le PDF')
      await user.click(exportButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erreur lors de la génération du PDF')
      })
    })

    it('closes modal after successful export', async () => {
      const user = userEvent.setup()
      ;(exportReportPagesPDF as jest.Mock).mockResolvedValue(undefined)

      render(<PageSelectionModal {...defaultProps} currentPage={1} />)

      const exportButton = screen.getByText('Télécharger le PDF')
      await user.click(exportButton)

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('disables export button when no pages selected', () => {
      render(<PageSelectionModal {...defaultProps} />)

      const exportButton = screen.getByText('Télécharger le PDF')
      expect(exportButton).toBeDisabled()
    })

    it('enables export button when pages are selected', async () => {
      const user = userEvent.setup()
      const { container } = render(<PageSelectionModal {...defaultProps} />)

      const exportButton = screen.getByText('Télécharger le PDF')
      expect(exportButton).toBeDisabled()

      await user.click(container.querySelector('img[alt="Page 1"]')!.parentElement!)

      expect(exportButton).not.toBeDisabled()
    })

    it('resets loading state after error', async () => {
      const user = userEvent.setup()
      ;(exportReportPagesPDF as jest.Mock).mockRejectedValue(new Error('Generation failed'))

      render(<PageSelectionModal {...defaultProps} currentPage={1} />)

      const exportButton = screen.getByText('Télécharger le PDF')
      await user.click(exportButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erreur lors de la génération du PDF')
      })

      expect(screen.getByText('Télécharger le PDF')).toBeInTheDocument()
      expect(exportButton).not.toBeDisabled()
    })
  })

  describe('Page Display', () => {
    it('shows selected pages summary', async () => {
      const user = userEvent.setup()
      const { container } = render(<PageSelectionModal {...defaultProps} />)

      await user.click(container.querySelector('img[alt="Page 1"]')!.parentElement!)
      await user.click(container.querySelector('img[alt="Page 5"]')!.parentElement!)

      expect(screen.getByText(/Le PDF sera généré avec les pages suivantes: 1, 5/i)).toBeInTheDocument()
    })

    it('hides summary when no pages selected', () => {
      render(<PageSelectionModal {...defaultProps} />)
      expect(screen.queryByText(/Le PDF sera généré avec les pages suivantes/i)).not.toBeInTheDocument()
    })

    it('updates summary when pages are deselected', async () => {
      const user = userEvent.setup()
      const { container } = render(<PageSelectionModal {...defaultProps} />)

      await user.click(container.querySelector('img[alt="Page 1"]')!.parentElement!)
      await user.click(container.querySelector('img[alt="Page 5"]')!.parentElement!)

      expect(screen.getByText(/Le PDF sera généré avec les pages suivantes: 1, 5/i)).toBeInTheDocument()

      await user.click(container.querySelector('img[alt="Page 1"]')!.parentElement!)

      expect(screen.getByText(/Le PDF sera généré avec les pages suivantes: 5/i)).toBeInTheDocument()
    })

    it('shows summary with all selected pages', async () => {
      const user = userEvent.setup()
      render(<PageSelectionModal {...defaultProps} />)

      const selectAllButton = screen.getByText('Tout sélectionner')
      await user.click(selectAllButton)

      const summaryText = screen.getByText(/Le PDF sera généré avec les pages suivantes/i)
      expect(summaryText).toBeInTheDocument()
      expect(summaryText.textContent).toContain('1, 2, 3')
      expect(summaryText.textContent).toContain('36')
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid page selection/deselection', async () => {
      const user = userEvent.setup()
      const { container } = render(<PageSelectionModal {...defaultProps} />)

      const page1 = container.querySelector('img[alt="Page 1"]')!.parentElement!

      await user.click(page1)
      await user.click(page1)
      await user.click(page1)
      await user.click(page1)

      expect(screen.getByText('0 page sélectionnée')).toBeInTheDocument()
    })

    it('handles select all then deselect individual page', async () => {
      const user = userEvent.setup()
      const { container } = render(<PageSelectionModal {...defaultProps} />)

      await user.click(screen.getByText('Tout sélectionner'))
      expect(screen.getByText('36 pages sélectionnées')).toBeInTheDocument()

      await user.click(container.querySelector('img[alt="Page 1"]')!.parentElement!)
      expect(screen.getByText('35 pages sélectionnées')).toBeInTheDocument()
    })

    it('does not close modal on error', async () => {
      const user = userEvent.setup()
      ;(exportReportPagesPDF as jest.Mock).mockRejectedValue(new Error('Generation failed'))

      render(<PageSelectionModal {...defaultProps} currentPage={1} />)

      const exportButton = screen.getByText('Télécharger le PDF')
      await user.click(exportButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      expect(defaultProps.onClose).not.toHaveBeenCalled()
      expect(screen.getByText('Télécharger en PDF')).toBeInTheDocument()
    })

    it('maintains selected pages after failed export', async () => {
      const user = userEvent.setup()
      ;(exportReportPagesPDF as jest.Mock).mockRejectedValue(new Error('Generation failed'))

      render(<PageSelectionModal {...defaultProps} currentPage={5} />)

      expect(screen.getByText('1 page sélectionnée')).toBeInTheDocument()

      const exportButton = screen.getByText('Télécharger le PDF')
      await user.click(exportButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      expect(screen.getByText('1 page sélectionnée')).toBeInTheDocument()
    })
  })
})
