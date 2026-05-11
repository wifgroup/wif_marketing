// Shared sync queue using Durable Objects (placeholder)
// In production, sync jobs can be enqueued via Durable Objects or Cron Triggers

export async function enqueueSyncJob(env, type = "full", payload = {}) {
  try {
    // Placeholder: Store sync job in KV for a Cron Trigger to pick up
    const jobId = "sync:" + Date.now() + ":" + Math.random().toString(36).slice(2, 8);
    await env.CONTENT_KV?.put(jobId, JSON.stringify({
      type,
      payload,
      status: "pending",
      createdAt: new Date().toISOString(),
    }), { expirationTtl: 300 }); // Expire after 5 minutes

    console.log("Sync job enqueued:", jobId);
    return { jobId, type };
  } catch (error) {
    console.error("Failed to enqueue sync job:", error.message);
    // Fallback: attempt immediate sync
    return attemptImmediateSync(env, type, payload);
  }
}

async function attemptImmediateSync(env, type, payload) {
  // Direct sync without queue — for fallback or small payloads
  try {
    const octokit = await importOctokit(env);
    if (!octokit) return { error: "GitHub client unavailable" };

    const repo = env.GITHUB_REPO || "wifgroup/wif_marketing";
    const [owner, repoName] = repo.split("/");
    const ref = payload.branch || env.GITHUB_BRANCH || "New";

    // Fetch all content files
    const { data: tree } = await octokit.git.getTree({
      owner, repo: repoName,
      tree_sha: ref,
      recursive: 1,
    });

    const mdFiles = tree.tree
      .filter((f) => f.path.startsWith("content/") && f.path.endsWith(".md"))
      .map((f) => f.path);

    // Build content index
    const index = [];
    for (const filePath of mdFiles) {
      const { data } = await octokit.repos.getContent({
        owner, repo: repoName,
        path: filePath, ref,
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
            try { val = JSON.parse(val); } catch {}
            fm[key] = val;
          }
        });

        index.push({
          path: filePath,
          slug: fm.slug || filePath.split("/").pop().replace(".md", ""),
          title: fm.title || "",
          status: fm.status || "draft",
          type: fm.type || "blog",
          date: fm.date || "",
        });
      }
    }

    // Store index in KV
    await setKV(env, "content-index", {
      updatedAt: new Date().toISOString(),
      trigger: payload.trigger || "manual",
      count: index.length,
      items: index,
    }, { expirationTtl: 300 });

    // Mark sync complete
    await setKV(env, "sync:last-full-sync", {
      at: new Date().toISOString(),
      count: index.length,
      trigger: type,
    }, { expirationTtl: 86400 });

    return { success: true, synced: index.length, items: index };
  } catch (error) {
    console.error("Immediate sync failed:", error.message);
    return { error: error.message };
  }
}

// Standalone helpers for non-Pages environments
import { getGithubClient } from "./github.js";
import { setKV as setKvFn, getKV as getKvFn } from "./kv.js";

async function importOctokit(env) {
  try {
    return await getGithubClient({ headers: new Headers() }, env);
  } catch {
    return null;
  }
}

async function setKV(env, key, value, opts) {
  return setKvFn(key, value, opts);
}