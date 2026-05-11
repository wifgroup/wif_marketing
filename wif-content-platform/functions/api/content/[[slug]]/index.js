// Cloudflare Pages Function: GET /api/content/:collection/:slug
// Gets a single content item

import { getGithubClient } from "../../shared/github";
import { corsHeaders } from "../../shared/auth";

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const slug = parts[parts.length - 1];
  const collection = parts[parts.length - 3];

  if (!collection || !slug) {
    return new Response(JSON.stringify({ error: "Missing collection or slug" }), {
      status: 400,
      headers: corsHeaders(),
    });
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
    const filePath = "content/" + collection + "/" + slug + ".md";

    const { data } = await octokit.repos.getContent({
      owner: repo.split("/")[0],
      repo: repo.split("/")[1],
      path: filePath,
      ref,
    });

    const content = Buffer.from(data.content, "base64").toString("utf-8");
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!fmMatch) {
      return new Response(
        JSON.stringify({ error: "Invalid content format" }),
        { status: 400, headers: corsHeaders() }
      );
    }

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

    const body = content.slice(fmMatch[0].length).trim();

    return new Response(
      JSON.stringify({ ...fm, body, slug }),
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Content fetch error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
}