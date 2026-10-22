import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePoly } from '../js/core/parser.js';
import { normalise } from '../js/core/normalise.js';
import { runTwoPointer } from '../js/algorithms/twoPointer.js';
import { runNestedLoop } from '../js/algorithms/nestedLoop.js';
import { runInsertion } from '../js/algorithms/insertion.js';
import { addReference } from '../js/algorithms/reference.js';
import { Player } from '../js/player/player.js';
import { toText } from '../js/core/polyList.js';

test('STRESS 1: Maximum 10-term dense polynomials (interleaved exponents)', () => {
  // 10 terms each with exponents 19 down to 0 alternating
  const pStr = '10x^19 + 8x^17 + 6x^15 + 4x^13 + 2x^11 + 9x^9 + 7x^7 + 5x^5 + 3x^3 + x';
  const qStr = '9x^18 + 7x^16 + 5x^14 + 3x^12 + x^10 + 8x^8 + 6x^6 + 4x^4 + 2x^2 + 5';

  const p = parsePoly(pStr).terms;
  const q = parsePoly(qStr).terms;
  assert.equal(p.length, 10);
  assert.equal(q.length, 10);

  const ref = addReference(p, q);
  const refText = toText(ref);
  assert.equal(ref.length, 20); // 20 distinct terms in result

  const tp = runTwoPointer(p, q);
  const nl = runNestedLoop(p, q);
  const ins = runInsertion(p, q, { cursorOpt: true });
  const insOff = runInsertion(p, q, { cursorOpt: false });

  assert.equal(tp.resultText, refText);
  assert.equal(nl.resultText, refText);
  assert.equal(ins.resultText, refText);
  assert.equal(insOff.resultText, refText);

  // Invariant checks on steps
  assert(tp.steps.length > 20);
  assert(nl.steps.length > 20);
  assert(ins.steps.length > 20);
});

test('STRESS 2: Maximum 10-term full cancellation to zero', () => {
  const pStr = '10x^9 + 9x^8 + 8x^7 + 7x^6 + 6x^5 + 5x^4 + 4x^3 + 3x^2 + 2x + 1';
  const qStr = '-10x^9 - 9x^8 - 8x^7 - 7x^6 - 6x^5 - 5x^4 - 4x^3 - 3x^2 - 2x - 1';

  const p = parsePoly(pStr).terms;
  const q = parsePoly(qStr).terms;

  const ref = addReference(p, q);
  assert.equal(toText(ref), '0');

  const tp = runTwoPointer(p, q);
  const nl = runNestedLoop(p, q);
  const ins = runInsertion(p, q, { cursorOpt: true });

  assert.equal(tp.resultText, '0');
  assert.equal(nl.resultText, '0');
  assert.equal(ins.resultText, '0');

  assert.equal(tp.result.length, 0);
  assert.equal(nl.result.length, 0);
  assert.equal(ins.result.length, 0);

  // In insertion, all 10 nodes initially copied must be unlinked
  const lastInsStep = ins.steps[ins.steps.length - 1];
  assert.equal(lastInsStep.lists.R.length, 0);
});

test('STRESS 3: Extreme boundary values (coefficients -999, 999; exponents 99, 0)', () => {
  const pStr = '999x^99 - 999';
  const qStr = '1x^99 + 999';

  const p = parsePoly(pStr).terms;
  const q = parsePoly(qStr).terms;

  const ref = addReference(p, q);
  const refText = toText(ref); // 1000x^99, constant cancels
  assert.equal(refText, '1000x^99');

  const tp = runTwoPointer(p, q);
  const nl = runNestedLoop(p, q);
  const ins = runInsertion(p, q, { cursorOpt: true });

  assert.equal(tp.resultText, refText);
  assert.equal(nl.resultText, refText);
  assert.equal(ins.resultText, refText);
});

test('STRESS 4: Heavy unsorted input with multi-pass sort comparisons in Nested Loop', () => {
  // Completely reversed order: lowest to highest exponent
  const pStr = '1 + 2x + 3x^2 + 4x^3 + 5x^4 + 6x^5 + 7x^6 + 8x^7 + 9x^8 + 10x^9';
  const qStr = '2 + 4x + 6x^2 + 8x^3 + 10x^4 + 12x^5 + 14x^6 + 16x^7 + 18x^8 + 20x^9';

  const p = parsePoly(pStr).terms;
  const q = parsePoly(qStr).terms;

  // Nested loop can run on unsorted directly
  const nl = runNestedLoop(p, q);
  const expectedSorted = addReference(p, q);
  const expectedText = toText(expectedSorted);

  assert.equal(nl.resultText, expectedText);
  assert(nl.stats.sortComparisons > 0, 'Nested loop should have sort comparisons');

  // Verify result is strictly descending
  for (let i = 0; i < nl.result.length - 1; i++) {
    assert(nl.result[i].exp > nl.result[i + 1].exp);
  }
});

test('STRESS 5: High-volume 1,000 randomized polynomial pairs benchmark', () => {
  let seed = 987654321;
  function pseudoRandom() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  function randomPoly(termCount) {
    const exps = [];
    while (exps.length < termCount) {
      const exp = Math.floor(pseudoRandom() * 50); // 0 to 49
      if (!exps.includes(exp)) exps.push(exp);
    }
    exps.sort((a, b) => b - a);

    const terms = [];
    for (const exp of exps) {
      let coef = 0;
      while (coef === 0) {
        coef = Math.floor(pseudoRandom() * 1999) - 999;
      }
      terms.push({ coef, exp });
    }
    return terms;
  }

  const startTime = Date.now();
  let totalStepsGenerated = 0;

  for (let i = 0; i < 1000; i++) {
    const lenP = Math.floor(pseudoRandom() * 8) + 1; // 1 to 8 terms
    const lenQ = Math.floor(pseudoRandom() * 8) + 1; // 1 to 8 terms

    const p = randomPoly(lenP);
    const q = randomPoly(lenQ);

    const ref = addReference(p, q);
    const refText = toText(ref);

    const tp = runTwoPointer(p, q);
    const nl = runNestedLoop(p, q);
    const ins = runInsertion(p, q, { cursorOpt: true });

    assert.equal(tp.resultText, refText, `Run ${i}: Two-pointer mismatch`);
    assert.equal(nl.resultText, refText, `Run ${i}: Nested-loop mismatch`);
    assert.equal(ins.resultText, refText, `Run ${i}: Insertion mismatch`);

    totalStepsGenerated += tp.steps.length + nl.steps.length + ins.steps.length;
  }

  const elapsed = Date.now() - startTime;
  assert(elapsed < 10000, `1000 pairs took ${elapsed}ms, should be under 10s`);
  assert(totalStepsGenerated > 20000, `Generated ${totalStepsGenerated} steps`);
});

test('STRESS 6: Rapid player scrubbing (1,000 random jumps)', () => {
  const pStr = '10x^9 + 8x^7 + 6x^5 + 4x^3 + 2x';
  const qStr = '9x^8 + 7x^6 + 5x^4 + 3x^2 + 1';

  const p = parsePoly(pStr).terms;
  const q = parsePoly(qStr).terms;
  const { steps } = runTwoPointer(p, q);

  const player = new Player();
  player.load(steps);

  let seed = 42;
  function randomInt(max) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % max;
  }

  // Rapidly jump 1000 times
  for (let i = 0; i < 1000; i++) {
    const target = randomInt(steps.length);
    player.goTo(target);
    const current = player.getCurrentStep();
    assert.equal(player.currentIndex, target);
    assert.deepEqual(current, steps[target]);
  }
});
