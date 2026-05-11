import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CaseStudies({ posts: initialPosts }) {
  const [posts, setPosts] = React.useState(initialPosts || []);
  const [loading, setLoading] = React.useState(!initialPosts);
  const [statusFilter, setStatusFilter] = React.useState("all");

  React.useEffect(() => {
    if (!initialPosts) loadCaseStudies();
  }, [statusFilter]);

  async function loadCaseStudies() {
    setLoading(true);
    try {
      const status = statusFilter === "all" ? undefined : statusFilter;
      const data = await fetch(`/api/content?collection=case-studies${status ? `&status=${status}` : ""}`).then((r) => r.json());
      setPosts(data || []);
    } catch (err) {
      console.error("Failed to load case studies:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Studies</h1>
          <p className="text-sm text-gray-500 mt-1">
            Client success stories and results
          </p>
        </div>
        <Link
          to="/case-studies/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Case Study
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {["all", "published", "draft"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {status === "all"
              ? "All"
              : status === "published"
              ? "Published"
              : "Drafts"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No case studies yet</h3>
          <p className="text-sm text-gray-500 mt-1">
            Create your first case study to showcase client results.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.slug}
              post={post}
              collection="case-studies"
              onDelete={() => loadCaseStudies()}
            />
          ))}
        </div>
      )}
    </div>
  );
}