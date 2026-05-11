// Cloudflare Pages Function: POST /api/content/open-pr
// Creates a PR from draft branch to New branch

import { getGithubClient } from "../../shared/github";
import { corsHeaders, validateAccess } from "../../shared/auth";

export async function onRequestPost(context) {
  const { request, env } = context;

  const authCheck = await validateAccess(request, env);
  if (authCheck) return authCheck;

  try {
    const body = await request.json();
    const { slug, collection, title } = body;

    if (!slug || !collection) {
      return new Response(
        JSON.stringify({ error: "Slug and collection required" }),
        { status: 400, headers: corsHeaders() }
      );
    }

    const octokit = getGithubClient(request, env);
    if (!octokit) {
      return new Response(
        JSON.stringify({ error: "GitHub authentication required" }),
        { status: 401, headers: corsHeaders() }
      );
    }

    const repo = env.GITHUB_REPO || "wifgroup/wif_marketing";
    const [owner, repoName] = repo.split("/");
    const headBranch = "cms/" + collection + "/" + slug;
    const baseBranch = env.GITHUB_BRANCH || "New";

    const { data: pr } = await octokit.pulls.create({
      owner,
      repo: repoName,
      title: title || "Content: " + slug,
      head: headBranch,
      base: baseBranch,
      body: "Content PR for **" + collection + "** — `" + slug + "`\n\n---\nAutomated PR from WIF Content Platform.",
      draft: false,
    });

    return new Response(
      JSON.stringify({
        success: true,
        prNumber: pr.number,
        prUrl: pr.html_url,
        message: "PR #" + pr.number + " created successfully",
      }),
      { headers: corsHeaders() }
    );
  } catch (error) {
    if (error.status === 422) {
      try {
        const repo = env.GITHUB_REPO || "wifgroup/wif_marketing";
        const [owner, repoName] = repo.split("/");
        const { data: prs } = await octokit.pulls.list({
          owner,
          repo: repoName,
          head: "cms/" + collection + "/" + slug,
          base: env.GITHUB_BRANCH || "New",
          state: "open",
        });

        if (prs.length > 0) {
          return new Response(
            JSON.stringify({
              success: true,
              prNumber: prs[0].number,
              prUrl: prs[0].html_url,
              message: "PR already exists",
            }),
            { headers: corsHeaders() }
          );
        }
      } catch {}
    }

    console.error("Open PR error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create PR" }),
      { status: 500, headers: corsHeaders() }
    );
  }
}