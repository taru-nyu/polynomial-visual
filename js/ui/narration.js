/**
 * Narration live region manager for screen readers and user feedback
 */

/**
 * Updates narration bar with current step narration and step number
 * @param {HTMLElement} narrationEl Container element
 * @param {Object} step Current step snapshot
 * @param {number} stepIndex Current 0-based index
 * @param {number} totalSteps Total step count
 * @param {boolean} [hideForPredict=false] Whether to mask narration during predict prompt
 */
export function updateNarration(narrationEl, step, stepIndex, totalSteps, hideForPredict = false) {
  if (!narrationEl) return;

  if (!step) {
    narrationEl.innerHTML = `
      <span class="narration-step-badge">Step 0/0</span>
      <span>Enter two polynomials and press Build lists.</span>
    `;
    return;
  }

  const stepDisplay = `Step ${stepIndex + 1} of ${totalSteps}`;

  if (hideForPredict) {
    narrationEl.innerHTML = `
      <span class="narration-step-badge">${stepDisplay}</span>
      <span>Prediction Mode: What will the algorithm do next? Make your guess below.</span>
    `;
    return;
  }

  narrationEl.innerHTML = `
    <span class="narration-step-badge">${stepDisplay}</span>
    <span>${escapeHtml(step.narration)}</span>
  `;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
