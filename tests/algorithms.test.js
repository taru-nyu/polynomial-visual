import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePoly } from '../js/core/parser.js';
import { normalise } from '../js/core/normalise.js';
import { runTwoPointer } from '../js/algorithms/twoPointer.js';
import { runNestedLoop } from '../js/algorithms/nestedLoop.js';
import { runInsertion } from '../js/algorithms/insertion.js';
import { addReference } from '../js/algorithms/reference.js';
import { PRESETS } from '../js/core/presets.js';
import { toText } from '../js/core/polyList.js';

test('14.2 Algorithms: Seven Presets Verification', () => {
  for (const preset of PRESETS) {
    let pTerms = parsePoly(preset.p).terms;
    let qTerms = parsePoly(preset.q).terms;

    // For unsorted preset, nestedLoop can run on raw terms;
    // twoPointer and insertion require sorted P/Q as per PRD
    if (preset.name.includes('Unsorted')) {
      const nlRes = runNestedLoop(pTerms, qTerms);
      assert.equal(nlRes.resultText, preset.expectedR, `Nested loop failed on ${preset.name}`);

      pTerms = normalise(pTerms);
      qTerms = normalise(qTerms);
    }

    const tpRes = runTwoPointer(pTerms, qTerms);
    const nlRes = runNestedLoop(pTerms, qTerms);
    const insOffRes = runInsertion(pTerms, qTerms, { cursorOpt: false });
    const insOnRes = runInsertion(pTerms, qTerms, { cursorOpt: true });
    const refTerms = addReference(pTerms, qTerms);
    const refText = toText(refTerms);

    assert.equal(tpRes.resultText, preset.expectedR, `Two-pointer failed on ${preset.name}`);
    assert.equal(nlRes.resultText, preset.expectedR, `Nested-loop failed on ${preset.name}`);
    assert.equal(insOffRes.resultText, preset.expectedR, `Insertion (cursor off) failed on ${preset.name}`);
    assert.equal(insOnRes.resultText, preset.expectedR, `Insertion (cursor on) failed on ${preset.name}`);
    assert.equal(refText, preset.expectedR, `Reference failed on ${preset.name}`);
  }
});

test('14.2 Counters for Basic preset match PRD Section 7.4', () => {
  const basic = PRESETS.find(p => p.name === 'Basic');
  const pTerms = parsePoly(basic.p).terms;
  const qTerms = parsePoly(basic.q).terms;

  // Two-pointer
  const tp = runTwoPointer(pTerms, qTerms);
  assert.equal(tp.stats.comparisons, 5, 'Two-pointer comparisons must be 5');
  assert.equal(tp.stats.created, 4, 'Two-pointer nodes created must be 4');
  assert.equal(tp.stats.moves, 8, 'Two-pointer pointer moves must be 8');

  // Nested-loop
  const nl = runNestedLoop(pTerms, qTerms);
  assert.equal(nl.stats.comparisons, 7, 'Nested loop comparisons must be 7');
  assert.equal(nl.stats.created, 4, 'Nested loop nodes created must be 4');

  // Insertion cursor off
  const insOff = runInsertion(pTerms, qTerms, { cursorOpt: false });
  assert.equal(insOff.stats.comparisons, 10, 'Insertion cursor off comparisons must be 10');
  assert.equal(insOff.stats.created, 5, 'Insertion cursor off nodes created must be 5');

  // Insertion cursor on
  const insOn = runInsertion(pTerms, qTerms, { cursorOpt: true });
  assert.equal(insOn.stats.comparisons, 8, 'Insertion cursor on comparisons must be 8');
  assert.equal(insOn.stats.created, 5, 'Insertion cursor on nodes created must be 5');
});

test('14.2 Property Test: 200 random polynomial pairs match reference', () => {
  // Simple seeded pseudo-random generator (LCG)
  let seed = 123456789;
  function pseudoRandom() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  function randomPoly(termCount) {
    const exps = [];
    while (exps.length < termCount) {
      const exp = Math.floor(pseudoRandom() * 15);
      if (!exps.includes(exp)) exps.push(exp);
    }
    exps.sort((a, b) => b - a);

    const terms = [];
    for (const exp of exps) {
      let coef = 0;
      while (coef === 0) {
        coef = Math.floor(pseudoRandom() * 19) - 9;
      }
      terms.push({ coef, exp });
    }
    return terms;
  }

  for (let i = 0; i < 200; i++) {
    const lenP = Math.floor(pseudoRandom() * 6); // 0 to 5 terms
    const lenQ = Math.floor(pseudoRandom() * 6); // 0 to 5 terms

    const p = randomPoly(lenP);
    const q = randomPoly(lenQ);

    const ref = addReference(p, q);
    const refText = toText(ref);

    const tp = runTwoPointer(p, q);
    const nl = runNestedLoop(p, q);
    const ins = runInsertion(p, q, { cursorOpt: true });

    assert.equal(tp.resultText, refText, `Run ${i}: Two-pointer mismatch with reference`);
    assert.equal(nl.resultText, refText, `Run ${i}: Nested-loop mismatch with reference`);
    assert.equal(ins.resultText, refText, `Run ${i}: Insertion mismatch with reference`);
  }
});
