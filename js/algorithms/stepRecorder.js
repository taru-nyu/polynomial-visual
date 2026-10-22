/**
 * StepRecorder creates immutable snapshot records for playback
 * following PRD Section 8.
 */

export class StepRecorder {
  /**
   * @param {Array<{coef: number, exp: number}>} termsP
   * @param {Array<{coef: number, exp: number}>} termsQ
   * @param {'tp'|'nl'|'ins'} approach
   */
  constructor(termsP, termsQ, approach) {
    this.approach = approach;
    this.steps = [];
    this.stepCount = 0;

    // Create initial list representations with stable IDs
    this.lists = {
      P: termsP.map((t, idx) => ({
        id: `P${idx}`,
        coef: t.coef,
        exp: t.exp,
        state: 'normal'
      })),
      Q: termsQ.map((t, idx) => ({
        id: `Q${idx}`,
        coef: t.coef,
        exp: t.exp,
        state: 'normal'
      })),
      R: []
    };

    this.pointers = {
      p: null,
      q: null,
      tail: null,
      c: null,
      prev: null,
      lifted: null
    };

    this.counters = {
      comparisons: 0,
      created: 0,
      moves: 0,
      sortComparisons: 0
    };
  }

  /**
   * Records a snapshot step
   * @param {Object} params
   * @param {string} params.phase - 'scan'|'leftover'|'sort'|'copy'|'insert'|'done'
   * @param {string} params.action - e.g. 'COMPARE', 'MATCH_MERGE', etc.
   * @param {number} params.line - Pseudocode line number
   * @param {string} params.narration - Narrative explanation
   * @param {Object} [params.predict=null] - Prediction object for interactive mode
   */
  record({ phase, action, line, narration, predict = null }) {
    // Deep clone lists, pointers, and counters
    const snapshotLists = {
      P: this.lists.P.map(n => ({ ...n })),
      Q: this.lists.Q.map(n => ({ ...n })),
      R: this.lists.R.map(n => ({ ...n }))
    };

    const snapshotPointers = { ...this.pointers };
    const snapshotCounters = { ...this.counters };

    const step = {
      id: this.stepCount++,
      phase,
      action,
      line,
      narration,
      lists: Object.freeze(snapshotLists),
      pointers: Object.freeze(snapshotPointers),
      counters: Object.freeze(snapshotCounters),
      predict: predict ? Object.freeze({ ...predict }) : null
    };

    this.steps.push(Object.freeze(step));
  }

  setNodeState(listKey, id, state) {
    const list = this.lists[listKey];
    if (!list) return;
    const node = list.find(n => n.id === id);
    if (node) {
      node.state = state;
    }
  }

  setAllNodeStates(listKey, state) {
    const list = this.lists[listKey];
    if (!list) return;
    for (const node of list) {
      node.state = state;
    }
  }

  addNodeR(id, coef, exp, state = 'created') {
    this.lists.R.push({ id, coef, exp, state });
    this.counters.created++;
  }

  insertNodeR(index, id, coef, exp, state = 'created') {
    this.lists.R.splice(index, 0, { id, coef, exp, state });
    this.counters.created++;
  }

  unlinkNodeR(id) {
    const idx = this.lists.R.findIndex(n => n.id === id);
    if (idx !== -1) {
      this.lists.R.splice(idx, 1);
    }
  }

  setPointers(newPointers) {
    this.pointers = { ...this.pointers, ...newPointers };
  }

  incComparisons(amount = 1) {
    this.counters.comparisons += amount;
  }

  incSortComparisons(amount = 1) {
    this.counters.sortComparisons += amount;
  }

  incMoves(amount = 1) {
    this.counters.moves += amount;
  }
}
