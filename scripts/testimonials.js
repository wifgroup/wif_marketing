// scripts/testimonials.js

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


    /* ===== Testimonial Carousel Functionality ===== */
    const carousel = document.querySelector('.testimonial-carousel');
    const prevButton = document.querySelector('.carousel-nav.prev');
    const nextButton = document.querySelector('.carousel-nav.next');
    const carouselDotsContainer = document.querySelector('.carousel-dots');
    const testimonialCards = document.querySelectorAll('.testimonial-card');

    let currentIndex = 0;
    let itemsPerView = 3; // Default for desktop
    let autoPlayInterval;

    // --- Helper Functions ---
    const getItemsPerView = () => {
        if (window.innerWidth <= 767) return 1; // Mobile
        if (window.innerWidth <= 1023) return 2; // Tablet
        return 3; // Desktop
    };

    const updateCarouselPosition = () => {
        const cardWidth = testimonialCards[0].offsetWidth + parseFloat(getComputedStyle(carousel).gap);
        carousel.scrollLeft = currentIndex * cardWidth;
        updateDots();
    };

    const updateDots = () => {
        carouselDotsContainer.innerHTML = ''; // Clear existing dots
        const numDots = Math.ceil(testimonialCards.length / itemsPerView);
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('span');
            dot.classList.add('carousel-dot');
            if (i === Math.floor(currentIndex / itemsPerView)) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', () => {
                currentIndex = i * itemsPerView;
                updateCarouselPosition();
                stopAutoPlay();
                startAutoPlay();
            });
            carouselDotsContainer.appendChild(dot);
        }
    };

    const navigateCarousel = (direction) => {
        stopAutoPlay(); // Stop autoplay on manual navigation
        const numItems = testimonialCards.length;
        const totalPages = Math.ceil(numItems / itemsPerView);

        if (direction === 'next') {
            currentIndex += itemsPerView;
            if (currentIndex >= numItems) {
                currentIndex = 0; // Loop back to start
            }
        } else { // 'prev'
            currentIndex -= itemsPerView;
            if (currentIndex < 0) {
                currentIndex = (totalPages - 1) * itemsPerView; // Loop to end
                // Adjust for cases where last page isn't full
                if (currentIndex >= numItems) {
                    currentIndex = numItems - itemsPerView;
                    if (currentIndex < 0) currentIndex = 0; // Handle very few items
                }
            }
        }
        updateCarouselPosition();
        startAutoPlay(); // Restart autoplay
    };

    const startAutoPlay = () => {
        if (isReducedMotion) return; // Do not autoplay if reduced motion
        stopAutoPlay(); // Clear any existing interval
        autoPlayInterval = setInterval(() => {
            navigateCarousel('next');
        }, 5000); // Change testimonial every 5 seconds
    };

    const stopAutoPlay = () => {
        clearInterval(autoPlayInterval);
    };

    // --- Event Listeners & Initialization ---
    prevButton.addEventListener('click', () => navigateCarousel('prev'));
    nextButton.addEventListener('click', () => navigateCarousel('next'));

    // Handle touch/swipe for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        stopAutoPlay();
    });

    carousel.addEventListener('touchmove', (e) => {
        touchEndX = e.touches[0].clientX;
    });

    carousel.addEventListener('touchend', () => {
        if (touchStartX - touchEndX > 50) { // Swiped left
            navigateCarousel('next');
        } else if (touchEndX - touchStartX > 50) { // Swiped right
            navigateCarousel('prev');
        }
        startAutoPlay();
    });


    // Initial setup and resize handling
    const initializeCarousel = () => {
        itemsPerView = getItemsPerView();
        updateCarouselPosition();
        updateDots();
        startAutoPlay();
    };

    window.addEventListener('resize', () => {
        // Debounce resize for performance
        let resizeTimer;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initializeCarousel, 200);
    });

    initializeCarousel(); // Call on load

    // Stop autoplay when user hovers over carousel (if not reduced motion)
    if (!isReducedMotion) {
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
    }

})();
