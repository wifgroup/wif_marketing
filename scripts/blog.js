// scripts/blog.js

(() => {
    // Check for reduced motion preference
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ===== Reveal on Scroll (Fade-in and Slide) - Consistent with other sections ===== */
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


    /* ===== Filter Functionality ===== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const blogCards = document.querySelectorAll('.blog-card'); // Changed from projectCards

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' from previous button and set aria-pressed to false
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });

            // Add 'active' to current button and set aria-pressed to true
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');

            const filterValue = button.getAttribute('data-filter');

            blogCards.forEach(card => { // Changed from projectCards
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'flex'; // Show card
                    if (!isReducedMotion) {
                        card.style.opacity = '0'; // Reset for fade-in
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 50); // Small delay for re-animation
                    } else {
                        card.style.opacity = '1';
                        card.style.transform = 'none';
                    }
                } else {
                    card.style.display = 'none'; // Hide card
                }
            });
        });
    });

    // No modal functionality for blog posts in this design, they would link to full articles.

})();
