import fs from 'fs';
import path from 'path';

describe('OCR Quality Tests', () => {
  let ocrData: any;

  beforeAll(() => {
    const ocrPath = path.join(process.cwd(), 'public/data/ocr/pages.json');
    const rawData = fs.readFileSync(ocrPath, 'utf8');
    ocrData = JSON.parse(rawData);
  });

  describe('Data Structure', () => {
    it('should have valid metadata', () => {
      expect(ocrData.metadata).toBeDefined();
      expect(ocrData.metadata.totalPages).toBeGreaterThan(0);
      expect(ocrData.metadata.avgConfidence).toBeGreaterThan(0);
      expect(ocrData.metadata.avgConfidence).toBeLessThanOrEqual(100);
    });

    it('should have pages array', () => {
      expect(Array.isArray(ocrData.pages)).toBe(true);
      expect(ocrData.pages.length).toBe(ocrData.metadata.totalPages);
    });

    it('should have valid page structure', () => {
      const firstPage = ocrData.pages[0];
      expect(firstPage).toHaveProperty('id');
      expect(firstPage).toHaveProperty('pageNumber');
      expect(firstPage).toHaveProperty('filename');
      expect(firstPage).toHaveProperty('text');
      expect(firstPage).toHaveProperty('confidence');
      expect(firstPage).toHaveProperty('words');
    });
  });

  describe('Quality Metrics', () => {
    it('should have average confidence >= 70%', () => {
      expect(ocrData.metadata.avgConfidence).toBeGreaterThanOrEqual(70);
    });

    it('should have all pages with confidence >= 50%', () => {
      const lowConfidencePages = ocrData.pages.filter(
        (p: any) => !p.error && p.confidence < 50
      );

      expect(lowConfidencePages).toHaveLength(0);

      if (lowConfidencePages.length > 0) {
        console.warn('\n⚠️  Pages with confidence < 50%:');
        lowConfidencePages.forEach((p: any) => {
          console.warn(`   - Page ${p.pageNumber}: ${p.confidence}%`);
        });
      }
    });

    it('should have at least 80% of pages with confidence >= 70%', () => {
      const highQualityPages = ocrData.pages.filter(
        (p: any) => !p.error && p.confidence >= 70
      );

      const highQualityPercentage = (highQualityPages.length / ocrData.pages.length) * 100;

      expect(highQualityPercentage).toBeGreaterThanOrEqual(80);
    });

    it('should have no failed pages', () => {
      const failedPages = ocrData.pages.filter((p: any) => p.error);
      expect(failedPages).toHaveLength(0);

      if (failedPages.length > 0) {
        console.error('\n❌ Failed pages:');
        failedPages.forEach((p: any) => {
          console.error(`   - Page ${p.pageNumber}: ${p.error}`);
        });
      }
    });
  });

  describe('Content Quality', () => {
    it('should have text content for all pages', () => {
      const pagesWithoutText = ocrData.pages.filter(
        (p: any) => !p.error && (!p.text || p.text.trim().length === 0)
      );

      expect(pagesWithoutText).toHaveLength(0);
    });

    it('should have reasonable word count per page', () => {
      const validPages = ocrData.pages.filter((p: any) => !p.error);

      validPages.forEach((page: any) => {
        expect(page.words).toBeGreaterThan(0);
        expect(page.words).toBeLessThan(10000);
      });
    });

    it('should not have excessive noise characters', () => {
      const noisePattern = /[|~`^°¤§±·×÷¬¦¨´¸]/g;

      const noisyPages = ocrData.pages.filter((p: any) => {
        if (p.error || !p.text) return false;

        const noiseMatches = p.text.match(noisePattern);
        if (!noiseMatches) return false;

        const noiseRatio = noiseMatches.length / p.text.length;
        return noiseRatio > 0.05;
      });

      expect(noisyPages).toHaveLength(0);

      if (noisyPages.length > 0) {
        console.warn('\n⚠️  Pages with excessive noise:');
        noisyPages.forEach((p: any) => {
          const noiseMatches = p.text.match(noisePattern) || [];
          const noiseRatio = ((noiseMatches.length / p.text.length) * 100).toFixed(2);
          console.warn(`   - Page ${p.pageNumber}: ${noiseRatio}% noise`);
        });
      }
    });
  });

  describe('Reprocessing Tracking', () => {
    it('should track reprocessed pages if any', () => {
      const reprocessedPages = ocrData.pages.filter((p: any) => p.reprocessed);

      if (reprocessedPages.length > 0) {
        expect(ocrData.metadata.reprocessedPages).toBeDefined();
        expect(ocrData.metadata.lastReprocessed).toBeDefined();

        console.log('\n📊 Reprocessing Stats:');
        console.log(`   Pages reprocessed: ${reprocessedPages.length}`);
        console.log(`   Last reprocessed: ${ocrData.metadata.lastReprocessed}`);

        const avgImprovement = reprocessedPages.reduce((sum: number, p: any) => {
          return sum + p.confidence;
        }, 0) / reprocessedPages.length;

        console.log(`   Avg confidence after reprocessing: ${avgImprovement.toFixed(1)}%`);
      }
    });
  });

  describe('Language Detection', () => {
    it('should use French language', () => {
      expect(ocrData.metadata.language).toBe('fra');
    });

    it('should contain French-specific characters', () => {
      const allText = ocrData.pages
        .filter((p: any) => !p.error)
        .map((p: any) => p.text)
        .join(' ');

      const hasFrenchAccents = /[àâäéèêëïîôùûüÿçœæÀÂÄÉÈÊËÏÎÔÙÛÜŸÇŒÆ]/.test(allText);

      expect(hasFrenchAccents).toBe(true);
    });
  });

  describe('Performance Metrics', () => {
    it('should have metadata with processing time', () => {
      expect(ocrData.metadata.processingTime).toBeDefined();
      expect(ocrData.metadata.processingTime).toBeGreaterThan(0);
    });

    it('should have reasonable processing time per page', () => {
      const avgTimePerPage = ocrData.metadata.processingTime / ocrData.metadata.totalPages;

      expect(avgTimePerPage).toBeGreaterThan(0);
      expect(avgTimePerPage).toBeLessThan(30000);
    });
  });

  describe('Confidence Distribution', () => {
    it('should provide confidence distribution stats', () => {
      const confidenceRanges = {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0
      };

      ocrData.pages.forEach((page: any) => {
        if (page.error) return;

        if (page.confidence >= 90) confidenceRanges.excellent++;
        else if (page.confidence >= 70) confidenceRanges.good++;
        else if (page.confidence >= 50) confidenceRanges.fair++;
        else confidenceRanges.poor++;
      });

      console.log('\n📈 Confidence Distribution:');
      console.log(`   Excellent (≥90%): ${confidenceRanges.excellent} pages`);
      console.log(`   Good (70-89%): ${confidenceRanges.good} pages`);
      console.log(`   Fair (50-69%): ${confidenceRanges.fair} pages`);
      console.log(`   Poor (<50%): ${confidenceRanges.poor} pages`);

      expect(confidenceRanges.excellent + confidenceRanges.good).toBeGreaterThan(
        ocrData.pages.length * 0.7
      );
    });
  });
});
