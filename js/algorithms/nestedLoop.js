import { Node } from '../core/node.js';
import { fromTerms, toTerms, toText } from '../core/polyList.js';
import { StepRecorder } from './stepRecorder.js';

/**
 * Nested-loop traversal algorithm for polynomial addition.
 *
 * @param {Array<{coef: number, exp: number}>} termsP
 * @param {Array<{coef: number, exp: number}>} termsQ
 * @returns {{
 *   steps: Array<Object>,
 *   result: Array<{coef: number, exp: number}>,
 *   resultText: string,
 *   stats: { comparisons: number, created: number, moves: number, sortComparisons: number }
 * }}
 */
export function runNestedLoop(termsP, termsQ) {
  const recorder = new StepRecorder(termsP, termsQ, 'nl');

  const headP = fromTerms(termsP);
  const headQ = fromTerms(termsQ);
  let rCount = 0;

  // Track visited nodes of Q by index/node
  const visitedQ = new Set();

  // Step: INIT
  recorder.record({
    phase: 'scan',
    action: 'INIT',
    line: 1,
    narration: 'Lists are ready. Press Play or step forward.'
  });

  // Step: SET_POINTERS
  recorder.record({
    phase: 'scan',
    action: 'SET_POINTERS',
    line: 1,
    narration: 'Mark every node of Q unvisited.'
  });

  // Phase 1: Scan
  let p = headP;
  let pIdx = 0;

  while (p !== null) {
    const pId = `P${pIdx}`;
    recorder.setNodeState('P', pId, 'outer');
    recorder.setPointers({ p: pId, q: null });

    recorder.record({
      phase: 'scan',
      action: 'SET_POINTERS',
      line: 2,
      narration: `Outer pointer p is at ${p.coef}x^${p.exp}. Scan Q for the same exponent.`
    });

    let q = headQ;
    let qIdx = 0;
    let found = false;

    while (q !== null) {
      const qId = `Q${qIdx}`;
      recorder.incMoves(1);
      recorder.setPointers({ p: pId, q: qId });

      if (visitedQ.has(qIdx)) {
        // Skip visited
        recorder.record({
          phase: 'scan',
          action: 'SKIP_VISITED',
          line: 4,
          narration: `This node of Q (${q.coef}x^${q.exp}) was already used, so skip it.`
        });
        q = q.next;
        qIdx++;
        continue;
      }

      // Unvisited: Compare exponents
      recorder.setNodeState('Q', qId, 'compare');
      recorder.incComparisons(1);

      const isMatch = p.exp === q.exp;
      recorder.record({
        phase: 'scan',
        action: 'COMPARE',
        line: 5,
        narration: `${p.exp} vs ${q.exp}: ${isMatch ? 'exponents are equal' : 'no match'}.`,
        predict: {
          question: `p.exp = ${p.exp}, q.exp = ${q.exp}. Is there a match?`,
          options: ['Match found', 'No match yet'],
          answer: isMatch ? 0 : 1
        }
      });

      if (isMatch) {
        found = true;
        visitedQ.add(qIdx);
        const sum = p.coef + q.coef;

        if (sum !== 0) {
          const rId = `R${rCount++}`;
          recorder.addNodeR(rId, sum, p.exp, 'created');
          recorder.setPointers({ tail: rId });
          recorder.setNodeState('P', pId, 'visited');
          recorder.setNodeState('Q', qId, 'visited');

          recorder.record({
            phase: 'scan',
            action: 'MATCH_MERGE',
            line: 7,
            narration: `Exponents are equal. ${p.coef} + (${q.coef}) = ${sum}, so add ${sum}x^${p.exp} to R.`
          });
        } else {
          recorder.setNodeState('P', pId, 'zero');
          recorder.setNodeState('Q', qId, 'zero');

          recorder.record({
            phase: 'scan',
            action: 'ZERO_DROP',
            line: 7,
            narration: `${p.coef} + (${q.coef}) = 0, so the x^${p.exp} term disappears.`
          });
        }

        recorder.record({
          phase: 'scan',
          action: 'MARK_VISITED',
          line: 8,
          narration: `Mark Q node ${q.coef}x^${q.exp} as visited.`
        });
        break;
      } else {
        recorder.setNodeState('Q', qId, 'normal');
      }

      q = q.next;
      qIdx++;
    }

    if (!found) {
      // q reached NULL
      recorder.incMoves(1);
      recorder.setPointers({ p: pId, q: 'Q_NULL' });

      recorder.record({
        phase: 'scan',
        action: 'NO_MATCH',
        line: 9,
        narration: `There is no exponent ${p.exp} in Q. Keep the term from P as it is.`
      });

      const rId = `R${rCount++}`;
      recorder.addNodeR(rId, p.coef, p.exp, 'created');
      recorder.setPointers({ tail: rId });
      recorder.setNodeState('P', pId, 'visited');

      recorder.record({
        phase: 'scan',
        action: 'COPY_NODE',
        line: 9,
        narration: `Copy ${p.coef}x^${p.exp} into R.`
      });
    }

    p = p.next;
    pIdx++;
    recorder.incMoves(1);
  }

  // Phase 2: Leftover unvisited nodes in Q
  recorder.setPointers({ p: null, q: null });
  let qLeft = headQ;
  let qLeftIdx = 0;
  let hasUnvisitedQ = false;

  while (qLeft !== null) {
    if (!visitedQ.has(qLeftIdx)) {
      hasUnvisitedQ = true;
      break;
    }
    qLeft = qLeft.next;
    qLeftIdx++;
  }

  if (hasUnvisitedQ) {
    recorder.record({
      phase: 'leftover',
      action: 'LEFTOVER',
      line: 10,
      narration: 'Copy any remaining unvisited nodes of Q into R.'
    });

    qLeft = headQ;
    qLeftIdx = 0;
    while (qLeft !== null) {
      const qId = `Q${qLeftIdx}`;
      if (!visitedQ.has(qLeftIdx)) {
        recorder.setPointers({ q: qId });
        const rId = `R${rCount++}`;
        recorder.addNodeR(rId, qLeft.coef, qLeft.exp, 'created');
        recorder.setPointers({ tail: rId });
        recorder.setNodeState('Q', qId, 'visited');

        recorder.record({
          phase: 'leftover',
          action: 'COPY_NODE',
          line: 10,
          narration: `Copy unvisited term ${qLeft.coef}x^${qLeft.exp} from Q into R.`
        });
      }
      qLeft = qLeft.next;
      qLeftIdx++;
    }
  }

  recorder.setPointers({ p: null, q: null });

  // Phase 3: Sort R by exponent, descending
  // Check if R needs sorting
  const rList = recorder.lists.R;
  let needsSort = false;
  for (let i = 0; i < rList.length - 1; i++) {
    if (rList[i].exp < rList[i + 1].exp) {
      needsSort = true;
      break;
    }
  }

  if (rList.length > 1) {
    recorder.record({
      phase: 'sort',
      action: 'SORT_CHECK',
      line: 11,
      narration: 'Sort R by exponent in descending order.'
    });

    // Insertion sort simulation on R
    for (let i = 1; i < rList.length; i++) {
      let j = i;
      while (j > 0) {
        recorder.incSortComparisons(1);
        const nodeA = rList[j - 1];
        const nodeB = rList[j];

        const isOutOfOrder = nodeB.exp > nodeA.exp;
        recorder.record({
          phase: 'sort',
          action: 'SORT_CHECK',
          line: 11,
          narration: `Is exponent ${nodeB.exp} bigger than ${nodeA.exp}? ${isOutOfOrder ? 'Yes' : 'No'}.`
        });

        if (isOutOfOrder) {
          recorder.setNodeState('R', nodeB.id, 'lifted');
          recorder.setPointers({ lifted: nodeB.id });

          recorder.record({
            phase: 'sort',
            action: 'SORT_LIFT',
            line: 11,
            narration: `Exponent ${nodeB.exp} is out of order. Lift it out of the list.`
          });

          // Swap elements in recorder's R
          const temp = rList[j];
          rList[j] = rList[j - 1];
          rList[j - 1] = temp;

          recorder.setNodeState('R', nodeB.id, 'created');
          recorder.setPointers({ lifted: null });

          recorder.record({
            phase: 'sort',
            action: 'SORT_PLACE',
            line: 11,
            narration: `Place exponent ${nodeB.exp} before ${nodeA.exp}. Arrows are re-linked.`
          });

          j--;
        } else {
          break;
        }
      }
    }
  }

  // Final result
  const finalTerms = rList.map(n => ({ coef: n.coef, exp: n.exp }));
  const resultText = toText(finalTerms);

  recorder.setAllNodeStates('P', 'visited');
  recorder.setAllNodeStates('Q', 'visited');
  recorder.setAllNodeStates('R', 'created');
  recorder.setPointers({ p: null, q: null, tail: rList.length > 0 ? rList[rList.length - 1].id : null, lifted: null });

  recorder.record({
    phase: 'done',
    action: 'DONE',
    line: 12,
    narration: `Done. R(x) = ${resultText}.`
  });

  return {
    steps: recorder.steps,
    result: finalTerms,
    resultText,
    stats: { ...recorder.counters }
  };
}
