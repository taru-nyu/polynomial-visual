import { ThemeManager } from './theme.js';
import { HelpModal } from './helpModal.js';
import { BenchmarkModal } from './benchmarkModal.js';

/**
 * Initializes the common site navigation bar on any page.
 * @param {'home'|'visualizer'|'compare'|'learn'} activePage
 */
export function initNavigation(activePage = 'home') {
  const themeManager = new ThemeManager();
  const helpModal = new HelpModal();
  const benchmarkModal = new BenchmarkModal();

  const header = document.querySelector('.site-header');
  if (!header) return { themeManager, helpModal, benchmarkModal };

  header.innerHTML = `
    <div class="container nav-container">
      <a href="index.html" class="brand" aria-label="Polynomial Addition Visualizer Home">
        <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="12" r="3"></circle>
          <line x1="9" y1="12" x2="15" y2="12"></line>
          <polygon points="15,9 18,12 15,15" fill="currentColor"></polygon>
        </svg>
        <span>PolyVisualizer</span>
      </a>

      <nav aria-label="Main Navigation">
        <ul class="nav-links">
          <li><a href="index.html" class="nav-link" ${activePage === 'home' ? 'aria-current="page"' : ''}>Home</a></li>
          <li><a href="visualizer.html" class="nav-link" ${activePage === 'visualizer' ? 'aria-current="page"' : ''}>Visualizer</a></li>
          <li><a href="compare.html" class="nav-link" ${activePage === 'compare' ? 'aria-current="page"' : ''}>Compare</a></li>
          <li><a href="learn.html" class="nav-link" ${activePage === 'learn' ? 'aria-current="page"' : ''}>Learn</a></li>
        </ul>
      </nav>

      <div class="nav-actions">
        <button class="btn btn-secondary btn-sm" id="benchmark-nav-btn" title="Stress Test & Benchmark Suite" style="font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>Benchmark</span>
        </button>

        <button class="btn btn-icon" id="theme-toggle-btn" aria-label="Toggle theme (Light/Dark/Auto)" title="Toggle theme">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="theme-icon">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>

        <button class="btn btn-icon" id="help-btn" aria-label="Open help and shortcuts" title="Help & Shortcuts (?)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
  `;

  // Bind theme button
  const themeBtn = header.querySelector('#theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      themeManager.toggleTheme();
    });
  }

  // Bind help button
  const helpBtn = header.querySelector('#help-btn');
  if (helpBtn) {
    helpBtn.addEventListener('click', (e) => {
      helpModal.open(e.currentTarget);
    });
  }

  // Bind benchmark button
  const benchmarkBtn = header.querySelector('#benchmark-nav-btn');
  if (benchmarkBtn) {
    benchmarkBtn.addEventListener('click', () => {
      benchmarkModal.open();
    });
  }

  return { themeManager, helpModal, benchmarkModal };
}
