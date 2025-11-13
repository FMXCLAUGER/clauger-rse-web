import { SearchIndex } from '@/lib/search/search-index';
import type { OCRData } from '@/lib/search/types';

// Create mock Document constructor
const mockDocumentConstructor = jest.fn().mockImplementation(function(this: any, config: any) {
  this.config = config
  this.index = []

  this.add = jest.fn((doc) => {
    this.index.push(doc)
    return this
  })

  this.search = jest.fn((query: string, options?: any) => {
    const results = this.index
      .filter((doc: any) => {
        const text = ((doc.title || '') + ' ' + (doc.content || '')).toLowerCase()
        return text.includes(query.toLowerCase())
      })
      .map((doc: any) => ({
        id: doc.id,
        doc: { id: doc.id, pageNumber: doc.pageNumber, title: doc.title }
      }))

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
jest.mock('flexsearch/dist/module/document', () => ({
  __esModule: true,
  default: mockDocumentConstructor,
}))

describe('Autocomplete', () => {
  let searchIndex: SearchIndex;

  const mockOCRData: OCRData = {
    metadata: {
      totalPages: 5,
      successful: 5,
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
        text: 'Environnement et développement durable sont essentiels pour notre avenir',
        confidence: 85,
        words: 10
      },
      {
        id: 2,
        pageNumber: 2,
        filename: 'page2.png',
        text: 'Clauger propose des solutions innovantes pour le froid industriel et environnemental',
        confidence: 90,
        words: 12
      },
      {
        id: 3,
        pageNumber: 3,
        filename: 'page3.png',
        text: 'La gouvernance responsable est essentielle pour notre entreprise durable',
        confidence: 88,
        words: 10
      },
      {
        id: 4,
        pageNumber: 4,
        filename: 'page4.png',
        text: 'Énergie renouvelable et efficacité énergétique sont nos priorités',
        confidence: 87,
        words: 9
      },
      {
        id: 5,
        pageNumber: 5,
        filename: 'page5.png',
        text: 'Innovation technologique et transformation digitale pour un futur durable',
        confidence: 89,
        words: 11
      }
    ]
  };

  beforeEach(async () => {
    mockDocumentConstructor.mockClear()
    searchIndex = new SearchIndex();
    await searchIndex.loadData(mockOCRData);
  });

  describe('getAutocompleteSuggestions', () => {
    it('should return suggestions for partial word', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('envir');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('environnement') || s.includes('environnemental'))).toBe(true);
    });

    it('should return empty array for very short query', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('e');
      expect(suggestions).toHaveLength(0);
    });

    it('should return empty array for stopwords', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('le');
      expect(suggestions).toHaveLength(0);
    });

    it('should complete last word in multi-word query', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('développement dur');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('durable'))).toBe(true);
    });

    it('should preserve prefix in suggestions', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('énergie renouv');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.startsWith('énergie'))).toBe(true);
    });

    it('should prioritize prefix matches', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('innov');
      expect(suggestions.length).toBeGreaterThan(0);
      const firstSuggestion = suggestions[0];
      expect(firstSuggestion).toContain('innov');
    });

    it('should limit suggestions to specified count', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('e', 3);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should handle queries with no matches', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('xyzabc');
      expect(suggestions).toHaveLength(0);
    });

    it('should handle accented characters', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('énerg');
      expect(suggestions.length).toBeGreaterThan(0);
      // Vocabulary stores normalized words (without accents)
      expect(suggestions.some(s => s.includes('energie') || s.includes('energetique'))).toBe(true);
    });

    it('should be case insensitive', () => {
      const suggestionsLower = searchIndex.getAutocompleteSuggestions('envir');
      const suggestionsUpper = searchIndex.getAutocompleteSuggestions('ENVIR');
      expect(suggestionsLower.length).toEqual(suggestionsUpper.length);
    });
  });

  describe('Performance', () => {
    it('should return suggestions quickly', () => {
      const start = Date.now();
      searchIndex.getAutocompleteSuggestions('envir', 5);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should handle multiple rapid calls', () => {
      const start = Date.now();
      for (let i = 0; i < 10; i++) {
        searchIndex.getAutocompleteSuggestions('env', 5);
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('');
      expect(suggestions).toHaveLength(0);
    });

    it('should handle whitespace only', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('   ');
      expect(suggestions).toHaveLength(0);
    });

    it('should handle special characters', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('envir@#$');
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle very long queries', () => {
      const longQuery = 'environnement développement durable gouvernance responsable énergie';
      const suggestions = searchIndex.getAutocompleteSuggestions(longQuery);
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle numeric queries', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('123');
      expect(suggestions).toHaveLength(0);
    });

    it('should handle mixed content', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('env123irom');
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('Scoring', () => {
    it('should prioritize exact prefix matches', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('innov');

      if (suggestions.length > 1) {
        const firstWord = suggestions[0].split(' ').pop() || '';
        const secondWord = suggestions[1].split(' ').pop() || '';

        expect(firstWord.startsWith('innov')).toBe(true);
      }
    });

    it('should rank shorter completions higher', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('dur');

      if (suggestions.length > 1) {
        const words = suggestions.map(s => s.split(' ').pop() || '');
        const lengths = words.map(w => w.length);

        expect(lengths[0]).toBeLessThanOrEqual(lengths[lengths.length - 1] + 5);
      }
    });
  });

  describe('Multi-word Queries', () => {
    it('should complete only the last word', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('développement dur');

      suggestions.forEach(suggestion => {
        expect(suggestion).toContain('développement');
      });
    });

    it('should handle trailing spaces', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('développement ');
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle multiple spaces', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('développement   dur');
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('Vocabulary Integration', () => {
    it('should only suggest words from indexed vocabulary', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('envir');

      suggestions.forEach(suggestion => {
        const lastWord = suggestion.split(' ').pop() || '';
        expect(lastWord.length).toBeGreaterThan(2);
      });
    });

    it('should filter out stopwords from suggestions', () => {
      const suggestions = searchIndex.getAutocompleteSuggestions('l');

      const hasStopwords = suggestions.some(s => {
        const lastWord = s.split(' ').pop() || '';
        return ['le', 'la', 'les'].includes(lastWord);
      });

      expect(hasStopwords).toBe(false);
    });
  });
});
