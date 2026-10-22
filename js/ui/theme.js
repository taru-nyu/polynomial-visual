/**
 * Theme and Reduced Motion Management
 * PRD Section 9.3 and 9.4
 */

const STORAGE_THEME_KEY = 'poly_vis_theme';
const STORAGE_MOTION_KEY = 'poly_vis_reduced_motion';

export class ThemeManager {
  constructor() {
    this.theme = this.getSavedTheme() || 'dark';
    this.reducedMotion = this.getSavedMotion() || false;
    this.applyTheme(this.theme);
    this.applyMotion(this.reducedMotion);
    this.initSystemListeners();
  }

  getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_THEME_KEY);
    } catch {
      return null;
    }
  }

  getSavedMotion() {
    try {
      const val = localStorage.getItem(STORAGE_MOTION_KEY);
      return val ? JSON.parse(val) : false;
    } catch {
      return false;
    }
  }

  applyTheme(theme) {
    this.theme = theme;
    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {}

    const root = document.documentElement;
    if (theme === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }

  applyMotion(isReduced) {
    this.reducedMotion = Boolean(isReduced);
    try {
      localStorage.setItem(STORAGE_MOTION_KEY, JSON.stringify(this.reducedMotion));
    } catch {}

    const root = document.documentElement;
    if (this.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }

  toggleTheme() {
    // Cycle auto -> light -> dark -> auto
    const nextTheme = this.theme === 'auto' ? 'light' : this.theme === 'light' ? 'dark' : 'auto';
    this.applyTheme(nextTheme);
    return nextTheme;
  }

  isDark() {
    if (this.theme === 'dark') return true;
    if (this.theme === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  initSystemListeners() {
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.theme === 'auto') {
          this.applyTheme('auto');
        }
      });
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        if (this.getSavedMotion() === null) {
          this.applyMotion(e.matches);
        }
      });
    }
  }
}
