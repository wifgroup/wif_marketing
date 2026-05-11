// Client-side WebSocket + polling bridge for sync status
// Connects to the webhook endpoint for near-real-time updates

export class SyncBridge {
  constructor(baseUrl = "") {
    this.baseUrl = baseUrl;
    this.listeners = [];
    this.pollingInterval = null;
    this.state = null;
  }

  // Start polling (every 30s)
  start() {
    this.fetch();
    this.pollingInterval = setInterval(() => this.fetch(), 30000);
  }

  stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  async fetch() {
    try {
      const res = await fetch(this.baseUrl + "/api/webhook");
      if (!res.ok) return;
      const data = await res.json();
      this.state = data;
      this.notify(data);
    } catch (err) {
      // Silently fail, will retry on next interval
    }
  }

  onUpdate(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  notify(data) {
    this.listeners.forEach((cb) => cb(data));
  }

  // Trigger a manual sync (dev/test only)
  async triggerSync(type = "full") {
    const res = await fetch(this.baseUrl + "/api/sync/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    return res.json();
  }
}

// Singleton instance
let bridgeInstance = null;

export function getSyncBridge() {
  if (!bridgeInstance) {
    bridgeInstance = new SyncBridge();
  }
  return bridgeInstance;
}