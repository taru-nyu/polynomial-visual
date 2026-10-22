import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePoly } from '../js/core/parser.js';
import { runTwoPointer } from '../js/algorithms/twoPointer.js';
import { runNestedLoop } from '../js/algorithms/nestedLoop.js';
import { runInsertion } from '../js/algorithms/insertion.js';
import { PRESETS } from '../js/core/presets.js';

test('14.3 Step invariants: INIT, DONE, narration, line numbers, non-decreasing counters', () => {
  const algorithms = [
    { name: 'Two-pointer', run: (p, q) => runTwoPointer(p, q) },
    { name: 'Nested loop', run: (p, q) => runNestedLoop(p, q) },
    { name: 'Insertion off', run: (p, q) => runInsertion(p, q, { cursorOpt: false }) },
    { name: 'Insertion on', run: (p, q) => runInsertion(p, q, { cursorOpt: true }) }
  ];

  const basic = PRESETS.find(p => p.name === 'Basic');
  const pTerms = parsePoly(basic.p).terms;
  const qTerms = parsePoly(basic.q).terms;

  for (const algo of algorithms) {
    const { steps } = algo.run(pTerms, qTerms);

    assert(steps.length > 0, `${algo.name}: steps should not be empty`);

    // First step is INIT
    assert.equal(steps[0].action, 'INIT', `${algo.name}: First step must be INIT`);

    // Last step is DONE
    assert.equal(steps[steps.length - 1].action, 'DONE', `${algo.name}: Last step must be DONE`);

    let prevComparisons = 0;
    let prevCreated = 0;
    let prevMoves = 0;
    let prevSort = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      // Narration exists
      assert(
        typeof step.narration === 'string' && step.narration.trim().length > 0,
        `${algo.name} step ${i}: narration must be non-empty`
      );

      // Line number valid
      assert(
        typeof step.line === 'number' && step.line >= 1 && step.line <= 12,
        `${algo.name} step ${i}: line number must be between 1 and 12`
      );

      // Counters non-decreasing
      assert(
        step.counters.comparisons >= prevComparisons,
        `${algo.name} step ${i}: comparisons decreased`
      );
      assert(
        step.counters.created >= prevCreated,
        `${algo.name} step ${i}: created decreased`
      );
      assert(
        step.counters.moves >= prevMoves,
        `${algo.name} step ${i}: moves decreased`
      );
      assert(
        step.counters.sortComparisons >= prevSort,
        `${algo.name} step ${i}: sortComparisons decreased`
      );

      prevComparisons = step.counters.comparisons;
      prevCreated = step.counters.created;
      prevMoves = step.counters.moves;
      prevSort = step.counters.sortComparisons;

      // Immutability: step object and child lists should be frozen
      assert(Object.isFrozen(step), `${algo.name} step ${i}: step object must be frozen`);
      assert(Object.isFrozen(step.lists), `${algo.name} step ${i}: lists object must be frozen`);
      assert(Object.isFrozen(step.pointers), `${algo.name} step ${i}: pointers must be frozen`);
      assert(Object.isFrozen(step.counters), `${algo.name} step ${i}: counters must be frozen`);
    }
  }
});
