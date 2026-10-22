import { toText } from './polyList.js';
import { normalizeInputText } from './parser.js';

/**
 * Normalises an array of terms by sorting them in strictly descending exponent order.
 * @param {Array<{coef: number, exp: number}>} terms
 * @returns {Array<{coef: number, exp: number}>} New sorted array of terms
 */
export function normalise(terms) {
  if (!terms || !Array.isArray(terms)) return [];
  return [...terms].sort((a, b) => b.exp - a.exp);
}

/**
 * Combines like terms (same exponent) by summing their coefficients,
 * removing any resulting zero-coefficient terms, and sorting descending.
 * Also parses raw text if given a string with duplicate exponents.
 * @param {Array<{coef: number, exp: number}>|string} input
 * @returns {Array<{coef: number, exp: number}>} Combined terms
 */
export function combineLikeTerms(input) {
  let terms = [];

  if (typeof input === 'string') {
    const cleaned = normalizeInputText(input);
    if (!cleaned || cleaned === '0') return [];

    const rawTokens = cleaned.match(/([+-]?[^+-]+)/g) || [];
    for (const token of rawTokens) {
      const match = token.match(/^([+-]?)(\d*)(?:x(?:\^(\d+))?)?$/);
      if (!match) continue;

      const sign = match[1] === '-' ? -1 : 1;
      const coefStr = match[2];
      const isVariablePresent = token.includes('x');
      const expStr = match[3];

      let coef = 1;
      if (coefStr !== '') {
        coef = parseInt(coefStr, 10);
      } else if (!isVariablePresent) {
        continue;
      }
      coef *= sign;

      let exp = 0;
      if (isVariablePresent) {
        exp = token.includes('^') && expStr ? parseInt(expStr, 10) : 1;
      }

      if (coef !== 0) {
        terms.push({ coef, exp });
      }
    }
  } else if (Array.isArray(input)) {
    terms = input;
  }

  const map = new Map();
  for (const term of terms) {
    const current = map.get(term.exp) || 0;
    map.set(term.exp, current + term.coef);
  }

  const result = [];
  for (const [exp, coef] of map.entries()) {
    if (coef !== 0) {
      result.push({ coef, exp });
    }
  }

  return normalise(result);
}

/**
 * Convenience helper to convert combined terms back into standard text
 * @param {string} rawText
 * @returns {string}
 */
export function combineText(rawText) {
  const combined = combineLikeTerms(rawText);
  return toText(combined);
}

/**
 * Convenience helper to sort a raw text string into descending exponent order
 * @param {string} rawText
 * @param {Array<{coef: number, exp: number}>} [parsedTerms]
 * @returns {string}
 */
export function normaliseText(rawText, parsedTerms) {
  if (parsedTerms && parsedTerms.length > 0) {
    return toText(normalise(parsedTerms));
  }
  return toText(combineLikeTerms(rawText));
}
