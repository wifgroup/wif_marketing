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

  const footerGrid = document.querySelector(".site-footer .footer-grid");

  if (footerGrid && !body.classList.contains("home-page")) {
    const footerSections = Array.from(footerGrid.children);
    footerGrid.dataset.footerSections = String(footerSections.length);

    footerSections.forEach((section) => {
      const heading = section.querySelector("h2");
      if (!heading) return;

      section.dataset.footerSection = heading.textContent.trim().toLowerCase().replace(/\s+/g, "-");
    });
  }

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
  const growthPages = [
    { href: "digital-marketing-agency-surat.html", label: "Digital marketing Surat" },
    { href: "performance-marketing-agency-surat.html", label: "Performance marketing Surat" },
    { href: "services/google-ads-agency-surat.html", label: "Google Ads Surat" },
    { href: "services/ppc-agency-surat.html", label: "PPC agency Surat" },
    { href: "services/local-seo-agency-surat.html", label: "Local SEO Surat" },
    { href: "services/seo-agency-surat.html", label: "SEO agency Surat" },
    { href: "services/google-ads-management-india.html", label: "Google Ads India" },
    { href: "services/meta-ads-agency-india.html", label: "Meta Ads India" },
    { href: "services/linkedin-ads-agency-india.html", label: "LinkedIn Ads India" },
    { href: "industries/ev-marketing-agency-india.html", label: "EV marketing India" },
    { href: "industries/textile-marketing-agency-surat.html", label: "Textile marketing Surat" },
    { href: "industries/export-business-marketing-gujarat.html", label: "Export marketing Gujarat" },
    { href: "industries/b2b-lead-generation-agency-india.html", label: "B2B lead generation India" },
    { href: "industries/showroom-marketing-agency-surat.html", label: "Showroom marketing Surat" },
    { href: "industries/d2c-marketing-agency-india.html", label: "D2C marketing India" },
    { href: "global/google-ads-agency-usa.html", label: "Google Ads USA" },
    { href: "global/linkedin-ads-agency-usa.html", label: "LinkedIn Ads USA" },
    { href: "global/performance-marketing-agency-uk.html", label: "Performance marketing UK" }
  ];

  const normalizedPathname = decodeURI(pathname).replace(/\\/g, "/");
  const currentGrowthPage = growthPages.find((page) => normalizedPathname.endsWith(`/${page.href}`));

  const getPageDepthPrefix = () => {
    if (normalizedPathname.endsWith("/index.html") || normalizedPathname.endsWith("/")) return "";
    return currentGrowthPage && currentGrowthPage.href.includes("/") ? "../" : "";
  };

  const pageHash = (value) =>
    Array.from(value).reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0, 0);

  document.querySelectorAll("[data-growth-pages]").forEach((target) => {
    if (currentPath === "index.html" && !currentGrowthPage) return;

    const prefix = target.dataset.growthPrefix || getPageDepthPrefix();
    const pageKey = currentGrowthPage ? currentGrowthPage.href : currentPath;
    const pool = growthPages.filter((page) => page.href !== pageKey);
    const start = Math.abs(pageHash(pageKey)) % pool.length;
    const selectedPages = Array.from({ length: 5 }, (_, index) => pool[(start + index) % pool.length]);
    const heading = document.createElement("h2");

    heading.textContent = "Growth pages";
    target.replaceChildren(heading);

    selectedPages.forEach((page) => {
      const link = document.createElement("a");
      link.href = `${prefix}${page.href}`;
      link.textContent = page.label;
      target.appendChild(link);
    });
  });

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

    const ledgerImage = home.querySelector("[data-demand-ledger-image]");
    const ledgerButtons = Array.from(home.querySelectorAll("[data-demand-ledger-trigger]"));

    if (ledgerImage && ledgerButtons.length) {
      ledgerButtons.forEach((button) => {
        const imageSrc = button.dataset.image;

        if (imageSrc) {
          const preload = new Image();
          preload.src = imageSrc;
        }

        button.addEventListener("click", () => {
          if (!imageSrc) return;

          ledgerImage.src = imageSrc;
          ledgerImage.alt = button.dataset.alt || "";

          ledgerButtons.forEach((item) => {
            const isActive = item === button;
            item.classList.toggle("is-active", isActive);
            item.setAttribute("aria-pressed", String(isActive));
          });
        });
      });
    }

    document.querySelectorAll(".gpt-accordion-card").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        document.querySelectorAll(".gpt-accordion-card").forEach((item) => item.classList.toggle("is-active", item === card));
      });
      card.addEventListener("focusin", () => {
        document.querySelectorAll(".gpt-accordion-card").forEach((item) => item.classList.toggle("is-active", item === card));
      });
    });

    document.querySelectorAll("[data-audit-map]").forEach((map) => {
      const items = Array.from(map.querySelectorAll("li"));

      items.forEach((item) => {
        const button = item.querySelector("button");
        if (!button) return;

        button.addEventListener("click", () => {
          items.forEach((layer) => {
            const isActive = layer === item;
            layer.classList.toggle("is-active", isActive);
            layer.querySelector("button")?.setAttribute("aria-expanded", String(isActive));
          });
        });
      });
    });
  };

  initGptHome();
})();
