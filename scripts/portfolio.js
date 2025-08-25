// scripts/portfolio.js

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
    const projectCards = document.querySelectorAll('.project-card');

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

            projectCards.forEach(card => {
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

    /* ===== Project Details Modal Functionality ===== */
    const projectModal = document.getElementById('project-modal');
    const closeButton = projectModal.querySelector('.close-btn');
    const btnViewDetails = document.querySelectorAll('.btn-view-details');

    // Data for dynamic modal content (can be fetched from API in real app)
    const projectData = {
        project1: {
            image: "https://placehold.co/800x500/e0f2fe/1d4ed8?text=SEO+Growth+Details",
            title: "E-commerce Traffic Surge Campaign",
            category: "SEO",
            description: "Implemented a comprehensive SEO strategy including keyword research, on-page optimization, technical SEO fixes, and strategic link building. This led to a significant increase in organic search visibility and conversion rates for a fashion e-commerce client.",
            stats: [
                { icon: "fas fa-arrow-up", text: "+180% Organic Traffic" },
                { icon: "fas fa-chart-bar", text: "+65% Conversion Rate" },
                { icon: "fas fa-clock", text: "Achieved in 6 Months" }
            ],
            testimonial: "“WIF Marketing's SEO expertise completely transformed our online presence. Our traffic has never been higher, and we're seeing fantastic ROI!” - Sarah L., CEO of FashionNova"
        },
        project2: {
            image: "https://placehold.co/800x500/e0f2fe/1d4ed8?text=PPC+Leads+Details",
            title: "Tech Startup Lead Generation Boost",
            category: "PPC",
            description: "Developed and managed targeted PPC campaigns across Google Ads and LinkedIn for a burgeoning B2B SaaS startup. Focused on highly specific keywords and audience segmentation to drive high-quality leads at an optimized cost-per-acquisition.",
            stats: [
                { icon: "fas fa-users", text: "+250 New Leads/Month" },
                { icon: "fas fa-dollar-sign", text: "3X ROI on Ad Spend" },
                { icon: "fas fa-piggy-bank", text: "20% Lower CPA" }
            ],
            testimonial: "“Their PPC team is phenomenal. We saw an immediate surge in qualified leads, directly impacting our sales pipeline.” - Mark T., Marketing Director at InnovateTech"
        },
        project3: {
            image: "https://placehold.co/800x500/e0f2fe/1d4ed8?text=SMM+Engage+Details",
            title: "Global Brand Awareness Campaign",
            category: "SMM",
            description: "Designed and executed a multi-platform social media campaign to boost brand awareness and engagement for a new consumer electronics product. Utilized interactive content, influencer collaborations, and precise ad targeting.",
            stats: [
                { icon: "fas fa-heart", text: "+500% Social Engagement" },
                { icon: "fas fa-eye", text: "1.5M+ Impressions" },
                { icon: "fas fa-hashtag", text: "Top Trending Hashtag" }
            ],
            testimonial: "“The SMM strategy was incredibly creative and effective. Our brand reached a massive new audience, and the engagement was fantastic.” - Emily R., Brand Manager at NexGen Electronics"
        },
        project4: {
            image: "https://placehold.co/800x500/e0f2fe/1d4ed8?text=Web+Design+Details",
            title: "SaaS Platform UX/UI Redesign",
            category: "Web Design",
            description: "A complete overhaul of an existing SaaS platform's user experience and interface. Focused on intuitive navigation, modern aesthetics, and mobile responsiveness to improve user retention and feature adoption.",
            stats: [
                { icon: "fas fa-desktop", text: "Improved UX/UI Score" },
                { icon: "fas fa-redo-alt", text: "-30% Bounce Rate" },
                { icon: "fas fa-clock", text: "+20% Session Duration" }
            ],
            testimonial: "“The redesign breathed new life into our platform. Users love the new interface, and our engagement metrics have soared.” - Alex D., Product Head at Cloudify Solutions"
        },
        project5: {
            image: "https://placehold.co/800x500/e0f2fe/1d4ed8?text=Branding+Details",
            title: "Comprehensive Corporate Rebranding",
            category: "Branding",
            description: "Developed a new brand identity, including logo, color palette, typography, and messaging guidelines for a mid-sized corporate client. The goal was to modernize their image and better reflect their innovative services.",
            stats: [
                { icon: "fas fa-award", text: "Enhanced Brand Perception" },
                { icon: "fas fa-star", text: "+25% Brand Recognition" },
                { icon: "fas fa-users-cog", text: "Stronger Internal Alignment" }
            ],
            testimonial: "“WIF Marketing delivered a brand identity that truly captures our vision. It’s professional, modern, and perfectly represents who we are.” - David K., CEO of Global Innovators"
        },
        project6: {
            image: "https://placehold.co/800x500/e0f2fe/1d4ed8?text=Local+SEO+Details",
            title: "Local Restaurant Visibility Boost",
            category: "SEO",
            description: "Executed a local SEO campaign for a chain of restaurants, focusing on Google My Business optimization, local citation building, and review management. Resulted in higher visibility in local search results and increased foot traffic.",
            stats: [
                { icon: "fas fa-map-marker-alt", text: "Top 3 Local Rankings" },
                { icon: "fas fa-phone-alt", text: "+40% Call Volume" },
                { icon: "fas fa-comments", text: "+60% Online Reviews" }
            ],
            testimonial: "“Our reservations have gone up significantly since WIF Marketing optimized our local listings. They truly understand local search!” - Maria S., Owner of The Gourmet Bistro"
        }
    };


    btnViewDetails.forEach(button => {
        button.addEventListener('click', () => {
            const projectId = button.getAttribute('data-project-id');
            const data = projectData[projectId];
            if (data) {
                document.getElementById('modal-image').src = data.image;
                document.getElementById('modal-image').alt = data.title;
                document.getElementById('modal-title').textContent = data.title;
                document.getElementById('modal-category').textContent = data.category;
                document.getElementById('modal-description').textContent = data.description;

                const modalStats = document.getElementById('modal-stats');
                modalStats.innerHTML = ''; // Clear previous stats
                data.stats.forEach(stat => {
                    const statItem = document.createElement('div');
                    statItem.classList.add('modal-stat-item');
                    statItem.innerHTML = `<i class="${stat.icon}"></i> <span>${stat.text}</span>`;
                    modalStats.appendChild(statItem);
                });

                const modalTestimonial = document.getElementById('modal-testimonial');
                if (data.testimonial) {
                    modalTestimonial.innerHTML = `<p>${data.testimonial}</p>`;
                    modalTestimonial.style.display = 'block';
                } else {
                    modalTestimonial.style.display = 'none';
                }

                openModal();
            }
        });
    });

    closeButton.addEventListener('click', closeModal);
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) { // Close when clicking outside content
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectModal.classList.contains('active')) {
            closeModal();
        }
    });

    function openModal() {
        projectModal.classList.add('active');
        projectModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
        // Focus trap for accessibility (simple version)
        setTimeout(() => {
            const focusableElements = projectModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstFocusable = focusableElements[0];
            firstFocusable && firstFocusable.focus();
        }, 300); // Allow modal to transition in
    }

    function closeModal() {
        projectModal.classList.remove('active');
        projectModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restore background scrolling
    }
})();
