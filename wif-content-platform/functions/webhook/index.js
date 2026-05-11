// Webhook receiver with full sync pipeline

import { corsHeaders } from "../../shared/auth";
import { deleteKV, setKV, getKV } from "../../shared/kv";
import { getGithubClient } from "../../shared/github";
import { enqueueSyncJob } from "../../shared/queue";

export async function onRequestPost(context) {
  const { request, env } = context;
  const signature = request.headers.get("X-Hub-Signature-256");
  const webhookSecret = env.GITHUB_WEBHOOK_SECRET;
  const deliveryId = request.headers.get("X-GitHub-Delivery");

  // Signature verification
  if (webhookSecret) {
    try {
      const body = await request.text();
      const expected = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      ).then((key) =>
        crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))
          .then((sig) => "sha256=" + Buffer.from(sig).toString("hex"))
      );

      if (signature !== expected) {
        return new Response(
          JSON.stringify({ error: "Invalid signature", received: false }),
          { status: 403, headers: corsHeaders() }
        );
      }
    } catch (err) {
      console.error("Webhook signature verification error:", err.message);
      return new Response(
        JSON.stringify({ error: "Signature verification failed" }),
        { status: 403, headers: corsHeaders() }
      );
    }
  }

  const event = request.headers.get("X-GitHub-Event");
  let payload;

  try {
    payload = typeof request.body === "string"
      ? JSON.parse(request.body)
      : await request.json();
  } catch {
    payload = {};
  }

  // Deduplication: skip if we already processed this delivery
  if (deliveryId) {
    const processed = await getKV("webhook:delivery:" + deliveryId);
    if (processed) {
      return new Response(
        JSON.stringify({ received: true, event, deduplicated: true }),
        { headers: corsHeaders() }
      );
    }
    // Mark as processed (expire after 24 hours)
    await setKV("webhook:delivery:" + deliveryId, { processed: true }, { expirationTtl: 86400 });
  }

  console.log("Webhook event: " + event + " | Delivery: " + deliveryId);

  try {
    let result = { received: true, event };

    switch (event) {
      case "push": {
        const ref = payload?.ref;
        if (ref === "refs/heads/New") {
          // Invalidate full content cache
          await deleteKV("content-index");
          await setKV("sync:last-push", {
            at: new Date().toISOString(),
            ref: payload?.after || "",
            commits: (payload?.commits || []).length,
          }, { expirationTtl: 86400 });

          // Schedule a full sync
          await enqueueSyncJob(env, "full", {
            branch: "New",
            trigger: "webhook-push",
            commits: (payload?.commits || []).map((c) => ({
              id: c.id,
              message: c.message,
              author: c.author?.name,
            })),
          });

          result.syncScheduled = true;
          console.log("Full sync scheduled for push to New branch");
        }
        break;
      }

      case "pull_request": {
        const action = payload?.action;
        const pr = payload?.pull_request || {};

        if (action === "closed" && pr.merged) {
          await deleteKV("content-index");
          // Invalidate any cached PR status
          const prKey = "sync:pr:" + (pr.number || 0);
          await setKV(prKey, {
            merged: true,
            mergedAt: new Date().toISOString(),
            title: pr.title,
            head: pr.head?.ref,
            base: pr.base?.ref,
          }, { expirationTtl: 3600 });

          result.prMerged = true;
          console.log("PR #" + pr.number + " merged — cache invalidated");
        }

        if (action === "opened" || action === "synchronize") {
          // Track active PRs for status display
          const prKey = "sync:pr:" + (pr.number || 0);
          await setKV(prKey, {
            number: pr.number,
            title: pr.title,
            state: pr.state,
            status: action === "synchronize" ? "updated" : "opened",
            head: pr.head?.ref,
            updatedAt: new Date().toISOString(),
          }, { expirationTtl: 86400 });

          result.prTracked = true;
        }
        break;
      }

      case "status": {
        // Track CI build status
        const sha = payload?.sha;
        if (sha) {
          await setKV("ci:status:" + sha.substring(0, 12), {
            state: payload.state,
            context: payload.context,
            description: payload.description,
            targetUrl: payload.target_url,
            updatedAt: new Date().toISOString(),
          }, { expirationTtl: 3600 });
          result.ciStatus = true;
        }
        break;
      }

      default:
        console.log("Unhandled webhook event: " + event);
        result.unhandled = true;
    }

    // Update last webhook timestamp
    await setKV("sync:last-webhook", {
      event,
      at: new Date().toISOString(),
      deliveryId,
    }, { expirationTtl: 86400 });

    result.syncState = await getSyncState(env);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders(), "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message, received: false }),
      { status: 500, headers: corsHeaders() }
    );
  }
}

// GET handler — returns current sync state (no auth required for dashboard polling)
export async function onRequestGet(context) {
  const { env } = context;
  const state = await getSyncState(env);

  return new Response(JSON.stringify(state), {
    headers: { ...corsHeaders(), "Cache-Control": "no-cache" },
  });
}

async function getSyncState(env) {
  const [lastPush, lastWebhook, lastSync, prList, ciKeys] = await Promise.all([
    getKV("sync:last-push").catch(() => null),
    getKV("sync:last-webhook").catch(() => null),
    getKV("sync:last-full-sync").catch(() => null),
    listActivePRs(env),
    listCIStatuses(env),
  ]);

  return {
    lastPush: lastPush || null,
    lastWebhook: lastWebhook || null,
    lastFullSync: lastSync || null,
    activePRs: prList || [],
    ciStatuses: ciKeys || [],
    ready: true,
  };
}

async function listActivePRs(env) {
  const prs = [];
  try {
    // List keys matching "sync:pr:*" pattern
    const { keys } = await env.CONTENT_KV?.list?.({ prefix: "sync:pr:" }) || { keys: [] };
    for (const key of keys) {
      try {
        const val = await getKV(key.name);
        if (val) prs.push({ ...val, key: key.name });
      } catch {}
    }
  } catch (e) {
    console.warn("Could not list PR cache entries:", e.message);
  }
  return prs.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}

async function listCIStatuses(env) {
  const statuses = [];
  try {
    const { keys } = await env.CONTENT_KV?.list?.({ prefix: "ci:status:" }) || { keys: [] };
    for (const key of keys) {
      try {
        const val = await getKV(key.name);
        if (val) statuses.push(val);
      } catch {}
    }
  } catch (e) {
    console.warn("Could not list CI status entries:", e.message);
  }
  return statuses.slice(0, 10);
}