import { Node } from '../core/node.js';
import { fromTerms, toTerms, toText } from '../core/polyList.js';
import { StepRecorder } from './stepRecorder.js';

/**
 * Two-pointer traversal algorithm for polynomial addition.
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
export function runTwoPointer(termsP, termsQ) {
  const recorder = new StepRecorder(termsP, termsQ, 'tp');

  // Real Node linked lists
  const headP = fromTerms(termsP);
  const headQ = fromTerms(termsQ);
  let headR = null;
  let tailR = null;
  let rCount = 0;

  // Step: INIT
  recorder.record({
    phase: 'scan',
    action: 'INIT',
    line: 1,
    narration: 'Lists are ready. Press Play or step forward.'
  });

  let p = headP;
  let q = headQ;
  let pIdx = 0;
  let qIdx = 0;

  // Step: SET_POINTERS
  if (p || q) {
    recorder.setPointers({
      p: p ? `P${pIdx}` : 'P_NULL',
      q: q ? `Q${qIdx}` : 'Q_NULL',
      tail: null
    });
    if (p) recorder.setNodeState('P', `P${pIdx}`, 'compare');
    if (q) recorder.setNodeState('Q', `Q${qIdx}`, 'compare');

    recorder.record({
      phase: 'scan',
      action: 'SET_POINTERS',
      line: 1,
      narration: 'p starts at the head of P and q at the head of Q.'
    });
  }

  // Traversal loop
  while (p !== null && q !== null) {
    const pId = `P${pIdx}`;
    const qId = `Q${qIdx}`;

    // Highlight active compare nodes
    recorder.setNodeState('P', pId, 'compare');
    recorder.setNodeState('Q', qId, 'compare');

    // COMPARE step
    recorder.incComparisons(1);
    let predictAnswer = 2; // Merge
    let outcomeText = 'exponents are equal';
    if (p.exp > q.exp) {
      predictAnswer = 0; // Copy from P
      outcomeText = `p has higher exponent (${p.exp} > ${q.exp})`;
    } else if (p.exp < q.exp) {
      predictAnswer = 1; // Copy from Q
      outcomeText = `q has higher exponent (${q.exp} > ${p.exp})`;
    }

    recorder.record({
      phase: 'scan',
      action: 'COMPARE',
      line: 3,
      narration: `${p.exp} vs ${q.exp}: ${outcomeText}.`,
      predict: {
        question: `p.exp = ${p.exp}, q.exp = ${q.exp}. What happens next?`,
        options: ['Copy from P', 'Copy from Q', 'Merge'],
        answer: predictAnswer
      }
    });

    if (p.exp === q.exp) {
      const sum = p.coef + q.coef;
      if (sum !== 0) {
        const rId = `R${rCount++}`;
        recorder.addNodeR(rId, sum, p.exp, 'created');
        recorder.setPointers({ tail: rId });

        // Node linked in R
        const rNode = new Node(sum, p.exp);
        if (!headR) {
          headR = rNode;
          tailR = rNode;
        } else {
          tailR.next = rNode;
          tailR = rNode;
        }

        recorder.setNodeState('P', pId, 'visited');
        recorder.setNodeState('Q', qId, 'visited');

        recorder.record({
          phase: 'scan',
          action: 'MATCH_MERGE',
          line: 5,
          narration: `Exponents are equal. ${p.coef} + (${q.coef}) = ${sum}, so add ${sum}x^${p.exp} to R.`
        });
      } else {
        // Zero sum
        recorder.setNodeState('P', pId, 'zero');
        recorder.setNodeState('Q', qId, 'zero');

        recorder.record({
          phase: 'scan',
          action: 'ZERO_DROP',
          line: 5,
          narration: `${p.coef} + (${q.coef}) = 0, so the x^${p.exp} term disappears.`
        });
      }

      // Advance both pointers
      p = p.next;
      pIdx++;
      recorder.incMoves(1);

      q = q.next;
      qIdx++;
      recorder.incMoves(1);

      recorder.setPointers({
        p: p ? `P${pIdx}` : 'P_NULL',
        q: q ? `Q${qIdx}` : 'Q_NULL'
      });
    } else if (p.exp > q.exp) {
      // Copy p
      const rId = `R${rCount++}`;
      recorder.addNodeR(rId, p.coef, p.exp, 'created');
      recorder.setPointers({ tail: rId });

      const rNode = new Node(p.coef, p.exp);
      if (!headR) {
        headR = rNode;
        tailR = rNode;
      } else {
        tailR.next = rNode;
        tailR = rNode;
      }

      recorder.setNodeState('P', pId, 'visited');

      recorder.record({
        phase: 'scan',
        action: 'COPY_NODE',
        line: 8,
        narration: `Exponent ${p.exp} is only in P. Copy it into R.`
      });

      p = p.next;
      pIdx++;
      recorder.incMoves(1);
      recorder.setPointers({ p: p ? `P${pIdx}` : 'P_NULL' });
    } else {
      // Copy q
      const rId = `R${rCount++}`;
      recorder.addNodeR(rId, q.coef, q.exp, 'created');
      recorder.setPointers({ tail: rId });

      const rNode = new Node(q.coef, q.exp);
      if (!headR) {
        headR = rNode;
        tailR = rNode;
      } else {
        tailR.next = rNode;
        tailR = rNode;
      }

      recorder.setNodeState('Q', qId, 'visited');

      recorder.record({
        phase: 'scan',
        action: 'COPY_NODE',
        line: 10,
        narration: `Exponent ${q.exp} is only in Q. Copy it into R.`
      });

      q = q.next;
      qIdx++;
      recorder.incMoves(1);
      recorder.setPointers({ q: q ? `Q${qIdx}` : 'Q_NULL' });
    }
  }

  // Leftover phase
  if (p !== null || q !== null) {
    recorder.record({
      phase: 'leftover',
      action: 'LEFTOVER',
      line: 11,
      narration: 'One list is finished. Copy what is left of the other.'
    });

    while (p !== null) {
      const pId = `P${pIdx}`;
      const rId = `R${rCount++}`;
      recorder.addNodeR(rId, p.coef, p.exp, 'created');
      recorder.setPointers({ tail: rId });

      const rNode = new Node(p.coef, p.exp);
      if (!headR) {
        headR = rNode;
        tailR = rNode;
      } else {
        tailR.next = rNode;
        tailR = rNode;
      }

      recorder.setNodeState('P', pId, 'visited');

      recorder.record({
        phase: 'leftover',
        action: 'COPY_NODE',
        line: 11,
        narration: `Copy remaining term ${p.coef}x^${p.exp} from P into R.`
      });

      p = p.next;
      pIdx++;
      recorder.incMoves(1);
      recorder.setPointers({ p: p ? `P${pIdx}` : 'P_NULL' });
    }

    while (q !== null) {
      const qId = `Q${qIdx}`;
      const rId = `R${rCount++}`;
      recorder.addNodeR(rId, q.coef, q.exp, 'created');
      recorder.setPointers({ tail: rId });

      const rNode = new Node(q.coef, q.exp);
      if (!headR) {
        headR = rNode;
        tailR = rNode;
      } else {
        tailR.next = rNode;
        tailR = rNode;
      }

      recorder.setNodeState('Q', qId, 'visited');

      recorder.record({
        phase: 'leftover',
        action: 'COPY_NODE',
        line: 11,
        narration: `Copy remaining term ${q.coef}x^${q.exp} from Q into R.`
      });

      q = q.next;
      qIdx++;
      recorder.incMoves(1);
      recorder.setPointers({ q: q ? `Q${qIdx}` : 'Q_NULL' });
    }
  }

  const resultTerms = toTerms(headR);
  const resultText = toText(resultTerms);

  // Set all remaining nodes in P, Q to visited
  recorder.setAllNodeStates('P', 'visited');
  recorder.setAllNodeStates('Q', 'visited');

  recorder.record({
    phase: 'done',
    action: 'DONE',
    line: 12,
    narration: `Done. R(x) = ${resultText}.`
  });

  return {
    steps: recorder.steps,
    result: resultTerms,
    resultText,
    stats: { ...recorder.counters }
  };
}
