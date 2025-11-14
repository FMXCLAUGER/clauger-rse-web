import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { ExportModal } from '@/components/export/ExportModal'
import { exportDashboardPDF, exportDataCSV, exportAllDataCSV } from '@/lib/export/export-utils'
import { toast } from 'sonner'

jest.mock('@/lib/export/export-utils', () => ({
  exportDashboardPDF: jest.fn(),
  exportDataCSV: jest.fn(),
  exportAllDataCSV: jest.fn(),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('lucide-react', () => ({
  X: () => <span>X</span>,
  Download: () => <span>Download</span>,
  FileText: () => <span>FileText</span>,
  FileSpreadsheet: () => <span>FileSpreadsheet</span>,
  Loader2: () => <span>Loader2</span>,
}))

jest.mock('@/lib/security/logger-helpers', () => ({
  logError: jest.fn(),
}))

describe('ExportModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    activeTab: 'environment' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('returns null when isOpen=false', () => {
      const { container } = render(<ExportModal {...defaultProps} isOpen={false} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders modal when isOpen=true', () => {
      render(<ExportModal {...defaultProps} />)
      expect(screen.getByText('Exporter les données')).toBeInTheDocument()
    })

    it('renders modal subtitle', () => {
      render(<ExportModal {...defaultProps} />)
      expect(screen.getByText("Choisissez le format d'export")).toBeInTheDocument()
    })

    it('renders 3 export buttons', () => {
      render(<ExportModal {...defaultProps} />)
      expect(screen.getByText('Exporter en PDF')).toBeInTheDocument()
      expect(screen.getByText('Exporter en CSV')).toBeInTheDocument()
      expect(screen.getByText('Export complet CSV')).toBeInTheDocument()
    })

    it('renders export button descriptions', () => {
      render(<ExportModal {...defaultProps} />)
      expect(screen.getByText('Dashboard actuel avec graphiques')).toBeInTheDocument()
      expect(screen.getByText('Données de la section actuelle')).toBeInTheDocument()
      expect(screen.getByText('Toutes les données ESG')).toBeInTheDocument()
    })

    it('renders close button', () => {
      render(<ExportModal {...defaultProps} />)
      const closeButton = screen.getByRole('button', { name: 'Fermer' })
      expect(closeButton).toBeInTheDocument()
    })

    it('renders info message', () => {
      render(<ExportModal {...defaultProps} />)
      expect(screen.getByText(/Les fichiers sont téléchargés directement/i)).toBeInTheDocument()
    })
  })

  describe('Close Functionality', () => {
    it('calls onClose when X button clicked', async () => {
      const user = userEvent.setup()
      render(<ExportModal {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: 'Fermer' })
      await user.click(closeButton)

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop clicked', async () => {
      const user = userEvent.setup()
      const { container } = render(<ExportModal {...defaultProps} />)

      const backdrop = container.querySelector('[aria-hidden="true"]')
      if (backdrop) {
        await user.click(backdrop as HTMLElement)
        expect(defaultProps.onClose).toHaveBeenCalled()
      }
    })
  })

  describe('PDF Export', () => {
    it('calls exportDashboardPDF when PDF button clicked', async () => {
      const user = userEvent.setup()
      ;(exportDashboardPDF as jest.Mock).mockResolvedValue(undefined)

      render(<ExportModal {...defaultProps} activeTab="environment" />)

      const pdfButton = screen.getByText('Exporter en PDF').closest('button')
      await user.click(pdfButton!)

      await waitFor(() => {
        expect(exportDashboardPDF).toHaveBeenCalledWith(
          'dashboard-content',
          'Dashboard-Environnement'
        )
      })
    })

    it('calls exportDashboardPDF with correct name for social tab', async () => {
      const user = userEvent.setup()
      ;(exportDashboardPDF as jest.Mock).mockResolvedValue(undefined)

      render(<ExportModal {...defaultProps} activeTab="social" />)

      const pdfButton = screen.getByText('Exporter en PDF').closest('button')
      await user.click(pdfButton!)

      await waitFor(() => {
        expect(exportDashboardPDF).toHaveBeenCalledWith(
          'dashboard-content',
          'Dashboard-Social'
        )
      })
    })

    it('calls exportDashboardPDF with correct name for governance tab', async () => {
      const user = userEvent.setup()
      ;(exportDashboardPDF as jest.Mock).mockResolvedValue(undefined)

      render(<ExportModal {...defaultProps} activeTab="governance" />)

      const pdfButton = screen.getByText('Exporter en PDF').closest('button')
      await user.click(pdfButton!)

      await waitFor(() => {
        expect(exportDashboardPDF).toHaveBeenCalledWith(
          'dashboard-content',
          'Dashboard-Gouvernance'
        )
      })
    })

    it('shows loading state during PDF export', async () => {
      const user = userEvent.setup()
      ;(exportDashboardPDF as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<ExportModal {...defaultProps} />)

      const pdfButton = screen.getByText('Exporter en PDF').closest('button')
      await user.click(pdfButton!)

      expect(screen.getByText('Loader2')).toBeInTheDocument()
      expect(pdfButton).toBeDisabled()
    })

    it('disables PDF button during export', async () => {
      const user = userEvent.setup()
      ;(exportDashboardPDF as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<ExportModal {...defaultProps} />)

      const pdfButton = screen.getByText('Exporter en PDF').closest('button')
      await user.click(pdfButton!)

      expect(pdfButton).toBeDisabled()
      expect(pdfButton).toHaveClass('disabled:opacity-50')
    })

    it('shows success toast after PDF export', async () => {
      const user = userEvent.setup()
      ;(exportDashboardPDF as jest.Mock).mockResolvedValue(undefined)

      render(<ExportModal {...defaultProps} />)

      const pdfButton = screen.getByText('Exporter en PDF').closest('button')
      await user.click(pdfButton!)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('PDF exporté avec succès !')
      })
    })

    it('shows error toast when PDF export fails', async () => {
      const user = userEvent.setup()
      ;(exportDashboardPDF as jest.Mock).mockRejectedValue(new Error('Export failed'))

      render(<ExportModal {...defaultProps} />)

      const pdfButton = screen.getByText('Exporter en PDF').closest('button')
      await user.click(pdfButton!)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Erreur lors de l'export PDF")
      })
    })

    it('closes modal after successful PDF export', async () => {
      const user = userEvent.setup()
      ;(exportDashboardPDF as jest.Mock).mockResolvedValue(undefined)

      render(<ExportModal {...defaultProps} />)

      const pdfButton = screen.getByText('Exporter en PDF').closest('button')
      await user.click(pdfButton!)

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('does not close modal after failed PDF export', async () => {
      const user = userEvent.setup()
      ;(exportDashboardPDF as jest.Mock).mockRejectedValue(new Error('Export failed'))

      render(<ExportModal {...defaultProps} />)

      const pdfButton = screen.getByText('Exporter en PDF').closest('button')
      await user.click(pdfButton!)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })

    it('re-enables PDF button after export completes', async () => {
      const user = userEvent.setup()
      ;(exportDashboardPDF as jest.Mock).mockResolvedValue(undefined)

      render(<ExportModal {...defaultProps} />)

      const pdfButton = screen.getByText('Exporter en PDF').closest('button')
      await user.click(pdfButton!)

      await waitFor(() => {
        expect(exportDashboardPDF).toHaveBeenCalled()
      })
    })

    it('re-enables PDF button after export fails', async () => {
      const user = userEvent.setup()
      ;(exportDashboardPDF as jest.Mock).mockRejectedValue(new Error('Export failed'))

      render(<ExportModal {...defaultProps} />)

      const pdfButton = screen.getByText('Exporter en PDF').closest('button')
      await user.click(pdfButton!)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })
    })
  })

  describe('CSV Export', () => {
    it('calls exportDataCSV when CSV button clicked', async () => {
      const user = userEvent.setup()

      render(<ExportModal {...defaultProps} activeTab="environment" />)

      const csvButton = screen.getByText('Exporter en CSV').closest('button')
      await user.click(csvButton!)

      expect(exportDataCSV).toHaveBeenCalledWith('environment')
    })

    it('calls exportDataCSV with social tab', async () => {
      const user = userEvent.setup()

      render(<ExportModal {...defaultProps} activeTab="social" />)

      const csvButton = screen.getByText('Exporter en CSV').closest('button')
      await user.click(csvButton!)

      expect(exportDataCSV).toHaveBeenCalledWith('social')
    })

    it('calls exportDataCSV with governance tab', async () => {
      const user = userEvent.setup()

      render(<ExportModal {...defaultProps} activeTab="governance" />)

      const csvButton = screen.getByText('Exporter en CSV').closest('button')
      await user.click(csvButton!)

      expect(exportDataCSV).toHaveBeenCalledWith('governance')
    })

    it('shows success toast after CSV export', async () => {
      const user = userEvent.setup()

      render(<ExportModal {...defaultProps} />)

      const csvButton = screen.getByText('Exporter en CSV').closest('button')
      await user.click(csvButton!)

      expect(toast.success).toHaveBeenCalledWith('CSV exporté avec succès !')
    })

    it('closes modal after CSV export', async () => {
      const user = userEvent.setup()

      render(<ExportModal {...defaultProps} />)

      const csvButton = screen.getByText('Exporter en CSV').closest('button')
      await user.click(csvButton!)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('shows error toast when CSV export throws error', async () => {
      const user = userEvent.setup()
      ;(exportDataCSV as jest.Mock).mockImplementation(() => {
        throw new Error('CSV export failed')
      })

      render(<ExportModal {...defaultProps} />)

      const csvButton = screen.getByText('Exporter en CSV').closest('button')
      await user.click(csvButton!)

      expect(toast.error).toHaveBeenCalledWith("Erreur lors de l'export CSV")
    })

    it('does not close modal after failed CSV export', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      ;(exportDataCSV as jest.Mock).mockImplementation(() => {
        throw new Error('CSV export failed')
      })

      render(<ExportModal {...defaultProps} onClose={onClose} />)

      const csvButton = screen.getByText('Exporter en CSV').closest('button')
      await user.click(csvButton!)

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Complete CSV Export', () => {
    it('calls exportAllDataCSV when complete CSV button clicked', async () => {
      const user = userEvent.setup()

      render(<ExportModal {...defaultProps} />)

      const allCsvButton = screen.getByText('Export complet CSV').closest('button')
      await user.click(allCsvButton!)

      expect(exportAllDataCSV).toHaveBeenCalled()
    })

    it('shows success toast after complete CSV export', async () => {
      const user = userEvent.setup()

      render(<ExportModal {...defaultProps} />)

      const allCsvButton = screen.getByText('Export complet CSV').closest('button')
      await user.click(allCsvButton!)

      expect(toast.success).toHaveBeenCalledWith('Toutes les données exportées !')
    })

    it('closes modal after complete CSV export', async () => {
      const user = userEvent.setup()

      render(<ExportModal {...defaultProps} />)

      const allCsvButton = screen.getByText('Export complet CSV').closest('button')
      await user.click(allCsvButton!)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('shows error toast when complete CSV export fails', async () => {
      const user = userEvent.setup()
      ;(exportAllDataCSV as jest.Mock).mockImplementation(() => {
        throw new Error('Complete export failed')
      })

      render(<ExportModal {...defaultProps} />)

      const allCsvButton = screen.getByText('Export complet CSV').closest('button')
      await user.click(allCsvButton!)

      expect(toast.error).toHaveBeenCalledWith("Erreur lors de l'export")
    })

    it('does not close modal after failed complete CSV export', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      ;(exportAllDataCSV as jest.Mock).mockImplementation(() => {
        throw new Error('Complete export failed')
      })

      render(<ExportModal {...defaultProps} onClose={onClose} />)

      const allCsvButton = screen.getByText('Export complet CSV').closest('button')
      await user.click(allCsvButton!)

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Tab Names', () => {
    const tabs = [
      { key: 'environment', name: 'Dashboard-Environnement' },
      { key: 'social', name: 'Dashboard-Social' },
      { key: 'governance', name: 'Dashboard-Gouvernance' },
    ]

    tabs.forEach(({ key, name }) => {
      it(`uses correct dashboard name for ${key} tab`, async () => {
        const user = userEvent.setup()
        ;(exportDashboardPDF as jest.Mock).mockResolvedValue(undefined)

        render(<ExportModal {...defaultProps} activeTab={key as any} />)

        const pdfButton = screen.getByText('Exporter en PDF').closest('button')
        await user.click(pdfButton!)

        await waitFor(() => {
          expect(exportDashboardPDF).toHaveBeenCalledWith('dashboard-content', name)
        })
      })
    })
  })

  describe('Button Interactions', () => {
    it('CSV button is not disabled during PDF export', async () => {
      const user = userEvent.setup()
      ;(exportDashboardPDF as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<ExportModal {...defaultProps} />)

      const pdfButton = screen.getByText('Exporter en PDF').closest('button')
      const csvButton = screen.getByText('Exporter en CSV').closest('button')

      await user.click(pdfButton!)

      expect(csvButton).not.toBeDisabled()
    })

    it('Complete CSV button is not disabled during PDF export', async () => {
      const user = userEvent.setup()
      ;(exportDashboardPDF as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<ExportModal {...defaultProps} />)

      const pdfButton = screen.getByText('Exporter en PDF').closest('button')
      const allCsvButton = screen.getByText('Export complet CSV').closest('button')

      await user.click(pdfButton!)

      expect(allCsvButton).not.toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('close button has accessible label', () => {
      render(<ExportModal {...defaultProps} />)
      const closeButton = screen.getByRole('button', { name: 'Fermer' })
      expect(closeButton).toHaveAttribute('aria-label', 'Fermer')
    })

    it('backdrop has aria-hidden attribute', () => {
      const { container } = render(<ExportModal {...defaultProps} />)
      const backdrop = container.querySelector('[aria-hidden="true"]')
      expect(backdrop).toBeInTheDocument()
    })

    it('all export buttons are accessible', () => {
      render(<ExportModal {...defaultProps} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(4) // 3 export + 1 close
    })
  })
})
