// MCP Tools for WIF Content Platform
// Each tool wraps the corresponding Pages Function API call

import { fetch } from "undici";

const API_BASE = process.env.API_BASE || "http://localhost:8787";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

// Helper: call Pages Function
async function callFunction(endpoint, method = "GET", body = null, token = null) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(url, config);
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

// Helper: build tool result schema
function buildSchema(properties) {
  const schema = { type: "object", properties: {}, required: [] };
  for (const [key, val] of Object.entries(properties)) {
    schema.properties[key] = val;
    if (val.required) schema.required.push(key);
    delete val.required;
  }
  return schema;
}

// -- list_content --
// Lists blog or case-study posts
export const ListContentTool = {
  name: "list_content",
  description: "List blog posts or case studies from the content platform",
  inputSchema: buildSchema({
    collection: {
      type: "string",
      enum: ["blog", "case-studies"],
      description: "Content collection to list",
      required: true,
    },
    status: {
      type: "string",
      enum: ["published", "draft", "all"],
      description: "Filter by status (default: published)",
    },
    limit: {
      type: "integer",
      description: "Maximum number of results (default: 20)",
    },
  }),
};

export async function listContent(args, context) {
  const { collection, status = "published", limit = 20 } = args;
  const statusParam = status === "all" ? undefined : status;
  const query = new URLSearchParams({ collection });
  if (statusParam) query.set("status", statusParam);

  const results = await callFunction(`/api/content?${query}`);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(results?.slice(0, limit) || [], null, 2),
        annotations: {
          priority: 0,
        },
      },
    ],
  };
}

// -- get_content --
// Gets a single content item
export const GetContentTool = {
  name: "get_content",
  description: "Fetch a single blog post or case study by slug",
  inputSchema: buildSchema({
    collection: {
      type: "string",
      enum: ["blog", "case-studies"],
      description: "Content collection",
      required: true,
    },
    slug: {
      type: "string",
      description: "Content slug",
      required: true,
    },
  }),
};

export async function getContent(args) {
  const { collection, slug } = args;
  const result = await callFunction(`/api/content/${collection}/${slug}`);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

// -- save_draft --
// Creates or updates a draft via GitHub
export const SaveDraftTool = {
  name: "save_draft",
  description: "Save a content draft to the GitHub repository",
  inputSchema: buildSchema({
    collection: {
      type: "string",
      enum: ["blog", "case-studies"],
      description: "Content collection",
      required: true,
    },
    title: {
      type: "string",
      description: "Content title",
      required: true,
    },
    slug: {
      type: "string",
      description: "URL slug (kebab-case)",
      required: true,
    },
    body: {
      type: "string",
      description: "Markdown body content",
      required: true,
    },
    description: {
      type: "string",
      description: "SEO description",
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "Content tags",
    },
  }),
};

export async function saveDraft(args, context) {
  const token = context?.token || GITHUB_TOKEN;
  if (!token) {
    throw new Error("GitHub token required. Set GITHUB_TOKEN env var.");
  }

  const result = await callFunction("/api/content/save-draft", "POST", args, token);
  return {
    content: [
      {
        type: "text",
        text: `Draft saved: ${result?.message || "OK"}\nBranch: ${result?.branch || "N/A"}\nSlug: ${args.slug}`,
      },
    ],
  };
}

// -- upload_image --
// Uploads an image to R2 storage
export const UploadImageTool = {
  name: "upload_image",
  description: "Upload an image file to the media library (R2)",
  inputSchema: buildSchema({
    file: {
      type: "string",
      description: "Base64-encoded image data",
      required: true,
    },
    filename: {
      type: "string",
      description: "Original filename (e.g., 'photo.jpg')",
      required: true,
    },
    collection: {
      type: "string",
      enum: ["blog", "case-studies"],
      description: "Target collection",
    },
    slug: {
      type: "string",
      description: "Content slug for folder organization",
    },
  }),
};

export async function uploadImage(args, context) {
  const token = context?.token || GITHUB_TOKEN;
  if (!token) {
    throw new Error("GitHub token required. Set GITHUB_TOKEN env var.");
  }

  const formData = new FormData();
  const buffer = Buffer.from(args.file, "base64");
  formData.append("file", new Blob([buffer], { type: "image/jpeg" }), args.filename);
  formData.append("collection", args.collection || "blog");
  if (args.slug) formData.append("slug", args.slug);

  const result = await callFunction("/api/content/upload-media", "POST", formData, token);
  return {
    content: [
      {
        type: "text",
        text: `Image uploaded: ${result?.url || "N/A"}`,
      },
      {
        type: "image_url",
        image_url: {
          url: result?.url || "",
        },
      },
    ],
  };
}

// -- publish_post --
// Opens a PR to publish a draft
export const PublishPostTool = {
  name: "publish_post",
  description: "Publish a draft by creating a PR into the New branch",
  inputSchema: buildSchema({
    slug: {
      type: "string",
      description: "Content slug",
      required: true,
    },
    collection: {
      type: "string",
      enum: ["blog", "case-studies"],
      description: "Content collection",
      required: true,
    },
    title: {
      type: "string",
      description: "Content title for the PR",
    },
  }),
};

export async function publishPost(args, context) {
  const token = context?.token || GITHUB_TOKEN;
  if (!token) {
    throw new Error("GitHub token required. Set GITHUB_TOKEN env var.");
  }

  const result = await callFunction("/api/content/open-pr", "POST", args, token);
  return {
    content: [
      {
        type: "text",
        text: `PR Created!\n#${result?.prNumber}: ${args.title || args.slug}\nURL: ${result?.prUrl}`,
      },
    ],
  };
}

// -- search_content --
// Full-text search across published content
export const SearchContentTool = {
  name: "search_content",
  description: "Search published content by keyword",
  inputSchema: buildSchema({
    query: {
      type: "string",
      description: "Search query",
      required: true,
    },
  }),
};

export async function searchContent(args) {
  const query = encodeURIComponent(args.query);
  const results = await callFunction(`/api/content/search?q=${query}`);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(results || [], null, 2),
      },
    ],
  };
}

// -- get_seo_report --
// Returns SEO metadata for a content item
export const GetSeoReportTool = {
  name: "get_seo_report",
  description: "Get SEO analysis and metadata for a content item",
  inputSchema: buildSchema({
    collection: {
      type: "string",
      enum: ["blog", "case-studies"],
      description: "Content collection",
      required: true,
    },
    slug: {
      type: "string",
      description: "Content slug",
      required: true,
    },
  }),
};

export async function getSeoReport(args) {
  const content = await callFunction(
    `/api/content/${args.collection}/${args.slug}`
  );

  if (!content) {
    return {
      content: [
        {
          type: "text",
          text: "Content not found",
          annotations: { priority: 1 },
        },
      ],
    };
  }

  // Analyze SEO quality
  const issues = [];
  const recommendations = [];

  if (!content.title) issues.push("Missing title");
  if (!content.description) issues.push("Missing meta description");
  if (!content.canonical && content.slug) {
    recommendations.push(
      `Add canonical URL: https://wifmarketing.co/${content.type === "blog" ? "blog" : "case-studies"}/${content.slug}`
    );
  }
  if (!content.og_title) recommendations.push("Add OG title for social sharing");
  if (!content.og_description) recommendations.push("Add OG description for social sharing");
  if (!content.image) recommendations.push("Add featured image for rich previews");
  if (content.body && content.body.length < 300) issues.push("Content body may be too short (<300 chars)");
  if (!content.tags || content.tags.length === 0) recommendations.push("Add tags for content categorization");

  const report = {
    title: content.title || "(no title)",
    slug: content.slug,
    type: content.type,
    score: Math.max(0, 100 - issues.length * 15 - recommendations.length * 5),
    issues,
    recommendations,
    metadata: {
      title: content.title,
      description: content.description,
      og_title: content.og_title,
      og_description: content.og_description,
      canonical: content.canonical || `https://wifmarketing.co/${content.type}/${content.slug}`,
      image: content.image,
      tags: content.tags || [],
      status: content.status,
      date: content.date,
    },
  };

  return {
    content: [
      {
        type: "text",
        text: `SEO Report: ${report.title}\nScore: ${report.score}/100\n${issues.length ? "Issues: " + issues.join(", ") : "No critical issues"}\n${recommendations.length ? "Recommendations: " + recommendations.join("; ") + "." : "All recommendations met!"}\n\nMetadata: ${JSON.stringify(report.metadata, null, 2)}`,
      },
    ],
  };
}

export function createToolDefinitions() {
  return [
    ListContentTool,
    GetContentTool,
    SaveDraftTool,
    UploadImageTool,
    PublishPostTool,
    SearchContentTool,
    GetSeoReportTool,
  ];
}