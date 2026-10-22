/**
 * Parses polynomial text into an array of terms [{ coef, exp }]
 * following the PRD Section 6 specification.
 */

/**
 * @typedef {Object} ParseResult
 * @property {Array<{coef: number, exp: number}>} terms
 * @property {string|null} error
 * @property {number|null} duplicateExp
 */

/**
 * Normalizes input string (replaces Unicode minus with ASCII hyphen, lowercases, trims)
 * @param {string} text
 * @returns {string}
 */
export function normalizeInputText(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/\s+/g, '')
    .toLowerCase();
}

/**
 * Parses a polynomial string into terms.
 * @param {string} rawText
 * @param {string} [name='polynomial'] Name for error messages (e.g. 'P' or 'Q')
 * @returns {ParseResult}
 */
export function parsePoly(rawText, name = 'polynomial') {
  if (!rawText || rawText.trim() === '') {
    return {
      terms: [],
      error: 'Enter a polynomial, or type 0 for the zero polynomial.',
      duplicateExp: null
    };
  }

  const cleaned = normalizeInputText(rawText);

  // Check if it's the zero polynomial
  if (cleaned === '0') {
    return { terms: [], error: null, duplicateExp: null };
  }

  // Regex to split into raw signed terms
  // Matches +term or -term or leading term
  // Valid term structure:
  // ([+-]?\d+)?(x(\^(\d+))?)?
  // Let's check for invalid characters first
  // Allowed characters: digits, x, +, -, ^
  const invalidCharMatch = cleaned.match(/[^0-9x+\-^]/);
  if (invalidCharMatch) {
    const rawPortion = rawText.match(/[^0-9xX+\-\s\u2212\u2013\u2014^]+/)?.[0] || invalidCharMatch[0];
    return {
      terms: [],
      error: `Could not read "${rawPortion}". Use terms like 5x^3, -x or 7.`,
      duplicateExp: null
    };
  }

  // Split tokens by '+' or '-' keeping the signs
  // e.g. 5x^4-3x^2+2x+7 -> ['+5x^4', '-3x^2', '+2x', '+7']
  const tokenRegex = /([+-]?[^+-]+)/g;
  const rawTokens = cleaned.match(tokenRegex);

  if (!rawTokens || rawTokens.length === 0) {
    return {
      terms: [],
      error: 'Enter a polynomial, or type 0 for the zero polynomial.',
      duplicateExp: null
    };
  }

  const terms = [];
  const seenExponents = new Map();

  for (const token of rawTokens) {
    if (!token) continue;

    // A term must match one of:
    // 1) constant: ^[+-]?\d+$
    // 2) linear: ^[+-]?(\d+)?x$
    // 3) power: ^[+-]?(\d+)?x\^(\d+)$
    // 4) explicit 0 power: ^[+-]?(\d+)?x\^0$
    const termPattern = /^([+-]?)(\d*)(?:x(?:\^(\d+))?)?$/;
    const match = token.match(termPattern);

    // If it doesn't match or is malformed like 'x^^2', '5x^', '++2'
    if (!match) {
      return {
        terms: [],
        error: `Could not read "${token}". Use terms like 5x^3, -x or 7.`,
        duplicateExp: null
      };
    }

    const sign = match[1] === '-' ? -1 : 1;
    const coefStr = match[2];
    const isVariablePresent = token.includes('x');
    const expStr = match[3];

    // Case 1: just a sign with nothing else, e.g. "+" or "-"
    if (!coefStr && !isVariablePresent) {
      return {
        terms: [],
        error: `Could not read "${token}". Use terms like 5x^3, -x or 7.`,
        duplicateExp: null
      };
    }

    let coef = 1;
    if (coefStr !== '') {
      coef = parseInt(coefStr, 10);
    } else if (!isVariablePresent) {
      return {
        terms: [],
        error: `Could not read "${token}". Use terms like 5x^3, -x or 7.`,
        duplicateExp: null
      };
    }
    coef *= sign;

    let exp = 0;
    if (isVariablePresent) {
      if (token.includes('^')) {
        if (expStr === undefined || expStr === '') {
          return {
            terms: [],
            error: `Could not read "${token}". Exponent missing after ^.`,
            duplicateExp: null
          };
        }
        exp = parseInt(expStr, 10);
      } else {
        exp = 1;
      }
    } else {
      exp = 0;
    }

    // Check zero coefficient term
    if (coef === 0) {
      return {
        terms: [],
        error: `Terms with coefficient 0 are not allowed. Remove ${token}.`,
        duplicateExp: null
      };
    }

    // Check coefficient bounds
    if (coef < -999 || coef > 999) {
      return {
        terms: [],
        error: 'Coefficients must be whole numbers from -999 to 999.',
        duplicateExp: null
      };
    }

    // Check exponent bounds
    if (exp < 0 || exp > 99) {
      return {
        terms: [],
        error: 'Exponents must be whole numbers from 0 to 99.',
        duplicateExp: null
      };
    }

    // Check duplicate exponent
    if (seenExponents.has(exp)) {
      return {
        terms: [],
        error: `Exponent ${exp} appears twice in ${name}. Combine them, or press Combine like terms.`,
        duplicateExp: exp
      };
    }

    seenExponents.set(exp, true);
    terms.push({ coef, exp });
  }

  // Check maximum 10 terms
  if (terms.length > 10) {
    return {
      terms: [],
      error: 'Maximum 10 terms per polynomial.',
      duplicateExp: null
    };
  }

  return { terms, error: null, duplicateExp: null };
}
