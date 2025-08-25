// scripts/contact.js

(() => {
    // Check for reduced motion preference
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ===== Reveal on Scroll (Fade-in and Slide) - Consistent with other sections ===== */
    const revealElements = document.querySelectorAll('.reveal-from-bottom, .reveal-from-left, .reveal-from-right');
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


    /* ===== Contact Form Submission (Client-side validation & feedback) ===== */
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const submitButton = contactForm ? contactForm.querySelector('.submit-btn') : null;

    if (contactForm && submitButton) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission

            formMessage.textContent = ''; // Clear previous messages
            formMessage.classList.remove('success', 'error');

            const fullName = document.getElementById('full-name').value.trim();
            const emailAddress = document.getElementById('email-address').value.trim();
            const message = document.getElementById('message').value.trim();

            let isValid = true;
            let errorMessage = [];

            if (!fullName) {
                errorMessage.push('Full Name is required.');
                isValid = false;
            }
            if (!emailAddress) {
                errorMessage.push('Email Address is required.');
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) { // Simple regex for email format
                errorMessage.push('Please enter a valid email address.');
                isValid = false;
            }
            if (!message) {
                errorMessage.push('Your Message is required.');
                isValid = false;
            }

            if (!isValid) {
                formMessage.innerHTML = '⚠️ ' + errorMessage.join('<br>'); // Display all errors
                formMessage.classList.add('error');
                return;
            }

            // If validation passes, simulate API call
            formMessage.textContent = 'Sending message...';
            formMessage.classList.add('success'); // Use success color for "loading" state
            submitButton.disabled = true;
            const formFields = contactForm.querySelectorAll('input, select, textarea');
            formFields.forEach(field => field.disabled = true);

            setTimeout(() => {
                const success = Math.random() > 0.1; // Simulate 90% success rate

                if (success) {
                    formMessage.innerHTML = '✅ Thanks for reaching out! Our team will get back to you within 24 hours.';
                    formMessage.classList.add('success');
                    contactForm.reset(); // Clear form on success
                } else {
                    formMessage.innerHTML = '⚠️ Oops! Something went wrong. Please try again later.';
                    formMessage.classList.add('error');
                }

                submitButton.disabled = false;
                formFields.forEach(field => field.disabled = false);
            }, 2000); // Simulate network request delay (2 seconds)
        });
    }

})();
