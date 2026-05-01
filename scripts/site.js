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

  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const hrefPath = href.split("#")[0];
    if (hrefPath && hrefPath === currentPath) {
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
})();
