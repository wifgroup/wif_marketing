import React, { useState, useEffect } from "react";
import api from "../utils/api";
import SyncStatus from "../components/sync-status/SyncStatus";

export default function Settings() {
  const [webhookStatus, setWebhookStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadWebhookStatus();
  }, []);

  async function loadWebhookStatus() {
    try {
      setLoading(true);
      // Fetch sync state from webhook endpoint
      const res = await fetch("/api/webhook");
      if (!res.ok) throw new Error("Failed to fetch sync state");
      const data = await res.json();
      setWebhookStatus(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyWebhookUrl() {
    const url = window.location.origin + "/api/webhook";
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure webhooks, sync, and integration settings
          </p>
        </div>
      </div>

      {/* Webhook Configuration Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            GitHub Webhook Configuration
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook URL
            </label>
            <div className="flex gap-2">
              <code className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono break-all">
                {typeof window !== "undefined"
                  ? window.location.origin + "/api/webhook"
                  : "https://your-domain.com/api/webhook"}
              </code>
              <button
                onClick={copyWebhookUrl}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook Secret
            </label>
            <code className="block bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono">
              {process.env.GITHUB_WEBHOOK_SECRET || "YOUR_WEBHOOK_SECRET"}
            </code>
            <p className="text-xs text-gray-500 mt-1">
              Configure this secret in your GitHub repository webhook settings
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Repository
            </label>
            <code className="block bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono">
              wifgroup/wif_marketing
            </code>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Setup Instructions
            </h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal pl-4">
              <li>Go to GitHub → wifgroup/wif_marketing → Settings → Webhooks</li>
              <li>Click "Add webhook"</li>
              <li>Paste the Webhook URL above</li>
              <li>Set Secret to the value shown above</li>
              <li>Select events: "Push" and "Pull requests"</li>
              <li>Click "Add webhook"</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Sync Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Sync Status
          </h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>Failed to load sync status: {error}</p>
              <button
                onClick={loadWebhookStatus}
                className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
              >
                Retry
              </button>
            </div>
          ) : webhookStatus ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase">Last Webhook</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {webhookStatus.lastWebhook
                      ? new Date(webhookStatus.lastWebhook.at).toLocaleString()
                      : "Never"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase">Last Push</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {webhookStatus.lastPush
                      ? new Date(webhookStatus.lastPush.at).toLocaleString()
                      : "Never"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase">Last Full Sync</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {webhookStatus.lastFullSync
                      ? new Date(webhookStatus.lastFullSync.at).toLocaleString()
                      : "Never"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase">Active PRs</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {webhookStatus.activePRs
                      ? webhookStatus.activePRs.filter((pr) => !pr.merged).length
                      : 0}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Active Pull Requests
                </h3>
                {webhookStatus.activePRs && webhookStatus.activePRs.length > 0 ? (
                  <div className="space-y-2">
                    {webhookStatus.activePRs
                      .filter((pr) => !pr.merged)
                      .map((pr) => (
                        <div
                          key={pr.number || pr.key}
                          className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              #{pr.number || "—"} {pr.title}
                            </p>
                            {pr.head && (
                              <p className="text-xs text-gray-500">
                                {pr.head} → {pr.base || "New"}
                              </p>
                            )}
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
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No active pull requests
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No sync data available</p>
          )}
        </div>
      </div>

      {/* Environment Variables Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Environment Variables
          </h2>
        </div>
        <div className="p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-500 font-medium">Variable</th>
                <th className="text-left py-2 text-gray-500 font-medium">Purpose</th>
                <th className="text-left py-2 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: "GITHUB_APP_ID", desc: "GitHub App Client ID", val: "SET" },
                { key: "GITHUB_APP_SECRET", desc: "GitHub App Client Secret", val: "SET" },
                { key: "GITHUB_INSTALLATION_ID", desc: "GitHub App Installation ID", val: "SET" },
                { key: "GITHUB_REPO", desc: "Target GitHub repository", val: "wifgroup/wif_marketing" },
                { key: "GITHUB_BRANCH", desc: "Target branch for builds", val: "New" },
                { key: "GITHUB_WEBHOOK_SECRET", desc: "Webhook HMAC secret", val: "SET" },
                { key: "CONTENT_KV_NAMESPACE_ID", desc: "KV namespace for content cache", val: "SET" },
                { key: "R2_BUCKET_NAME", desc: "R2 bucket for media files", val: "wif-content-media" },
              ].map((v) => (
                <tr key={v.key} className="border-b border-gray-100">
                  <td className="py-2 font-mono text-xs text-indigo-600">{v.key}</td>
                  <td className="py-2 text-gray-600">{v.desc}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        v.val === "SET"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {v.val === "SET" ? "✓ Set" : v.val}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}