import { isSortedDesc } from './polyList.js';

/**
 * Validates a pair of polynomials (P and Q) for a specific algorithm approach.
 *
 * @param {Array<{coef: number, exp: number}>} termsP
 * @param {Array<{coef: number, exp: number}>} termsQ
 * @param {'tp'|'nl'|'ins'} approach 'tp' (two-pointer), 'nl' (nested-loop), 'ins' (insertion)
 * @param {boolean} [cursorOpt=false] Whether cursor optimisation is enabled for insertion
 * @returns {{
 *   errors: { p: string|null, q: string|null },
 *   warnings: { p: string|null, q: string|null },
 *   isValid: boolean,
 *   canPlay: boolean
 * }}
 */
export function validatePair(termsP, termsQ, approach, cursorOpt = false) {
  const result = {
    errors: { p: null, q: null },
    warnings: { p: null, q: null },
    isValid: true,
    canPlay: true
  };

  const isPSorted = isSortedDesc(termsP);
  const isQSorted = isSortedDesc(termsQ);

  if (approach === 'tp') {
    // Two-pointer requires both P and Q sorted in descending order
    if (!isPSorted) {
      result.warnings.p = 'P is not sorted. Two-pointer needs descending order. Normalise, or switch to Nested loop.';
      result.canPlay = false;
    }
    if (!isQSorted) {
      result.warnings.q = 'Q is not sorted. Two-pointer needs descending order. Normalise, or switch to Nested loop.';
      result.canPlay = false;
    }
  } else if (approach === 'nl') {
    // Nested loop works on any order
    // No sorting requirement
  } else if (approach === 'ins') {
    // Insertion requires P sorted (R starts as copy of P)
    if (!isPSorted) {
      result.warnings.p = 'P is not sorted. Insertion approach needs P in descending order.';
      result.canPlay = false;
    }
    // If cursor optimisation is on, Q must be sorted too
    if (cursorOpt && !isQSorted) {
      result.warnings.q = 'Q is not sorted. Cursor optimisation requires Q to be in descending order.';
      result.canPlay = false;
    }
  }

  return result;
}
