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
    });

    it('should validate with city and state', () => {
      const result = CharitySearchInputSchema.parse({ 
        city: 'San Francisco', 
        state: 'CA' 
      });
      expect(result.city).toBe('San Francisco');
      expect(result.state).toBe('CA');
    });

    it('should validate with all fields', () => {
      const result = CharitySearchInputSchema.parse({ 
        query: 'test',
        city: 'San Francisco',
        state: 'CA'
      });
      expect(result.query).toBe('test');
      expect(result.city).toBe('San Francisco');
      expect(result.state).toBe('CA');
    });

    it('should validate empty input', () => {
      const result = CharitySearchInputSchema.parse({});
      expect(result).toEqual({});
    });

    it('should handle empty state string correctly', () => {
      const result = CharitySearchInputSchema.parse({ state: '' });
      expect(result.state).toBeUndefined();
    });

    it('should handle empty city string correctly', () => {
      const result = CharitySearchInputSchema.parse({ city: '' });
      expect(result.city).toBeUndefined();
    });
  });

  describe('invalid inputs', () => {
    it('should accept empty query', () => {
      const result = CharitySearchInputSchema.parse({ query: '' });
      expect(result.query).toBe('');
    });

    it('should reject query too long', () => {
      const longQuery = 'a'.repeat(201);
      expect(() => CharitySearchInputSchema.parse({ query: longQuery })).toThrow('Search query cannot exceed 200 characters');
    });

    it('should accept empty city', () => {
      const result = CharitySearchInputSchema.parse({ city: '' });
      expect(result.city).toBeUndefined();
    });

    it('should reject city too long', () => {
      const longCity = 'a'.repeat(101);
      expect(() => CharitySearchInputSchema.parse({ city: longCity })).toThrow('City name cannot exceed 100 characters');
    });

    it('should reject invalid state format', () => {
      expect(() => CharitySearchInputSchema.parse({ state: 'California' })).toThrow('State must be a 2-letter uppercase abbreviation');
    });

    it('should reject lowercase state', () => {
      expect(() => CharitySearchInputSchema.parse({ state: 'ca' })).toThrow('State must be a 2-letter uppercase abbreviation');
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
      ]
    };

    const result = CharitySearchOutputSchema.parse(validOutput);
    expect(result).toEqual(validOutput);
  });

  it('should validate empty results', () => {
    const emptyOutput = {
      results: []
    };

    const result = CharitySearchOutputSchema.parse(emptyOutput);
    expect(result.results).toHaveLength(0);
  });

  it('should reject missing required fields', () => {
    expect(() => CharitySearchOutputSchema.parse({})).toThrow();
  });

  it('should reject invalid result structure', () => {
    const invalidOutput = {
      results: [{ name: 'Missing EIN' }]
    };

    expect(() => CharitySearchOutputSchema.parse(invalidOutput)).toThrow();
  });
});
