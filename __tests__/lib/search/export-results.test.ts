import { SearchResultsExporter, type ExportFormat, type ExportOptions } from '@/lib/search/export-results';
import type { SearchResult } from '@/lib/search/types';

// Mock window and navigator for browser APIs
const mockClipboard = {
  writeText: jest.fn()
};

const mockURL = {
  createObjectURL: jest.fn(),
  revokeObjectURL: jest.fn()
};

Object.defineProperty(global, 'navigator', {
  value: { clipboard: mockClipboard },
  writable: true
});

Object.defineProperty(global, 'URL', {
  value: mockURL,
  writable: true
});

describe('SearchResultsExporter', () => {
  let exporter: SearchResultsExporter;
  let mockResults: SearchResult[];

  beforeEach(() => {
    exporter = new SearchResultsExporter();

    mockResults = [
      {
        id: 1,
        pageNumber: 5,
        title: 'Page 5',
        snippet: 'Ceci est un extrait sur le développement durable et environnement',
        highlightedSnippet: 'Ceci est un extrait sur le <mark>développement durable</mark> et <mark>environnement</mark>',
        score: 8.5,
        confidence: 92.3
      },
      {
        id: 2,
        pageNumber: 12,
        title: 'Page 12',
        snippet: 'Gouvernance responsable et RSE Clauger',
        highlightedSnippet: 'Gouvernance responsable et <mark>RSE</mark> Clauger',
        score: 6.2,
        confidence: 87.1
      },
      {
        id: 3,
        pageNumber: 18,
        title: 'Page 18',
        snippet: 'Innovation technologique pour un avenir durable',
        highlightedSnippet: 'Innovation technologique pour un avenir <mark>durable</mark>',
        score: 7.8,
        confidence: 95.6
      }
    ];

    jest.clearAllMocks();
  });

  describe('exportToJSON', () => {
    it('should export results to JSON format', () => {
      const result = exporter.exportToJSON(mockResults, 'développement durable');

      const parsed = JSON.parse(result);

      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.query).toBe('développement durable');
      expect(parsed.metadata.totalResults).toBe(3);
      expect(parsed.metadata.exportedAt).toBeDefined();
      expect(parsed.metadata.version).toBe('1.0');
    });

    it('should include all result fields in JSON', () => {
      const result = exporter.exportToJSON(mockResults, 'test query');
      const parsed = JSON.parse(result);

      expect(parsed.results).toHaveLength(3);
      expect(parsed.results[0]).toHaveProperty('pageNumber');
      expect(parsed.results[0]).toHaveProperty('title');
      expect(parsed.results[0]).toHaveProperty('snippet');
      expect(parsed.results[0]).toHaveProperty('score');
      expect(parsed.results[0]).toHaveProperty('confidence');
    });

    it('should format JSON with indentation', () => {
      const result = exporter.exportToJSON(mockResults, 'test');

      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });

    it('should handle empty results', () => {
      const result = exporter.exportToJSON([], 'empty query');
      const parsed = JSON.parse(result);

      expect(parsed.metadata.totalResults).toBe(0);
      expect(parsed.results).toHaveLength(0);
    });

    it('should handle special characters in query', () => {
      const result = exporter.exportToJSON(mockResults, 'test "query" & more');
      const parsed = JSON.parse(result);

      expect(parsed.metadata.query).toBe('test "query" & more');
    });

    it('should include valid ISO timestamp', () => {
      const result = exporter.exportToJSON(mockResults, 'test');
      const parsed = JSON.parse(result);

      const timestamp = new Date(parsed.metadata.exportedAt);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.toISOString()).toBe(parsed.metadata.exportedAt);
    });
  });

  describe('exportToCSV', () => {
    it('should export results to CSV format', () => {
      const result = exporter.exportToCSV(mockResults, 'développement durable');

      expect(result).toContain('# Search Query: développement durable');
      expect(result).toContain('# Exported:');
      expect(result).toContain('# Total Results: 3');
      expect(result).toContain('Page,Title,Snippet,Score,Confidence');
    });

    it('should include all rows in CSV', () => {
      const result = exporter.exportToCSV(mockResults, 'test');
      const lines = result.split('\n');

      expect(lines.filter(l => l.startsWith('5,'))).toHaveLength(1);
      expect(lines.filter(l => l.startsWith('12,'))).toHaveLength(1);
      expect(lines.filter(l => l.startsWith('18,'))).toHaveLength(1);
    });

    it('should escape quotes in CSV', () => {
      const resultsWithQuotes: SearchResult[] = [{
        id: 1,
        pageNumber: 1,
        title: 'Page 1',
        snippet: 'Text with "quotes" inside',
        highlightedSnippet: 'Text with "quotes" inside',
        score: 5,
        confidence: 85
      }];

      const result = exporter.exportToCSV(resultsWithQuotes, 'test');

      expect(result).toContain('""quotes""');
    });

    it('should format scores with 2 decimals', () => {
      const result = exporter.exportToCSV(mockResults, 'test');

      expect(result).toContain('8.50');
      expect(result).toContain('6.20');
      expect(result).toContain('7.80');
    });

    it('should format confidence with percentage', () => {
      const result = exporter.exportToCSV(mockResults, 'test');

      expect(result).toContain('92.3%');
      expect(result).toContain('87.1%');
      expect(result).toContain('95.6%');
    });

    it('should use French locale for date', () => {
      const result = exporter.exportToCSV(mockResults, 'test');

      expect(result).toContain('# Exported:');
      const lines = result.split('\n');
      const exportedLine = lines.find(l => l.startsWith('# Exported:'));
      expect(exportedLine).toBeDefined();
    });

    it('should handle empty results in CSV', () => {
      const result = exporter.exportToCSV([], 'empty');

      expect(result).toContain('# Total Results: 0');
      expect(result).toContain('Page,Title,Snippet,Score,Confidence');
    });
  });

  describe('exportToMarkdown', () => {
    it('should export results to Markdown format', () => {
      const result = exporter.exportToMarkdown(mockResults, 'RSE Clauger');

      expect(result).toContain('# Résultats de Recherche');
      expect(result).toContain('**Requête :** `RSE Clauger`');
      expect(result).toContain('**Nombre de résultats :** 3');
      expect(result).toContain('## 1. Page 5');
      expect(result).toContain('## 2. Page 12');
      expect(result).toContain('## 3. Page 18');
    });

    it('should include metadata in Markdown', () => {
      const result = exporter.exportToMarkdown(mockResults, 'test');

      expect(result).toContain('**Date :**');
      expect(result).toContain('**Nombre de résultats :** 3');
    });

    it('should format results as sections', () => {
      const result = exporter.exportToMarkdown(mockResults, 'test');

      expect(result).toContain('### Extrait :');
      expect(result).toContain('> Ceci est un extrait');
      expect(result).toContain('- **Score :** 8.50');
      expect(result).toContain('- **Confiance OCR :** 92.3%');
    });

    it('should include separators between results', () => {
      const result = exporter.exportToMarkdown(mockResults, 'test');

      const separators = (result.match(/---/g) || []).length;
      expect(separators).toBeGreaterThan(0);
    });

    it('should escape backticks in query', () => {
      const result = exporter.exportToMarkdown(mockResults, 'test `code` query');

      expect(result).toContain('\\`');
    });

    it('should handle empty results in Markdown', () => {
      const result = exporter.exportToMarkdown([], 'empty');

      expect(result).toContain('# Résultats de Recherche');
      expect(result).toContain('**Nombre de résultats :** 0');
    });

    it('should number results correctly', () => {
      const result = exporter.exportToMarkdown(mockResults, 'test');

      expect(result).toContain('## 1. Page 5');
      expect(result).toContain('## 2. Page 12');
      expect(result).toContain('## 3. Page 18');
    });
  });

  describe('exportToText', () => {
    it('should export results to plain text format', () => {
      const result = exporter.exportToText(mockResults, 'gouvernance');

      expect(result).toContain('RÉSULTATS DE RECHERCHE');
      expect(result).toContain('======================');
      expect(result).toContain('Requête : gouvernance');
      expect(result).toContain('Nombre de résultats : 3');
    });

    it('should format results as numbered list', () => {
      const result = exporter.exportToText(mockResults, 'test');

      expect(result).toContain('1. Page 5');
      expect(result).toContain('2. Page 12');
      expect(result).toContain('3. Page 18');
    });

    it('should include score and confidence on same line', () => {
      const result = exporter.exportToText(mockResults, 'test');

      expect(result).toContain('Score: 8.50 | Confiance: 92.3%');
      expect(result).toContain('Score: 6.20 | Confiance: 87.1%');
    });

    it('should include separators between results', () => {
      const result = exporter.exportToText(mockResults, 'test');

      const separators = (result.match(/----------------------/g) || []).length;
      expect(separators).toBeGreaterThanOrEqual(mockResults.length);
    });

    it('should indent content properly', () => {
      const result = exporter.exportToText(mockResults, 'test');

      expect(result).toContain('   Score:');
      expect(result).toContain('   Ceci est un extrait');
    });

    it('should use French locale for date', () => {
      const result = exporter.exportToText(mockResults, 'test');

      expect(result).toContain('Date :');
    });

    it('should handle empty results in text', () => {
      const result = exporter.exportToText([], 'empty');

      expect(result).toContain('RÉSULTATS DE RECHERCHE');
      expect(result).toContain('Nombre de résultats : 0');
    });
  });

  describe('export (main method)', () => {
    it('should export to JSON when format is json', () => {
      const options: ExportOptions = {
        format: 'json',
        query: 'test query'
      };

      const result = exporter.export(mockResults, options);
      const parsed = JSON.parse(result);

      expect(parsed.metadata.query).toBe('test query');
    });

    it('should export to CSV when format is csv', () => {
      const options: ExportOptions = {
        format: 'csv',
        query: 'test query'
      };

      const result = exporter.export(mockResults, options);

      expect(result).toContain('# Search Query: test query');
      expect(result).toContain('Page,Title,Snippet');
    });

    it('should export to Markdown when format is markdown', () => {
      const options: ExportOptions = {
        format: 'markdown',
        query: 'test query'
      };

      const result = exporter.export(mockResults, options);

      expect(result).toContain('# Résultats de Recherche');
      expect(result).toContain('**Requête :** `test query`');
    });

    it('should export to Text when format is text', () => {
      const options: ExportOptions = {
        format: 'text',
        query: 'test query'
      };

      const result = exporter.export(mockResults, options);

      expect(result).toContain('RÉSULTATS DE RECHERCHE');
      expect(result).toContain('Requête : test query');
    });

    it('should throw error for unsupported format', () => {
      const options: ExportOptions = {
        format: 'invalid' as ExportFormat,
        query: 'test'
      };

      expect(() => exporter.export(mockResults, options)).toThrow('Unsupported export format');
    });
  });

  describe('copyToClipboard', () => {
    it('should copy content to clipboard', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      await exporter.copyToClipboard('test content');

      expect(mockClipboard.writeText).toHaveBeenCalledWith('test content');
    });

    it('should handle clipboard error', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard error'));

      await expect(exporter.copyToClipboard('test')).rejects.toThrow('Clipboard error');
    });

    it('should throw error if clipboard API not available', async () => {
      const originalNavigator = global.navigator;
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true
      });

      await expect(exporter.copyToClipboard('test')).rejects.toThrow('Clipboard API not available');

      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true
      });
    });
  });

  describe('downloadFile', () => {
    let mockLink: any;
    let mockBlob: any;

    beforeEach(() => {
      mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
        remove: jest.fn()
      };

      mockBlob = new Blob(['test'], { type: 'text/plain' });

      global.Blob = jest.fn().mockReturnValue(mockBlob) as any;
      global.document = {
        createElement: jest.fn().mockReturnValue(mockLink),
        body: {
          appendChild: jest.fn(),
          removeChild: jest.fn()
        }
      } as any;

      mockURL.createObjectURL.mockReturnValue('blob:test-url');
    });

    it('should create and click download link', () => {
      exporter.downloadFile('test content', 'test.txt', 'text/plain');

      expect(global.document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('blob:test-url');
      expect(mockLink.download).toBe('test.txt');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should append and remove link from DOM', () => {
      exporter.downloadFile('test', 'file.txt', 'text/plain');

      expect(global.document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(global.document.body.removeChild).toHaveBeenCalledWith(mockLink);
    });

    it('should create blob with correct content and type', () => {
      exporter.downloadFile('test content', 'file.json', 'application/json');

      expect(global.Blob).toHaveBeenCalledWith(['test content'], { type: 'application/json' });
    });

    it('should revoke object URL after download', () => {
      exporter.downloadFile('test', 'file.txt', 'text/plain');

      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });

    it('should throw error in SSR context', () => {
      const originalWindow = (global as any).window;
      delete (global as any).window;

      expect(() => exporter.downloadFile('test', 'file.txt', 'text/plain'))
        .toThrow('downloadFile can only be called in browser environment');

      (global as any).window = originalWindow;
    });
  });

  describe('exportAndDownload', () => {
    let mockLink: any;

    beforeEach(() => {
      mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
        remove: jest.fn()
      };

      global.Blob = jest.fn().mockReturnValue(new Blob()) as any;
      global.document = {
        createElement: jest.fn().mockReturnValue(mockLink),
        body: {
          appendChild: jest.fn(),
          removeChild: jest.fn()
        }
      } as any;

      mockURL.createObjectURL.mockReturnValue('blob:test-url');
    });

    it('should generate correct filename for JSON export', () => {
      const options: ExportOptions = {
        format: 'json',
        query: 'test query'
      };

      exporter.exportAndDownload(mockResults, options);

      expect(mockLink.download).toMatch(/^search-test-query-.*\.json$/);
    });

    it('should generate correct filename for CSV export', () => {
      const options: ExportOptions = {
        format: 'csv',
        query: 'RSE Clauger'
      };

      exporter.exportAndDownload(mockResults, options);

      expect(mockLink.download).toMatch(/^search-RSE-Clauger-.*\.csv$/);
    });

    it('should generate correct filename for Markdown export', () => {
      const options: ExportOptions = {
        format: 'markdown',
        query: 'gouvernance'
      };

      exporter.exportAndDownload(mockResults, options);

      expect(mockLink.download).toMatch(/^search-gouvernance-.*\.md$/);
    });

    it('should generate correct filename for Text export', () => {
      const options: ExportOptions = {
        format: 'text',
        query: 'environnement'
      };

      exporter.exportAndDownload(mockResults, options);

      expect(mockLink.download).toMatch(/^search-environnement-.*\.txt$/);
    });

    it('should sanitize query in filename', () => {
      const options: ExportOptions = {
        format: 'json',
        query: 'test@#$%query!&*()'
      };

      exporter.exportAndDownload(mockResults, options);

      expect(mockLink.download).toMatch(/^search-test-query-.*\.json$/);
    });

    it('should limit query length in filename', () => {
      const options: ExportOptions = {
        format: 'json',
        query: 'a'.repeat(100)
      };

      exporter.exportAndDownload(mockResults, options);

      const filenameMatch = mockLink.download.match(/^search-(.+?)-.*\.json$/);
      expect(filenameMatch).toBeTruthy();
      expect(filenameMatch![1].length).toBeLessThanOrEqual(30);
    });

    it('should include timestamp in filename', () => {
      const options: ExportOptions = {
        format: 'json',
        query: 'test'
      };

      exporter.exportAndDownload(mockResults, options);

      expect(mockLink.download).toMatch(/search-test-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}.*\.json/);
    });
  });

  describe('Integration Tests', () => {
    it('should export and prepare download for all formats', () => {
      const formats: ExportFormat[] = ['json', 'csv', 'markdown', 'text'];

      formats.forEach(format => {
        const options: ExportOptions = {
          format,
          query: 'test'
        };

        const result = exporter.export(mockResults, options);

        expect(result).toBeTruthy();
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('should handle large number of results', () => {
      const largeResults = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        pageNumber: i + 1,
        title: `Page ${i + 1}`,
        snippet: `Snippet ${i}`,
        highlightedSnippet: `Snippet ${i}`,
        score: Math.random() * 10,
        confidence: 70 + Math.random() * 30
      }));

      const result = exporter.exportToJSON(largeResults, 'large test');
      const parsed = JSON.parse(result);

      expect(parsed.results).toHaveLength(100);
    });

    it('should preserve accented characters in all formats', () => {
      const accentedResults: SearchResult[] = [{
        id: 1,
        pageNumber: 1,
        title: 'Page 1',
        snippet: 'Développement durable, énergie, écologie',
        highlightedSnippet: '<mark>Développement</mark> durable',
        score: 5,
        confidence: 85
      }];

      const json = exporter.exportToJSON(accentedResults, 'énergie');
      const csv = exporter.exportToCSV(accentedResults, 'énergie');
      const markdown = exporter.exportToMarkdown(accentedResults, 'énergie');
      const text = exporter.exportToText(accentedResults, 'énergie');

      expect(json).toContain('énergie');
      expect(csv).toContain('énergie');
      expect(markdown).toContain('énergie');
      expect(text).toContain('énergie');
    });
  });
});
