// scripts/header.js
(() => {
  const header = document.querySelector('.site-header');
  const hamburger = document.querySelector('.hamburger');
  const drawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.querySelector('.drawer-overlay');
  const drawerClose = document.querySelector('.drawer-close');
  const navLinks = document.querySelectorAll('.nav-link');
  const ctaButtons = document.querySelectorAll('.cta-btn');
  const themeToggles = document.querySelectorAll('.theme-toggle');

  let focusableElements;
  let lastFocusedElement;

  /* ========== Shadow on scroll ========== */
  const onScroll = () => {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll);
  onScroll(); // initialize

  /* ========== Smooth scroll ========== */
  const smoothScroll = (e) => {
    if (e.target.matches('.nav-link, .cta-btn')) {
      const href = e.target.getAttribute('href') || '#contact';
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
        closeDrawer();
      }
    }
  };
  document.addEventListener('click', smoothScroll);

  /* ========== Scroll spy ========== */
  const sections = document.querySelectorAll('main, section[id]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('id');
        if (entry.isIntersecting) {
          document
            .querySelectorAll('.nav-link')
            .forEach((link) => link.classList.remove('is-active'));
          const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
          if (activeLink) activeLink.classList.add('is-active');
        }
      });
    },
    { threshold: 0.6 }
  );
  sections.forEach((section) => observer.observe(section));

  /* ========== Drawer toggle ========== */
  const openDrawer = () => {
    lastFocusedElement = document.activeElement;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    drawerOverlay.classList.add('active');
    trapFocus(drawer);
  };
  const closeDrawer = () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    drawerOverlay.classList.remove('active');
    releaseFocus();
    if (lastFocusedElement) lastFocusedElement.focus();
  };
  hamburger.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);

  /* Esc to close drawer */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  /* ========== Focus trap ========== */
  function trapFocus(container) {
    focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    first.focus();

    container.addEventListener('keydown', function handler(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }
  function releaseFocus() {
    // Nothing needed here as event listener is local-scoped
  }

  /* ========== Theme toggle ========== */
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
    themeToggles.forEach((btn) => {
      btn.querySelector('.theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
    });
  };

  themeToggles.forEach((btn) =>
    btn.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark');
      applyTheme(isDark ? 'light' : 'dark');
    })
  );

  // Initialize theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
})();
