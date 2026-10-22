import { Node } from '../core/node.js';
import { toTerms, toText } from '../core/polyList.js';
import { StepRecorder } from './stepRecorder.js';

/**
 * Insertion-based algorithm for polynomial addition.
 *
 * @param {Array<{coef: number, exp: number}>} termsP
 * @param {Array<{coef: number, exp: number}>} termsQ
 * @param {Object} [options]
 * @param {boolean} [options.cursorOpt=false]
 * @returns {{
 *   steps: Array<Object>,
 *   result: Array<{coef: number, exp: number}>,
 *   resultText: string,
 *   stats: { comparisons: number, created: number, moves: number, sortComparisons: number }
 * }}
 */
export function runInsertion(termsP, termsQ, options = {}) {
  const cursorOpt = Boolean(options.cursorOpt);
  const recorder = new StepRecorder(termsP, termsQ, 'ins');

  // Step: INIT
  recorder.record({
    phase: 'copy',
    action: 'INIT',
    line: 1,
    narration: 'Lists are ready. Press Play or step forward.'
  });

  // Step 1: R = copy of P
  let rCount = 0;
  for (let i = 0; i < termsP.length; i++) {
    const t = termsP[i];
    recorder.addNodeR(`R${rCount++}`, t.coef, t.exp, 'created');
  }

  recorder.record({
    phase: 'copy',
    action: 'COPY_LIST',
    line: 1,
    narration: 'R starts as a copy of P.'
  });

  // Real Node linked list for R
  let headR = null;
  let tailR = null;
  const rNodeIds = []; // parallel array of IDs for R nodes

  for (let i = 0; i < termsP.length; i++) {
    const t = termsP[i];
    const node = new Node(t.coef, t.exp);
    const id = `R${i}`;
    rNodeIds.push(id);
    if (!headR) {
      headR = node;
      tailR = node;
    } else {
      tailR.next = node;
      tailR = node;
    }
  }

  // Pointer tracking
  let cursorNode = null;
  let cursorId = null;

  // Process each node in Q
  for (let qIdx = 0; qIdx < termsQ.length; qIdx++) {
    const qTerm = termsQ[qIdx];
    const qId = `Q${qIdx}`;

    // Lift term q out of its row
    recorder.setNodeState('Q', qId, 'lifted');
    recorder.setPointers({ q: qId, lifted: qId, c: null, prev: null });

    recorder.record({
      phase: 'insert',
      action: 'LIFT_TERM',
      line: 3,
      narration: `Pick up ${qTerm.coef}x^${qTerm.exp} from Q.`
    });

    // Determine starting cursor & prev
    let c = headR;
    let prev = null;
    let cId = rNodeIds[0] || null;
    let prevId = null;

    if (cursorOpt && cursorNode !== null) {
      c = cursorNode;
      cId = cursorId;
      // find prev of cursor
      let search = headR;
      let sIdx = 0;
      prev = null;
      prevId = null;
      while (search !== null && search !== c) {
        prev = search;
        prevId = rNodeIds[sIdx];
        search = search.next;
        sIdx++;
      }
    }

    recorder.setPointers({ c: cId, prev: prevId });

    // Traverse R to find placement
    while (c !== null) {
      recorder.incComparisons(1);

      if (c.exp > qTerm.exp) {
        // Move cursor on
        recorder.record({
          phase: 'insert',
          action: 'COMPARE',
          line: 5,
          narration: `${c.exp} vs ${qTerm.exp}: exponent ${c.exp} is bigger than ${qTerm.exp}, so move on.`,
          predict: {
            question: `c.exp = ${c.exp}, q.exp = ${qTerm.exp}. What happens next?`,
            options: ['Move cursor on', 'Merge here', 'Insert before this node'],
            answer: 0
          }
        });

        prev = c;
        prevId = cId;
        const currIdx = rNodeIds.indexOf(cId);
        c = c.next;
        cId = currIdx + 1 < rNodeIds.length ? rNodeIds[currIdx + 1] : null;

        recorder.incMoves(1);
        recorder.setPointers({ c: cId, prev: prevId });

        recorder.record({
          phase: 'insert',
          action: 'CURSOR_STEP',
          line: 5,
          narration: `Move cursor c to ${c ? `exponent ${c.exp}` : 'NULL'}.`
        });
      } else {
        // c.exp <= qTerm.exp
        break;
      }
    }

    if (c !== null && c.exp === qTerm.exp) {
      // Exponents equal: Merge
      recorder.record({
        phase: 'insert',
        action: 'COMPARE',
        line: 6,
        narration: `${c.exp} vs ${qTerm.exp}: exponents are equal.`,
        predict: {
          question: `c.exp = ${c.exp}, q.exp = ${qTerm.exp}. What happens next?`,
          options: ['Move cursor on', 'Merge here', 'Insert before this node'],
          answer: 1
        }
      });

      const sum = c.coef + qTerm.coef;
      c.coef = sum;
      const targetNodeInRecorder = recorder.lists.R.find(n => n.id === cId);
      if (targetNodeInRecorder) {
        targetNodeInRecorder.coef = sum;
      }

      if (sum !== 0) {
        recorder.setNodeState('R', cId, 'created');
        recorder.setNodeState('Q', qId, 'visited');
        recorder.setPointers({ lifted: null });

        recorder.record({
          phase: 'insert',
          action: 'MATCH_MERGE',
          line: 7,
          narration: `Exponents are equal. Add ${qTerm.coef} to existing node: new coefficient is ${sum}.`
        });

        cursorNode = c;
        cursorId = cId;
      } else {
        // Zero sum -> Unlink node!
        recorder.setNodeState('R', cId, 'zero');
        recorder.setNodeState('Q', qId, 'zero');

        recorder.record({
          phase: 'insert',
          action: 'ZERO_DROP',
          line: 8,
          narration: `The sum is zero. Unlink node ${cId} so the term disappears.`
        });

        // Unlink from linked list
        if (prev === null) {
          headR = c.next;
        } else {
          prev.next = c.next;
        }

        // Unlink from recorder
        recorder.unlinkNodeR(cId);
        const rmIdx = rNodeIds.indexOf(cId);
        if (rmIdx !== -1) {
          rNodeIds.splice(rmIdx, 1);
        }

        recorder.setPointers({ lifted: null, c: prev ? prevId : null });

        recorder.record({
          phase: 'insert',
          action: 'UNLINK_NODE',
          line: 8,
          narration: `Node unlinked. Arrows are redrawn.`
        });

        cursorNode = prev;
        cursorId = prevId;
      }
    } else {
      // c is NULL or c.exp < qTerm.exp: Insert new node
      recorder.record({
        phase: 'insert',
        action: 'COMPARE',
        line: 10,
        narration: `Exponent ${qTerm.exp} is not in R. Insert new node here.`,
        predict: {
          question: `Target position found for exponent ${qTerm.exp}. What happens next?`,
          options: ['Move cursor on', 'Merge here', 'Insert before this node'],
          answer: 2
        }
      });

      const newNodeId = `R${rCount++}`;
      const newNode = new Node(qTerm.coef, qTerm.exp);

      if (prev === null) {
        newNode.next = headR;
        headR = newNode;
        rNodeIds.unshift(newNodeId);
        recorder.insertNodeR(0, newNodeId, qTerm.coef, qTerm.exp, 'created');
      } else {
        newNode.next = prev.next;
        prev.next = newNode;
        const prevIndex = rNodeIds.indexOf(prevId);
        rNodeIds.splice(prevIndex + 1, 0, newNodeId);
        recorder.insertNodeR(prevIndex + 1, newNodeId, qTerm.coef, qTerm.exp, 'created');
      }

      recorder.setNodeState('Q', qId, 'visited');
      recorder.setPointers({ lifted: null, c: newNodeId });

      recorder.record({
        phase: 'insert',
        action: 'INSERT_NODE',
        line: 10,
        narration: `Insert new node ${qTerm.coef}x^${qTerm.exp} into R.`
      });

      cursorNode = newNode;
      cursorId = newNodeId;
    }
  }

  const resultTerms = toTerms(headR);
  const resultText = toText(resultTerms);

  recorder.setAllNodeStates('P', 'visited');
  recorder.setAllNodeStates('Q', 'visited');
  recorder.setAllNodeStates('R', 'created');
  recorder.setPointers({
    p: null,
    q: null,
    tail: rNodeIds.length > 0 ? rNodeIds[rNodeIds.length - 1] : null,
    c: null,
    prev: null,
    lifted: null
  });

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
