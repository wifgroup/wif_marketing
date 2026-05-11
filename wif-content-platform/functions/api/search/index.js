// Cloudflare Pages Function: POST /api/content/search
// Full-text search across published content

import { getGithubClient } from "../../shared/github";
import { corsHeaders } from "../../shared/auth";

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.toLowerCase() || "";

  if (!query) {
    return new Response(JSON.stringify({ error: "Missing search query" }), {
      status: 400,
      headers: corsHeaders(),
    });
  }

  try {
    const octokit = getGithubClient(request);
    if (!octokit) {
      return new Response(JSON.stringify({ error: "GitHub authentication required" }), {
        status: 401,
        headers: corsHeaders(),
      });
    }

    const repo = env.GITHUB_REPO || "wifgroup/wif_marketing";
    const ref = env.GITHUB_BRANCH || "New";

    // Use GitHub Code Search API
    const { data } = await octokit.search.code({
      q: `${query} repo:${repo} path:content extension:md`,
    });

    const results = [];
    for (const item of data.items) {
      const filePath = item.path;
      // Extract slug from path
      const slug = filePath.split("/").pop().replace(".md", "");
      const collection = filePath.split("/")[1];

      results.push({
        title: item.name,
        slug,
        collection,
        path: `/${collection}/${slug}.html`,
      });
    }

    return new Response(JSON.stringify(results), {
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error("Search error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
}