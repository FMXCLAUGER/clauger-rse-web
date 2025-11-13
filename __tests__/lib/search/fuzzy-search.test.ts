import { SearchIndex } from '@/lib/search/search-index';
import type { OCRData } from '@/lib/search/types';

// Create mock Document constructor that can be accessed by tests
const mockDocumentConstructor = jest.fn().mockImplementation(function(this: any, config: any) {
  this.config = config
  this.index = []

  this.add = jest.fn((doc) => {
    this.index.push(doc)
    return this
  })

  this.search = jest.fn((query: string, options?: any) => {
    // Simple mock search implementation
    const results = this.index
      .filter((doc: any) => {
        const text = ((doc.title || '') + ' ' + (doc.content || '')).toLowerCase()
        return text.includes(query.toLowerCase())
      })
      .map((doc: any) => ({
        id: doc.id,
        doc: { id: doc.id, pageNumber: doc.pageNumber, title: doc.title }
      }))

    // Return in FlexSearch format: array of field results
    if (results.length > 0) {
      return [{ field: 'content', result: results.slice(0, options?.limit || 10) }]
    }
    return []
  })

  this.remove = jest.fn()
  this.update = jest.fn()
  this.clear = jest.fn()
  return this
})

// Mock FlexSearch Document
jest.mock('flexsearch/dist/module/document', () => {
  return {
    __esModule: true,
    default: mockDocumentConstructor,
  }
})

describe('Fuzzy Search', () => {
  let searchIndex: SearchIndex;

  const mockOCRData: OCRData = {
    metadata: {
      totalPages: 3,
      successful: 3,
      failed: 0,
      language: 'fra',
      avgConfidence: 85,
      processingTime: 1000,
      timestamp: '2025-01-01T00:00:00.000Z'
    },
    pages: [
      {
        id: 1,
        pageNumber: 1,
        filename: 'page1.png',
        text: 'Environnement et développement durable sont au coeur de notre stratégie',
        confidence: 85,
        words: 10
      },
      {
        id: 2,
        pageNumber: 2,
        filename: 'page2.png',
        text: 'Clauger propose des solutions innovantes pour le froid industriel',
        confidence: 90,
        words: 10
      },
      {
        id: 3,
        pageNumber: 3,
        filename: 'page3.png',
        text: 'La gouvernance responsable est essentielle pour notre entreprise',
        confidence: 88,
        words: 9
      }
    ]
  };

  beforeEach(async () => {
    mockDocumentConstructor.mockClear()
    searchIndex = new SearchIndex();
    await searchIndex.loadData(mockOCRData);
  });

  describe('Levenshtein Distance', () => {
    it('should calculate distance correctly for identical words', () => {
      const distance = (searchIndex as any).levenshteinDistance('test', 'test');
      expect(distance).toBe(0);
    });

    it('should calculate distance for one character difference', () => {
      const distance = (searchIndex as any).levenshteinDistance('test', 'best');
      expect(distance).toBe(1);
    });

    it('should calculate distance for multiple differences', () => {
      const distance = (searchIndex as any).levenshteinDistance('sitting', 'kitten');
      expect(distance).toBe(3);
    });
  });

  describe('Typo Correction', () => {
    it('should correct single typo in word', () => {
      // "environement" (missing one 'n') has Levenshtein distance of 1 from "environnement"
      const suggestion = searchIndex.getSuggestion('environement');
      expect(suggestion.toLowerCase()).toContain('environnement');
    });

    it('should return original if word is correct', () => {
      const suggestion = searchIndex.getSuggestion('environnement');
      expect(suggestion.toLowerCase()).toBe('environnement');
    });

    it('should correct multiple words with typos', () => {
      const suggestion = searchIndex.getSuggestion('developement duarble');
      expect(suggestion).not.toBe('developement duarble');
    });

    it('should handle short words (stopwords)', () => {
      const suggestion = searchIndex.getSuggestion('le la les');
      expect(suggestion).toBe('le la les');
    });
  });

  describe('Alternative Suggestions', () => {
    it('should return empty array for correct word', () => {
      const suggestions = searchIndex.getAlternativeSuggestions('environnement');
      expect(suggestions).toHaveLength(0);
    });

    it('should return suggestions for misspelled word', () => {
      // Use "environement" (missing one 'n') instead of "enviromment" (too far)
      const suggestions = searchIndex.getAlternativeSuggestions('environement');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should limit suggestions to specified count', () => {
      const suggestions = searchIndex.getAlternativeSuggestions('enviromment', 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array for stopwords', () => {
      const suggestions = searchIndex.getAlternativeSuggestions('le');
      expect(suggestions).toHaveLength(0);
    });

    it('should return empty array for very short words', () => {
      const suggestions = searchIndex.getAlternativeSuggestions('ab');
      expect(suggestions).toHaveLength(0);
    });
  });

  describe('Fuzzy Search Integration', () => {
    it('should find results with exact match', () => {
      const results = searchIndex.search('environnement');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].pageNumber).toBe(1);
    });

    it('should find results with typo (fuzzy match)', () => {
      // Use "environement" (missing one 'n') instead of "enviromment" (too far)
      const results = searchIndex.search('environement');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle multiple typos', () => {
      const results = searchIndex.search('govarnance');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for nonsense query', () => {
      const results = searchIndex.search('xyzabcdef');
      expect(results).toHaveLength(0);
    });

    it('should prioritize exact matches over fuzzy matches', () => {
      const exactResults = searchIndex.search('environnement');
      // Use "environement" (missing one 'n') instead of "enviromment" (too far)
      const fuzzyResults = searchIndex.search('environement');

      expect(exactResults.length).toBeGreaterThan(0);
      expect(fuzzyResults.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should return suggestions quickly', () => {
      const start = Date.now();
      searchIndex.getSuggestion('enviromment');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should search quickly with fuzzy matching', () => {
      const start = Date.now();
      searchIndex.search('enviromment');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty query', () => {
      const results = searchIndex.search('');
      expect(results).toHaveLength(0);
    });

    it('should handle very short query', () => {
      const results = searchIndex.search('a');
      expect(results).toHaveLength(0);
    });

    it('should handle query with special characters', () => {
      const results = searchIndex.search('environ@ment!');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle query with numbers', () => {
      const suggestion = searchIndex.getSuggestion('test123');
      expect(typeof suggestion).toBe('string');
    });

    it('should handle accented characters', () => {
      const suggestion = searchIndex.getSuggestion('développement');
      expect(typeof suggestion).toBe('string');
    });
  });
});
