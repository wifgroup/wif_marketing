// scripts/faq.js
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ready = (fn) => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  ready(() => {
    const items = Array.from(document.querySelectorAll('.accordion-item'));
    if (!items.length) return;

    // store open/close functions so we can close other items reliably
    const api = new Map();

    items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      const content = item.querySelector('.accordion-content');
      if (!header || !content) return;

      // baseline init
      content.style.overflow = 'hidden';
      content.style.maxHeight = '0px';
      content.style.display = 'none';
      content._animating = false;

      const open = () => {
        if (content._animating) return;
        content._animating = true;

        header.setAttribute('aria-expanded', 'true');
        item.classList.add('is-open');

        if (prefersReduced) {
          content.style.display = 'block';
          content.style.maxHeight = 'none';
          content._animating = false;
          return;
        }

        // Make visible so scrollHeight is measurable
        content.style.display = 'block';
        content.style.overflow = 'hidden';
        // Start from 0
        content.style.maxHeight = '0px';
        // Ensure browser paints before we measure
        requestAnimationFrame(() => {
          const full = content.scrollHeight; // measured height
          // Apply transition to max-height
          content.style.transition = 'max-height 360ms ease';
          content.style.maxHeight = full + 'px';
        });

        content.addEventListener('transitionend', function _onOpen(e) {
          if (e.propertyName !== 'max-height') return;
          // After opening, allow dynamic growth
          content.style.transition = '';
          content.style.maxHeight = 'none';
          content.style.overflow = 'visible';
          content._animating = false;
        }, { once: true });
      };

      const close = () => {
        if (content._animating) return;
        content._animating = true;

        header.setAttribute('aria-expanded', 'false');
        item.classList.remove('is-open');

        if (prefersReduced) {
          content.style.display = 'none';
          content.style.maxHeight = '0px';
          content._animating = false;
          return;
        }

        // If maxHeight is 'none' (auto), set it to current scrollHeight px to start transition
        // Make sure element is visible to measure
        content.style.overflow = 'hidden';
        content.style.display = 'block';
        const current = content.scrollHeight;
        content.style.maxHeight = current + 'px';

        // Force a paint then animate to 0
        requestAnimationFrame(() => {
          content.style.transition = 'max-height 360ms ease';
          content.style.maxHeight = '0px';
        });

        content.addEventListener('transitionend', function _onClose(e) {
          if (e.propertyName !== 'max-height') return;
          // Fully hide after collapse
          content.style.transition = '';
          content.style.display = 'none';
          content.style.maxHeight = '0px';
          content._animating = false;
        }, { once: true });
      };

      api.set(item, { open, close, header, content });
    });

    // Attach click handlers (single-open behavior: closes others)
    api.forEach((entry, item) => {
      const { header, open, close } = entry;

      header.addEventListener('click', (ev) => {
        // header is a button — no need to prevent default in normal use.
        ev.preventDefault();

        const isOpen = item.classList.contains('is-open');

        // close other open items
        api.forEach((other, otherItem) => {
          if (otherItem !== item && otherItem.classList.contains('is-open')) other.close();
        });

        // toggle this one
        if (isOpen) close();
        else open();
      });

      // keyboard accessibility
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          const headers = Array.from(document.querySelectorAll('.accordion-header'));
          const idx = headers.indexOf(header);
          if (idx === -1) return;
          if (e.key === 'ArrowDown') headers[(idx + 1) % headers.length].focus();
          else headers[(idx - 1 + headers.length) % headers.length].focus();
        }
      });
    });

    // keep open panels sized correctly on resize / content changes
    const resizeHandler = () => {
      api.forEach(({ content }, item) => {
        if (item.classList.contains('is-open')) {
          // if maxHeight is 'none', skip; otherwise re-measure briefly
          if (content.style.maxHeight === 'none' || content._animating) return;
          content.style.transition = '';
          const full = content.scrollHeight;
          content.style.maxHeight = full + 'px';
          // after short delay, set to none so it can grow
          setTimeout(() => {
            if (item.classList.contains('is-open')) content.style.maxHeight = 'none';
          }, 360);
        }
      });
    };
    window.addEventListener('resize', () => { clearTimeout(window._faqResizeTimer); window._faqResizeTimer = setTimeout(resizeHandler, 120); });

    // mutation observer to handle dynamic content changes inside open panels
    const observer = new MutationObserver(() => {
      api.forEach(({ content }, item) => {
        if (item.classList.contains('is-open') && !content._animating) {
          // if currently 'none' (auto), briefly set px then back to none for smooth adjustment
          if (content.style.maxHeight === 'none') {
            content.style.transition = '';
            const full = content.scrollHeight;
            content.style.maxHeight = full + 'px';
            setTimeout(() => content.style.maxHeight = 'none', 360);
          }
        }
      });
    });

    api.forEach(({ content }) => {
      observer.observe(content, { childList: true, subtree: true, characterData: true });
    });
  });
})();
