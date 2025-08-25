// scripts/services.js

(() => {
    // Check for reduced motion preference
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ===== Reveal on Scroll (Fade-in and Slide) - Consistent with About Us ===== */
    const revealElements = document.querySelectorAll('.reveal-from-bottom, .reveal-from-right');
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


    /* ===== Accordion Functionality ===== */
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.closest('.accordion-item');
            const content = accordionItem.querySelector('.accordion-content');
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            // If not reduced motion, close other accordions and animate current one
            if (!isReducedMotion) {
                // Close all other accordions
                accordionHeaders.forEach(otherHeader => {
                    const otherAccordionItem = otherHeader.closest('.accordion-item');
                    const otherContent = otherAccordionItem.querySelector('.accordion-content');
                    if (otherHeader !== header && otherHeader.getAttribute('aria-expanded') === 'true') {
                        otherHeader.setAttribute('aria-expanded', 'false');
                        otherContent.style.maxHeight = '0';
                    }
                });

                // Toggle current accordion
                if (isExpanded) {
                    header.setAttribute('aria-expanded', 'false');
                    content.style.maxHeight = '0';
                } else {
                    header.setAttribute('aria-expanded', 'true');
                    // Set max-height to scrollHeight to allow smooth transition
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            } else { // If reduced motion, toggle directly without animation
                if (isExpanded) {
                    header.setAttribute('aria-expanded', 'false');
                    content.style.maxHeight = '0';
                } else {
                    header.setAttribute('aria-expanded', 'true');
                    content.style.maxHeight = 'fit-content';
                }
            }
        });

        // Handle keyboard navigation for accordion items
        header.closest('.accordion-item').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Prevent default scroll for space bar
                header.click();
            }
        });
    });

    // Initial check for reduced motion to ensure content is visible if needed
    if (isReducedMotion) {
        document.querySelectorAll('.accordion-content').forEach(content => {
            if (content.closest('.accordion-item').querySelector('.accordion-header').getAttribute('aria-expanded') === 'true') {
                 content.style.maxHeight = 'fit-content';
            }
        });
    }

})();
