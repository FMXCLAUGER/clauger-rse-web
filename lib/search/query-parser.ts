export type QueryOperator = 'AND' | 'OR' | 'NOT';

export interface ParsedQuery {
  type: 'simple' | 'advanced';
  terms: QueryTerm[];
}

export interface QueryTerm {
  value: string;
  operator?: QueryOperator;
  isPhrase: boolean;
  isNegated: boolean;
}

export class QueryParser {
  parse(query: string): ParsedQuery {
    const trimmed = query.trim();

    if (!this.isAdvancedQuery(trimmed)) {
      return {
        type: 'simple',
        terms: [{ value: trimmed, isPhrase: false, isNegated: false }]
      };
    }

    const terms = this.parseAdvancedQuery(trimmed);

    // If no actual search terms were found (only operators), treat as simple
    const operatorKeywords = ['AND', 'OR', 'NOT'];
    const hasRealTerms = terms.some(term =>
      !operatorKeywords.includes(term.value.toUpperCase())
    );

    if (terms.length === 0 || !hasRealTerms) {
      return {
        type: 'simple',
        terms: [{ value: trimmed, isPhrase: false, isNegated: false }]
      };
    }

    return {
      type: 'advanced',
      terms
    };
  }

  private isAdvancedQuery(query: string): boolean {
    const advancedPatterns = [
      /"[^"]*"/,  // Match phrases with quotes (including empty "")
      /"/,         // Match unclosed quotes
      /\bAND\b/i,
      /\bOR\b/i,
      /\bNOT\b/i,
      /-\w+/
    ];

    return advancedPatterns.some(pattern => pattern.test(query));
  }

  private parseAdvancedQuery(query: string): QueryTerm[] {
    const terms: QueryTerm[] = [];
    let currentPosition = 0;
    let currentOperator: QueryOperator | undefined;

    const tokens = this.tokenize(query);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (this.isOperator(token)) {
        currentOperator = token.toUpperCase() as QueryOperator;
        continue;
      }

      if (token.startsWith('"') && token.endsWith('"')) {
        const value = token.slice(1, -1);
        terms.push({
          value,
          operator: currentOperator,
          isPhrase: true,
          isNegated: false
        });
        currentOperator = undefined;
      } else if (token.startsWith('-')) {
        const value = token.slice(1);
        terms.push({
          value,
          operator: currentOperator,
          isPhrase: false,
          isNegated: true
        });
        currentOperator = undefined;
      } else if (token.toUpperCase() === 'NOT' && i + 1 < tokens.length) {
        i++;
        const nextToken = tokens[i];
        const value = nextToken.replace(/^["']|["']$/g, '');
        terms.push({
          value,
          operator: currentOperator,
          isPhrase: nextToken.startsWith('"') && nextToken.endsWith('"'),
          isNegated: true
        });
        currentOperator = undefined;
      } else if (token.length > 0) {
        terms.push({
          value: token,
          operator: currentOperator,
          isPhrase: false,
          isNegated: false
        });
        currentOperator = undefined;
      }
    }

    return terms;
  }

  private tokenize(query: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < query.length; i++) {
      const char = query[i];

      if ((char === '"' || char === "'") && !inQuotes) {
        if (current.trim()) {
          tokens.push(...this.splitOnOperators(current.trim()));
          current = '';
        }
        inQuotes = true;
        quoteChar = char;
        current = char;
      } else if (char === quoteChar && inQuotes) {
        current += char;
        tokens.push(current);
        current = '';
        inQuotes = false;
        quoteChar = '';
      } else if (inQuotes) {
        current += char;
      } else if (char === ' ' && current.trim()) {
        tokens.push(...this.splitOnOperators(current.trim()));
        current = '';
      } else if (char !== ' ') {
        current += char;
      }
    }

    if (current.trim()) {
      tokens.push(...this.splitOnOperators(current.trim()));
    }

    return tokens.filter(t => t.length > 0);
  }

  private splitOnOperators(text: string): string[] {
    const operators = ['AND', 'OR', 'NOT'];
    const tokens: string[] = [];
    let current = '';

    const words = text.split(/\s+/);

    for (const word of words) {
      if (operators.includes(word.toUpperCase())) {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
        tokens.push(word);
      } else {
        current += (current ? ' ' : '') + word;
      }
    }

    if (current.trim()) {
      tokens.push(current.trim());
    }

    return tokens;
  }

  private isOperator(token: string): boolean {
    return ['AND', 'OR'].includes(token.toUpperCase());
  }

  toReadableString(parsed: ParsedQuery): string {
    if (parsed.type === 'simple') {
      return parsed.terms[0]?.value || '';
    }

    return parsed.terms
      .map((term, index) => {
        let str = '';

        if (index > 0 && term.operator) {
          str += ` ${term.operator} `;
        } else if (index > 0 && !term.isNegated) {
          // Don't add implicit AND before negated terms (NOT keyword)
          str += ' AND ';
        } else if (index > 0) {
          // Just a space before NOT
          str += ' ';
        }

        if (term.isNegated) {
          str += 'NOT ';
        }

        if (term.isPhrase) {
          str += `"${term.value}"`;
        } else {
          str += term.value;
        }

        return str;
      })
      .join('');
  }
}

export const queryParser = new QueryParser();
