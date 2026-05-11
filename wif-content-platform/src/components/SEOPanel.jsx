import React, { useState } from "react";
import api from "../utils/api";

export default function SEOPanel({ post, onUpdate }) {
  const [ogImageUrl, setOgImageUrl] = useState("");

  function handleGenerateOG() {
    const title = post.title || "Untitled";
    const template =
      "https://wifmarketing.co/api/og?title=" +
      encodeURIComponent(title) +
      "&brand=WIF%20Marketing";
    setOgImageUrl(template);
    onUpdate({ og_title: title });
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-sm font-semibold text-gray-700 uppercase">
        SEO & Meta Tags
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OG Title
          </label>
          <input
            type="text"
            value={post.og_title || ""}
            onChange={(e) => onUpdate({ og_title: e.target.value })}
            placeholder="Social sharing title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            maxLength={60}
          />
          <p className="text-xs text-gray-400 mt-1">
            {post.og_title?.length || 0}/60 characters recommended
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OG Description
          </label>
          <textarea
            value={post.og_description || ""}
            onChange={(e) => onUpdate({ og_description: e.target.value })}
            placeholder="Social sharing description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            maxLength={160}
          />
          <p className="text-xs text-gray-400 mt-1">
            {post.og_description?.length || 0}/160 characters recommended
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Canonical URL
          </label>
          <input
            type="url"
            value={post.canonical || ""}
            onChange={(e) => onUpdate({ canonical: e.target.value })}
            placeholder="https://wifmarketing.co/blog/slug"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <TagInput
            tags={post.tags || []}
            onChange={(tags) => onUpdate({ tags })}
          />
        </div>

        {/* OG Image Section */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OG Image (Banner)
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={post.image || ""}
                onChange={(e) => onUpdate({ image: e.target.value })}
                placeholder="/assets/image/content/blog/slug/hero.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
            <button
              onClick={handleGenerateOG}
              className="px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm whitespace-nowrap transition-colors"
            >
              Generate OG
            </button>
          </div>
          {ogImageUrl && (
            <div className="mt-3">
              <img
                src={ogImageUrl}
                alt="OG Preview"
                className="w-full max-w-lg rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image Alt Text
          </label>
          <input
            type="text"
            value={post.image_alt || ""}
            onChange={(e) => onUpdate({ image_alt: e.target.value })}
            placeholder="Description for accessibility & social"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Author
          </label>
          <input
            type="text"
            value={post.author || ""}
            onChange={(e) => onUpdate({ author: e.target.value })}
            placeholder="Author name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Live preview */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          How Google sees this page
        </h3>
        <div className="text-sm">
          <p className="text-blue-800 font-medium truncate">
            {post.og_title || post.title || "No title"}
          </p>
          <p className="text-green-700 text-xs">
            {post.canonical || post.slug
              ? `https://wifmarketing.co/blog/${post.slug || "slug"}`
              : "No URL"}
          </p>
          <p className="text-gray-600 mt-1 text-xs">
            {post.og_description ||
              post.description ||
              "No description — search engines may auto-generate one."}
          </p>
        </div>
      </div>
    </div>
  );
}

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState("");

  function addTag() {
    const tag = input.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput("");
  }

  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs"
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="hover:text-red-500"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag();
          }
          if (e.key === "Backspace" && !input && tags.length > 0) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={addTag}
        placeholder="Add tag and press Enter"
        className="text-xs border-gray-300 rounded-lg px-2 py-0.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[120px]"
      />
    </div>
  );
}