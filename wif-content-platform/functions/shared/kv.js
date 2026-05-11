// Shared utilities — KV cache operations with typed helpers

export async function getKV(envOrKey, maybeKey) {
  // Support both old signature (key) and new (env, key)
  let key;
  if (maybeKey !== undefined) {
    key = maybeKey;
  } else {
    key = envOrKey;
  }

  try {
    // In production: return await env.CONTENT_KV.get(key, { type: "json" });
    // Placeholder returns null
    return null;
  } catch {
    return null;
  }
}

export async function setKV(envOrKey, maybeValue, maybeOpts) {
  let value, opts;
  if (maybeOpts !== undefined) {
    value = maybeValue;
    opts = maybeOpts;
  } else {
    value = maybeValue;
    opts = {};
  }

  try {
    // In production: await env.CONTENT_KV.put(key, JSON.stringify(value), opts);
    return true;
  } catch {
    return false;
  }
}

export async function deleteKV(envOrKey, maybeKey) {
  const key = maybeKey || envOrKey;
  try {
    // In production: await env.CONTENT_KV.delete(key);
    return true;
  } catch {
    return false;
  }
}

export async function listKV(envOrPrefix, maybePrefix) {
  const prefix = maybePrefix || envOrPrefix || "";
  try {
    // In production: const { keys } = await env.CONTENT_KV.list({ prefix });
    // return keys;
    return [];
  } catch {
    return [];
  }
}

// Content-specific helpers

export function contentCacheKey(collection, slug) {
  return "content:" + collection + ":" + slug;
}

export function contentListKey(collection, status) {
  return "content-list:" + collection + ":" + (status || "all");
}

export function invalidateContentCache(env, collection, slug) {
  return Promise.all([
    deleteKV(env, contentCacheKey(collection, slug)),
    deleteKV(env, contentListKey(collection, "all")),
    deleteKV(env, contentListKey(collection, "published")),
    deleteKV(env, contentListKey(collection, "draft")),
    deleteKV(env, "content-index"),
  ]);
}