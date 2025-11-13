import { QueryParser, type ParsedQuery } from '@/lib/search/query-parser';

describe('QueryParser', () => {
  let parser: QueryParser;

  beforeEach(() => {
    parser = new QueryParser();
  });

  describe('Simple Queries', () => {
    it('should parse simple single-word query', () => {
      const result = parser.parse('environnement');

      expect(result.type).toBe('simple');
      expect(result.terms).toHaveLength(1);
      expect(result.terms[0]).toEqual({
        value: 'environnement',
        isPhrase: false,
        isNegated: false
      });
    });

    it('should parse simple multi-word query', () => {
      const result = parser.parse('développement durable');

      expect(result.type).toBe('simple');
      expect(result.terms).toHaveLength(1);
      expect(result.terms[0]).toEqual({
        value: 'développement durable',
        isPhrase: false,
        isNegated: false
      });
    });

    it('should trim whitespace from simple query', () => {
      const result = parser.parse('  gouvernance  ');

      expect(result.type).toBe('simple');
      expect(result.terms[0].value).toBe('gouvernance');
    });

    it('should handle empty query', () => {
      const result = parser.parse('');

      expect(result.type).toBe('simple');
      expect(result.terms).toHaveLength(1);
      expect(result.terms[0].value).toBe('');
    });
  });

  describe('Phrase Search', () => {
    it('should parse exact phrase with double quotes', () => {
      const result = parser.parse('"développement durable"');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(1);
      expect(result.terms[0]).toEqual({
        value: 'développement durable',
        isPhrase: true,
        isNegated: false,
        operator: undefined
      });
    });

    it('should parse multiple phrases', () => {
      const result = parser.parse('"RSE Clauger" AND "rapport 2025"');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(2);
      expect(result.terms[0]).toEqual({
        value: 'RSE Clauger',
        isPhrase: true,
        isNegated: false,
        operator: undefined
      });
      expect(result.terms[1]).toEqual({
        value: 'rapport 2025',
        isPhrase: true,
        isNegated: false,
        operator: 'AND'
      });
    });

    it('should handle mixed phrase and simple terms', () => {
      const result = parser.parse('"gouvernance responsable" innovation');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(2);
      expect(result.terms[0].isPhrase).toBe(true);
      expect(result.terms[1].isPhrase).toBe(false);
    });

    it('should handle empty phrase', () => {
      const result = parser.parse('""');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(1);
      expect(result.terms[0].value).toBe('');
    });
  });

  describe('Boolean Operators', () => {
    it('should parse AND operator', () => {
      const result = parser.parse('environnement AND durable');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(2);
      expect(result.terms[0].value).toBe('environnement');
      expect(result.terms[1].value).toBe('durable');
      expect(result.terms[1].operator).toBe('AND');
    });

    it('should parse OR operator', () => {
      const result = parser.parse('énergie OR climat');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(2);
      expect(result.terms[0].value).toBe('énergie');
      expect(result.terms[1].value).toBe('climat');
      expect(result.terms[1].operator).toBe('OR');
    });

    it('should parse NOT operator', () => {
      const result = parser.parse('développement NOT pollution');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(2);
      expect(result.terms[0].value).toBe('développement');
      expect(result.terms[1].value).toBe('pollution');
      expect(result.terms[1].isNegated).toBe(true);
    });

    it('should handle case-insensitive operators', () => {
      const result = parser.parse('climate and energy or renewable');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(3);
      expect(result.terms[1].operator).toBe('AND');
      expect(result.terms[2].operator).toBe('OR');
    });

    it('should parse complex multi-operator query', () => {
      const result = parser.parse('RSE AND gouvernance OR social NOT environnement');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(4);
      expect(result.terms[0].value).toBe('RSE');
      expect(result.terms[1].value).toBe('gouvernance');
      expect(result.terms[1].operator).toBe('AND');
      expect(result.terms[2].value).toBe('social');
      expect(result.terms[2].operator).toBe('OR');
      expect(result.terms[3].value).toBe('environnement');
      expect(result.terms[3].isNegated).toBe(true);
    });

    it('should handle operators in quoted phrases', () => {
      const result = parser.parse('"RSE AND gouvernance"');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(1);
      expect(result.terms[0].value).toBe('RSE AND gouvernance');
      expect(result.terms[0].isPhrase).toBe(true);
    });
  });

  describe('Negation', () => {
    it('should parse negation with dash prefix', () => {
      const result = parser.parse('-pollution');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(1);
      expect(result.terms[0]).toEqual({
        value: 'pollution',
        isPhrase: false,
        isNegated: true,
        operator: undefined
      });
    });

    it('should parse mixed positive and negative terms', () => {
      const result = parser.parse('environnement -pollution durable');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(3);
      expect(result.terms[0].isNegated).toBe(false);
      expect(result.terms[1].isNegated).toBe(true);
      expect(result.terms[2].isNegated).toBe(false);
    });

    it('should handle NOT operator with quotes', () => {
      const result = parser.parse('NOT "gaz effet serre"');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(1);
      expect(result.terms[0].value).toBe('gaz effet serre');
      expect(result.terms[0].isNegated).toBe(true);
      expect(result.terms[0].isPhrase).toBe(true);
    });

    it('should parse multiple negations', () => {
      const result = parser.parse('-pollution -déchet -CO2');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(3);
      expect(result.terms.every(t => t.isNegated)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle extra whitespace', () => {
      const result = parser.parse('   RSE    AND     gouvernance   ');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(2);
      expect(result.terms[0].value).toBe('RSE');
      expect(result.terms[1].value).toBe('gouvernance');
    });

    it('should handle special characters in simple query', () => {
      const result = parser.parse('énergie@clauger.com');

      expect(result.type).toBe('simple');
      expect(result.terms[0].value).toBe('énergie@clauger.com');
    });

    it('should handle numbers', () => {
      const result = parser.parse('rapport 2025');

      expect(result.type).toBe('simple');
      expect(result.terms[0].value).toBe('rapport 2025');
    });

    it('should handle single quotes as regular characters', () => {
      const result = parser.parse("l'environnement");

      expect(result.type).toBe('simple');
      expect(result.terms[0].value).toBe("l'environnement");
    });

    it('should handle unclosed quotes', () => {
      const result = parser.parse('"développement durable');

      expect(result.type).toBe('advanced');
      expect(result.terms.length).toBeGreaterThan(0);
    });

    it('should handle operators without terms', () => {
      const result = parser.parse('AND OR NOT');

      expect(result.type).toBe('simple');
      expect(result.terms).toHaveLength(1);
    });

    it('should handle only negation', () => {
      const result = parser.parse('-');

      expect(result.type).toBe('simple');
    });
  });

  describe('toReadableString', () => {
    it('should convert simple query to readable string', () => {
      const parsed = parser.parse('environnement');
      const readable = parser.toReadableString(parsed);

      expect(readable).toBe('environnement');
    });

    it('should convert advanced query with AND to readable string', () => {
      const parsed = parser.parse('RSE AND gouvernance');
      const readable = parser.toReadableString(parsed);

      expect(readable).toBe('RSE AND gouvernance');
    });

    it('should convert query with phrases to readable string', () => {
      const parsed = parser.parse('"développement durable" OR innovation');
      const readable = parser.toReadableString(parsed);

      expect(readable).toBe('"développement durable" OR innovation');
    });

    it('should convert negated terms to readable string', () => {
      const parsed = parser.parse('environnement NOT pollution');
      const readable = parser.toReadableString(parsed);

      expect(readable).toBe('environnement NOT pollution');
    });

    it('should handle implicit AND operator', () => {
      const parsed = parser.parse('"climat" "énergie"');
      const readable = parser.toReadableString(parsed);

      expect(readable).toContain('AND');
    });

    it('should convert complex query to readable string', () => {
      const parsed = parser.parse('RSE AND "rapport 2025" OR social NOT pollution');
      const readable = parser.toReadableString(parsed);

      expect(readable).toContain('RSE');
      expect(readable).toContain('AND');
      expect(readable).toContain('"rapport 2025"');
      expect(readable).toContain('OR');
      expect(readable).toContain('NOT');
    });
  });

  describe('Real-world Queries', () => {
    it('should parse typical search query 1', () => {
      const result = parser.parse('bilan carbone Clauger');

      expect(result.type).toBe('simple');
      expect(result.terms[0].value).toBe('bilan carbone Clauger');
    });

    it('should parse typical search query 2', () => {
      const result = parser.parse('"responsabilité sociale" AND entreprise');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(2);
    });

    it('should parse typical search query 3', () => {
      const result = parser.parse('énergie renouvelable -fossile');

      expect(result.type).toBe('advanced');
      expect(result.terms).toHaveLength(3); // Three separate terms: "énergie", "renouvelable", "-fossile"
      expect(result.terms[0].value).toBe('énergie');
      expect(result.terms[1].value).toBe('renouvelable');
      expect(result.terms[2].value).toBe('fossile');
      expect(result.terms[2].isNegated).toBe(true);
    });

    it('should parse typical search query 4', () => {
      const result = parser.parse('(RSE OR ESG) AND gouvernance');

      expect(result.type).toBe('advanced');
      expect(result.terms.length).toBeGreaterThan(0);
    });

    it('should parse accented French terms', () => {
      const result = parser.parse('émission énergie déchet');

      expect(result.type).toBe('simple');
      expect(result.terms[0].value).toBe('émission énergie déchet');
    });
  });

  describe('Performance', () => {
    it('should parse quickly', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        parser.parse('RSE AND gouvernance OR social NOT environnement');
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle very long queries', () => {
      const longQuery = Array(50).fill('terme').join(' AND ');
      const result = parser.parse(longQuery);

      expect(result.terms.length).toBeGreaterThan(0);
    });
  });
});
