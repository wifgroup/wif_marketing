// API client for WIF Content Platform
// Wraps fetch calls to Cloudflare Pages Functions

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function request(method, endpoint, data = null, auth = true) {
  const url = `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
  };

  // Attach auth token if available
  if (auth) {
    const token = localStorage.getItem("wif_access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers,
  };

  if (data instanceof FormData) {
    delete headers["Content-Type"];
    config.body = data;
  } else if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  // Handle empty responses (e.g., 204 No Content)
  const text = await response.text();
  if (!text) return null;

  return JSON.parse(text);
}

export default {
  get(endpoint) {
    return request("GET", endpoint);
  },

  post(endpoint, data) {
    return request("POST", endpoint, data);
  },

  put(endpoint, data) {
    return request("PUT", endpoint, data);
  },

  delete(endpoint) {
    return request("DELETE", endpoint);
  },
};