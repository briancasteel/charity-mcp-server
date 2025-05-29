import { describe, it, expect } from '@jest/globals';
import {
  EINSchema,
  CharityLookupInputSchema,
  PublicCharityCheckInputSchema,
  CharitySearchInputSchema,
  CharityLookupOutputSchema,
  PublicCharityCheckOutputSchema,
  CharitySearchOutputSchema,
  type CharityLookupInput,
  type PublicCharityCheckInput,
  type CharitySearchInput,
  type CharityLookupOutput,
  type PublicCharityCheckOutput,
  type CharitySearchOutput,
} from './charity-schemas.js';

describe('EINSchema', () => {
  describe('valid EINs', () => {
    it('should accept valid EIN with hyphens', () => {
      const result = EINSchema.parse('12-3456789');
      expect(result).toBe('12-3456789');
    });

    it('should accept valid EIN without hyphens', () => {
      const result = EINSchema.parse('123456789');
      expect(result).toBe('12-3456789');
    });

    it('should normalize EIN format', () => {
      const result = EINSchema.parse('123456789');
      expect(result).toBe('12-3456789');
    });
  });

  describe('invalid EINs', () => {
    it('should reject EIN too short', () => {
      expect(() => EINSchema.parse('12345678')).toThrow('EIN must be at least 9 characters');
    });

    it('should reject EIN too long', () => {
      expect(() => EINSchema.parse('12-34567890')).toThrow('EIN must be at most 10 characters');
    });

    it('should reject non-numeric EIN', () => {
      expect(() => EINSchema.parse('12-345678A')).toThrow('EIN must be a valid 9-digit number');
    });

    it('should reject EIN with special characters', () => {
      expect(() => EINSchema.parse('12-345678!')).toThrow('EIN must be a valid 9-digit number');
    });

    it('should reject empty string', () => {
      expect(() => EINSchema.parse('')).toThrow();
    });
  });
});

describe('CharityLookupInputSchema', () => {
  it('should validate valid input', () => {
    const validInput: CharityLookupInput = {
      ein: '12-3456789'
    };
    const result = CharityLookupInputSchema.parse({ ein: '123456789' });
    expect(result).toEqual(validInput);
  });

  it('should reject missing EIN', () => {
    expect(() => CharityLookupInputSchema.parse({})).toThrow();
  });

  it('should reject invalid EIN', () => {
    expect(() => CharityLookupInputSchema.parse({ ein: 'invalid' })).toThrow();
  });
});

describe('PublicCharityCheckInputSchema', () => {
  it('should validate valid input', () => {
    const validInput: PublicCharityCheckInput = {
      ein: '12-3456789'
    };
    const result = PublicCharityCheckInputSchema.parse({ ein: '123456789' });
    expect(result).toEqual(validInput);
  });

  it('should reject missing EIN', () => {
    expect(() => PublicCharityCheckInputSchema.parse({})).toThrow();
  });
});

describe('CharitySearchInputSchema', () => {
  describe('valid inputs', () => {
    it('should validate with query only', () => {
      const result = CharitySearchInputSchema.parse({ query: 'test charity' });
      expect(result.query).toBe('test charity');
      expect(result.limit).toBe(25); // default
      expect(result.offset).toBe(0); // default
    });

    it('should validate with city and state', () => {
      const result = CharitySearchInputSchema.parse({ 
        city: 'San Francisco', 
        state: 'CA' 
      });
      expect(result.city).toBe('San Francisco');
      expect(result.state).toBe('CA');
    });

    it('should validate with custom limit and offset', () => {
      const result = CharitySearchInputSchema.parse({ 
        query: 'test',
        limit: 50,
        offset: 10 
      });
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(10);
    });

    it('should apply default values', () => {
      const result = CharitySearchInputSchema.parse({});
      expect(result.limit).toBe(25);
      expect(result.offset).toBe(0);
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty query', () => {
      expect(() => CharitySearchInputSchema.parse({ query: '' })).toThrow('Search query cannot be empty');
    });

    it('should reject query too long', () => {
      const longQuery = 'a'.repeat(201);
      expect(() => CharitySearchInputSchema.parse({ query: longQuery })).toThrow('Search query cannot exceed 200 characters');
    });

    it('should reject empty city', () => {
      expect(() => CharitySearchInputSchema.parse({ city: '' })).toThrow('City name cannot be empty');
    });

    it('should reject city too long', () => {
      const longCity = 'a'.repeat(101);
      expect(() => CharitySearchInputSchema.parse({ city: longCity })).toThrow('City name cannot exceed 100 characters');
    });

    it('should reject invalid state format', () => {
      expect(() => CharitySearchInputSchema.parse({ state: 'California' })).toThrow('State must be a 2-letter abbreviation');
    });

    it('should reject lowercase state', () => {
      expect(() => CharitySearchInputSchema.parse({ state: 'ca' })).toThrow('State must be uppercase 2-letter abbreviation');
    });

    it('should reject limit too small', () => {
      expect(() => CharitySearchInputSchema.parse({ limit: 0 })).toThrow('Limit must be at least 1');
    });

    it('should reject limit too large', () => {
      expect(() => CharitySearchInputSchema.parse({ limit: 101 })).toThrow('Limit cannot exceed 100');
    });

    it('should reject negative offset', () => {
      expect(() => CharitySearchInputSchema.parse({ offset: -1 })).toThrow('Offset cannot be negative');
    });
  });
});

describe('CharityLookupOutputSchema', () => {
  it('should validate complete charity data', () => {
    const validOutput: CharityLookupOutput = {
      ein: '12-3456789',
      name: 'Test Charity',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      deductibilityCode: '1',
      deductibilityDetail: 'Contributions are deductible',
      status: 'Active',
      classification: '501(c)(3)',
      activity: 'Educational',
      organization: 'Corporation',
      ruling: '1990',
      foundation: 'No'
    };

    const result = CharityLookupOutputSchema.parse(validOutput);
    expect(result).toEqual(validOutput);
  });

  it('should validate minimal charity data', () => {
    const minimalOutput = {
      ein: '12-3456789',
      name: 'Test Charity'
    };

    const result = CharityLookupOutputSchema.parse(minimalOutput);
    expect(result.ein).toBe('12-3456789');
    expect(result.name).toBe('Test Charity');
  });

  it('should reject missing required fields', () => {
    expect(() => CharityLookupOutputSchema.parse({ ein: '12-3456789' })).toThrow();
    expect(() => CharityLookupOutputSchema.parse({ name: 'Test Charity' })).toThrow();
  });
});

describe('PublicCharityCheckOutputSchema', () => {
  it('should validate complete public charity check data', () => {
    const validOutput: PublicCharityCheckOutput = {
      ein: '12-3456789',
      isPublicCharity: true,
      deductible: true
    };

    const result = PublicCharityCheckOutputSchema.parse(validOutput);
    expect(result).toEqual(validOutput);
  });

  it('should validate minimal data', () => {
    const minimalOutput = {
      ein: '12-3456789',
      isPublicCharity: false
    };

    const result = PublicCharityCheckOutputSchema.parse(minimalOutput);
    expect(result.ein).toBe('12-3456789');
    expect(result.isPublicCharity).toBe(false);
  });

  it('should reject missing required fields', () => {
    expect(() => PublicCharityCheckOutputSchema.parse({ ein: '12-3456789' })).toThrow();
    expect(() => PublicCharityCheckOutputSchema.parse({ isPublicCharity: true })).toThrow();
  });
});

describe('CharitySearchOutputSchema', () => {
  it('should validate complete search results', () => {
    const validOutput: CharitySearchOutput = {
      results: [
        {
          ein: '12-3456789',
          name: 'Test Charity 1',
          city: 'San Francisco',
          state: 'CA',
          deductibilityCode: '1'
        },
        {
          ein: '98-7654321',
          name: 'Test Charity 2'
        }
      ],
      pagination: {
        total: 150,
        page: 1,
        limit: 25,
        hasMore: true
      }
    };

    const result = CharitySearchOutputSchema.parse(validOutput);
    expect(result).toEqual(validOutput);
  });

  it('should validate empty results', () => {
    const emptyOutput = {
      results: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 25,
        hasMore: false
      }
    };

    const result = CharitySearchOutputSchema.parse(emptyOutput);
    expect(result.results).toHaveLength(0);
    expect(result.pagination.total).toBe(0);
  });

  it('should reject missing required fields', () => {
    expect(() => CharitySearchOutputSchema.parse({ results: [] })).toThrow();
    expect(() => CharitySearchOutputSchema.parse({ pagination: {} })).toThrow();
  });

  it('should reject invalid result structure', () => {
    const invalidOutput = {
      results: [{ name: 'Missing EIN' }],
      pagination: {
        total: 1,
        page: 1,
        limit: 25,
        hasMore: false
      }
    };

    expect(() => CharitySearchOutputSchema.parse(invalidOutput)).toThrow();
  });
});
