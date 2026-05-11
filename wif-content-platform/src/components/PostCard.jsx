import React from "react";
import { Link } from "react-router-dom";

export default function PostCard({ post, collection, onDelete }) {
  const typeLabel = collection === "blog" ? "Blog" : "Case Study";
  const editPath = `/${collection}/${post.slug}`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {post.image && (
        <div className="h-40 overflow-hidden">
          <img
            src={
              post.image.startsWith("http")
                ? post.image
                : `https://wifmarketing.co${post.image}`
            }
            alt={post.image_alt || post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-indigo-600 uppercase">
            {typeLabel}
          </span>
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              post.status === "published"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {post.status}
          </span>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link to={editPath} className="hover:text-indigo-600 transition-colors">
            {post.title}
          </Link>
        </h3>
        {post.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {post.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{post.formattedDate || post.date || "No date"}</span>
          {post.result_headline && (
            <span className="text-indigo-600 font-medium">
              {post.result_headline}
            </span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <Link
            to={editPath}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Edit →
          </Link>
          <button
            onClick={() => {
              if (
                confirm(
                  `Delete "${post.title}"? This will remove the draft but not affect published pages.`
                )
              ) {
                onDelete?.();
              }
            }}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}