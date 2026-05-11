import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

export default function Dashboard() {
  const [stats, setStats] = useState({ blog: 0, caseStudies: 0, drafts: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [blogRes, csRes, blogDraftRes, csDraftRes] = await Promise.all([
          api.get("content?collection=blog&status=published"),
          api.get("content?collection=case-studies&status=published"),
          api.get("content?collection=blog&status=draft"),
          api.get("content?collection=case-studies&status=draft"),
        ]);

        setStats({
          blog: blogRes.length || 0,
          caseStudies: csRes.length || 0,
          drafts: (blogDraftRes?.length || 0) + (csDraftRes?.length || 0),
        });

        // Combine and sort recent items
        const all = [
          ...(blogRes || []),
          ...(csRes || []),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecent(all.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Published Blog Posts"
          value={stats.blog}
          icon="📝"
          color="bg-blue-500"
        />
        <StatCard
          label="Published Case Studies"
          value={stats.caseStudies}
          icon="📊"
          color="bg-green-500"
        />
        <StatCard
          label="Drafts"
          value={stats.drafts}
          icon="📋"
          color="bg-amber-500"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ActionCard
          to="/blog/new"
          title="New Blog Post"
          description="Create and publish a new blog article"
          icon="✍️"
        />
        <ActionCard
          to="/case-studies/new"
          title="New Case Study"
          description="Showcase a client success story"
          icon="🏆"
        />
      </div>

      {/* Recent content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Recent Content
          </h2>
        </div>
        {recent.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No content yet. Create your first post to get started!
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {recent.map((item) => (
              <li key={item.slug} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      to={
                        item.type === "blog"
                          ? `/blog/${item.slug}`
                          : `/case-studies/${item.slug}`
                      }
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      {item.title}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.type === "blog" ? "Blog" : "Case Study"} ·{" "}
                      {item.formattedDate || "No date"}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      item.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div
          className={`${color} text-white rounded-lg p-3 text-2xl`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ to, title, description, icon }) {
  return (
    <Link
      to={to}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex items-start gap-4"
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </Link>
  );
}