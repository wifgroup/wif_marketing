// Cloudflare Pages Function: POST /api/content/save-draft
// Creates a branch and writes .md file via GitHub API

import { getGithubClient } from "../../shared/github";
import { corsHeaders, validateAccess } from "../../shared/auth";

export async function onRequestPost(context) {
  const { request, env } = context;

  const authCheck = await validateAccess(request, env);
  if (authCheck) return authCheck;

  try {
    const body = await request.json();
    const { title, slug, description, content, status, type, date, author, image, image_alt, og_title, og_description, tags, faqs, metrics, client, industry, result_headline } = body;

    if (!title || !slug) {
      return new Response(JSON.stringify({ error: "Title and slug required" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const octokit = getGithubClient(request, env);
    if (!octokit) {
      return new Response(JSON.stringify({ error: "GitHub authentication required" }), {
        status: 401,
        headers: corsHeaders(),
      });
    }

    const repo = env.GITHUB_REPO || "wifgroup/wif_marketing";
    const [owner, repoName] = repo.split("/");
    const branchName = "cms/" + type + "/" + slug;
    const filePath = "content/" + type + "/" + slug + ".md";
    const baseBranch = env.GITHUB_BRANCH || "New";

    // Build frontmatter
    const fmLines = [
      "---",
      'title: "' + title + '"',
      'slug: "' + slug + '"',
      'status: "' + (status || "draft") + '"',
      'type: "' + type + '"',
      'date: "' + (date || new Date().toISOString().split("T")[0]) + '"',
      'author: "' + (author || "WIF Marketing") + '"',
    ];

    if (description) fmLines.push("description: " + JSON.stringify(description));
    if (image) fmLines.push("image: " + JSON.stringify(image));
    if (image_alt) fmLines.push("image_alt: " + JSON.stringify(image_alt));
    if (og_title) fmLines.push("og_title: " + JSON.stringify(og_title));
    if (og_description) fmLines.push("og_description: " + JSON.stringify(og_description));
    if (client) fmLines.push("client: " + JSON.stringify(client));
    if (industry) fmLines.push("industry: " + JSON.stringify(industry));
    if (result_headline) fmLines.push("result_headline: " + JSON.stringify(result_headline));
    if (tags && tags.length > 0) fmLines.push("tags: " + JSON.stringify(tags));
    if (faqs && faqs.length > 0 && faqs.some((f) => f.question)) fmLines.push("faqs: " + JSON.stringify(faqs));
    if (metrics && metrics.length > 0 && metrics.some((m) => m.label)) fmLines.push("metrics: " + JSON.stringify(metrics));

    fmLines.push("---");
    const frontmatter = fmLines.join("\n");
    const fullContent = frontmatter + "\n\n" + (content || "");
    const encoded = Buffer.from(fullContent).toString("base64");

    // 1. Get the base branch SHA
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo: repoName,
      ref: "heads/" + baseBranch,
    });
    const baseSha = refData.object.sha;

    // 2. Create a new branch from base
    await octokit.git.createRef({
      owner,
      repo: repoName,
      ref: "refs/heads/" + branchName,
      sha: baseSha,
    });

    // 3. Write the file
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: filePath,
      message: "Draft: " + title,
      content: encoded,
      branch: branchName,
    });

    return new Response(
      JSON.stringify({
        success: true,
        slug,
        branch: branchName,
        message: "Draft saved successfully",
      }),
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Save draft error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to save draft" }),
      { status: 500, headers: corsHeaders() }
    );
  }
}