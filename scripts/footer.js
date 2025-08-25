// scripts/footer.js

(() => {
    // Check for reduced motion preference
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ===== Reveal on Scroll (Fade-in and Slide) - Consistent with other sections ===== */
    const revealElements = document.querySelectorAll('.reveal-from-bottom'); // Footer generally reveals from bottom
    const revealObserverOptions = {
        root: null, // viewport as the root
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealObserverOptions);
    revealElements.forEach(el => revealObserver.observe(el));

    /* ===== Dynamic Copyright Year Update ===== */
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

})();
