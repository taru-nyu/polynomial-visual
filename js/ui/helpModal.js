/**
 * Accessible Help Modal Dialog
 * PRD Section 10.8 & Section 14.4
 */

export class HelpModal {
  constructor() {
    this.overlay = null;
    this.dialog = null;
    this.closeBtn = null;
    this.triggerEl = null;
    this.activeTab = 'format';
    this.init();
  }

  init() {
    // Check if modal DOM already exists
    let overlay = document.getElementById('help-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'help-modal-overlay';
      overlay.className = 'modal-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'help-modal-title');

      overlay.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <h2 id="help-modal-title" class="modal-title">Help & Reference</h2>
            <button class="btn btn-icon" id="help-modal-close" aria-label="Close help modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="modal-tabs" role="tablist">
              <button class="modal-tab-btn" role="tab" id="tab-btn-format" aria-selected="true" aria-controls="tab-content-format">Input Format</button>
              <button class="modal-tab-btn" role="tab" id="tab-btn-colours" aria-selected="false" aria-controls="tab-content-colours">Colours & Cues</button>
              <button class="modal-tab-btn" role="tab" id="tab-btn-shortcuts" aria-selected="false" aria-controls="tab-content-shortcuts">Shortcuts</button>
            </div>

            <!-- Tab 1: Input Format -->
            <div class="modal-tab-content active" id="tab-content-format" role="tabpanel" aria-labelledby="tab-btn-format">
              <h3 style="margin-bottom: var(--space-2); font-size: 1.05rem;">How to Enter Polynomials</h3>
              <p style="margin-bottom: var(--space-3); color: var(--muted);">Enter terms joined by <code>+</code> or <code>-</code>. Spaces are optional and case is ignored.</p>
              
              <div style="background: var(--surface-raised); padding: var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-3);">
                <strong style="color: var(--success);">✓ Valid Examples:</strong>
                <ul style="margin-left: var(--space-4); margin-top: var(--space-1); font-family: var(--font-mono); font-size: 0.9rem;">
                  <li>5x^4 + 3x^2 + 2x + 7</li>
                  <li>-x (means -1x^1)</li>
                  <li>x^3 (means 1x^3)</li>
                  <li>7 (means 7x^0)</li>
                  <li>0 (the zero polynomial / empty list)</li>
                </ul>
              </div>

              <div style="background: var(--error-bg); padding: var(--space-3); border-radius: var(--radius-md);">
                <strong style="color: var(--error);">✗ Invalid Examples:</strong>
                <ul style="margin-left: var(--space-4); margin-top: var(--space-1); font-family: var(--font-mono); font-size: 0.9rem;">
                  <li>3y^2 (only variable 'x' is supported)</li>
                  <li>2.5x (coefficients must be integers)</li>
                  <li>x^-1 or x^100 (exponents 0 to 99 only)</li>
                  <li>0x^2 (terms with 0 coefficient not allowed)</li>
                  <li>More than 10 terms</li>
                </ul>
              </div>
            </div>

            <!-- Tab 2: Colours & Cues -->
            <div class="modal-tab-content" id="tab-content-colours" role="tabpanel" aria-labelledby="tab-btn-colours">
              <p style="margin-bottom: var(--space-3); color: var(--muted);">Color is never the only signal. Every state includes a shape or badge cue.</p>
              <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                <div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2); background: var(--surface-raised); border-radius: var(--radius-md);">
                  <div style="width: 24px; height: 24px; background: #FFE27A; border: 2px solid #B8860B; border-radius: 4px;"></div>
                  <div><strong>Comparing:</strong> Yellow fill, 3px border, and a "COMPARE" tag.</div>
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2); background: var(--surface-raised); border-radius: var(--radius-md);">
                  <div style="width: 24px; height: 24px; background: #BBD3FF; border: 2px solid #1E56C8; border-radius: 4px;"></div>
                  <div><strong>Outer Loop:</strong> Blue fill, thick left bar, and an "OUTER" tag.</div>
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2); background: var(--surface-raised); border-radius: var(--radius-md);">
                  <div style="width: 24px; height: 24px; background: #B7E4C7; border: 2px solid #2E7D32; border-radius: 4px;"></div>
                  <div><strong>Created Node:</strong> Green fill and green checkmark badge.</div>
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2); background: var(--surface-raised); border-radius: var(--radius-md);">
                  <div style="width: 24px; height: 24px; background: #E3E6EA; border: 2px dashed #9E9E9E; border-radius: 4px;"></div>
                  <div><strong>Visited / Used:</strong> Grey fill, muted text, and dashed border.</div>
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2); background: var(--surface-raised); border-radius: var(--radius-md);">
                  <div style="width: 24px; height: 24px; background: #F8B4B0; border: 2px solid #C5221F; border-radius: 4px;"></div>
                  <div><strong>Zero Sum:</strong> Red flash and cross badge; term dropped.</div>
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2); background: var(--surface-raised); border-radius: var(--radius-md);">
                  <div style="width: 24px; height: 24px; background: #D9C6F2; border: 2px solid #6D28D9; border-radius: 4px;"></div>
                  <div><strong>Lifted Node:</strong> Purple fill, raised by 24px with drop shadow.</div>
                </div>
              </div>
            </div>

            <!-- Tab 3: Shortcuts -->
            <div class="modal-tab-content" id="tab-content-shortcuts" role="tabpanel" aria-labelledby="tab-btn-shortcuts">
              <p style="margin-bottom: var(--space-3); color: var(--muted);">Shortcuts are active when not typing inside an input field.</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
                <tr style="border-bottom: 1px solid var(--border);"><td style="padding: var(--space-2);"><kbd style="background: var(--surface-raised); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border);">Space</kbd></td><td>Play / Pause playback</td></tr>
                <tr style="border-bottom: 1px solid var(--border);"><td style="padding: var(--space-2);"><kbd style="background: var(--surface-raised); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border);">←</kbd> / <kbd style="background: var(--surface-raised); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border);">→</kbd></td><td>Step backward / forward</td></tr>
                <tr style="border-bottom: 1px solid var(--border);"><td style="padding: var(--space-2);"><kbd style="background: var(--surface-raised); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border);">Home</kbd> / <kbd style="background: var(--surface-raised); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border);">End</kbd></td><td>Restart / Jump to end</td></tr>
                <tr style="border-bottom: 1px solid var(--border);"><td style="padding: var(--space-2);"><kbd style="background: var(--surface-raised); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border);">+</kbd> / <kbd style="background: var(--surface-raised); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border);">-</kbd></td><td>Increase / decrease speed</td></tr>
                <tr style="border-bottom: 1px solid var(--border);"><td style="padding: var(--space-2);"><kbd style="background: var(--surface-raised); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border);">?</kbd></td><td>Open Help dialog</td></tr>
                <tr><td style="padding: var(--space-2);"><kbd style="background: var(--surface-raised); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border);">Esc</kbd></td><td>Close Help dialog</td></tr>
              </table>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    this.overlay = overlay;
    this.dialog = overlay.querySelector('.modal-dialog');
    this.closeBtn = overlay.querySelector('#help-modal-close');

    // Attach listeners
    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Tab buttons
    const tabs = [
      { btnId: 'tab-btn-format', contentId: 'tab-content-format' },
      { btnId: 'tab-btn-colours', contentId: 'tab-content-colours' },
      { btnId: 'tab-btn-shortcuts', contentId: 'tab-content-shortcuts' }
    ];

    tabs.forEach(tab => {
      const btn = this.overlay.querySelector(`#${tab.btnId}`);
      if (btn) {
        btn.addEventListener('click', () => {
          tabs.forEach(t => {
            this.overlay.querySelector(`#${t.btnId}`).setAttribute('aria-selected', 'false');
            this.overlay.querySelector(`#${t.contentId}`).classList.remove('active');
          });
          btn.setAttribute('aria-selected', 'true');
          this.overlay.querySelector(`#${tab.contentId}`).classList.add('active');
        });
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      } else if (e.key === '?' && !this.isTypingInInput(e) && !this.isOpen()) {
        e.preventDefault();
        this.open();
      }
    });
  }

  isTypingInInput(e) {
    const tag = (e.target.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
  }

  isOpen() {
    return this.overlay && this.overlay.classList.contains('open');
  }

  open(triggerEl = null) {
    this.triggerEl = triggerEl || document.activeElement;
    this.overlay.classList.add('open');
    this.closeBtn.focus();
  }

  close() {
    this.overlay.classList.remove('open');
    if (this.triggerEl && typeof this.triggerEl.focus === 'function') {
      this.triggerEl.focus();
    }
  }
}
