/**
 * Independent reference calculation for polynomial addition using a Map.
 * Used for correctness testing and property-based verification.
 *
 * @param {Array<{coef: number, exp: number}>} termsP
 * @param {Array<{coef: number, exp: number}>} termsQ
 * @returns {Array<{coef: number, exp: number}>} Canonical result terms sorted descending
 */
export function addReference(termsP, termsQ) {
  const map = new Map();

  for (const term of termsP) {
    map.set(term.exp, (map.get(term.exp) || 0) + term.coef);
  }

  for (const term of termsQ) {
    map.set(term.exp, (map.get(term.exp) || 0) + term.coef);
  }

  const result = [];
  for (const [exp, coef] of map.entries()) {
    if (coef !== 0) {
      result.push({ coef, exp });
    }
  }

  result.sort((a, b) => b.exp - a.exp);
  return result;
}
