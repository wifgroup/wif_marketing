// Enhanced shared auth utilities

export async function validateAccess(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const tokenMatch = cookie.match(/wif_access_token=([^;]+)/);

  if (!tokenMatch) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders(),
    });
  }

  const token = tokenMatch[1];

  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: "Bearer " + token,
        "User-Agent": "WIF-Admin",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: corsHeaders(),
      });
    }

    // Attach user info to request for downstream use
    const user = await res.json();
    request.user = user;

    return null;
  } catch {
    return new Response(JSON.stringify({ error: "Auth check failed" }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
}

export function corsHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Content-Type": "application/json",
    ...extra,
  };
}

// Read GitHub webhook payload and verify signature
export async function verifyWebhookSignature(request, secret) {
  if (!secret) return true; // Skip verification if no secret configured

  const signature = request.headers.get("X-Hub-Signature-256");
  const body = await request.text();

  const expected = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  ).then((key) =>
    crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))
      .then((sig) => "sha256=" + Buffer.from(sig).toString("hex"))
  );

  return signature === expected;
}