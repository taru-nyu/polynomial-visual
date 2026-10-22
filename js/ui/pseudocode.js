/**
 * Pseudocode data and active line highlight manager for PRD Section 7 & 10.2
 */

export const PSEUDOCODE = {
  tp: [
    'p = P.head; q = Q.head; R = empty',
    'while p != NULL and q != NULL:',
    '  if p.exp == q.exp:',
    '    sum = p.coef + q.coef',
    '    if sum != 0: append(R, sum, p.exp)',
    '    p = p.next; q = q.next',
    '  else if p.exp > q.exp:',
    '    append(R, p.coef, p.exp); p = p.next',
    '  else:',
    '    append(R, q.coef, q.exp); q = q.next',
    'copy every remaining node of P or Q into R',
    'return R'
  ],
  nl: [
    'R = empty; mark every node of Q unvisited',
    'for each node p in P:',
    '  found = false',
    '  for each unvisited node q in Q:',
    '    if p.exp == q.exp:',
    '      sum = p.coef + q.coef',
    '      if sum != 0: append(R, sum, p.exp)',
    '      mark q visited; found = true; break',
    '  if not found: append(R, p.coef, p.exp)',
    'for each unvisited node q in Q: append(R, q.coef, q.exp)',
    'sort R by exponent, descending',
    'return R'
  ],
  ins: [
    'R = copy of P',
    'for each node q in Q:',
    '  lift q out of its row',
    '  c = (optimised and cursor set) ? cursor : R.head; prev = node before c',
    '  while c != NULL and c.exp > q.exp: prev = c; c = c.next',
    '  if c != NULL and c.exp == q.exp:',
    '    c.coef = c.coef + q.coef',
    '    if c.coef == 0: unlink c (prev.next = c.next)',
    '  else:',
    '    insert new node (q.coef, q.exp) between prev and c',
    '  cursor = node where the term landed',
    'return R'
  ]
};

/**
 * Initializes and populates the pseudocode panel for the selected approach
 * @param {HTMLElement} container
 * @param {'tp'|'nl'|'ins'} approach
 */
export function initPseudocode(container, approach) {
  if (!container) return;
  const lines = PSEUDOCODE[approach] || PSEUDOCODE.tp;

  let html = '';
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    html += `
      <div class="code-line" id="code-line-${lineNum}" data-line="${lineNum}">
        <span class="code-line-number">${lineNum}</span>
        <span class="code-line-content">${escapeHtml(lines[i])}</span>
      </div>
    `;
  }
  container.innerHTML = html;
}

/**
 * Highlights active line in pseudocode panel and scrolls it into view
 * @param {HTMLElement} container
 * @param {number} activeLineNumber
 */
export function highlightPseudocodeLine(container, activeLineNumber) {
  if (!container) return;

  const lines = container.querySelectorAll('.code-line');
  lines.forEach(el => el.classList.remove('active'));

  if (!activeLineNumber) return;

  const target = container.querySelector(`#code-line-${activeLineNumber}`);
  if (target) {
    target.classList.add('active');
    // Scroll smoothly into view if needed
    const panel = container.parentElement;
    if (panel) {
      const top = target.offsetTop - panel.offsetTop - 40;
      panel.scrollTop = Math.max(0, top);
    }
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
