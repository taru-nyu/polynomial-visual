/**
 * Standard preset polynomial pairs defined in PRD Section 6.4.
 */
export const PRESETS = [
  {
    name: 'Basic',
    p: '5x^4 + 3x^2 + 2x + 7',
    q: '2x^4 + 4x^3 - 3x^2 + 6',
    expectedR: '7x^4 + 4x^3 + 2x + 13',
    tests: 'Match, cancel, unmatched'
  },
  {
    name: 'Full cancellation',
    p: '3x^2 + 2x',
    q: '-3x^2 - 2x',
    expectedR: '0',
    tests: 'Empty result'
  },
  {
    name: 'Empty operand',
    p: '4x^3 + 1',
    q: '0',
    expectedR: '4x^3 + 1',
    tests: 'Zero polynomial input'
  },
  {
    name: 'Disjoint exponents',
    p: '6x^5 + 2x^3',
    q: '7x^4 + x',
    expectedR: '6x^5 + 7x^4 + 2x^3 + x',
    tests: 'No matches'
  },
  {
    name: 'Different lengths',
    p: 'x^6 + x^3 + 1',
    q: '2x^3',
    expectedR: 'x^6 + 3x^3 + 1',
    tests: 'm not equal to n'
  },
  {
    name: 'Identical',
    p: '2x^2 + 3',
    q: '2x^2 + 3',
    expectedR: '4x^2 + 6',
    tests: 'All match'
  },
  {
    name: 'Unsorted input',
    p: '2x + 7 + 5x^4 + 3x^2',
    q: '6 - 3x^2 + 4x^3 + 2x^4',
    expectedR: '7x^4 + 4x^3 + 2x + 13',
    tests: 'Warning and normalise'
  },
  {
    name: 'Stress: 10 vs 10 Dense Interleaved',
    p: '10x^19 + 8x^17 + 6x^15 + 4x^13 + 2x^11 + 9x^9 + 7x^7 + 5x^5 + 3x^3 + x',
    q: '9x^18 + 7x^16 + 5x^14 + 3x^12 + x^10 + 8x^8 + 6x^6 + 4x^4 + 2x^2 + 5',
    expectedR: '10x^19 + 9x^18 + 8x^17 + 7x^16 + 6x^15 + 5x^14 + 4x^13 + 3x^12 + 2x^11 + x^10 + 9x^9 + 8x^8 + 7x^7 + 6x^6 + 5x^5 + 4x^4 + 3x^3 + 2x^2 + x + 5',
    tests: 'Max capacity 20-term result'
  },
  {
    name: 'Stress: 10-term Full Cancellation',
    p: '10x^9 + 9x^8 + 8x^7 + 7x^6 + 6x^5 + 5x^4 + 4x^3 + 3x^2 + 2x + 1',
    q: '-10x^9 - 9x^8 - 8x^7 - 7x^6 - 6x^5 - 5x^4 - 4x^3 - 3x^2 - 2x - 1',
    expectedR: '0',
    tests: 'All 10 terms cancel to zero'
  },
  {
    name: 'Stress: Extreme Boundaries',
    p: '999x^99 - 999',
    q: '1x^99 + 999',
    expectedR: '1000x^99',
    tests: 'Max/min bounds (-999 to 999, exp 99)'
  },
  {
    name: 'Stress: Heavy Unsorted Multi-pass',
    p: '1 + 2x + 3x^2 + 4x^3 + 5x^4 + 6x^5 + 7x^6 + 8x^7 + 9x^8 + 10x^9',
    q: '2 + 4x + 6x^2 + 8x^3 + 10x^4 + 12x^5 + 14x^6 + 16x^7 + 18x^8 + 20x^9',
    expectedR: '30x^9 + 27x^8 + 24x^7 + 21x^6 + 18x^5 + 15x^4 + 12x^3 + 9x^2 + 6x + 3',
    tests: 'Complete reverse order sort'
  }
];

/**
 * Generates a valid random polynomial string within PRD constraints.
 * @param {number} [termCount=4] Number of terms (1 to 10)
 * @returns {string}
 */
export function generateRandomPolynomial(termCount = 4) {
  const count = Math.max(1, Math.min(10, termCount));
  const exponents = [];
  while (exponents.length < count) {
    const exp = Math.floor(Math.random() * 13); // 0 to 12
    if (!exponents.includes(exp)) {
      exponents.push(exp);
    }
  }
  exponents.sort((a, b) => b - a);

  const terms = [];
  for (const exp of exponents) {
    let coef = 0;
    while (coef === 0) {
      coef = Math.floor(Math.random() * 19) - 9; // -9 to 9
    }
    terms.push({ coef, exp });
  }

  // Format into string
  let str = '';
  for (let i = 0; i < terms.length; i++) {
    const { coef, exp } = terms[i];
    const abs = Math.abs(coef);
    const sign = coef < 0 ? '-' : '+';
    let termText = '';
    if (exp === 0) termText = `${abs}`;
    else if (exp === 1) termText = abs === 1 ? 'x' : `${abs}x`;
    else termText = abs === 1 ? `x^${exp}` : `${abs}x^${exp}`;

    if (i === 0) {
      str += coef < 0 ? `-${termText}` : termText;
    } else {
      str += ` ${sign} ${termText}`;
    }
  }

  return str || '0';
}
