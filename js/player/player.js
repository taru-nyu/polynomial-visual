/**
 * Playback state machine and controller following PRD Section 13.4, 13.5, and 9.4.
 */
export class Player {
  constructor() {
    this.steps = [];
    this.currentIndex = 0;
    this.speed = 1.0;
    this.state = 'empty'; // 'empty' | 'ready' | 'playing' | 'paused' | 'finished' | 'stale'
    this.predictMode = false;
    this.timer = null;
    this.listeners = new Map();
  }

  /**
   * Registers an event callback
   * Events: 'stepChange', 'stateChange', 'predictPrompt', 'finish'
   * @param {string} event
   * @param {Function} callback
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const list = this.listeners.get(event);
    if (!list) return;
    const idx = list.indexOf(callback);
    if (idx !== -1) list.splice(idx, 1);
  }

  emit(event, data) {
    const list = this.listeners.get(event);
    if (list) {
      for (const cb of list) {
        cb(data);
      }
    }
  }

  setState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      this.emit('stateChange', { state: this.state });
    }
  }

  /**
   * Loads a new step sequence
   * @param {Array<Object>} steps
   */
  load(steps) {
    this.clearTimer();
    this.steps = Array.isArray(steps) ? steps : [];
    this.currentIndex = 0;
    if (this.steps.length > 0) {
      this.setState('ready');
      this.emitStep();
    } else {
      this.setState('empty');
    }
  }

  markStale() {
    this.clearTimer();
    this.setState('stale');
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  getCurrentStep() {
    if (this.steps.length === 0) return null;
    return this.steps[this.currentIndex] || null;
  }

  emitStep() {
    const step = this.getCurrentStep();
    if (step) {
      this.emit('stepChange', {
        step,
        index: this.currentIndex,
        total: this.steps.length,
        isFirst: this.currentIndex === 0,
        isLast: this.currentIndex === this.steps.length - 1
      });
    }
  }

  setSpeed(newSpeed) {
    this.speed = Math.max(0.25, Math.min(4.0, Number(newSpeed) || 1.0));
    // If currently playing, reschedule next step with new interval
    if (this.state === 'playing') {
      this.clearTimer();
      this.scheduleNext();
    }
  }

  setPredictMode(enabled) {
    this.predictMode = Boolean(enabled);
  }

  play() {
    if (this.steps.length === 0) return;
    if (this.currentIndex >= this.steps.length - 1) {
      // If at finish, restart from 0
      this.currentIndex = 0;
      this.emitStep();
    }
    this.setState('playing');
    this.scheduleNext();
  }

  pause() {
    this.clearTimer();
    if (this.state === 'playing') {
      this.setState(this.currentIndex >= this.steps.length - 1 ? 'finished' : 'paused');
    }
  }

  next() {
    this.pause();
    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex++;
      this.emitStep();
      if (this.currentIndex === this.steps.length - 1) {
        this.setState('finished');
        this.emit('finish', { step: this.getCurrentStep() });
      }
    }
  }

  prev() {
    this.pause();
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.setState('paused');
      this.emitStep();
    }
  }

  restart() {
    this.pause();
    this.currentIndex = 0;
    this.setState('ready');
    this.emitStep();
  }

  jumpToEnd() {
    this.pause();
    if (this.steps.length > 0) {
      this.currentIndex = this.steps.length - 1;
      this.setState('finished');
      this.emitStep();
      this.emit('finish', { step: this.getCurrentStep() });
    }
  }

  goTo(targetIndex) {
    this.pause();
    if (this.steps.length === 0) return;
    const clamped = Math.max(0, Math.min(this.steps.length - 1, targetIndex));
    this.currentIndex = clamped;
    if (this.currentIndex === this.steps.length - 1) {
      this.setState('finished');
      this.emit('finish', { step: this.getCurrentStep() });
    } else if (this.currentIndex === 0) {
      this.setState('ready');
    } else {
      this.setState('paused');
    }
    this.emitStep();
  }

  scheduleNext() {
    this.clearTimer();
    if (this.state !== 'playing') return;

    // Base animation time 600ms / speed, pause between steps 900ms / speed
    const stepInterval = Math.max(150, Math.round(900 / this.speed));

    this.timer = setTimeout(() => {
      if (this.state !== 'playing') return;

      const currentStep = this.getCurrentStep();
      // Check for predict mode trigger on COMPARE step
      if (
        this.predictMode &&
        currentStep &&
        currentStep.action === 'COMPARE' &&
        currentStep.predict
      ) {
        this.pause();
        this.emit('predictPrompt', { step: currentStep });
        return;
      }

      if (this.currentIndex < this.steps.length - 1) {
        this.currentIndex++;
        this.emitStep();

        if (this.currentIndex === this.steps.length - 1) {
          this.setState('finished');
          this.emit('finish', { step: this.getCurrentStep() });
        } else {
          this.scheduleNext();
        }
      } else {
        this.setState('finished');
        this.emit('finish', { step: this.getCurrentStep() });
      }
    }, stepInterval);
  }
}
