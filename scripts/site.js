(() => {
  const API_URL = "https://dhansafar-web-api.vercel.app/api/contacts";
  const body = document.body;
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const siteMenu = document.querySelector("[data-site-menu]");
  const yearTargets = document.querySelectorAll("[data-year]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  yearTargets.forEach((target) => {
    target.textContent = new Date().getFullYear();
  });

  const closeMenu = () => {
    body.classList.remove("menu-open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  };

  if (menuToggle && siteMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = body.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteMenu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  const syncHeader = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

    document.documentElement.style.setProperty("--scroll-progress", String(Math.min(Math.max(progress, 0), 1)));

    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  const parallaxTargets = reduceMotion ? [] : Array.from(document.querySelectorAll("[data-parallax]"));
  let parallaxTicking = false;

  const syncParallax = () => {
    parallaxTicking = false;
    if (!parallaxTargets.length) return;
    const viewportCenter = window.innerHeight / 2;

    parallaxTargets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      const speed = Number(target.dataset.parallax || 0);
      const distance = rect.top + rect.height / 2 - viewportCenter;
      target.style.setProperty("--parallax-y", String(Math.round(distance * speed)));
    });
  };

  const requestParallax = () => {
    if (parallaxTicking) return;
    parallaxTicking = true;
    window.requestAnimationFrame(syncParallax);
  };

  if (parallaxTargets.length) {
    syncParallax();
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax);
  }

  const pathname = window.location.pathname;
  const currentPath = pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const hrefPath = href.split("#")[0];
    const normalizedHref = hrefPath.replace(/^\.\.\//, "");
    const isSectionParent =
      (pathname.includes("/services/") && normalizedHref === "services.html") ||
      (pathname.includes("/case-studies/") && normalizedHref === "case-studies.html") ||
      (pathname.includes("/resources/") && normalizedHref === "resources.html");

    if (hrefPath && (hrefPath === currentPath || normalizedHref === currentPath || isSectionParent)) {
      link.classList.add("is-active");
    }
  });

  if (!reduceMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -48px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index * 45, 360)}ms`;
      revealObserver.observe(element);
    });
  } else {
    document.querySelectorAll(".reveal").forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  document.querySelectorAll("[data-accordion]").forEach((accordion) => {
    accordion.querySelectorAll(".faq-item button").forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".faq-item");
        const isOpen = item.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(isOpen));
      });
    });
  });

  document.querySelectorAll("[data-filter-group]").forEach((group) => {
    const buttons = group.querySelectorAll("[data-filter]");
    const targetSelector = group.getAttribute("data-filter-target");
    const target = targetSelector ? document.querySelector(targetSelector) : group.closest("section");
    const cards = target ? target.querySelectorAll("[data-category]") : document.querySelectorAll("[data-category]");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        buttons.forEach((item) => {
          item.classList.toggle("is-active", item === button);
          item.setAttribute("aria-pressed", String(item === button));
        });

        cards.forEach((card) => {
          const categories = (card.dataset.category || "").split(/\s+/);
          const shouldShow = filter === "all" || categories.includes(filter);
          card.hidden = !shouldShow;
          if (shouldShow) {
            card.classList.add("is-visible");
          }
        });
      });
    });
  });

  const submitContactRequest = async (formData) => {
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const service = String(formData.get("service") || "Not selected").trim();
    const message = String(formData.get("message") || "").trim();

    const payload = {
      name,
      phone_number: phone || "N/A",
      message: [
        `New WIF Marketing website inquiry from: ${email}`,
        `Service interest: ${service || "Not selected"}`,
        "",
        message
      ].join("\n")
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json().catch(() => ({}));
  };

  document.querySelectorAll("[data-contact-form]").forEach((form) => {
    const status = form.querySelector("[data-form-status]");
    const submitButton = form.querySelector("button[type='submit']");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const requiredValues = ["name", "email", "message"].map((field) => String(formData.get(field) || "").trim());
      const email = String(formData.get("email") || "").trim();
      const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      status.classList.remove("is-success", "is-error");

      if (requiredValues.some((value) => !value) || !emailLooksValid) {
        status.textContent = "Please add your name, a valid email and a short project note.";
        status.classList.add("is-error");
        return;
      }

      status.textContent = "Sending your request...";
      status.classList.add("is-success");
      if (submitButton) submitButton.disabled = true;

      try {
        await submitContactRequest(formData);
        status.textContent = "Thanks. Your request was submitted successfully.";
        status.classList.add("is-success");
        form.reset();
      } catch (error) {
        console.error("Contact submission failed:", error);
        status.textContent = "Something went wrong while submitting. Please try again or email business@wifmarketing.co.";
        status.classList.remove("is-success");
        status.classList.add("is-error");
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  });

  const initGptHome = () => {
    const home = document.querySelector(".gpt-home");
    if (!home) return;

    document.querySelectorAll(".gpt-accordion-card").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        document.querySelectorAll(".gpt-accordion-card").forEach((item) => item.classList.toggle("is-active", item === card));
      });
      card.addEventListener("focusin", () => {
        document.querySelectorAll(".gpt-accordion-card").forEach((item) => item.classList.toggle("is-active", item === card));
      });
    });

    if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
      document.querySelectorAll("[data-word-reveal]").forEach((text) => {
        text.innerHTML = text.textContent
          .trim()
          .split(/\s+/)
          .map((word) => `<span>${word}</span>`)
          .join(" ");
      });
      return;
    }

    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      ".gpt-hero-bg img",
      { scale: 1.12, opacity: 0.35 },
      {
        scale: 1.04,
        opacity: 0.55,
        duration: 1.35,
        ease: "power3.out"
      }
    );

    document.querySelectorAll("[data-word-reveal]").forEach((text) => {
      const words = text.textContent.trim().split(/\s+/);
      text.innerHTML = words.map((word) => `<span>${word}</span>`).join(" ");

      gsap.to(text.querySelectorAll("span"), {
        opacity: 1,
        stagger: 0.035,
        ease: "none",
        scrollTrigger: {
          trigger: text,
          start: "top 78%",
          end: "bottom 42%",
          scrub: true
        }
      });
    });

    document.querySelectorAll("[data-gsap-pin]").forEach((section) => {
      const pinCopy = section.querySelector("[data-pin-copy]");
      if (!pinCopy || window.innerWidth < 981) return;

      ScrollTrigger.create({
        trigger: section,
        start: "top top+=96",
        end: "bottom bottom",
        pin: pinCopy,
        pinSpacing: false
      });
    });

    document.querySelectorAll("[data-scale-media] img").forEach((image) => {
      gsap.timeline({
        scrollTrigger: {
          trigger: image,
          start: "top 88%",
          end: "bottom 12%",
          scrub: true
        }
      })
        .fromTo(image, { scale: 0.8, opacity: 0.38, filter: "grayscale(1) contrast(1.12) brightness(0.72)" }, { scale: 1, opacity: 1, filter: "grayscale(0.2) contrast(1.08) brightness(1)", duration: 0.55, ease: "none" })
        .to(image, { scale: 0.96, opacity: 0.2, filter: "grayscale(1) contrast(1.12) brightness(0.45)", duration: 0.45, ease: "none" });
    });
  };

  initGptHome();
})();
