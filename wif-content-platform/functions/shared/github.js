// GitHub API client using octokit
// Uses Cloudflare Workers fetch-compatible implementation

import { Octokit } from "@octokit/core";

export async function getGithubClient(request, env) {
  const token = await getAccessToken(request, env);
  if (!token) return null;

  return new Octokit({
    auth: token,
    request: {
      fetch: (...args) => fetch(...args),
    },
  });
}

async function getAccessToken(request, env) {
  // 1. Check for OAuth code in URL (authorization callback)
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const GITHUB_APP_ID = env.GITHUB_APP_ID;
    const GITHUB_APP_SECRET = env.GITHUB_APP_SECRET;

    if (GITHUB_APP_ID && GITHUB_APP_SECRET) {
      const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Basic " + Buffer.from(GITHUB_APP_ID + ":" + GITHUB_APP_SECRET).toString("base64"),
        },
        body: JSON.stringify({
          client_id: GITHUB_APP_ID,
          client_secret: GITHUB_APP_SECRET,
          code,
        }),
      });

      const data = await res.json();
      if (data.access_token) {
        // Store token in secure cookie
        return data.access_token;
      }
    }
  }

  // 2. Check for stored access token in cookie
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/wif_access_token=([^;]+)/);
  if (match) return match[1];

  // 3. Check for GitHub App installation token
  if (env.GITHUB_APP_ID && env.GITHUB_PRIVATE_KEY) {
    try {
      const jwt = await generateAppJWT(env);
      const res = await fetch("https://api.github.com/app/installations", {
        headers: {
          Authorization: "Bearer " + jwt,
          Accept: "application/vnd.github.v3+json",
        },
      });

      const { installations } = await res.json();
      const target = installations?.find(
        (i) => String(i.id) === String(env.GITHUB_INSTALLATION_ID)
      );

      if (target) {
        const tokenRes = await fetch(
          "https://api.github.com/installation/repositories",
          {
            headers: {
              Authorization: "Bearer " + jwt,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );
        const tokenData = await tokenRes.json();
        return tokenData.token;
      }
    } catch (e) {
      console.warn("GitHub App token exchange failed:", e.message);
    }
  }

  return null;
}

async function generateAppJWT(env) {
  // Generate JWT for GitHub App authentication
  // This is a simplified placeholder — in production, use a proper JWT library
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + 600, // 10 minutes
    iss: env.GITHUB_APP_ID,
  };

  // Note: In production, sign with RS256 using the private key
  // This is a placeholder that returns a base64-encoded header.payload
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT", kid: env.GITHUB_APP_ID })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return `${header}.${body}.SIGNATURE_PLACEHOLDER`;
}

export function getGitHubWebhookSignature(payload, secret) {
  // Compute HMAC-SHA256 for webhook verification
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  ).then((key) =>
    crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
      .then((sig) => "sha256=" + Buffer.from(sig).toString("hex"))
  );
}