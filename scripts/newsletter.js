// scripts/newsletter.js

(() => {
    // Check for reduced motion preference
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ===== Reveal on Scroll (Fade-in and Slide) - Consistent with other sections ===== */
    const revealElements = document.querySelectorAll('.reveal-from-bottom'); // Removed .reveal-from-right for simplicity here
    const revealObserverOptions = {
        root: null, // viewport as the root
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Special handling for value-proposition list items to stagger them
                if (entry.target.classList.contains('value-proposition')) {
                    const listItems = entry.target.querySelectorAll('li');
                    listItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('is-visible');
                        }, index * 150); // Stagger reveal by 150ms
                    });
                }
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealObserverOptions);
    revealElements.forEach(el => revealObserver.observe(el));


    /* ===== Newsletter Form Submission (Client-side validation & feedback) ===== */
    const newsletterForm = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('email-input');
    const formMessage = document.getElementById('form-message');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission

            const email = emailInput.value;
            formMessage.textContent = ''; // Clear previous messages
            formMessage.classList.remove('success', 'error');

            // Basic email validation
            if (!email) {
                formMessage.textContent = 'Please enter your email address.';
                formMessage.classList.add('error');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { // Simple regex for email format
                formMessage.textContent = 'Please enter a valid email address.';
                formMessage.classList.add('error');
                return;
            }

            // Simulate API call
            formMessage.textContent = 'Subscribing...';
            formMessage.classList.add('success'); // Use success color for "loading" state
            emailInput.disabled = true;
            newsletterForm.querySelector('button').disabled = true;

            setTimeout(() => {
                const success = Math.random() > 0.1; // Simulate 90% success rate

                if (success) {
                    formMessage.textContent = '🎉 You’re in! Check your inbox for the first tip.';
                    formMessage.classList.add('success');
                    emailInput.value = ''; // Clear input on success
                } else {
                    formMessage.textContent = 'Oops! Something went wrong. Please try again.';
                    formMessage.classList.add('error');
                }

                emailInput.disabled = false;
                newsletterForm.querySelector('button').disabled = false;
            }, 1500); // Simulate network request delay
        });
    }

    // Adjust reveal observer for staggered list items in value proposition
    const valuePropListObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const listItems = entry.target.querySelectorAll('li');
                listItems.forEach((item, index) => {
                    if (!isReducedMotion) {
                        setTimeout(() => {
                            item.classList.add('is-visible');
                        }, index * 150); // Stagger reveal
                    } else {
                        item.classList.add('is-visible'); // Show immediately
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, revealObserverOptions); // Using same options as general reveal

    const valuePropSection = document.querySelector('.value-proposition');
    if (valuePropSection) {
        valuePropListObserver.observe(valuePropSection);
    }


})();
