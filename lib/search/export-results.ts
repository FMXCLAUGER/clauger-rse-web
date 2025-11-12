import type { SearchResult } from './types';

export type ExportFormat = 'json' | 'csv' | 'markdown' | 'text';

export interface ExportOptions {
  format: ExportFormat;
  query: string;
  timestamp?: boolean;
  includeMetadata?: boolean;
}

export class SearchResultsExporter {
  exportToJSON(results: SearchResult[], query: string): string {
    const data = {
      metadata: {
        query,
        totalResults: results.length,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      },
      results: results.map(r => ({
        pageNumber: r.pageNumber,
        title: r.title,
        snippet: r.snippet,
        score: r.score,
        confidence: r.confidence
      }))
    };

    return JSON.stringify(data, null, 2);
  }

  exportToCSV(results: SearchResult[], query: string): string {
    const headers = ['Page', 'Title', 'Snippet', 'Score', 'Confidence'];
    const rows = results.map(r => [
      r.pageNumber.toString(),
      r.title,
      `"${r.snippet.replace(/"/g, '""')}"`,
      r.score.toFixed(2),
      r.confidence.toFixed(1) + '%'
    ]);

    const csv = [
      `# Search Query: ${query}`,
      `# Exported: ${new Date().toLocaleString('fr-FR')}`,
      `# Total Results: ${results.length}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csv;
  }

  exportToMarkdown(results: SearchResult[], query: string): string {
    const markdown = [
      `# Résultats de Recherche`,
      ``,
      `**Requête :** \`${query}\`  `,
      `**Date :** ${new Date().toLocaleString('fr-FR')}  `,
      `**Nombre de résultats :** ${results.length}`,
      ``,
      `---`,
      ``,
      ...results.map((r, index) => [
        `## ${index + 1}. ${r.title}`,
        ``,
        `- **Score :** ${r.score.toFixed(2)}`,
        `- **Confiance OCR :** ${r.confidence.toFixed(1)}%`,
        ``,
        `### Extrait :`,
        ``,
        `> ${r.snippet}`,
        ``,
        `---`,
        ``
      ].join('\n'))
    ].join('\n');

    return markdown;
  }

  exportToText(results: SearchResult[], query: string): string {
    const text = [
      `RÉSULTATS DE RECHERCHE`,
      `======================`,
      ``,
      `Requête : ${query}`,
      `Date : ${new Date().toLocaleString('fr-FR')}`,
      `Nombre de résultats : ${results.length}`,
      ``,
      `----------------------`,
      ``,
      ...results.map((r, index) => [
        `${index + 1}. ${r.title}`,
        `   Score: ${r.score.toFixed(2)} | Confiance: ${r.confidence.toFixed(1)}%`,
        ``,
        `   ${r.snippet}`,
        ``,
        `   ----------------------`,
        ``
      ].join('\n'))
    ].join('\n');

    return text;
  }

  export(results: SearchResult[], options: ExportOptions): string {
    switch (options.format) {
      case 'json':
        return this.exportToJSON(results, options.query);
      case 'csv':
        return this.exportToCSV(results, options.query);
      case 'markdown':
        return this.exportToMarkdown(results, options.query);
      case 'text':
        return this.exportToText(results, options.query);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  downloadFile(content: string, filename: string, mimeType: string) {
    if (typeof window === 'undefined') {
      throw new Error('downloadFile can only be called in browser environment');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  exportAndDownload(results: SearchResult[], options: ExportOptions) {
    const content = this.export(results, options);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const sanitizedQuery = options.query.replace(/[^a-z0-9]/gi, '-').slice(0, 30);

    const extensions: Record<ExportFormat, string> = {
      json: 'json',
      csv: 'csv',
      markdown: 'md',
      text: 'txt'
    };

    const mimeTypes: Record<ExportFormat, string> = {
      json: 'application/json',
      csv: 'text/csv',
      markdown: 'text/markdown',
      text: 'text/plain'
    };

    const filename = `search-${sanitizedQuery}-${timestamp}.${extensions[options.format]}`;
    const mimeType = mimeTypes[options.format];

    this.downloadFile(content, filename, mimeType);
  }

  copyToClipboard(content: string): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      throw new Error('Clipboard API not available');
    }

    return navigator.clipboard.writeText(content);
  }
}

export const resultsExporter = new SearchResultsExporter();
