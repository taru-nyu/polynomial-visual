import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePoly } from '../js/core/parser.js';
import { normalise, combineLikeTerms } from '../js/core/normalise.js';
import { toText } from '../js/core/polyList.js';

test('14.1 Parser: valid polynomial expressions', () => {
  // 5x^4+3x^2
  let res = parsePoly('5x^4+3x^2');
  assert.equal(res.error, null);
  assert.deepEqual(res.terms, [{ coef: 5, exp: 4 }, { coef: 3, exp: 2 }]);

  // -x
  res = parsePoly('-x');
  assert.equal(res.error, null);
  assert.deepEqual(res.terms, [{ coef: -1, exp: 1 }]);

  // x
  res = parsePoly('x');
  assert.equal(res.error, null);
  assert.deepEqual(res.terms, [{ coef: 1, exp: 1 }]);

  // 7
  res = parsePoly('7');
  assert.equal(res.error, null);
  assert.deepEqual(res.terms, [{ coef: 7, exp: 0 }]);

  // X^3 - 2
  res = parsePoly('X^3 - 2');
  assert.equal(res.error, null);
  assert.deepEqual(res.terms, [{ coef: 1, exp: 3 }, { coef: -2, exp: 0 }]);

  // 0 -> empty list, no error
  res = parsePoly('0');
  assert.equal(res.error, null);
  assert.deepEqual(res.terms, []);

  // with unicode minus
  res = parsePoly('5x^4 \u2212 3x^2');
  assert.equal(res.error, null);
  assert.deepEqual(res.terms, [{ coef: 5, exp: 4 }, { coef: -3, exp: 2 }]);
});

test('14.1 Parser: invalid inputs and validation errors', () => {
  // Empty text
  let res = parsePoly('');
  assert.match(res.error, /Enter a polynomial/i);

  res = parsePoly('   ');
  assert.match(res.error, /Enter a polynomial/i);

  // 3y^2 (unreadable)
  res = parsePoly('3y^2');
  assert.match(res.error, /Could not read/i);

  // 0x^2 (zero coefficient)
  res = parsePoly('0x^2');
  assert.match(res.error, /Terms with coefficient 0 are not allowed/i);

  // 2.5x (decimal)
  res = parsePoly('2.5x');
  assert.match(res.error, /Could not read/i);

  // x^-1 (negative exponent)
  res = parsePoly('x^-1');
  assert.match(res.error, /Could not read/i);

  // x^100 (exponent > 99)
  res = parsePoly('x^100');
  assert.match(res.error, /Exponents must be whole numbers from 0 to 99/i);

  // 1000x (coefficient > 999)
  res = parsePoly('1000x');
  assert.match(res.error, /Coefficients must be whole numbers from -999 to 999/i);

  // 2x^2 + 3x^2 (duplicate exponent)
  res = parsePoly('2x^2 + 3x^2', 'P');
  assert.match(res.error, /Exponent 2 appears twice in P/i);
  assert.equal(res.duplicateExp, 2);

  // Eleven terms (too many terms)
  const eleven = '10x^10 + 9x^9 + 8x^8 + 7x^7 + 6x^6 + 5x^5 + 4x^4 + 3x^3 + 2x^2 + x + 1';
  res = parsePoly(eleven);
  assert.match(res.error, /Maximum 10 terms/i);
});

test('Normalise and combineLikeTerms', () => {
  const terms = [{ coef: 2, exp: 1 }, { coef: 5, exp: 4 }, { coef: 7, exp: 0 }];
  const sorted = normalise(terms);
  assert.deepEqual(sorted, [{ coef: 5, exp: 4 }, { coef: 2, exp: 1 }, { coef: 7, exp: 0 }]);

  const combined = combineLikeTerms('2x^2 + 3x^2 - 5x + 1');
  assert.deepEqual(combined, [{ coef: 5, exp: 2 }, { coef: -5, exp: 1 }, { coef: 1, exp: 0 }]);
  assert.equal(toText(combined), '5x^2 - 5x + 1');
});
