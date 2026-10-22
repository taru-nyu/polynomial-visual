import { parsePoly } from '../core/parser.js';
import { validatePair } from '../core/validate.js';
import { normaliseText, combineText } from '../core/normalise.js';
import { PRESETS, generateRandomPolynomial } from '../core/presets.js';

/**
 * Input Panel Controller
 * Handles input parsing, validation errors/warnings, presets, random generation, and term builder.
 * PRD Section 6, Section 10.2, and 10.3
 */
export class InputPanel {
  /**
   * @param {Object} elements DOM elements
   * @param {Function} onBuild Callback when valid input is submitted: (termsP, termsQ, approach, cursorOpt) => void
   */
  constructor(elements, onBuild) {
    this.elements = elements;
    this.onBuild = onBuild;
    this.approach = 'tp';
    this.cursorOpt = false;
    this.init();
  }

  init() {
    this.populatePresets();
    this.attachEventListeners();
    this.validate();
  }

  populatePresets() {
    const { presetSelect } = this.elements;
    if (!presetSelect) return;

    presetSelect.innerHTML = '<option value="">-- Choose a Preset --</option>';
    for (const p of PRESETS) {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.textContent = `${p.name} (${p.tests})`;
      presetSelect.appendChild(opt);
    }
  }

  attachEventListeners() {
    const {
      inputP,
      inputQ,
      presetSelect,
      btnRandom,
      btnSwap,
      btnClear,
      approachRadios,
      cursorOptCheckbox,
      btnBuild,
      termBuilder
    } = this.elements;

    if (inputP) inputP.addEventListener('input', () => this.validate());
    if (inputQ) inputQ.addEventListener('input', () => this.validate());

    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        const selected = PRESETS.find(p => p.name === e.target.value);
        if (selected) {
          inputP.value = selected.p;
          inputQ.value = selected.q;
          this.validate();
        }
      });
    }

    if (btnRandom) {
      btnRandom.addEventListener('click', () => {
        inputP.value = generateRandomPolynomial(4);
        inputQ.value = generateRandomPolynomial(4);
        if (presetSelect) presetSelect.value = '';
        this.validate();
      });
    }

    if (btnSwap) {
      btnSwap.addEventListener('click', () => {
        const temp = inputP.value;
        inputP.value = inputQ.value;
        inputQ.value = temp;
        this.validate();
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        inputP.value = '';
        inputQ.value = '';
        if (presetSelect) presetSelect.value = '';
        this.validate();
      });
    }

    if (approachRadios) {
      approachRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          if (e.target.checked) {
            this.approach = e.target.value;
            this.updateApproachVisibility();
            this.validate();
          }
        });
      });
    }

    if (cursorOptCheckbox) {
      cursorOptCheckbox.addEventListener('change', (e) => {
        this.cursorOpt = e.target.checked;
        this.validate();
      });
    }

    if (termBuilder) {
      const { btnToggle, tray, coefInput, expInput, targetSelect, btnAddTerm } = termBuilder;

      if (btnToggle && tray) {
        btnToggle.addEventListener('click', () => {
          const isHidden = tray.style.display === 'none';
          tray.style.display = isHidden ? 'flex' : 'none';
          btnToggle.classList.toggle('active', isHidden);
          if (isHidden) coefInput.focus();
        });
      }

      if (btnAddTerm) {
        btnAddTerm.addEventListener('click', () => {
          const coef = parseInt(coefInput.value, 10);
          const exp = parseInt(expInput.value, 10);
          if (isNaN(coef) || isNaN(exp) || coef === 0 || exp < 0 || exp > 99) {
            return;
          }

          const targetInput = targetSelect.value === 'Q' ? inputQ : inputP;
          const sign = coef < 0 ? '-' : '+';
          const abs = Math.abs(coef);
          let termText = '';
          if (exp === 0) termText = `${abs}`;
          else if (exp === 1) termText = abs === 1 ? 'x' : `${abs}x`;
          else termText = abs === 1 ? `x^${exp}` : `${abs}x^${exp}`;

          const existing = targetInput.value.trim();
          if (!existing || existing === '0') {
            targetInput.value = coef < 0 ? `-${termText}` : termText;
          } else {
            targetInput.value = `${existing} ${sign} ${termText}`;
          }

          coefInput.value = '';
          expInput.value = '';
          this.validate();
        });
      }
    }

    if (btnBuild) {
      btnBuild.addEventListener('click', () => {
        const valid = this.validate();
        if (valid) {
          const pRes = parsePoly(inputP.value, 'P');
          const qRes = parsePoly(inputQ.value, 'Q');
          this.onBuild(pRes.terms, qRes.terms, this.approach, this.cursorOpt);
        } else {
          // Focus first invalid field
          if (this.elements.inputP.classList.contains('input--error')) {
            this.elements.inputP.focus();
          } else if (this.elements.inputQ.classList.contains('input--error')) {
            this.elements.inputQ.focus();
          }
        }
      });
    }
  }

  updateApproachVisibility() {
    const { cursorOptContainer } = this.elements;
    if (cursorOptContainer) {
      cursorOptContainer.style.display = this.approach === 'ins' ? 'inline-flex' : 'none';
    }
  }

  validate() {
    const { inputP, inputQ, messageP, messageQ, btnBuild } = this.elements;
    const pVal = inputP.value;
    const qVal = inputQ.value;

    const parseP = parsePoly(pVal, 'P');
    const parseQ = parsePoly(qVal, 'Q');

    inputP.classList.remove('input--error', 'input--warning');
    inputQ.classList.remove('input--error', 'input--warning');
    messageP.innerHTML = '';
    messageQ.innerHTML = '';

    let hasError = false;

    // Check P parse errors
    if (parseP.error) {
      hasError = true;
      inputP.classList.add('input--error');
      messageP.className = 'field-message error';
      messageP.innerHTML = `<span>⚠ ${parseP.error}</span>`;
      if (parseP.duplicateExp !== null) {
        const fixBtn = document.createElement('button');
        fixBtn.className = 'btn btn-secondary btn-sm';
        fixBtn.textContent = 'Combine like terms';
        fixBtn.addEventListener('click', () => {
          inputP.value = combineText(inputP.value);
          this.validate();
        });
        messageP.appendChild(fixBtn);
      }
    }

    // Check Q parse errors
    if (parseQ.error) {
      hasError = true;
      inputQ.classList.add('input--error');
      messageQ.className = 'field-message error';
      messageQ.innerHTML = `<span>⚠ ${parseQ.error}</span>`;
      if (parseQ.duplicateExp !== null) {
        const fixBtn = document.createElement('button');
        fixBtn.className = 'btn btn-secondary btn-sm';
        fixBtn.textContent = 'Combine like terms';
        fixBtn.addEventListener('click', () => {
          inputQ.value = combineText(inputQ.value);
          this.validate();
        });
        messageQ.appendChild(fixBtn);
      }
    }

    // Update metadata pills
    const metaP = document.getElementById('meta-p');
    if (metaP) {
      if (!parseP.error && parseP.terms.length > 0) {
        const degP = Math.max(...parseP.terms.map(t => t.exp));
        metaP.textContent = `${parseP.terms.length} terms | deg ${degP}`;
        metaP.style.display = 'inline-block';
      } else if (!parseP.error && parseP.terms.length === 0) {
        metaP.textContent = '0 terms (Zero poly)';
        metaP.style.display = 'inline-block';
      } else {
        metaP.style.display = 'none';
      }
    }

    const metaQ = document.getElementById('meta-q');
    if (metaQ) {
      if (!parseQ.error && parseQ.terms.length > 0) {
        const degQ = Math.max(...parseQ.terms.map(t => t.exp));
        metaQ.textContent = `${parseQ.terms.length} terms | deg ${degQ}`;
        metaQ.style.display = 'inline-block';
      } else if (!parseQ.error && parseQ.terms.length === 0) {
        metaQ.textContent = '0 terms (Zero poly)';
        metaQ.style.display = 'inline-block';
      } else {
        metaQ.style.display = 'none';
      }
    }

    if (btnBuild) {
      btnBuild.disabled = hasError;
    }

    if (hasError) return false;

    // Check algorithm warnings (unsorted input)
    const pairVal = validatePair(parseP.terms, parseQ.terms, this.approach, this.cursorOpt);

    if (pairVal.warnings.p) {
      inputP.classList.add('input--warning');
      messageP.className = 'field-message warning';
      messageP.innerHTML = `<span>ℹ ${pairVal.warnings.p}</span>`;

      const normBtn = document.createElement('button');
      normBtn.className = 'btn btn-secondary btn-sm';
      normBtn.textContent = 'Normalise';
      normBtn.addEventListener('click', () => {
        inputP.value = normaliseText(inputP.value, parseP.terms);
        this.validate();
      });
      messageP.appendChild(normBtn);

      const switchBtn = document.createElement('button');
      switchBtn.className = 'btn btn-secondary btn-sm';
      switchBtn.textContent = 'Switch to Nested loop';
      switchBtn.addEventListener('click', () => {
        this.setApproach('nl');
      });
      messageP.appendChild(switchBtn);
    }

    if (pairVal.warnings.q) {
      inputQ.classList.add('input--warning');
      messageQ.className = 'field-message warning';
      messageQ.innerHTML = `<span>ℹ ${pairVal.warnings.q}</span>`;

      const normBtn = document.createElement('button');
      normBtn.className = 'btn btn-secondary btn-sm';
      normBtn.textContent = 'Normalise';
      normBtn.addEventListener('click', () => {
        inputQ.value = normaliseText(inputQ.value, parseQ.terms);
        this.validate();
      });
      messageQ.appendChild(normBtn);

      const switchBtn = document.createElement('button');
      switchBtn.className = 'btn btn-secondary btn-sm';
      switchBtn.textContent = 'Switch to Nested loop';
      switchBtn.addEventListener('click', () => {
        this.setApproach('nl');
      });
      messageQ.appendChild(switchBtn);
    }

    return true;
  }

  setApproach(approach) {
    this.approach = approach;
    const { approachRadios } = this.elements;
    if (approachRadios) {
      approachRadios.forEach(r => {
        r.checked = r.value === approach;
      });
    }
    this.updateApproachVisibility();
    this.validate();
  }
}
