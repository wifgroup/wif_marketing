// Sync status component — displays real-time sync state in admin UI

import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function SyncStatus() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchSyncState() {
    try {
      setLoading(true);
      const res = await fetch("/api/webhook");
      if (!res.ok) throw new Error("Failed to fetch sync state");
      const data = await res.json();
      setState(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSyncState();
    const interval = setInterval(fetchSyncState, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !state) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 p-3">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Loading sync status...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 p-3 bg-amber-50 rounded-lg">
        <AlertCircle className="w-4 h-4" />
        <span>Sync error: {error}</span>
        <button onClick={fetchSyncState} className="ml-auto text-amber-700 hover:text-amber-900">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const lastSync = state.lastFullSync || state.lastPush || state.lastWebhook;
  const prCount = (state.activePRs || []).filter((pr) => !pr.merged).length;

  return (
    <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          Sync Status
        </h3>
        <button
          onClick={fetchSyncState}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Last Webhook" value={formatTime(state.lastWebhook?.at)} />
        <Stat label="Last Push" value={formatTime(state.lastPush?.at)} />
        <Stat label="Last Full Sync" value={formatTime(state.lastFullSync?.at)} />
        <Stat label="Active PRs" value={prCount} badge />
      </div>

      {state.activePRs && state.activePRs.length > 0 && (
        <div className="border-t border-gray-100 pt-3 mt-1">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
            Recent PRs
          </h4>
          <div className="space-y-2">
            {state.activePRs.slice(0, 5).map((pr) => (
              <div
                key={pr.number || pr.key}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    #{pr.number || pr.key?.split(":").pop()} {pr.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {pr.head || ""} → {pr.base || "New"}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    pr.merged
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {pr.merged ? "Merged" : "Open"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 pt-3 mt-1">
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
          CI Status
        </h4>
        <div className="flex flex-wrap gap-2">
          {(state.ciStatuses || []).slice(0, 5).map((ci, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 text-xs rounded-full ${
                ci.state === "success"
                  ? "bg-green-100 text-green-700"
                  : ci.state === "failure"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {ci.context}: {ci.state}
            </span>
          ))}
          {!state.ciStatuses || state.ciStatuses.length === 0 ? (
            <span className="text-xs text-gray-400">No CI data</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, badge }) {
  if (badge) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-500">{label}</span>
        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
          {value}
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || "—"}</span>
    </div>
  );
}

function formatTime(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  const now = new Date();
  const diff = now - d;

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}