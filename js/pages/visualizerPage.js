import { initNavigation } from '../ui/nav.js';
import { Player } from '../player/player.js';
import { Controls } from '../ui/controls.js';
import { InputPanel } from '../ui/inputPanel.js';
import { renderStep } from '../ui/renderer.js';
import { initPseudocode, highlightPseudocodeLine } from '../ui/pseudocode.js';
import { updateCounters } from '../ui/counters.js';
import { updateNarration } from '../ui/narration.js';
import { runTwoPointer } from '../algorithms/twoPointer.js';
import { runNestedLoop } from '../algorithms/nestedLoop.js';
import { runInsertion } from '../algorithms/insertion.js';
import { PRESETS } from '../core/presets.js';

export function initVisualizerPage() {
  const { themeManager } = initNavigation('visualizer');

  // DOM elements
  const rowP = document.getElementById('list-row-p');
  const rowQ = document.getElementById('list-row-q');
  const rowR = document.getElementById('list-row-r');
  const phaseBadge = document.getElementById('phase-badge');
  const narrationBar = document.getElementById('narration-bar');
  const pseudocodeBody = document.getElementById('pseudocode-body');

  const counterComparisons = document.getElementById('counter-comparisons');
  const counterCreated = document.getElementById('counter-created');
  const counterMoves = document.getElementById('counter-moves');
  const counterSortRow = document.getElementById('counter-sort-row');
  const counterSortVal = document.getElementById('counter-sort-val');
  const complexityTime = document.getElementById('complexity-time');
  const complexitySpace = document.getElementById('complexity-space');

  const resultPanel = document.getElementById('result-panel');
  const resultText = document.getElementById('result-text');
  const resultStats = document.getElementById('result-stats');
  const resultPredictScore = document.getElementById('result-predict-score');
  const btnCompareAll = document.getElementById('btn-compare-all');
  const btnCopyResult = document.getElementById('btn-copy-result');
  const btnCopyShare = document.getElementById('btn-copy-share');

  const predictionCard = document.getElementById('prediction-card');
  const predictQuestion = document.getElementById('predict-question');
  const predictOptionsContainer = document.getElementById('predict-options');
  const btnCheckPredict = document.getElementById('btn-check-predict');
  const predictScoreDisplay = document.getElementById('predict-score-display');

  // State
  let currentRun = null;
  let activeApproach = 'tp';
  let activeCursorOpt = false;
  let currentTermsP = [];
  let currentTermsQ = [];

  // Predict mode state
  let predictTotal = 0;
  let predictCorrect = 0;
  let currentPendingPredict = null;

  // Initialize Player
  const player = new Player();

  // Initialize Controls
  const controls = new Controls({
    btnRestart: document.getElementById('btn-restart'),
    btnPrev: document.getElementById('btn-prev'),
    btnPlayPause: document.getElementById('btn-play-pause'),
    btnNext: document.getElementById('btn-next'),
    btnEnd: document.getElementById('btn-end'),
    scrubber: document.getElementById('step-scrubber'),
    stepIndicator: document.getElementById('step-indicator'),
    speedBtns: document.querySelectorAll('.speed-btn'),
    predictToggle: document.getElementById('predict-mode-toggle')
  }, player);

  // Initialize Input Panel
  const inputPanel = new InputPanel({
    inputP: document.getElementById('input-p'),
    inputQ: document.getElementById('input-q'),
    messageP: document.getElementById('message-p'),
    messageQ: document.getElementById('message-q'),
    presetSelect: document.getElementById('preset-select'),
    btnRandom: document.getElementById('btn-random'),
    btnSwap: document.getElementById('btn-swap'),
    btnClear: document.getElementById('btn-clear'),
    approachRadios: document.querySelectorAll('input[name="approach"]'),
    cursorOptContainer: document.getElementById('cursor-opt-container'),
    cursorOptCheckbox: document.getElementById('cursor-opt-checkbox'),
    btnBuild: document.getElementById('btn-build'),
    termBuilder: {
      btnToggle: document.getElementById('btn-toggle-tb'),
      tray: document.getElementById('term-builder-tray'),
      coefInput: document.getElementById('tb-coef'),
      expInput: document.getElementById('tb-exp'),
      targetSelect: document.getElementById('tb-target'),
      btnAddTerm: document.getElementById('tb-add-btn')
    }
  }, (termsP, termsQ, approach, cursorOpt) => {
    buildAndRun(termsP, termsQ, approach, cursorOpt);
  });

  function buildAndRun(termsP, termsQ, approach, cursorOpt, initialStep = 0) {
    currentTermsP = termsP;
    currentTermsQ = termsQ;
    activeApproach = approach;
    activeCursorOpt = cursorOpt;

    // Reset predict counters
    predictTotal = 0;
    predictCorrect = 0;
    if (predictionCard) predictionCard.style.display = 'none';
    if (resultPanel) resultPanel.style.display = 'none';

    // Populate pseudocode
    initPseudocode(pseudocodeBody, approach);

    // Run chosen algorithm
    if (approach === 'tp') {
      currentRun = runTwoPointer(termsP, termsQ);
    } else if (approach === 'nl') {
      currentRun = runNestedLoop(termsP, termsQ);
    } else if (approach === 'ins') {
      currentRun = runInsertion(termsP, termsQ, { cursorOpt });
    }

    // Load steps into player
    player.load(currentRun.steps);

    if (initialStep > 0 && initialStep < currentRun.steps.length) {
      player.goTo(initialStep);
    }
  }

  // Player stepChange handler
  player.on('stepChange', ({ step, index, total }) => {
    if (!step) return;

    // Hide prediction card if step changed without predict prompt
    if (predictionCard && !currentPendingPredict) {
      predictionCard.style.display = 'none';
    }

    // Phase badge
    if (phaseBadge) {
      phaseBadge.textContent = step.phase;
      phaseBadge.className = `badge badge-${step.phase}`;
    }

    // Render SVG
    renderStep({ rowP, rowQ, rowR }, step, {
      scale: 1.0,
      reducedMotion: themeManager.reducedMotion
    });

    // Update Narration
    const isPredictPrompt = currentPendingPredict && currentPendingPredict.step === step;
    updateNarration(narrationBar, step, index, total, isPredictPrompt);

    // Highlight Pseudocode
    highlightPseudocodeLine(pseudocodeBody, step.line);

    // Live Counters
    updateCounters(
      {
        comparisonsEl: counterComparisons,
        createdEl: counterCreated,
        movesEl: counterMoves,
        sortRowEl: counterSortRow,
        sortValEl: counterSortVal,
        timeEl: complexityTime,
        spaceEl: complexitySpace
      },
      step.counters,
      activeApproach,
      activeCursorOpt
    );

    // Auto-scroll canvas viewport to keep active node in view
    autoScrollCanvas(step);

    // Update URL query string with current state
    updateUrlQuery(index);
  });

  function autoScrollCanvas(step) {
    const viewport = document.getElementById('canvas-viewport');
    if (!viewport || !step || !step.pointers) return;
    const activeId = step.pointers.p || step.pointers.q || step.pointers.c || step.pointers.tail || step.pointers.lifted;
    if (!activeId || activeId.includes('NULL')) return;

    const nodeEl = document.getElementById(activeId);
    if (nodeEl) {
      const nodeBox = nodeEl.getBoundingClientRect();
      const vpBox = viewport.getBoundingClientRect();
      if (nodeBox.left < vpBox.left + 80 || nodeBox.right > vpBox.right - 80) {
        const offset = (nodeBox.left - vpBox.left) + viewport.scrollLeft - (viewport.clientWidth / 2) + 60;
        viewport.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
      }
    }
  }

  // Finish handler
  player.on('finish', () => {
    if (!currentRun || !resultPanel) return;

    resultPanel.style.display = 'flex';
    resultText.textContent = `R(x) = ${currentRun.resultText}`;

    const st = currentRun.stats;
    let statsSummary = `Done in ${st.comparisons} comparisons, ${st.created} nodes created, ${st.moves} pointer moves.`;
    if (activeApproach === 'nl' && st.sortComparisons > 0) {
      statsSummary += ` (${st.sortComparisons} sort comparisons)`;
    }
    resultStats.textContent = statsSummary;

    if (player.predictMode && predictTotal > 0) {
      resultPredictScore.style.display = 'block';
      resultPredictScore.textContent = `Predicted ${predictCorrect} of ${predictTotal} correctly.`;
    } else {
      resultPredictScore.style.display = 'none';
    }
  });

  // Predict mode prompt
  player.on('predictPrompt', ({ step }) => {
    if (!step.predict || !predictionCard) return;

    currentPendingPredict = { step };
    predictionCard.style.display = 'flex';
    predictQuestion.textContent = step.predict.question;

    let optionsHtml = '';
    step.predict.options.forEach((opt, idx) => {
      optionsHtml += `
        <label class="predict-option-label">
          <input type="radio" name="predict_choice" value="${idx}" ${idx === 0 ? 'checked' : ''}>
          <span>${opt}</span>
        </label>
      `;
    });
    predictOptionsContainer.innerHTML = optionsHtml;

    predictScoreDisplay.textContent = `Score so far: ${predictCorrect} of ${predictTotal}`;

    // Update narration to prompt guess
    updateNarration(narrationBar, step, player.currentIndex, player.steps.length, true);
  });

  if (btnCheckPredict) {
    btnCheckPredict.addEventListener('click', () => {
      if (!currentPendingPredict) return;
      const selected = predictOptionsContainer.querySelector('input[name="predict_choice"]:checked');
      if (!selected) return;

      const choice = parseInt(selected.value, 10);
      const isCorrect = choice === currentPendingPredict.step.predict.answer;

      predictTotal++;
      if (isCorrect) {
        predictCorrect++;
      } else {
        // Shake panel for wrong answer
        predictionCard.classList.add('shake');
        setTimeout(() => predictionCard.classList.remove('shake'), 400);
      }

      currentPendingPredict = null;
      predictionCard.style.display = 'none';

      // Advance step
      player.next();
    });
  }

  // Result Actions
  if (btnCompareAll) {
    btnCompareAll.addEventListener('click', () => {
      const p = encodeURIComponent(document.getElementById('input-p').value);
      const q = encodeURIComponent(document.getElementById('input-q').value);
      window.location.href = `compare.html?p=${p}&q=${q}`;
    });
  }

  if (btnCopyResult) {
    btnCopyResult.addEventListener('click', () => {
      if (currentRun) {
        navigator.clipboard.writeText(`R(x) = ${currentRun.resultText}`);
        btnCopyResult.textContent = 'Copied!';
        setTimeout(() => { btnCopyResult.textContent = 'Copy result'; }, 2000);
      }
    });
  }

  if (btnCopyShare) {
    btnCopyShare.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href);
      btnCopyShare.textContent = 'Link copied!';
      setTimeout(() => { btnCopyShare.textContent = 'Copy share link'; }, 2000);
    });
  }

  const btnExportLog = document.getElementById('btn-export-log');
  if (btnExportLog) {
    btnExportLog.addEventListener('click', () => {
      if (!currentRun || !currentRun.steps) return;
      let log = '==================================================\n';
      log += 'Polynomial Addition Step Execution Log (PRD F-29)\n';
      log += `Approach: ${activeApproach.toUpperCase()}\n`;
      log += `P(x) = ${document.getElementById('input-p').value}\n`;
      log += `Q(x) = ${document.getElementById('input-q').value}\n`;
      log += `Result: R(x) = ${currentRun.resultText}\n`;
      log += '==================================================\n\n';

      currentRun.steps.forEach((st, idx) => {
        log += `Step ${idx + 1}/${currentRun.steps.length} | [${st.action}] Line ${st.line}: ${st.narration}\n`;
      });

      const st = currentRun.stats;
      log += '\n==================================================\n';
      log += `Final Counters: Comparisons=${st.comparisons}, NodesCreated=${st.created}, PointerMoves=${st.moves}`;
      if (st.sortComparisons > 0) log += `, SortComparisons=${st.sortComparisons}`;
      log += '\n==================================================\n';

      const blob = new Blob([log], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `poly_addition_${activeApproach}_steps.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function updateUrlQuery(stepIndex) {
    const pVal = document.getElementById('input-p')?.value;
    const qVal = document.getElementById('input-q')?.value;
    if (!pVal || !qVal) return;

    const params = new URLSearchParams();
    params.set('p', pVal);
    params.set('q', qVal);
    params.set('a', activeApproach);
    if (activeCursorOpt) params.set('c', '1');
    if (stepIndex !== undefined && stepIndex !== null) {
      params.set('step', stepIndex);
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }

  // Parse initial URL query params or load default Basic preset
  const params = new URLSearchParams(window.location.search);
  const paramP = params.get('p');
  const paramQ = params.get('q');
  const paramA = params.get('a') || 'tp';
  const paramStep = parseInt(params.get('step') || '0', 10);
  const paramCursor = params.get('c') === '1';

  const basicPreset = PRESETS.find(p => p.name === 'Basic');
  const initialP = paramP || basicPreset.p;
  const initialQ = paramQ || basicPreset.q;

  document.getElementById('input-p').value = initialP;
  document.getElementById('input-q').value = initialQ;
  inputPanel.setApproach(paramA);
  if (document.getElementById('cursor-opt-checkbox')) {
    document.getElementById('cursor-opt-checkbox').checked = paramCursor;
  }

  // Initial build
  document.getElementById('btn-build').click();
  if (paramStep > 0) {
    player.goTo(paramStep);
  }
}
