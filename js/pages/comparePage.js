import { initNavigation } from '../ui/nav.js';
import { Player } from '../player/player.js';
import { Controls } from '../ui/controls.js';
import { renderStep } from '../ui/renderer.js';
import { parsePoly } from '../core/parser.js';
import { normalise } from '../core/normalise.js';
import { normaliseText } from '../core/normalise.js';
import { PRESETS, generateRandomPolynomial } from '../core/presets.js';
import { runTwoPointer } from '../algorithms/twoPointer.js';
import { runNestedLoop } from '../algorithms/nestedLoop.js';
import { runInsertion } from '../algorithms/insertion.js';

export function initComparePage() {
  const { themeManager } = initNavigation('compare');

  // Input elements
  const inputP = document.getElementById('compare-input-p');
  const inputQ = document.getElementById('compare-input-q');
  const messageP = document.getElementById('compare-message-p');
  const messageQ = document.getElementById('compare-message-q');
  const presetSelect = document.getElementById('compare-preset-select');
  const btnRandom = document.getElementById('compare-btn-random');
  const btnSwap = document.getElementById('compare-btn-swap');
  const btnClear = document.getElementById('compare-btn-clear');
  const btnRunAll = document.getElementById('compare-btn-run');
  const cursorOptCheckbox = document.getElementById('compare-cursor-opt');

  // Algorithm panel DOMs
  const panels = {
    tp: {
      rowP: document.getElementById('tp-row-p'),
      rowQ: document.getElementById('tp-row-q'),
      rowR: document.getElementById('tp-row-r'),
      phaseBadge: document.getElementById('tp-phase-badge'),
      narration: document.getElementById('tp-narration'),
      counters: document.getElementById('tp-counters')
    },
    nl: {
      rowP: document.getElementById('nl-row-p'),
      rowQ: document.getElementById('nl-row-q'),
      rowR: document.getElementById('nl-row-r'),
      phaseBadge: document.getElementById('nl-phase-badge'),
      narration: document.getElementById('nl-narration'),
      counters: document.getElementById('nl-counters')
    },
    ins: {
      rowP: document.getElementById('ins-row-p'),
      rowQ: document.getElementById('ins-row-q'),
      rowR: document.getElementById('ins-row-r'),
      phaseBadge: document.getElementById('ins-phase-badge'),
      narration: document.getElementById('ins-narration'),
      counters: document.getElementById('ins-counters')
    }
  };

  // Summary Table and Chart DOMs
  const summaryTbody = document.getElementById('summary-tbody');
  const selfCheckResult = document.getElementById('self-check-result');
  const chartBars = {
    tp: document.getElementById('chart-bar-tp'),
    nl: document.getElementById('chart-bar-nl'),
    ins: document.getElementById('chart-bar-ins')
  };
  const chartLabels = {
    tp: document.getElementById('chart-val-tp'),
    nl: document.getElementById('chart-val-nl'),
    ins: document.getElementById('chart-val-ins')
  };
  const chartExplanation = document.getElementById('chart-explanation');

  // Shared Master Player
  const masterPlayer = new Player();

  const controls = new Controls({
    btnRestart: document.getElementById('btn-restart'),
    btnPrev: document.getElementById('btn-prev'),
    btnPlayPause: document.getElementById('btn-play-pause'),
    btnNext: document.getElementById('btn-next'),
    btnEnd: document.getElementById('btn-end'),
    scrubber: document.getElementById('step-scrubber'),
    stepIndicator: document.getElementById('step-indicator'),
    speedBtns: document.querySelectorAll('.speed-btn')
  }, masterPlayer);

  let runs = { tp: null, nl: null, ins: null };
  let maxSteps = 0;

  // Preset list
  if (presetSelect) {
    presetSelect.innerHTML = '<option value="">-- Choose a Preset --</option>';
    for (const p of PRESETS) {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.textContent = `${p.name} (${p.tests})`;
      presetSelect.appendChild(opt);
    }

    presetSelect.addEventListener('change', (e) => {
      const sel = PRESETS.find(p => p.name === e.target.value);
      if (sel) {
        inputP.value = sel.p;
        inputQ.value = sel.q;
        runAllThree();
      }
    });
  }

  if (btnRandom) {
    btnRandom.addEventListener('click', () => {
      inputP.value = generateRandomPolynomial(4);
      inputQ.value = generateRandomPolynomial(4);
      runAllThree();
    });
  }

  if (btnSwap) {
    btnSwap.addEventListener('click', () => {
      const temp = inputP.value;
      inputP.value = inputQ.value;
      inputQ.value = temp;
      runAllThree();
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      inputP.value = '';
      inputQ.value = '';
    });
  }

  if (btnRunAll) {
    btnRunAll.addEventListener('click', () => runAllThree());
  }

  if (cursorOptCheckbox) {
    cursorOptCheckbox.addEventListener('change', () => runAllThree());
  }

  function runAllThree() {
    const parseP = parsePoly(inputP.value, 'P');
    const parseQ = parsePoly(inputQ.value, 'Q');

    messageP.innerHTML = '';
    messageQ.innerHTML = '';

    if (parseP.error) {
      messageP.innerHTML = `<span style="color: var(--error);">⚠ ${parseP.error}</span>`;
      return;
    }
    if (parseQ.error) {
      messageQ.innerHTML = `<span style="color: var(--error);">⚠ ${parseQ.error}</span>`;
      return;
    }

    let pTerms = parseP.terms;
    let qTerms = parseQ.terms;

    // Check if unsorted and provide normalize button if needed
    const isPSorted = [...pTerms].every((t, i, arr) => i === 0 || arr[i - 1].exp > t.exp);
    const isQSorted = [...qTerms].every((t, i, arr) => i === 0 || arr[i - 1].exp > t.exp);

    if (!isPSorted || !isQSorted) {
      const normBtn = document.createElement('button');
      normBtn.className = 'btn btn-secondary btn-sm';
      normBtn.textContent = 'Normalise for Two-pointer & Insertion';
      normBtn.addEventListener('click', () => {
        inputP.value = normaliseText(inputP.value, pTerms);
        inputQ.value = normaliseText(inputQ.value, qTerms);
        runAllThree();
      });
      messageP.innerHTML = `<span style="color: var(--warning);">ℹ Inputs are not sorted. Normalise to run all three approaches fairly.</span> `;
      messageP.appendChild(normBtn);

      pTerms = normalise(pTerms);
      qTerms = normalise(qTerms);
    }

    const cursorOpt = cursorOptCheckbox ? cursorOptCheckbox.checked : false;

    // Execute algorithms
    runs.tp = runTwoPointer(pTerms, qTerms);
    runs.nl = runNestedLoop(pTerms, qTerms);
    runs.ins = runInsertion(pTerms, qTerms, { cursorOpt });

    maxSteps = Math.max(runs.tp.steps.length, runs.nl.steps.length, runs.ins.steps.length);

    // Create dummy unified steps for player
    const unifiedSteps = [];
    for (let i = 0; i < maxSteps; i++) {
      unifiedSteps.push({ index: i });
    }
    masterPlayer.load(unifiedSteps);

    // Update Summary Table & Chart
    updateSummaryTable(runs);
  }

  masterPlayer.on('stepChange', ({ index }) => {
    // Render each panel at current index (or hold last frame if finished)
    renderPanel('tp', runs.tp, index);
    renderPanel('nl', runs.nl, index);
    renderPanel('ins', runs.ins, index);
  });

  function renderPanel(key, run, index) {
    if (!run || !run.steps) return;
    const pDom = panels[key];
    const stepIdx = Math.min(index, run.steps.length - 1);
    const step = run.steps[stepIdx];
    const isFinished = index >= run.steps.length - 1;

    if (pDom.phaseBadge) {
      pDom.phaseBadge.textContent = isFinished ? 'Done' : step.phase;
      pDom.phaseBadge.className = `badge badge-${isFinished ? 'done' : step.phase}`;
    }

    renderStep(
      { rowP: pDom.rowP, rowQ: pDom.rowQ, rowR: pDom.rowR },
      step,
      { scale: 0.75, reducedMotion: themeManager.reducedMotion }
    );

    if (pDom.narration) {
      pDom.narration.textContent = step.narration;
    }

    if (pDom.counters) {
      const c = step.counters;
      let text = `Cmp: ${c.comparisons} | Nodes: ${c.created} | Moves: ${c.moves}`;
      if (key === 'nl' && c.sortComparisons > 0) {
        text += ` | Sort: ${c.sortComparisons}`;
      }
      pDom.counters.textContent = text;
    }
  }

  function updateSummaryTable(runs) {
    if (!summaryTbody || !runs.tp || !runs.nl || !runs.ins) return;

    const data = [
      { name: '1 Two-pointer', run: runs.tp, time: 'O(m + n)', space: 'O(1)' },
      { name: '2 Nested loop', run: runs.nl, time: 'O(m × n)', space: 'O(n)' },
      { name: '3 Insertion', run: runs.ins, time: runs.ins.cursorOpt ? 'O(m + n)' : 'O(m × n)', space: 'O(1)' }
    ];

    let html = '';
    for (const item of data) {
      const st = item.run.stats;
      let cmpText = `${st.comparisons}`;
      if (item.name.includes('Nested') && st.sortComparisons > 0) {
        cmpText += ` (+${st.sortComparisons} sort)`;
      }
      html += `
        <tr>
          <td><strong>${item.name}</strong></td>
          <td>${cmpText}</td>
          <td>${st.created}</td>
          <td>${st.moves}</td>
          <td><code>${item.time}</code></td>
          <td><code>${item.space}</code></td>
        </tr>
      `;
    }
    summaryTbody.innerHTML = html;

    // Self-check verification
    const r1 = runs.tp.resultText;
    const r2 = runs.nl.resultText;
    const r3 = runs.ins.resultText;

    if (r1 === r2 && r2 === r3) {
      selfCheckResult.innerHTML = `
        <span style="color: var(--success); font-weight: 700;">✓ Verification Passed:</span>
        All three approaches independently produced the identical canonical result:
        <code>R(x) = ${r1}</code>
      `;
    } else {
      selfCheckResult.innerHTML = `
        <span style="color: var(--error); font-weight: 700;">⚠ Verification Mismatch!</span>
        Results differed between approaches: TP="${r1}", NL="${r2}", INS="${r3}".
      `;
    }

    // Update Comparison Bar Chart
    const cTp = runs.tp.stats.comparisons;
    const cNl = runs.nl.stats.comparisons + (runs.nl.stats.sortComparisons || 0);
    const cIns = runs.ins.stats.comparisons;
    const maxCmp = Math.max(1, cTp, cNl, cIns);

    if (chartBars.tp) chartBars.tp.style.width = `${Math.round((cTp / maxCmp) * 100)}%`;
    if (chartBars.nl) chartBars.nl.style.width = `${Math.round((cNl / maxCmp) * 100)}%`;
    if (chartBars.ins) chartBars.ins.style.width = `${Math.round((cIns / maxCmp) * 100)}%`;

    if (chartLabels.tp) chartLabels.tp.textContent = `${cTp} comparisons`;
    if (chartLabels.nl) chartLabels.nl.textContent = `${cNl} comparisons`;
    if (chartLabels.ins) chartLabels.ins.textContent = `${cIns} comparisons`;

    if (chartExplanation) {
      if (cTp <= cNl && cTp <= cIns) {
        chartExplanation.textContent = 'Two-pointer achieves the lowest comparison cost because it advances through both pre-sorted lists in a single coordinated pass.';
      } else {
        chartExplanation.textContent = 'Costs vary based on exponent distribution, existing matches, and cursor restarting.';
      }
    }
  }

  // Parse URL query params
  const params = new URLSearchParams(window.location.search);
  const paramP = params.get('p');
  const paramQ = params.get('q');
  const basic = PRESETS.find(p => p.name === 'Basic');

  inputP.value = paramP || basic.p;
  inputQ.value = paramQ || basic.q;

  runAllThree();
}
