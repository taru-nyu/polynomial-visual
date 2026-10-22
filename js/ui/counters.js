/**
 * Live Counters and Complexity Display Component
 */

const COMPLEXITIES = {
  tp: { time: 'O(m + n)', space: 'O(1)' },
  nl: { time: 'O(m × n)', space: 'O(n)' },
  ins_off: { time: 'O(m × n)', space: 'O(1)' },
  ins_on: { time: 'O(m + n)', space: 'O(1)' }
};

/**
 * Updates counter elements and complexity tags
 * @param {Object} elements { comparisonsEl, createdEl, movesEl, sortRowEl, sortValEl, timeEl, spaceEl }
 * @param {Object} counters { comparisons, created, moves, sortComparisons }
 * @param {'tp'|'nl'|'ins'} approach
 * @param {boolean} [cursorOpt=false]
 */
export function updateCounters(elements, counters = {}, approach = 'tp', cursorOpt = false) {
  if (!elements) return;

  if (elements.comparisonsEl) {
    elements.comparisonsEl.textContent = counters.comparisons || 0;
  }
  if (elements.createdEl) {
    elements.createdEl.textContent = counters.created || 0;
  }
  if (elements.movesEl) {
    elements.movesEl.textContent = counters.moves || 0;
  }

  // Sort comparisons only shown for nested loop
  if (elements.sortRowEl && elements.sortValEl) {
    if (approach === 'nl') {
      elements.sortRowEl.style.display = 'flex';
      elements.sortValEl.textContent = counters.sortComparisons || 0;
    } else {
      elements.sortRowEl.style.display = 'none';
    }
  }

  // Complexity info
  const compKey = approach === 'ins' ? (cursorOpt ? 'ins_on' : 'ins_off') : approach;
  const comp = COMPLEXITIES[compKey] || COMPLEXITIES.tp;

  if (elements.timeEl) elements.timeEl.textContent = comp.time;
  if (elements.spaceEl) elements.spaceEl.textContent = comp.space;
}
