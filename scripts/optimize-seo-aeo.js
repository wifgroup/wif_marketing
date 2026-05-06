const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const site = "https://wifmarketing.co";
const lastmod = "2026-05-06";
const imageUrl = `${site}/assets/image/wif_marketing.png`;

const skipDirs = new Set([".git", "node_modules", "assets", "Design"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) walk(path.join(dir, entry.name), files);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function attr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function text(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : "";
}

function getMeta(html, key, value) {
  const regex = new RegExp(`<meta\\s+${key}=["']${value}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i");
  return getTag(html, regex);
}

function getCanonical(html, fallbackPath) {
  return getTag(html, /<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    || `${site}/${fallbackPath === "index.html" ? "" : fallbackPath}`;
}

function insertBeforeStylesheet(html, lines) {
  const block = lines.join("\n");
  if (/<link\s+rel=["']stylesheet["']/i.test(html)) {
    return html.replace(/(\s*<link\s+rel=["']stylesheet["'][^>]*>)/i, `\n${block}$1`);
  }
  return html.replace(/<\/head>/i, `${block}\n</head>`);
}

function upsertMeta(html, type, name, content) {
  const escaped = attr(content);
  const regex = new RegExp(`<meta\\s+${type}=["']${name}["'][^>]*>`, "i");
  const tag = `  <meta ${type}="${name}" content="${escaped}">`;
  if (regex.test(html)) {
    return html.replace(regex, tag);
  }
  const anchor = type === "name"
    ? /(\s*<meta\s+name=["']robots["'][^>]*>)/i
    : /(\s*<meta\s+property=["']og:image["'][^>]*>)/i;
  if (anchor.test(html)) {
    return html.replace(anchor, `$1\n${tag}`);
  }
  return insertBeforeStylesheet(html, [tag]);
}

function upsertLink(html, rel, href, extra = "") {
  const regex = new RegExp(`<link\\s+rel=["']${rel}["'][^>]*>`, "i");
  const tag = `  <link rel="${rel}" href="${href}"${extra}>`;
  if (regex.test(html)) {
    return html.replace(regex, tag);
  }
  return insertBeforeStylesheet(html, [tag]);
}

function ensureFontPreloads(html, prefix) {
  const regular = `${prefix}assets/fonts/galhau-display-font/GalhauDisplay-VariableVF.ttf`;
  const italic = `${prefix}assets/fonts/galhau-display-font/GalhauDisplay-RegularSlanted.ttf`;
  html = html.replace(/\s*<link\s+rel="preload"\s+href="[^"]+"\s+as="font"[^>]*>/gi, (tag) => {
    return tag.includes(regular) || tag.includes(italic) ? tag : "";
  });
  const lines = [];
  if (!html.includes(regular)) {
    lines.push(`  <link rel="preload" href="${regular}" as="font" type="font/ttf" crossorigin>`);
  }
  if (!html.includes(italic)) {
    lines.push(`  <link rel="preload" href="${italic}" as="font" type="font/ttf" crossorigin>`);
  }
  return lines.length ? insertBeforeStylesheet(html, lines) : html;
}

function breadcrumbName(segment) {
  return segment
    .replace(/\.html$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function breadcrumbList(relPath, canonical) {
  const parts = relPath === "index.html" ? [] : relPath.split("/");
  const categoryPages = new Map([
    ["case-studies", "case-studies.html"],
    ["resources", "resources.html"],
    ["services", "services.html"],
  ]);
  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${site}/` },
  ];
  if (parts.length > 1 && categoryPages.has(parts[0])) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: breadcrumbName(parts[0]),
      item: `${site}/${categoryPages.get(parts[0])}`,
    });
  }
  if (relPath !== "index.html") {
    items.push({
      "@type": "ListItem",
      position: items.length + 1,
      name: breadcrumbName(parts[parts.length - 1]),
      item: canonical,
    });
  }
  return {
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumbs`,
    itemListElement: items,
  };
}

function organizationNode() {
  return {
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${site}/#organization`,
    name: "WIF Marketing",
    url: `${site}/`,
    logo: imageUrl,
    image: imageUrl,
    description: "WIF Marketing is a Surat-based performance marketing agency for paid ads, SEO growth pages, tracking, automation and lead-generation systems.",
    email: "business@wifmarketing.co",
    telephone: "+91-9537192471",
    priceRange: "$$",
    areaServed: ["Surat", "Gujarat", "India", "United States", "United Kingdom", "Canada", "Australia"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Surat",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9537192471",
      email: "business@wifmarketing.co",
      contactType: "sales",
      areaServed: ["IN", "US", "GB", "CA", "AU"],
      availableLanguage: ["en", "hi", "gu"],
    },
    parentOrganization: {
      "@type": "Organization",
      name: "WIF Group",
      url: "https://www.wifgroup.in",
    },
    knowsAbout: [
      "Google Ads",
      "LinkedIn Ads",
      "Meta Ads",
      "Search Engine Optimization",
      "Local SEO",
      "Conversion Rate Optimization",
      "Marketing Analytics",
      "Lead Generation",
      "AI Calling Agents",
      "Workflow Automation",
      "CRM Lead Routing",
    ],
  };
}

function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": `${site}/#website`,
    url: `${site}/`,
    name: "WIF Marketing",
    publisher: { "@id": `${site}/#organization` },
    inLanguage: "en-IN",
  };
}

function pageNode(relPath, canonical, title, description) {
  const type = relPath === "contact.html"
    ? "ContactPage"
    : relPath === "resources.html" || relPath === "case-studies.html"
      ? "CollectionPage"
      : "WebPage";
  return {
    "@type": type,
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: title,
    headline: title,
    description,
    inLanguage: "en-IN",
    isPartOf: { "@id": `${site}/#website` },
    about: { "@id": `${site}/#organization` },
    publisher: { "@id": `${site}/#organization` },
    dateModified: lastmod,
    primaryImageOfPage: imageUrl,
  };
}

function contentNode(relPath, canonical, title, description) {
  if (relPath.startsWith("resources/")) {
    return {
      "@type": "Article",
      "@id": `${canonical}#article`,
      mainEntityOfPage: { "@id": `${canonical}#webpage` },
      headline: title,
      description,
      image: imageUrl,
      author: { "@id": `${site}/#organization` },
      publisher: { "@id": `${site}/#organization` },
      dateModified: lastmod,
      inLanguage: "en-IN",
    };
  }
  if (relPath.startsWith("case-studies/")) {
    return {
      "@type": "CreativeWork",
      "@id": `${canonical}#case-study`,
      mainEntityOfPage: { "@id": `${canonical}#webpage` },
      name: title,
      headline: title,
      description,
      author: { "@id": `${site}/#organization` },
      publisher: { "@id": `${site}/#organization` },
      dateModified: lastmod,
      inLanguage: "en-IN",
    };
  }
  if (relPath.startsWith("services/") || relPath.startsWith("industries/") || relPath.startsWith("global/")) {
    return {
      "@type": "Service",
      "@id": `${canonical}#service-offer`,
      name: title.replace(/\s*\|\s*WIF Marketing$/, ""),
      description,
      provider: { "@id": `${site}/#organization` },
      areaServed: ["Surat", "Gujarat", "India", "United States", "United Kingdom", "Canada", "Australia"],
      serviceType: title.replace(/\s*\|\s*WIF Marketing$/, ""),
    };
  }
  return null;
}

function faqNode(html, canonical) {
  const matches = [...html.matchAll(/<article\s+class=["'][^"']*faq-item[^"']*["'][\s\S]*?<button[^>]*>([\s\S]*?)<\/button>[\s\S]*?<div\s+class=["']faq-answer["'][^>]*>\s*<p>([\s\S]*?)<\/p>/gi)];
  if (!matches.length) return null;
  return {
    "@type": "FAQPage",
    "@id": `${canonical}#faq`,
    mainEntity: matches.slice(0, 4).map((match) => ({
      "@type": "Question",
      name: text(match[1]),
      acceptedAnswer: {
        "@type": "Answer",
        text: text(match[2]),
      },
    })),
  };
}

function normalizeGraph(existing) {
  if (!existing) return [];
  if (Array.isArray(existing)) return existing;
  if (Array.isArray(existing["@graph"])) return existing["@graph"];
  return [existing];
}

function hasNode(graph, id, type) {
  return graph.some((node) => {
    const nodeTypes = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    return (id && node["@id"] === id) || (type && nodeTypes.includes(type));
  });
}

function mergeJsonLd(html, relPath, canonical, title, description) {
  const scriptRegex = /<script\s+type=["']application\/ld\+json["']>\s*([\s\S]*?)\s*<\/script>/i;
  const match = html.match(scriptRegex);
  let existing = null;
  if (match) {
    try {
      existing = JSON.parse(match[1]);
    } catch {
      existing = null;
    }
  }

  const graph = normalizeGraph(existing);
  const nodes = [
    organizationNode(),
    websiteNode(),
    pageNode(relPath, canonical, title, description),
    breadcrumbList(relPath, canonical),
    contentNode(relPath, canonical, title, description),
    faqNode(html, canonical),
  ].filter(Boolean);

  for (const node of nodes) {
    const id = node["@id"];
    const type = node["@type"];
    if (!hasNode(graph, id, type)) {
      graph.push(node);
    } else if (id) {
      const index = graph.findIndex((item) => item["@id"] === id);
      graph[index] = { ...graph[index], ...node };
    }
  }

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2)
    .replace(/\n/g, "\n  ");
  const script = `  <script type="application/ld+json">\n  ${json}\n  </script>`;

  if (match) {
    return html.replace(scriptRegex, script);
  }
  return html.replace(/<\/head>/i, `${script}\n</head>`);
}

function processFile(file) {
  const raw = fs.readFileSync(file, "utf8");
  const hasBom = raw.charCodeAt(0) === 0xfeff;
  let html = hasBom ? raw.slice(1) : raw;
  const relPath = path.relative(root, file).split(path.sep).join("/");
  const depth = relPath.split("/").length - 1;
  const prefix = depth ? "../".repeat(depth) : "";
  const title = getTag(html, /<title>([\s\S]*?)<\/title>/i);
  const description = getMeta(html, "name", "description");
  const canonical = getCanonical(html, relPath);
  const ogTitle = title;
  const ogDescription = description;

  html = upsertMeta(html, "name", "author", "WIF Marketing");
  html = upsertMeta(html, "name", "publisher", "WIF Marketing");
  html = upsertMeta(html, "name", "theme-color", "#ffffff");
  html = upsertMeta(html, "property", "og:title", ogTitle);
  html = upsertMeta(html, "property", "og:description", ogDescription);
  html = upsertMeta(html, "property", "og:type", "website");
  html = upsertMeta(html, "property", "og:url", canonical);
  html = upsertMeta(html, "property", "og:image", imageUrl);
  html = upsertMeta(html, "property", "og:site_name", "WIF Marketing");
  html = upsertMeta(html, "property", "og:locale", "en_IN");
  html = upsertMeta(html, "property", "og:image:width", "500");
  html = upsertMeta(html, "property", "og:image:height", "500");
  html = upsertMeta(html, "property", "og:image:alt", "WIF Marketing logo");
  html = upsertMeta(html, "name", "twitter:card", "summary_large_image");
  html = upsertMeta(html, "name", "twitter:title", ogTitle);
  html = upsertMeta(html, "name", "twitter:description", ogDescription);
  html = upsertMeta(html, "name", "twitter:image", imageUrl);
  html = upsertMeta(html, "name", "twitter:image:alt", "WIF Marketing logo");
  html = upsertLink(html, "manifest", `${prefix}assets/favicon/site.webmanifest`);
  if (!/<link\s+rel=["']apple-touch-icon["']/i.test(html)) {
    html = insertBeforeStylesheet(html, [`  <link rel="apple-touch-icon" href="${prefix}assets/favicon/apple-touch-icon.png">`]);
  }
  html = ensureFontPreloads(html, prefix);
  html = mergeJsonLd(html, relPath, canonical, title, description);

  fs.writeFileSync(file, (hasBom ? "\uFEFF" : "") + html);
}

const files = walk(root).sort();
files.forEach(processFile);
console.log(`Optimized ${files.length} HTML files for SEO/AEO metadata.`);
