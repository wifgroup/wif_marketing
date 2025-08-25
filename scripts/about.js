// scripts/about.js

(() => {
    // Check for reduced motion preference
        // Intersection Observer for reveal animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Counter animation for stats
        const animateCounter = (element) => {
            const target = parseInt(element.dataset.target);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current >= target) {
                    element.textContent = target;
                } else {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                }
            };

            updateCounter();
        };

        // Timeline animation
        const animateTimeline = () => {
            const timeline = document.querySelector('.timeline');
            const timelineItems = document.querySelectorAll('.timeline-item');

            timeline.classList.add('animate');

            timelineItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('animate');
                }, index * 200);
            });
        };

        document.addEventListener('DOMContentLoaded', () => {
            // Observe reveal elements
            const revealElements = document.querySelectorAll('.reveal');
            revealElements.forEach(el => observer.observe(el));

            // Stats counter observer
            const statsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const counters = entry.target.querySelectorAll('.stat-number');
                        counters.forEach(counter => {
                            if (counter.dataset.target) {
                                animateCounter(counter);
                            }
                        });
                        statsObserver.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            const statsSection = document.querySelector('.stats-showcase');
            if (statsSection) {
                statsObserver.observe(statsSection);
            }

            // Timeline observer
            const timelineObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateTimeline();
                        timelineObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            const timeline = document.querySelector('.timeline');
            if (timeline) {
                timelineObserver.observe(timeline);
            }

            // Smooth scrolling
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        });

        // Add hover effects for better interactivity
        document.addEventListener('DOMContentLoaded', () => {
            const cards = document.querySelectorAll('.highlight-card, .value-card, .stat-item');
            cards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = card.classList.contains('stat-item')
                        ? 'translateY(-3px)'
                        : 'translateY(-8px)';
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0)';
                });
            });
        });
})();