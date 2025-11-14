/**
 * @jest-environment jsdom
 */
import {
  exportDashboardPDF,
  exportDataCSV,
  exportAllDataCSV,
  exportReportPagesPDF,
} from '@/lib/export/export-utils'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import Papa from 'papaparse'

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
    setProperties: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    getTextWidth: jest.fn(() => 50),
    text: jest.fn(),
  }))
})

// Mock html2canvas
jest.mock('html2canvas', () => {
  return jest.fn().mockResolvedValue({
    toDataURL: jest.fn(() => 'data:image/png;base64,mockImageData'),
    width: 800,
    height: 600,
  })
})

// Mock papaparse
jest.mock('papaparse', () => ({
  unparse: jest.fn((data, options) => 'mocked,csv,data'),
}))

// Mock logger
jest.mock('@/lib/security/logger-helpers', () => ({
  logError: jest.fn(),
}))

// Mock RSE data
jest.mock('@/lib/data/rse-data', () => ({
  environmentData: {
    emissions: [
      { year: 2023, scope1: 450, scope2: 380, scope3: 650 },
      { year: 2024, scope1: 420, scope2: 360, scope3: 620 },
      { year: 2025, scope1: 400, scope2: 340, scope3: 590 },
    ],
  },
  socialData: {
    workforce: [
      { year: 2023, total: 1450, men: 980, women: 470 },
      { year: 2024, total: 1490, men: 1000, women: 490 },
      { year: 2025, total: 1523, men: 1016, women: 507 },
    ],
  },
  governanceData: {
    budget: [
      { pillar: 'Environnement', amount: 3200000, percentage: '39.5%' },
      { pillar: 'Social', amount: 2850000, percentage: '35.2%' },
      { pillar: 'Gouvernance', amount: 2050000, percentage: '25.3%' },
    ],
  },
}))

// Mock PAGES constant
jest.mock('@/lib/constants', () => ({
  PAGES: Array.from({ length: 36 }, (_, i) => ({
    src: `/images/report/page-${i + 1}.webp`,
    number: i + 1,
  })),
}))

// Mock DOM APIs
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = jest.fn()
global.Blob = jest.fn().mockImplementation((content, options) => ({
  content,
  options,
  size: 1000,
  type: options?.type || '',
})) as any

// Mock document methods
const mockLink = {
  setAttribute: jest.fn(),
  click: jest.fn(),
  style: {},
}
document.createElement = jest.fn((tag) => {
  if (tag === 'a') return mockLink as any
  return {} as any
}) as any
document.body.appendChild = jest.fn()
document.body.removeChild = jest.fn()

describe('exportDashboardPDF', () => {
  let mockElement: HTMLElement
  let mockCanvas: any
  let mockPdf: any

  beforeEach(() => {
    mockElement = document.createElement('div')
    mockElement.id = 'test-dashboard'

    mockCanvas = {
      toDataURL: jest.fn(() => 'data:image/png;base64,mockImageData'),
      width: 800,
      height: 600,
    }

    mockPdf = {
      addImage: jest.fn(),
      save: jest.fn(),
      setProperties: jest.fn(),
    }

    ;(html2canvas as jest.Mock).mockResolvedValue(mockCanvas)
    ;(jsPDF as jest.Mock).mockReturnValue(mockPdf)

    document.getElementById = jest.fn((id) => {
      if (id === 'test-dashboard') return mockElement
      return null
    })

    jest.clearAllMocks()
  })

  it('should export dashboard to PDF successfully', async () => {
    await exportDashboardPDF('test-dashboard', 'Test Dashboard')

    expect(document.getElementById).toHaveBeenCalledWith('test-dashboard')
    expect(html2canvas).toHaveBeenCalledWith(mockElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })
    expect(mockPdf.addImage).toHaveBeenCalledWith(
      'data:image/png;base64,mockImageData',
      'PNG',
      0,
      0,
      800,
      600
    )
  })

  it('should throw error when element not found', async () => {
    document.getElementById = jest.fn(() => null)

    await expect(exportDashboardPDF('nonexistent', 'Test')).rejects.toThrow(
      'Dashboard element not found'
    )
  })

  it('should use landscape orientation for wide canvas', async () => {
    mockCanvas.width = 1200
    mockCanvas.height = 600
    ;(html2canvas as jest.Mock).mockResolvedValue(mockCanvas)

    await exportDashboardPDF('test-dashboard', 'Wide Dashboard')

    expect(jsPDF).toHaveBeenCalledWith({
      orientation: 'landscape',
      unit: 'px',
      format: [1200, 600],
    })
  })

  it('should use portrait orientation for tall canvas', async () => {
    mockCanvas.width = 600
    mockCanvas.height = 1200
    ;(html2canvas as jest.Mock).mockResolvedValue(mockCanvas)

    await exportDashboardPDF('test-dashboard', 'Tall Dashboard')

    expect(jsPDF).toHaveBeenCalledWith({
      orientation: 'portrait',
      unit: 'px',
      format: [600, 1200],
    })
  })

  it('should save PDF with correct filename format', async () => {
    const mockDate = new Date('2025-11-14T10:30:00Z')
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

    await exportDashboardPDF('test-dashboard', 'My Dashboard')

    expect(mockPdf.save).toHaveBeenCalledWith('My Dashboard-2025-11-14.pdf')
  })

  it('should handle html2canvas errors', async () => {
    ;(html2canvas as jest.Mock).mockRejectedValue(new Error('Canvas error'))

    await expect(
      exportDashboardPDF('test-dashboard', 'Test')
    ).rejects.toThrow('Canvas error')
  })

  it('should use scale 2 for high quality', async () => {
    await exportDashboardPDF('test-dashboard', 'Test')

    expect(html2canvas).toHaveBeenCalledWith(
      mockElement,
      expect.objectContaining({ scale: 2 })
    )
  })

  it('should use CORS for external images', async () => {
    await exportDashboardPDF('test-dashboard', 'Test')

    expect(html2canvas).toHaveBeenCalledWith(
      mockElement,
      expect.objectContaining({ useCORS: true })
    )
  })

  it('should disable logging in html2canvas', async () => {
    await exportDashboardPDF('test-dashboard', 'Test')

    expect(html2canvas).toHaveBeenCalledWith(
      mockElement,
      expect.objectContaining({ logging: false })
    )
  })

  it('should use white background color', async () => {
    await exportDashboardPDF('test-dashboard', 'Test')

    expect(html2canvas).toHaveBeenCalledWith(
      mockElement,
      expect.objectContaining({ backgroundColor: '#ffffff' })
    )
  })

  it('should handle special characters in filename', async () => {
    await exportDashboardPDF('test-dashboard', 'Dashboard / Test & More')

    expect(mockPdf.save).toHaveBeenCalledWith(
      expect.stringMatching(/Dashboard \/ Test & More-\d{4}-\d{2}-\d{2}\.pdf/)
    )
  })
})

describe('exportDataCSV', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(Papa.unparse as jest.Mock).mockReturnValue('test,csv,data')
  })

  describe('environment data export', () => {
    it('should export environment emissions data', () => {
      exportDataCSV('environment')

      expect(Papa.unparse).toHaveBeenCalled()
      const callArgs = (Papa.unparse as jest.Mock).mock.calls[0]
      const data = callArgs[0]

      expect(data).toHaveLength(3)
      expect(data[0]).toHaveProperty('Année', 2023)
      expect(data[0]).toHaveProperty('Scope 1', 450)
      expect(data[0]).toHaveProperty('Scope 2', 380)
      expect(data[0]).toHaveProperty('Scope 3', 650)
    })

    it('should calculate total emissions', () => {
      exportDataCSV('environment')

      const data = (Papa.unparse as jest.Mock).mock.calls[0][0]
      expect(data[0]).toHaveProperty('Total', 1480)
      expect(data[1]).toHaveProperty('Total', 1400)
      expect(data[2]).toHaveProperty('Total', 1330)
    })

    it('should use semicolon delimiter', () => {
      exportDataCSV('environment')

      const options = (Papa.unparse as jest.Mock).mock.calls[0][1]
      expect(options.delimiter).toBe(';')
    })

    it('should include headers', () => {
      exportDataCSV('environment')

      const options = (Papa.unparse as jest.Mock).mock.calls[0][1]
      expect(options.header).toBe(true)
    })

    it('should create correct filename for environment', () => {
      exportDataCSV('environment')

      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        expect.stringMatching(/donnees-environnement-\d{4}-\d{2}-\d{2}\.csv/)
      )
    })
  })

  describe('social data export', () => {
    it('should export social workforce data', () => {
      exportDataCSV('social')

      const data = (Papa.unparse as jest.Mock).mock.calls[0][0]
      expect(data).toHaveLength(3)
      expect(data[0]).toHaveProperty('Année', 2023)
      expect(data[0]).toHaveProperty('Total', 1450)
      expect(data[0]).toHaveProperty('Hommes', 980)
      expect(data[0]).toHaveProperty('Femmes', 470)
    })

    it('should calculate women percentage', () => {
      exportDataCSV('social')

      const data = (Papa.unparse as jest.Mock).mock.calls[0][0]
      expect(data[0]).toHaveProperty('% Femmes', '32.4')
      expect(data[1]).toHaveProperty('% Femmes', '32.9')
      expect(data[2]).toHaveProperty('% Femmes', '33.3')
    })

    it('should format percentage with 1 decimal', () => {
      exportDataCSV('social')

      const data = (Papa.unparse as jest.Mock).mock.calls[0][0]
      expect(data[0]['% Femmes']).toMatch(/^\d+\.\d$/)
    })

    it('should create correct filename for social', () => {
      exportDataCSV('social')

      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        expect.stringMatching(/donnees-social-\d{4}-\d{2}-\d{2}\.csv/)
      )
    })
  })

  describe('governance data export', () => {
    it('should export governance budget data', () => {
      exportDataCSV('governance')

      const data = (Papa.unparse as jest.Mock).mock.calls[0][0]
      expect(data).toHaveLength(3)
      expect(data[0]).toHaveProperty('Pilier', 'Environnement')
      expect(data[0]).toHaveProperty('Budget (€)', 3200000)
      expect(data[0]).toHaveProperty('Pourcentage', '39.5%')
    })

    it('should include all budget pillars', () => {
      exportDataCSV('governance')

      const data = (Papa.unparse as jest.Mock).mock.calls[0][0]
      expect(data[0].Pilier).toBe('Environnement')
      expect(data[1].Pilier).toBe('Social')
      expect(data[2].Pilier).toBe('Gouvernance')
    })

    it('should create correct filename for governance', () => {
      exportDataCSV('governance')

      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        expect.stringMatching(/donnees-gouvernance-\d{4}-\d{2}-\d{2}\.csv/)
      )
    })
  })

  describe('CSV file creation', () => {
    it('should create blob with UTF-8 BOM', () => {
      exportDataCSV('environment')

      expect(global.Blob).toHaveBeenCalledWith(
        ['\ufeff' + 'test,csv,data'],
        { type: 'text/csv;charset=utf-8;' }
      )
    })

    it('should create object URL for blob', () => {
      exportDataCSV('environment')

      expect(URL.createObjectURL).toHaveBeenCalled()
    })

    it('should create download link', () => {
      exportDataCSV('environment')

      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:mock-url')
    })

    it('should hide link element', () => {
      exportDataCSV('environment')

      expect(mockLink.style.visibility).toBe('hidden')
    })

    it('should append link to body', () => {
      exportDataCSV('environment')

      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink)
    })

    it('should trigger download click', () => {
      exportDataCSV('environment')

      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should remove link after click', () => {
      exportDataCSV('environment')

      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink)
    })

    it('should include current date in filename', () => {
      const mockDate = new Date('2025-11-14T10:30:00Z')
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

      exportDataCSV('environment')

      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        'donnees-environnement-2025-11-14.csv'
      )
    })
  })
})

describe('exportAllDataCSV', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(Papa.unparse as jest.Mock).mockReturnValue('complete,csv,data')
  })

  it('should export all RSE data', () => {
    exportAllDataCSV()

    expect(Papa.unparse).toHaveBeenCalled()
    const data = (Papa.unparse as jest.Mock).mock.calls[0][0]
    expect(data).toHaveLength(9)
  })

  it('should include environment indicators', () => {
    exportAllDataCSV()

    const data = (Papa.unparse as jest.Mock).mock.calls[0][0]
    const envData = data.filter((d: any) => d.Section === 'Environnement')
    expect(envData).toHaveLength(3)
  })

  it('should include social indicators', () => {
    exportAllDataCSV()

    const data = (Papa.unparse as jest.Mock).mock.calls[0][0]
    const socialData = data.filter((d: any) => d.Section === 'Social')
    expect(socialData).toHaveLength(3)
  })

  it('should include governance indicators', () => {
    exportAllDataCSV()

    const data = (Papa.unparse as jest.Mock).mock.calls[0][0]
    const govData = data.filter((d: any) => d.Section === 'Gouvernance')
    expect(govData).toHaveLength(3)
  })

  it('should have correct data structure', () => {
    exportAllDataCSV()

    const data = (Papa.unparse as jest.Mock).mock.calls[0][0]
    expect(data[0]).toHaveProperty('Section')
    expect(data[0]).toHaveProperty('Indicateur')
    expect(data[0]).toHaveProperty('Valeur')
  })

  it('should use semicolon delimiter', () => {
    exportAllDataCSV()

    const options = (Papa.unparse as jest.Mock).mock.calls[0][1]
    expect(options.delimiter).toBe(';')
  })

  it('should include headers', () => {
    exportAllDataCSV()

    const options = (Papa.unparse as jest.Mock).mock.calls[0][1]
    expect(options.header).toBe(true)
  })

  it('should create blob with UTF-8 BOM', () => {
    exportAllDataCSV()

    expect(global.Blob).toHaveBeenCalledWith(
      ['\ufeff' + 'complete,csv,data'],
      { type: 'text/csv;charset=utf-8;' }
    )
  })

  it('should create correct filename', () => {
    exportAllDataCSV()

    expect(mockLink.setAttribute).toHaveBeenCalledWith(
      'download',
      expect.stringMatching(/rapport-rse-complet-\d{4}-\d{2}-\d{2}\.csv/)
    )
  })

  it('should trigger download', () => {
    exportAllDataCSV()

    expect(mockLink.click).toHaveBeenCalled()
    expect(document.body.appendChild).toHaveBeenCalled()
    expect(document.body.removeChild).toHaveBeenCalled()
  })
})

describe('exportReportPagesPDF', () => {
  let mockPdf: any
  let mockImage: any

  beforeEach(() => {
    mockPdf = {
      addImage: jest.fn(),
      addPage: jest.fn(),
      save: jest.fn(),
      setProperties: jest.fn(),
      setFontSize: jest.fn(),
      setTextColor: jest.fn(),
      getTextWidth: jest.fn(() => 50),
      text: jest.fn(),
    }

    mockImage = {
      width: 1200,
      height: 1600,
      onload: null as any,
      onerror: null as any,
      src: '',
      crossOrigin: '',
    }

    ;(jsPDF as jest.Mock).mockReturnValue(mockPdf)

    global.Image = jest.fn().mockImplementation(() => {
      const img = { ...mockImage }
      setTimeout(() => {
        if (img.onload) img.onload()
      }, 0)
      return img
    }) as any

    jest.clearAllMocks()
  })

  describe('single page export', () => {
    it('should export single page successfully', async () => {
      await exportReportPagesPDF([5])

      expect(jsPDF).toHaveBeenCalledWith({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })
      expect(mockPdf.addImage).toHaveBeenCalled()
      expect(mockPdf.save).toHaveBeenCalled()
    })

    it('should set PDF properties', async () => {
      await exportReportPagesPDF([1])

      expect(mockPdf.setProperties).toHaveBeenCalledWith({
        title: 'Rapport RSE 2023 - Clauger',
        author: 'Clauger',
        subject: 'Rapport de Responsabilité Sociétale des Entreprises',
        creator: 'Clauger RSE Web Application',
      })
    })

    it('should load image with correct path', async () => {
      await exportReportPagesPDF([5])

      const ImageConstructor = global.Image as jest.Mock
      const imageInstance = ImageConstructor.mock.results[0].value

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(imageInstance.src).toBe('/images/report/page-5.webp')
    })

    it('should set crossOrigin for image', async () => {
      await exportReportPagesPDF([1])

      const ImageConstructor = global.Image as jest.Mock
      const imageInstance = ImageConstructor.mock.results[0].value

      expect(imageInstance.crossOrigin).toBe('anonymous')
    })

    it('should use portrait orientation for tall images', async () => {
      mockImage.width = 1200
      mockImage.height = 1600

      await exportReportPagesPDF([1])

      expect(jsPDF).toHaveBeenCalledWith({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })
    })

    it('should use landscape orientation for wide images', async () => {
      mockImage.width = 1600
      mockImage.height = 1200

      await exportReportPagesPDF([1])

      expect(jsPDF).toHaveBeenCalledWith({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })
    })

    it('should add page number footer', async () => {
      await exportReportPagesPDF([5])

      expect(mockPdf.setFontSize).toHaveBeenCalledWith(9)
      expect(mockPdf.setTextColor).toHaveBeenCalledWith(128, 128, 128)
      expect(mockPdf.text).toHaveBeenCalledWith('Page 5/36', expect.any(Number), expect.any(Number))
    })

    it('should calculate correct image dimensions with margins', async () => {
      mockImage.width = 1200
      mockImage.height = 1600

      await exportReportPagesPDF([1])

      expect(mockPdf.addImage).toHaveBeenCalledWith(
        expect.any(Object),
        'WEBP',
        expect.any(Number),
        10, // margin
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('should create filename for single page', async () => {
      const mockDate = new Date('2025-11-14T10:30:00Z')
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

      await exportReportPagesPDF([5])

      expect(mockPdf.save).toHaveBeenCalledWith('rapport-page-5-2025-11-14.pdf')
    })

    it('should use custom filename if provided', async () => {
      await exportReportPagesPDF([5], 'custom-report')

      expect(mockPdf.save).toHaveBeenCalledWith(
        expect.stringMatching(/custom-report-\d{4}-\d{2}-\d{2}\.pdf/)
      )
    })
  })

  describe('multiple pages export', () => {
    it('should export multiple pages successfully', async () => {
      await exportReportPagesPDF([1, 5, 10])

      expect(mockPdf.addImage).toHaveBeenCalledTimes(3)
      expect(mockPdf.addPage).toHaveBeenCalledTimes(2)
    })

    it('should sort pages in ascending order', async () => {
      await exportReportPagesPDF([10, 5, 1])

      const ImageConstructor = global.Image as jest.Mock
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(ImageConstructor.mock.results[0].value.src).toContain('page-1.webp')
      expect(ImageConstructor.mock.results[1].value.src).toContain('page-5.webp')
      expect(ImageConstructor.mock.results[2].value.src).toContain('page-10.webp')
    })

    it('should add new page for each additional page', async () => {
      await exportReportPagesPDF([1, 2, 3, 4])

      expect(mockPdf.addPage).toHaveBeenCalledTimes(3)
      expect(mockPdf.addImage).toHaveBeenCalledTimes(4)
    })

    it('should set properties only once', async () => {
      await exportReportPagesPDF([1, 2, 3])

      expect(mockPdf.setProperties).toHaveBeenCalledTimes(1)
    })

    it('should handle different orientations per page', async () => {
      let callCount = 0
      global.Image = jest.fn().mockImplementation(() => {
        const img = {
          ...mockImage,
          width: callCount === 0 ? 1200 : 1600,
          height: callCount === 0 ? 1600 : 1200,
        }
        callCount++
        setTimeout(() => {
          if (img.onload) img.onload()
        }, 0)
        return img
      }) as any

      await exportReportPagesPDF([1, 2])

      expect(mockPdf.addPage).toHaveBeenCalledWith('a4', 'landscape')
    })

    it('should create range filename for multiple pages', async () => {
      await exportReportPagesPDF([5, 6, 7, 8, 9])

      expect(mockPdf.save).toHaveBeenCalledWith(
        expect.stringMatching(/rapport-pages-5-a-9-\d{4}-\d{2}-\d{2}\.pdf/)
      )
    })

    it('should show correct page numbers in footer', async () => {
      await exportReportPagesPDF([5, 10, 15])

      expect(mockPdf.text).toHaveBeenCalledWith('Page 5/15', expect.any(Number), expect.any(Number))
      expect(mockPdf.text).toHaveBeenCalledWith('Page 10/15', expect.any(Number), expect.any(Number))
      expect(mockPdf.text).toHaveBeenCalledWith('Page 15/15', expect.any(Number), expect.any(Number))
    })
  })

  describe('error handling', () => {
    it('should throw error when no pages selected', async () => {
      await expect(exportReportPagesPDF([])).rejects.toThrow(
        'Aucune page sélectionnée'
      )
    })

    it('should throw error when image fails to load', async () => {
      global.Image = jest.fn().mockImplementation(() => {
        const img = { ...mockImage }
        setTimeout(() => {
          if (img.onerror) img.onerror()
        }, 0)
        return img
      }) as any

      await expect(exportReportPagesPDF([1])).rejects.toThrow(
        'Impossible de charger la page 1'
      )
    })

    it('should log error when image loading fails', async () => {
      const { logError } = require('@/lib/security/logger-helpers')

      global.Image = jest.fn().mockImplementation(() => {
        const img = { ...mockImage }
        setTimeout(() => {
          if (img.onerror) img.onerror()
        }, 0)
        return img
      }) as any

      await expect(exportReportPagesPDF([5])).rejects.toThrow()

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(logError).toHaveBeenCalledWith(
        'Report page image loading failed',
        expect.any(Error),
        { pageNumber: 5 }
      )
    })

    it('should throw error for specific page that fails', async () => {
      let callCount = 0
      global.Image = jest.fn().mockImplementation(() => {
        const img = { ...mockImage }
        const shouldFail = callCount === 1
        callCount++
        setTimeout(() => {
          if (shouldFail && img.onerror) {
            img.onerror()
          } else if (img.onload) {
            img.onload()
          }
        }, 0)
        return img
      }) as any

      await expect(exportReportPagesPDF([1, 5, 10])).rejects.toThrow(
        'Impossible de charger la page 5'
      )
    })
  })

  describe('aspect ratio and positioning', () => {
    it('should preserve aspect ratio for wide images', async () => {
      mockImage.width = 1600
      mockImage.height = 1200

      await exportReportPagesPDF([1])

      const addImageCall = mockPdf.addImage.mock.calls[0]
      const [, , x, y, width, height] = addImageCall

      const imageAspectRatio = mockImage.width / mockImage.height
      const addedAspectRatio = width / height

      expect(Math.abs(imageAspectRatio - addedAspectRatio)).toBeLessThan(0.01)
    })

    it('should preserve aspect ratio for tall images', async () => {
      mockImage.width = 1200
      mockImage.height = 1600

      await exportReportPagesPDF([1])

      const addImageCall = mockPdf.addImage.mock.calls[0]
      const [, , x, y, width, height] = addImageCall

      const imageAspectRatio = mockImage.width / mockImage.height
      const addedAspectRatio = width / height

      expect(Math.abs(imageAspectRatio - addedAspectRatio)).toBeLessThan(0.01)
    })

    it('should center horizontally for narrow images', async () => {
      mockImage.width = 600
      mockImage.height = 1600

      await exportReportPagesPDF([1])

      const addImageCall = mockPdf.addImage.mock.calls[0]
      const [, , x] = addImageCall

      expect(x).toBeGreaterThan(10) // Greater than margin
    })

    it('should respect top margin', async () => {
      await exportReportPagesPDF([1])

      const addImageCall = mockPdf.addImage.mock.calls[0]
      const [, , , y] = addImageCall

      expect(y).toBe(10) // Top margin
    })

    it('should respect footer height in calculations', async () => {
      await exportReportPagesPDF([1])

      const addImageCall = mockPdf.addImage.mock.calls[0]
      const [, , , , , height] = addImageCall

      // Height should account for margins and footer
      expect(height).toBeLessThan(297 - 10 - 10 - 10) // page height - top margin - bottom margin - footer
    })

    it('should fit wide images to page width', async () => {
      mockImage.width = 2000
      mockImage.height = 800

      await exportReportPagesPDF([1])

      const addImageCall = mockPdf.addImage.mock.calls[0]
      const [, , x, , width] = addImageCall

      expect(x).toBe(10) // Left margin
      expect(width).toBe(277) // Landscape page width - margins (297 - 20)
    })

    it('should fit tall images to available height', async () => {
      mockImage.width = 800
      mockImage.height = 3000

      await exportReportPagesPDF([1])

      const addImageCall = mockPdf.addImage.mock.calls[0]
      const [, , , , , height] = addImageCall

      // Should use available height (page height - margins - footer)
      expect(height).toBeLessThanOrEqual(277) // 297 - 10 - 10
    })
  })

  describe('page numbering', () => {
    it('should center page number text', async () => {
      mockPdf.getTextWidth.mockReturnValue(30)

      await exportReportPagesPDF([5])

      expect(mockPdf.text).toHaveBeenCalledWith(
        'Page 5/36',
        (210 - 30) / 2, // centered
        expect.any(Number)
      )
    })

    it('should place page number at bottom', async () => {
      await exportReportPagesPDF([1])

      expect(mockPdf.text).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number),
        290 // 297 - 7
      )
    })

    it('should use gray color for page number', async () => {
      await exportReportPagesPDF([1])

      expect(mockPdf.setTextColor).toHaveBeenCalledWith(128, 128, 128)
    })

    it('should use small font size for page number', async () => {
      await exportReportPagesPDF([1])

      expect(mockPdf.setFontSize).toHaveBeenCalledWith(9)
    })

    it('should show last selected page number for multiple pages', async () => {
      await exportReportPagesPDF([5, 10, 15, 20])

      expect(mockPdf.text).toHaveBeenCalledWith('Page 5/20', expect.any(Number), expect.any(Number))
      expect(mockPdf.text).toHaveBeenCalledWith('Page 10/20', expect.any(Number), expect.any(Number))
      expect(mockPdf.text).toHaveBeenCalledWith('Page 15/20', expect.any(Number), expect.any(Number))
      expect(mockPdf.text).toHaveBeenCalledWith('Page 20/20', expect.any(Number), expect.any(Number))
    })
  })

  describe('image format', () => {
    it('should add image as WEBP format', async () => {
      await exportReportPagesPDF([1])

      expect(mockPdf.addImage).toHaveBeenCalledWith(
        expect.any(Object),
        'WEBP',
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number)
      )
    })
  })
})
