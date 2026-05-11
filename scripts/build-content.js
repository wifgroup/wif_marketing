#!/usr/bin/env node
/**
 * build-content.js
 * Converts content/*.md files into static HTML pages for wif_marketing.
 * Runs during GitHub Actions CI on every push to New branch.
 *
 * Dependencies: marked (v12+), gray-matter, js-yaml
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const OUTPUT_DIR = path.join(ROOT);
const BASE_URL = "https://wifmarketing.co";
const SITE_NAME = "WIF Marketing";

// Configure marked
marked.use({
  gfm: true,
  breaks: true,
  headerIds: true,
});

// -- Utilities --

function readDirRecursive(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...readDirRecursive(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// -- Schema Generators --

function buildSchema(frontmatter, canonical, relPath) {
  const type = frontmatter.type === "blog" ? "BlogPosting" : "CreativeWork";
  const segments = relPath.split("/").filter(Boolean);

  const graph = [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: SITE_NAME,
      url: `${BASE_URL}/`,
      logo: `${BASE_URL}/assets/image/wif_marketing.png`,
      email: "business@wifmarketing.co",
      telephone: "+91-9537192471",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Surat",
        addressRegion: "Gujarat",
        addressCountry: "IN",
      },
      parentOrganization: {
        "@type": "Organization",
        name: "WIF Group",
        url: "https://www.wifgroup.in",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: `${BASE_URL}/`,
      name: SITE_NAME,
      publisher: { "@id": `${BASE_URL}/#organization` },
    },
    {
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: frontmatter.og_title || frontmatter.title,
      description: frontmatter.description,
      inLanguage: "en-IN",
      isPartOf: { "@id": `${BASE_URL}/#website` },
      about: { "@id": `${BASE_URL}/#organization` },
      primaryImageOfPage: frontmatter.image
        ? `${BASE_URL}${frontmatter.image}`
        : `${BASE_URL}/assets/image/wif_marketing.png`,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumbs`,
      itemListElement: breadcrumbList(canonical, segments),
    },
  ];

  if (type === "BlogPosting") {
    const blogNode = {
      "@type": "BlogPosting",
      "mainEntityOfPage": { "@id": `${canonical}#webpage` },
      headline: frontmatter.title,
      description: frontmatter.description,
      image: frontmatter.image
        ? [`${BASE_URL}${frontmatter.image}`]
        : [`${BASE_URL}/assets/image/wif_marketing.png`],
      author: { "@id": `${BASE_URL}/#organization` },
      publisher: { "@id": `${BASE_URL}/#organization` },
      datePublished: frontmatter.date,
      dateModified: frontmatter.updated || frontmatter.date,
      inLanguage: "en-IN",
    };
    if (frontmatter.faqs && frontmatter.faqs.length > 0) {
      blogNode.mainEntity = frontmatter.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      }));
    }
    graph.push(blogNode);
  } else {
    const cwNode = {
      "@type": "CreativeWork",
      "mainEntityOfPage": { "@id": `${canonical}#webpage` },
      name: frontmatter.title,
      headline: frontmatter.title,
      description: frontmatter.description,
      author: { "@id": `${BASE_URL}/#organization` },
      publisher: { "@id": `${BASE_URL}/#organization` },
      dateModified: frontmatter.date,
      inLanguage: "en-IN",
    };
    if (frontmatter.metrics && frontmatter.metrics.length > 0) {
      cwNode.hasMeasurement = frontmatter.metrics.map((m) => ({
        "@type": "QuantitativeValue",
        name: m.label,
        value: String(m.value),
      }));
    }
    graph.push(cwNode);
  }

  // FAQPage node if FAQs exist
  if (frontmatter.faqs && frontmatter.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${canonical}#faq`,
      mainEntity: frontmatter.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

function breadcrumbList(canonical, segments) {
  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
  ];
  const categoryMap = { blog: "blog.html", "case-studies": "case-studies.html" };
  let pos = 2;
  for (let i = 0; i < segments.length - 1; i++) {
    if (categoryMap[segments[i]]) {
      const name = segments[i].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      items.push({
        "@type": "ListItem",
        position: pos++,
        name,
        item: `${BASE_URL}/${categoryMap[segments[i]]}`,
      });
    }
  }
  const lastName = segments[segments.length - 1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  items.push({ "@type": "ListItem", position: pos, name: lastName, item: canonical });
  return items;
}

// -- HTML Generators --

function generatePostHTML(frontmatter, bodyHtml, canonical, relPath) {
  const schema = buildSchema(frontmatter, canonical, relPath);
  const depth = relPath.split("/").length - 1;
  const prefix = depth ? "../".repeat(depth) : "";
  const formattedDate = frontmatter.date ? formatDate(frontmatter.date) : "";
  const ogTitle = escapeHtml(frontmatter.og_title || frontmatter.title);
  const title = escapeHtml(frontmatter.title);
  const description = escapeHtml(frontmatter.description || "");
  const imageUrl = frontmatter.image
    ? `${BASE_URL}${escapeHtml(frontmatter.image)}`
    : `${BASE_URL}/assets/image/wif_marketing.png`;
  const imageAlt = escapeHtml(frontmatter.image_alt || frontmatter.title || "");
  const author = escapeHtml(frontmatter.author || SITE_NAME);

  // FAQ section
  let faqHTML = "";
  if (frontmatter.faqs && frontmatter.faqs.length > 0) {
    faqHTML = `<section class="faq-section reveal" data-accordion>
      <h2>Frequently Asked Questions</h2>
      <div class="faq-list">
        ${frontmatter.faqs
          .map(
            (faq, i) => `
          <article class="faq-item reveal">
            <button type="button" aria-expanded="${i === 0 ? "true" : "false"}">${escapeHtml(faq.question)}</button>
            <div class="faq-answer"><p>${escapeHtml(faq.answer)}</p></div>
          </article>`
          )
          .join("\n")}
      </div>
    </section>`;
  }

  // Metrics section
  let metricsHTML = "";
  if (frontmatter.metrics && frontmatter.metrics.length > 0) {
    metricsHTML = `<section class="metrics-section reveal">
      <div class="metrics-grid">
        ${frontmatter.metrics
          .map(
            (m) => `
          <div class="metric-card">
            <span class="metric-label">${escapeHtml(m.label)}</span>
            <span class="metric-value">${escapeHtml(String(m.value))}</span>
          </div>`
          )
          .join("\n")}
      </div>
    </section>`;
  }

  // Related posts link
  const collectionLabel = frontmatter.type === "blog" ? "Blog" : "Case Studies";
  const collectionPath = frontmatter.type === "blog" ? "blog.html" : "case-studies.html";
  const activeNav = frontmatter.type === "blog" ? "blog" : "case-studies";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ogTitle}</title>
  <meta name="description" content="${description}">
  <meta name="geo.region" content="IN-GJ">
  <meta name="geo.placename" content="Surat, Gujarat">
  <meta name="robots" content="index, follow">
  <meta name="author" content="${author}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="${prefix}assets/favicon/favicon.ico" type="image/x-icon">
  <link rel="apple-touch-icon" href="${prefix}assets/favicon/apple-touch-icon.png">
  <link rel="manifest" href="${prefix}assets/favicon/site.webmanifest">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:alt" content="${imageAlt}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="en_IN">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${ogTitle}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="theme-color" content="#ffffff">
  <link rel="stylesheet" href="${prefix}styles/site.css">
  <script src="${prefix}scripts/site.js" defer></script>
  <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
  </script>
</head>
<body class="${frontmatter.type}-page">
  <a href="#main" class="skip-link">Skip to content</a>
  <header class="site-header" data-header>
    <div class="shell header-shell">
      <a href="${prefix}index.html" class="brand" aria-label="${SITE_NAME} home"><img src="${prefix}assets/image/wif_marketing.png" alt="${SITE_NAME}" width="148" height="48"></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu" data-menu-toggle><span></span><span></span><span></span></button>
      <nav class="site-nav" id="site-menu" data-site-menu aria-label="Primary navigation">
        <a href="${prefix}services.html">Services</a>
        <a href="${prefix}case-studies.html" class="${activeNav === "case-studies" ? "is-active" : ""}">Case Studies</a>
        <a href="${prefix}blog.html" class="${activeNav === "blog" ? "is-active" : ""}">Blog</a>
        <a href="${prefix}about.html">About</a>
        <a href="${prefix}contact.html">Contact</a>
        <a class="nav-cta" href="https://cal.com/wifmarketing/free-audit" target="_blank" rel="noopener noreferrer">Book Free Audit</a>
      </nav>
    </div>
  </header>

  <main id="main">
    <article class="content-page shell">
      <div class="page-header">
        <nav class="page-breadcrumb" aria-label="Breadcrumb">
          <a href="${prefix}index.html">Home</a> /
          <a href="${prefix}${collectionPath}">${collectionLabel}</a> /
          ${title}
        </nav>
        <h1>${title}</h1>
        ${formattedDate ? `<time datetime="${frontmatter.date}">${formattedDate}</time>` : ""}
        ${author !== SITE_NAME ? `<span class="author">by ${author}</span>` : ""}
      </div>

      ${frontmatter.image ? `<figure class="hero-image"><img src="${prefix}${escapeHtml(frontmatter.image)}" alt="${imageAlt}" loading="lazy" width="1200" height="630"></figure>` : ""}

      <div class="content-body">
${bodyHtml}
      </div>

      ${metricsHTML}
      ${faqHTML}

      <section class="related-section reveal">
        <h2>Related Content</h2>
        <p><a href="${prefix}${collectionPath}" class="ghost-button">View All ${collectionLabel} →</a></p>
      </section>
    </article>
  </main>

  <footer class="site-footer">
    <div class="shell footer-grid">
      <section class="footer-section">
        <h2>WIF Marketing</h2>
        <p>Performance marketing agency in Surat, Gujarat — Google Ads, SEO, Meta Ads, LinkedIn Ads, AI calling agents, lead generation and workflow automation.</p>
      </section>
      <section class="footer-section">
        <h2>Services</h2>
        <nav>
          <a href="${prefix}services/google-ads-agency-surat.html">Google Ads</a>
          <a href="${prefix}services/seo-agency-surat.html">SEO</a>
          <a href="${prefix}services/meta-ads-agency-india.html">Meta Ads</a>
          <a href="${prefix}services/linkedin-ads-agency-india.html">LinkedIn Ads</a>
          <a href="${prefix}services/ai-calling-agent-lead-qualification.html">AI Calling</a>
          <a href="${prefix}services/workflow-automation.html">Automation</a>
        </nav>
      </section>
      <section class="footer-section">
        <h2>Resources</h2>
        <nav>
          <a href="${prefix}blog.html">Blog</a>
          <a href="${prefix}case-studies.html">Case Studies</a>
          <a href="${prefix}resources.html">Resources</a>
          <a href="${prefix}sitemap.xml">Sitemap</a>
        </nav>
      </section>
      <section class="footer-section">
        <h2>Contact</h2>
        <p><a href="mailto:business@wifmarketing.co">business@wifmarketing.co</a></p>
        <p><a href="tel:+919537192471">+91 95371 92471</a></p>
      </section>
    </div>
    <div class="shell footer-bottom">
      <p>&copy; ${new Date().getFullYear()} WIF Marketing. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;
}

// -- Listing Page Generators --

function generateListingPage(items, title, description, currentPath) {
  const canonical = `${BASE_URL}/${currentPath}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${BASE_URL}/#organization`, name: SITE_NAME, url: `${BASE_URL}/` },
      { "@type": "WebSite", "@id": `${BASE_URL}/#website`, url: `${BASE_URL}/`, name: SITE_NAME },
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: title,
        description: description,
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
          { "@type": "ListItem", position: 2, name: title, item: canonical },
        ],
      },
    ],
  };

  const cardsHTML = items
    .map((item) => {
      const imageBlock = item.image
        ? `<a href="${item.href}"><img src="${item.image.startsWith("http") ? item.image : BASE_URL + item.image}" alt="${escapeHtml(item.title)}" loading="lazy" width="400" height="225"></a>`
        : "";
      return `
    <article class="post-card reveal">
      ${imageBlock}
      <div class="post-card-body">
        <time datetime="${item.date}">${item.formattedDate}</time>
        <h3><a href="${item.href}">${escapeHtml(item.title)}</a></h3>
        <p>${escapeHtml(item.description)}</p>
        <a href="${item.href}" class="ghost-button">Read More →</a>
      </div>
    </article>`;
    })
    .join("\n");

  // Determine active nav
  let activeService = "";
  if (currentPath === "blog.html") activeService = "blog";
  if (currentPath === "case-studies.html") activeService = "case-studies";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${BASE_URL}/assets/image/wif_marketing.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="styles/site.css">
  <script src="scripts/site.js" defer></script>
  <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
  </script>
</head>
<body class="${currentPath.replace(".html", "")}-page">
  <a href="#main" class="skip-link">Skip to content</a>
  <header class="site-header" data-header>
    <div class="shell header-shell">
      <a href="index.html" class="brand" aria-label="${SITE_NAME} home"><img src="assets/image/wif_marketing.png" alt="${SITE_NAME}" width="148" height="48"></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu" data-menu-toggle><span></span><span></span><span></span></button>
      <nav class="site-nav" id="site-menu" data-site-menu aria-label="Primary navigation">
        <a href="services.html">Services</a>
        <a href="case-studies.html" class="${activeService === "case-studies" ? "is-active" : ""}">Case Studies</a>
        <a href="blog.html" class="${activeService === "blog" ? "is-active" : ""}">Blog</a>
        <a href="about.html">About</a>
        <a href="contact.html">Contact</a>
        <a class="nav-cta" href="https://cal.com/wifmarketing/free-audit" target="_blank" rel="noopener noreferrer">Book Free Audit</a>
      </nav>
    </div>
  </header>
  <main id="main">
    <section class="listing-page shell">
      <h1>${escapeHtml(title)}</h1>
      <p class="listing-intro">${escapeHtml(description)}</p>
      <div class="post-grid">
        ${cardsHTML}
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="shell footer-grid">
      <section><h2>WIF Marketing</h2>
        <p>Performance marketing agency in Surat, Gujarat.</p></section>
      <section><h2>Quick Links</h2>
        <nav><a href="services.html">Services</a><a href="blog.html">Blog</a><a href="case-studies.html">Case Studies</a><a href="resources.html">Resources</a></nav></section>
    </div>
    <div class="shell footer-bottom">
      <p>&copy; ${new Date().getFullYear()} WIF Marketing. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;
}

// -- Sitemap Generator --

function generateSitemap(publishedItems) {
  const urls = [
    { loc: `${BASE_URL}/`, lastmod: "2026-05-11", priority: "1.0", freq: "weekly" },
    { loc: `${BASE_URL}/services.html`, lastmod: "2026-05-11", priority: "0.9", freq: "weekly" },
    { loc: `${BASE_URL}/case-studies.html`, lastmod: "2026-05-11", priority: "0.9", freq: "weekly" },
    { loc: `${BASE_URL}/blog.html`, lastmod: "2026-05-11", priority: "0.9", freq: "weekly" },
    { loc: `${BASE_URL}/resources.html`, lastmod: "2026-05-11", priority: "0.85", freq: "weekly" },
    { loc: `${BASE_URL}/about.html`, lastmod: "2026-05-11", priority: "0.7", freq: "monthly" },
    { loc: `${BASE_URL}/contact.html`, lastmod: "2026-05-11", priority: "0.8", freq: "monthly" },
    { loc: `${BASE_URL}/privacy-policy.html`, lastmod: "2026-05-11", priority: "0.3", freq: "yearly" },
    { loc: `${BASE_URL}/terms.html`, lastmod: "2026-05-11", priority: "0.3", freq: "yearly" },
  ];

  for (const item of publishedItems) {
    urls.push({
      loc: `${BASE_URL}${item.href}`,
      lastmod: item.date || "2026-05-11",
      priority: item.type === "blog" ? "0.8" : "0.75",
      freq: "monthly",
    });
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const url of urls) {
    xml += `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.freq}</changefreq>
    <priority>${url.priority}</priority>
  </url>\n`;
  }
  xml += "</urlset>";
  return xml;
}

// -- API JSON Feed Generator --

function generateJSONFeed(items, collection) {
  return items.map((item) => ({
    title: item.title,
    slug: item.slug,
    description: item.description,
    date: item.date,
    formattedDate: item.formattedDate,
    image: item.image ? `${BASE_URL}${item.image}` : `${BASE_URL}/assets/image/wif_marketing.png`,
    url: `${BASE_URL}${item.href}`,
    tags: item.tags || [],
    status: item.status,
    type: item.type,
  }));
}

// -- Robots.txt Updater --

function updateRobotsTxt(publishedItems) {
  const blogPaths = publishedItems
    .filter((i) => i.type === "blog")
    .map((i) => i.href);

  const lines = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${BASE_URL}/sitemap.xml`,
    "",
  ];

  for (const bp of blogPaths) {
    lines.push(`Allow: ${bp}`);
  }

  return lines.join("\n") + "\n";
}

// -- Main Build --

function build() {
  console.log("WIF Marketing Content Build Starting...\n");

  const allPosts = [];

  for (const collection of ["blog", "case-studies"]) {
    const contentDir = path.join(CONTENT_DIR, collection);
    const files = readDirRecursive(contentDir);

    console.log(`Found ${files.length} files in content/${collection}/`);

    for (const filePath of files) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data: frontmatter, content: body } = matter(raw);

      if (frontmatter.status === "draft") {
        console.log(`  SKIP (draft): ${path.basename(filePath)}`);
        continue;
      }

      if (!frontmatter.title || !frontmatter.slug) {
        console.log(`  SKIP (missing title/slug): ${path.basename(filePath)}`);
        continue;
      }

      const slug = frontmatter.slug;
      const relPath = `${collection}/${slug}.html`;
      const outPath = path.join(OUTPUT_DIR, relPath);
      const canonical = `${BASE_URL}/${relPath}`;

      const bodyHtml = marked.parse(body);
      const html = generatePostHTML(frontmatter, bodyHtml, canonical, relPath);

      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, html, "utf-8");

      console.log(`  BUILT: ${relPath}`);

      allPosts.push({
        title: frontmatter.title,
        slug,
        description: frontmatter.description || "",
        date: frontmatter.date || "",
        formattedDate: frontmatter.date ? formatDate(frontmatter.date) : "",
        image: frontmatter.image || null,
        href: `/${relPath}`,
        tags: frontmatter.tags || [],
        status: frontmatter.status || "published",
        type: collection,
      });
    }
  }

  allPosts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  // Blog listing
  const blogPosts = allPosts.filter((p) => p.type === "blog");
  const blogHtml = generateListingPage(
    blogPosts,
    "Blog | WIF Marketing",
    "Latest insights on performance marketing, SEO, paid ads and lead generation from WIF Marketing in Surat, Gujarat.",
    "blog.html"
  );
  fs.writeFileSync(path.join(OUTPUT_DIR, "blog.html"), blogHtml, "utf-8");
  console.log("\nGENERATED: blog.html");

  // Case studies listing
  const caseStudies = allPosts.filter((p) => p.type === "case-studies");
  const csHtml = generateListingPage(
    caseStudies,
    "Case Studies | WIF Marketing Results",
    "Real results for real businesses — see how WIF Marketing delivered growth through performance marketing.",
    "case-studies.html"
  );
  fs.writeFileSync(path.join(OUTPUT_DIR, "case-studies.html"), csHtml, "utf-8");
  console.log("GENERATED: case-studies.html");

  // Sitemap
  const sitemap = generateSitemap(allPosts);
  fs.writeFileSync(path.join(OUTPUT_DIR, "sitemap.xml"), sitemap, "utf-8");
  console.log("GENERATED: sitemap.xml");

  // Robots.txt
  const robots = updateRobotsTxt(allPosts);
  fs.writeFileSync(path.join(OUTPUT_DIR, "robots.txt"), robots, "utf-8");
  console.log("UPDATED: robots.txt");

  // API JSON feeds
  const apiDir = path.join(OUTPUT_DIR, "api");
  fs.mkdirSync(apiDir, { recursive: true });

  fs.writeFileSync(
    path.join(apiDir, "blog.json"),
    JSON.stringify(generateJSONFeed(blogPosts, "blog"), null, 2),
    "utf-8"
  );
  console.log("GENERATED: api/blog.json");

  fs.writeFileSync(
    path.join(apiDir, "case-studies.json"),
    JSON.stringify(generateJSONFeed(caseStudies, "case-studies"), null, 2),
    "utf-8"
  );
  console.log("GENERATED: api/case-studies.json");

  console.log(`\nBuild complete! ${allPosts.length} pages generated.`);
  console.log(`  Blog posts: ${blogPosts.length}`);
  console.log(`  Case studies: ${caseStudies.length}`);
}

build();