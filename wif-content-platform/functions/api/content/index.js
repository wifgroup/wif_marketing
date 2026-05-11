// Cloudflare Pages Function: GET /api/content
// Lists content from GitHub repo

import { getGithubClient } from "../../shared/github";
import { corsHeaders, validateAccess } from "../../shared/auth";

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const status = url.searchParams.get("status");
  const collection = url.searchParams.get("collection");

  if (!collection || !["blog", "case-studies"].includes(collection)) {
    return new Response(JSON.stringify({ error: "Invalid or missing collection parameter" }), {
      status: 400,
      headers: corsHeaders(),
    });
  }

  // If requesting drafts, authenticate
  if (status === "draft") {
    const authCheck = await validateAccess(request, env);
    if (authCheck) return authCheck;
  }

  try {
    const octokit = getGithubClient(request, env);
    if (!octokit) {
      return new Response(JSON.stringify({ error: "GitHub authentication required" }), {
        status: 401,
        headers: corsHeaders(),
      });
    }

    const repo = env.GITHUB_REPO || "wifgroup/wif_marketing";
    const ref = env.GITHUB_BRANCH || "New";
    let files = [];

    try {
      const { data: tree } = await octokit.git.getTree({
        owner: repo.split("/")[0],
        repo: repo.split("/")[1],
        tree_sha: ref,
        recursive: 1,
      });

      files = tree.tree
        .filter((f) => f.path.startsWith("content/" + collection + "/") && f.path.endsWith(".md"))
        .map((f) => f.path);
    } catch {
      const { data } = await octokit.repos.getContent({
        owner: repo.split("/")[0],
        repo: repo.split("/")[1],
        path: "content/" + collection,
        ref,
      });

      files = (Array.isArray(data) ? data : [data])
        .filter((f) => f.name.endsWith(".md"))
        .map((f) => "content/" + collection + "/" + f.name);
    }

    const results = [];
    for (const filePath of files) {
      const { data } = await octokit.repos.getContent({
        owner: repo.split("/")[0],
        repo: repo.split("/")[1],
        path: filePath,
        ref,
      });

      const content = Buffer.from(data.content, "base64").toString("utf-8");
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (fmMatch) {
        const fm = {};
        fmMatch[1].split("\n").forEach((line) => {
          const idx = line.indexOf(":");
          if (idx > -1) {
            const key = line.slice(0, idx).trim();
            let val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
            if (val.startsWith("[") || val.startsWith("{")) {
              try { val = JSON.parse(val); } catch {}
            }
            fm[key] = val;
          }
        });

        if (status && fm.status !== status) continue;

        const slug = fm.slug || filePath.split("/").pop().replace(".md", "");

        results.push({
          title: fm.title || slug,
          slug,
          description: fm.description || "",
          date: fm.date || "",
          formattedDate: fm.date || "",
          image: fm.image || null,
          status: fm.status || "draft",
          type: fm.type || collection,
          href: "/" + collection + "/" + slug + ".html",
        });
      }
    }

    results.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    return new Response(JSON.stringify(results), {
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error("Content API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
}