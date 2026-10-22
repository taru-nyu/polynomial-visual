/**
 * Playback Controls Component and Keyboard Shortcuts
 * PRD Section 10.2, 10.8, and 11 (F-09, F-26)
 */

export class Controls {
  /**
   * @param {Object} elements DOM elements
   * @param {Player} player Playback controller instance
   */
  constructor(elements, player) {
    this.elements = elements;
    this.player = player;
    this.initListeners();
  }

  initListeners() {
    const {
      btnRestart,
      btnPrev,
      btnPlayPause,
      btnNext,
      btnEnd,
      scrubber,
      speedBtns,
      predictToggle
    } = this.elements;

    if (btnRestart) btnRestart.addEventListener('click', () => this.player.restart());
    if (btnPrev) btnPrev.addEventListener('click', () => this.player.prev());
    if (btnPlayPause) {
      btnPlayPause.addEventListener('click', () => {
        if (this.player.state === 'playing') {
          this.player.pause();
        } else {
          this.player.play();
        }
      });
    }
    if (btnNext) btnNext.addEventListener('click', () => this.player.next());
    if (btnEnd) btnEnd.addEventListener('click', () => this.player.jumpToEnd());

    if (scrubber) {
      scrubber.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.player.goTo(val);
      });
    }

    if (speedBtns) {
      speedBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const speed = parseFloat(btn.dataset.speed);
          this.player.setSpeed(speed);
          speedBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }

    if (predictToggle) {
      predictToggle.addEventListener('change', (e) => {
        this.player.setPredictMode(e.target.checked);
      });
    }

    // Connect player events to UI
    this.player.on('stepChange', ({ index, total }) => {
      if (scrubber) {
        scrubber.max = Math.max(0, total - 1);
        scrubber.value = index;
      }
      if (this.elements.stepIndicator) {
        this.elements.stepIndicator.textContent = `Step ${index + 1} / ${total}`;
      }
      this.updateButtonStates();
    });

    this.player.on('stateChange', ({ state }) => {
      this.updatePlayPauseButton(state);
      this.updateButtonStates();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcut(e));
  }

  updatePlayPauseButton(state) {
    const { btnPlayPause } = this.elements;
    if (!btnPlayPause) return;

    if (state === 'playing') {
      btnPlayPause.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <span>Pause</span>
      `;
      btnPlayPause.setAttribute('aria-label', 'Pause playback (Space)');
    } else {
      btnPlayPause.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21"></polygon>
        </svg>
        <span>Play</span>
      `;
      btnPlayPause.setAttribute('aria-label', 'Start playback (Space)');
    }
  }

  updateButtonStates() {
    const { btnRestart, btnPrev, btnNext, btnEnd } = this.elements;
    const isFirst = this.player.currentIndex === 0;
    const isLast = this.player.currentIndex >= this.player.steps.length - 1;
    const isEmpty = this.player.steps.length === 0;

    if (btnRestart) btnRestart.disabled = isEmpty || isFirst;
    if (btnPrev) btnPrev.disabled = isEmpty || isFirst;
    if (btnNext) btnNext.disabled = isEmpty || isLast;
    if (btnEnd) btnEnd.disabled = isEmpty || isLast;
  }

  handleKeyboardShortcut(e) {
    // Ignore shortcuts when user is focused inside text input or textarea
    const activeTag = (document.activeElement?.tagName || '').toLowerCase();
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
      return;
    }

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (this.player.state === 'playing') {
          this.player.pause();
        } else {
          this.player.play();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.player.prev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.player.next();
        break;
      case 'Home':
        e.preventDefault();
        this.player.restart();
        break;
      case 'End':
        e.preventDefault();
        this.player.jumpToEnd();
        break;
      case 'Equal':
      case 'NumpadAdd':
        // Speed up
        this.stepSpeed(1);
        break;
      case 'Minus':
      case 'NumpadSubtract':
        // Slow down
        this.stepSpeed(-1);
        break;
    }
  }

  stepSpeed(direction) {
    const speeds = [0.25, 0.5, 1.0, 2.0, 4.0];
    let idx = speeds.indexOf(this.player.speed);
    if (idx === -1) idx = 2; // default 1.0
    const nextIdx = Math.max(0, Math.min(speeds.length - 1, idx + direction));
    const newSpeed = speeds[nextIdx];
    this.player.setSpeed(newSpeed);

    if (this.elements.speedBtns) {
      this.elements.speedBtns.forEach(btn => {
        btn.classList.toggle('active', parseFloat(btn.dataset.speed) === newSpeed);
      });
    }
  }
}
