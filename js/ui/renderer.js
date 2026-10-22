/**
 * SVG Renderer for drawing linked list polynomial nodes, pointers, and arrows.
 * Pure function of the current step record, following PRD Section 9 and 13.6.
 */

const NODE_WIDTH = 120;
const NODE_HEIGHT = 46;
const NODE_GAP = 36;
const HEAD_WIDTH = 64;
const NULL_WIDTH = 48;
const ROW_HEIGHT = 92;

/**
 * Creates SVG definitions (arrow markers, symbols, filters)
 * @returns {string}
 */
export function getSvgDefs() {
  return `
    <defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="var(--muted)" class="arrow-head" />
      </marker>
      <filter id="lift-shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-opacity="0.3"/>
      </filter>
    </defs>
  `;
}

/**
 * Renders a single row (P, Q, or R) into an SVG container
 * @param {SVGSVGElement|HTMLElement} container
 * @param {Array<Object>} nodesList
 * @param {string} listKey 'P' | 'Q' | 'R'
 * @param {Object} pointers Active pointers object { p, q, tail, c, prev, lifted }
 * @param {Object} options { scale: number, reducedMotion: boolean }
 */
export function renderRow(container, nodesList, listKey, pointers = {}, options = {}) {
  const scale = options.scale || 1.0;
  const isReduced = Boolean(options.reducedMotion);

  if (!container) return;

  const totalNodes = nodesList ? nodesList.length : 0;
  const widthNeeded = Math.max(
    520,
    HEAD_WIDTH + totalNodes * (NODE_WIDTH + NODE_GAP) + NULL_WIDTH + 40
  );

  let svgHtml = `
    <svg viewBox="0 0 ${widthNeeded} ${ROW_HEIGHT}"
         width="${widthNeeded * scale}"
         height="${ROW_HEIGHT * scale}"
         class="list-svg ${isReduced ? 'reduced-motion' : ''}"
         role="img"
         aria-label="Linked list for polynomial ${listKey}">
      ${getSvgDefs()}
      <g transform="translate(10, 18)">
        <!-- Head Pointer -->
        <g class="head-pointer" transform="translate(0, 12)">
          <text x="0" y="16" font-family="var(--font-mono)" font-size="12" font-weight="700" fill="var(--muted)">head</text>
          <path d="M34,12 L54,12" class="arrow-line" marker-end="url(#arrowhead)" />
        </g>
  `;

  let currentX = HEAD_WIDTH;

  if (!nodesList || nodesList.length === 0) {
    // Empty list -> head points directly to NULL
    svgHtml += `
      <!-- NULL Node -->
      <g class="null-group" transform="translate(${currentX}, 0)">
        <rect x="0" y="0" width="${NULL_WIDTH}" height="${NODE_HEIGHT}" class="null-box" rx="8" ry="8" />
        <text x="${NULL_WIDTH / 2}" y="${NODE_HEIGHT / 2 + 1}" class="null-text">NULL</text>
      </g>
    `;
  } else {
    for (let i = 0; i < nodesList.length; i++) {
      const node = nodesList[i];
      const isLifted = pointers.lifted === node.id || node.state === 'lifted';
      const nodeY = isLifted ? -18 : 0;

      // Determine state class and cues
      let stateClass = `node--${node.state || 'normal'}`;
      let cueBadge = '';

      if (node.state === 'compare') {
        cueBadge = `
          <g transform="translate(26, -11)">
            <rect x="0" y="0" width="68" height="17" rx="4" fill="var(--state-compare-bg)" stroke="var(--state-compare-border)" stroke-width="1.5"/>
            <text x="34" y="9.5" font-size="9" font-family="var(--font-sans)" font-weight="800" fill="var(--state-compare-badge)" text-anchor="middle" dominant-baseline="central">COMPARE</text>
          </g>
        `;
      } else if (node.state === 'outer') {
        cueBadge = `
          <g transform="translate(32, -11)">
            <rect x="0" y="0" width="56" height="17" rx="4" fill="var(--state-outer-bg)" stroke="var(--state-outer-border)" stroke-width="1.5"/>
            <text x="28" y="9.5" font-size="9" font-family="var(--font-sans)" font-weight="800" fill="var(--state-outer-badge)" text-anchor="middle" dominant-baseline="central">OUTER</text>
          </g>
        `;
      } else if (node.state === 'created') {
        cueBadge = `
          <g transform="translate(108, -5)">
            <circle cx="8" cy="8" r="8" fill="#16A34A" />
            <path d="M5,8 L7.5,10.5 L11.5,5.5" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
        `;
      } else if (node.state === 'zero') {
        cueBadge = `
          <g transform="translate(108, -5)">
            <circle cx="8" cy="8" r="8" fill="#DC2626" />
            <path d="M5,5 L11,11 M11,5 L5,11" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>
          </g>
        `;
      }

      // Check active pointers on this node
      let pointerPills = '';
      const matchedPointers = [];
      if (pointers.p === node.id) matchedPointers.push({ name: 'p', cls: 'pointer-pill' });
      if (pointers.q === node.id) matchedPointers.push({ name: 'q', cls: 'pointer-pill' });
      if (pointers.tail === node.id) matchedPointers.push({ name: 'tail', cls: 'pointer-pill-tail' });
      if (pointers.c === node.id) matchedPointers.push({ name: 'c', cls: 'pointer-pill-cursor' });
      if (pointers.prev === node.id) matchedPointers.push({ name: 'prev', cls: 'pointer-pill-prev' });

      if (matchedPointers.length > 0) {
        let pillOffset = 0;
        for (const pInfo of matchedPointers) {
          const pillWidth = pInfo.name.length > 2 ? 34 : 24;
          pointerPills += `
            <g class="pointer-group" transform="translate(${pillOffset}, 49)">
              <!-- Small arrow pointing up -->
              <polygon points="12,0 8,5 16,5" class="${pInfo.cls}" />
              <rect x="0" y="5" width="${pillWidth}" height="18" rx="4" class="${pInfo.cls} pointer-pill" />
              <text x="${pillWidth / 2}" y="15" class="pointer-text">${pInfo.name}</text>
            </g>
          `;
          pillOffset += pillWidth + 6;
        }
      }

      svgHtml += `
        <!-- Node ${node.id} -->
        <g id="${node.id}" class="node-group ${stateClass}" transform="translate(${currentX}, ${nodeY})" ${isLifted ? 'filter="url(#lift-shadow)"' : ''}>
          <!-- Node Box -->
          <rect x="0" y="0" width="${NODE_WIDTH}" height="${NODE_HEIGHT}" rx="10" ry="10" class="node-box" />

          <!-- Internal Cell Lines -->
          <line x1="40" y1="0" x2="40" y2="${NODE_HEIGHT}" class="node-cell-line" />
          <line x1="80" y1="0" x2="80" y2="${NODE_HEIGHT}" class="node-cell-line" />

          <!-- Cell Headers -->
          <text x="20" y="10" class="node-cell-header">coef</text>
          <text x="60" y="10" class="node-cell-header">exp</text>
          <text x="100" y="10" class="node-cell-header">next</text>

          <!-- Cell Values -->
          <text x="20" y="28" class="node-text">${node.coef}</text>
          <text x="60" y="28" class="node-text node-text-exp">${node.exp}</text>
          <!-- Next pointer bullet -->
          <circle cx="100" cy="28" r="4.5" class="next-bullet" />

          <!-- Cue Badge -->
          ${cueBadge}

          <!-- Pointer Tags -->
          ${pointerPills}
        </g>
      `;

      // Draw arrow from this node's next cell to the next node or NULL
      const arrowStartX = currentX + 100;
      const arrowEndX = currentX + NODE_WIDTH + NODE_GAP;
      const arrowY = 28;

      svgHtml += `
        <!-- Arrow to next -->
        <path d="M${arrowStartX},${arrowY} L${arrowEndX - 4},${arrowY}" class="arrow-line" marker-end="url(#arrowhead)" />
      `;

      currentX += NODE_WIDTH + NODE_GAP;
    }

    // NULL Node at end of list
    svgHtml += `
      <!-- NULL Node -->
      <g class="null-group" transform="translate(${currentX}, 0)">
        <rect x="0" y="0" width="${NULL_WIDTH}" height="${NODE_HEIGHT}" rx="8" ry="8" class="null-box" />
        <text x="${NULL_WIDTH / 2}" y="${NODE_HEIGHT / 2 + 1}" class="null-text">NULL</text>
      </g>
    `;
  }

  svgHtml += `
      </g>
    </svg>
  `;

  container.innerHTML = svgHtml;
}

/**
 * Renders an entire step across P, Q, and R rows
 * @param {Object} containers { rowP, rowQ, rowR }
 * @param {Object} step Step snapshot object
 * @param {Object} options { scale: number, reducedMotion: boolean }
 */
export function renderStep(containers, step, options = {}) {
  if (!step || !containers) return;

  const lists = step.lists || { P: [], Q: [], R: [] };
  const pointers = step.pointers || {};

  if (containers.rowP) {
    renderRow(containers.rowP, lists.P, 'P', pointers, options);
  }
  if (containers.rowQ) {
    renderRow(containers.rowQ, lists.Q, 'Q', pointers, options);
  }
  if (containers.rowR) {
    renderRow(containers.rowR, lists.R, 'R', pointers, options);
  }
}
