import { initNavigation } from '../ui/nav.js';

export function initLearnPage() {
  initNavigation('learn');

  // Copy code buttons
  document.querySelectorAll('.btn-copy-code').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const codeId = e.currentTarget.dataset.codeId;
      const codeEl = document.getElementById(codeId);
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.textContent);
        const originalText = e.currentTarget.textContent;
        e.currentTarget.textContent = 'Copied!';
        setTimeout(() => { e.currentTarget.textContent = originalText; }, 2000);
      }
    });
  });

  // Accordion for Viva Questions
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!isExpanded));
      const content = document.getElementById(trigger.getAttribute('aria-controls'));
      if (content) {
        content.style.display = isExpanded ? 'none' : 'block';
      }
    });
  });

  // Sticky TOC highlighting on scroll
  const sections = document.querySelectorAll('.learn-section');
  const tocLinks = document.querySelectorAll('.toc-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) {
        currentId = sec.getAttribute('id');
      }
    });

    tocLinks.forEach(link => {
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });
}
